import { createHash, randomBytes } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getResend } from "@/lib/resend";

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function hasActiveAccess(status: string | null | undefined) {
  return status === "active" || status === "trialing";
}

export async function POST(req: NextRequest) {
  try {
    const { email } = (await req.json()) as { email?: string };

    if (!email || !email.includes("@")) {
      return NextResponse.json({ ok: false, error: "invalid_email" }, { status: 400 });
    }

    const normalizedEmail = normalizeEmail(email);

    const entitlement = await prisma.customerEntitlement.findFirst({
      where: {
        email: normalizedEmail,
        status: { in: ["active", "trialing"] },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    // Do not reveal account existence.
    if (!entitlement || !hasActiveAccess(entitlement.status)) {
      return NextResponse.json({ ok: true });
    }

    const token = randomBytes(32).toString("hex");
    const tokenHash = hashToken(token);
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

    await prisma.customerLoginToken.create({
      data: {
        email: normalizedEmail,
        tokenHash,
        expiresAt,
      },
    });

    const verifyUrl = new URL("/api/customer/verify", req.url);
    verifyUrl.searchParams.set("token", token);
    verifyUrl.searchParams.set("email", normalizedEmail);

    try {
      const resend = await getResend();
      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || "Nexmoneta <onboarding@resend.dev>",
        to: normalizedEmail,
        subject: "Dein Nexmoneta-Zugang",
        html: `
          <div style="font-family: Arial, sans-serif; line-height:1.6;">
            <h2>Dein Zugang zu Nexmoneta</h2>
            <p>Klicke auf den Button, um dein gekauftes Paket aufzurufen:</p>
            <p><a href="${verifyUrl.toString()}" style="display:inline-block;padding:10px 16px;background:#0f766e;color:white;text-decoration:none;border-radius:8px;">Zugang öffnen</a></p>
            <p>Der Link ist 30 Minuten gültig.</p>
          </div>
        `,
      });
    } catch (mailError) {
      console.warn("[Customer Access Link] Email could not be sent. Fallback URL:", verifyUrl.toString(), mailError);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[Customer Access Link]", error);
    return NextResponse.json({ ok: false, error: "internal_error" }, { status: 500 });
  }
}

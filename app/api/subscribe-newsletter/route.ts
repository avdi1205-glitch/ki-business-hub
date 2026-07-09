import { prisma } from "@/lib/prisma";
import { getResend } from "@/lib/resend";
import { createHash, randomBytes } from "node:crypto";

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, name, source } = body;

    if (!email) {
      return Response.json({ error: "Email is required" }, { status: 400 });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const normalizedName = name ? String(name).trim() : undefined;
    const normalizedSource = source ? String(source).trim() : undefined;

    const existing = await prisma.newsletterSubscriber.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      if (existing.status === "subscribed") {
        return Response.json({ success: true, message: "Email already subscribed" });
      }
    }

    const token = randomBytes(32).toString("hex");
    const tokenHash = hashToken(token);
    const confirmTokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    if (existing) {
      await prisma.newsletterSubscriber.update({
        where: { email: normalizedEmail },
        data: {
          status: "pending",
          name: normalizedName || existing.name,
          source: normalizedSource || existing.source,
          confirmTokenHash: tokenHash,
          confirmTokenExpiresAt,
          confirmedAt: null,
        },
      });
    } else {
      await prisma.newsletterSubscriber.create({
        data: {
          email: normalizedEmail,
          name: normalizedName,
          source: normalizedSource,
          status: "pending",
          confirmTokenHash: tokenHash,
          confirmTokenExpiresAt,
        },
      });
    }

    const fromEmail = process.env.NEWSLETTER_FROM_EMAIL || process.env.RESEND_FROM_EMAIL;
    if (process.env.RESEND_API_KEY && fromEmail) {
      const resend = await getResend();
      const confirmUrl = new URL("/api/subscribe-newsletter/confirm", request.url);
      confirmUrl.searchParams.set("token", token);
      confirmUrl.searchParams.set("email", normalizedEmail);

      await resend.emails.send({
        from: fromEmail,
        to: normalizedEmail,
        subject: "Bitte bestätige dein Nexmoneta Newsletter-Abo",
        html: `
          <div style="font-family:Arial,sans-serif;line-height:1.6;color:#0f172a;max-width:560px;margin:0 auto;padding:24px;">
            <h1 style="margin-bottom:12px;">Bitte bestätige dein Abo</h1>
            <p>Hallo ${normalizedName ? `${normalizedName},` : ""}</p>
            <p>Damit wir dich in den Nexmoneta Newsletter aufnehmen dürfen, bestätige bitte deine E-Mail-Adresse.</p>
            <p style="margin:24px 0;"><a href="${confirmUrl.toString()}" style="display:inline-block;padding:12px 18px;background:#0891b2;color:#fff;text-decoration:none;border-radius:10px;font-weight:700;">Abo bestätigen</a></p>
            <p>Der Bestätigungslink ist 24 Stunden gültig.</p>
            <p>Nach der Bestätigung erhältst du die Willkommens-Mail mit den nächsten Inhalten.</p>
            <p style="margin-top:14px;color:#475569;font-size:12px;">Transparenz: Teile der Inhalte koennen mit KI-Unterstuetzung erstellt und redaktionell geprueft sein.</p>
          </div>
        `,
      });
    }

    return Response.json({
      success: true,
      message: "Bitte bestätige deine E-Mail-Adresse.",
    });
  } catch {
    console.error("Newsletter Subscription Error");
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

// GET - Subscriber Count
export async function GET() {
  try {
    const subscribers = await prisma.newsletterSubscriber.findMany({
      where: { status: "subscribed" },
      select: { source: true },
    });

    const sourceBreakdown = subscribers.reduce<Record<string, number>>((accumulator, subscriber) => {
      const key = subscriber.source || "unknown";
      accumulator[key] = (accumulator[key] || 0) + 1;
      return accumulator;
    }, {});

    return Response.json({
      subscriberCount: subscribers.length,
      sourceBreakdown,
    });
  } catch {
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

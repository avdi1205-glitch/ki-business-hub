import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const ALLOWED_STATUSES = new Set(["pending", "subscribed", "lead_new"]);

export async function GET() {
  try {
    const subscribers = await prisma.newsletterSubscriber.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        email: true,
        name: true,
        source: true,
        status: true,
        createdAt: true,
        confirmedAt: true,
      },
    });

    const counts = subscribers.reduce<Record<string, number>>((accumulator, subscriber) => {
      accumulator[subscriber.status] = (accumulator[subscriber.status] || 0) + 1;
      return accumulator;
    }, { total: subscribers.length });

    return NextResponse.json({ subscribers, counts });
  } catch (error) {
    console.error("[NEWSLETTER-SUBSCRIBERS]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const email = String(body.email || "").trim().toLowerCase();
    const status = String(body.status || "").trim();
    const name = body.name ? String(body.name).trim() : undefined;
    const source = body.source ? String(body.source).trim() : undefined;

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    if (!ALLOWED_STATUSES.has(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const current = await prisma.newsletterSubscriber.findUnique({
      where: { email },
    });

    if (!current) {
      return NextResponse.json({ error: "Subscriber not found" }, { status: 404 });
    }

    const updates: Record<string, unknown> = {
      status,
      ...(name ? { name } : {}),
      ...(source ? { source } : {}),
    };

    if (status === "subscribed") {
      updates.confirmedAt = current.confirmedAt || new Date();
      updates.confirmTokenHash = null;
      updates.confirmTokenExpiresAt = null;
    }

    if (status === "pending") {
      updates.confirmTokenHash = current.confirmTokenHash;
      updates.confirmTokenExpiresAt = current.confirmTokenExpiresAt;
    }

    const subscriber = await prisma.newsletterSubscriber.update({
      where: { email },
      data: updates,
      select: {
        id: true,
        email: true,
        name: true,
        source: true,
        status: true,
        createdAt: true,
        confirmedAt: true,
      },
    });

    return NextResponse.json({ success: true, subscriber });
  } catch (error) {
    console.error("[NEWSLETTER-SUBSCRIBERS]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
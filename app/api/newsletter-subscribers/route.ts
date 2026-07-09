import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const ALLOWED_STATUSES = new Set(["pending", "subscribed", "lead_new"]);
let confirmedAtSupportPromise: Promise<boolean> | null = null;

async function supportsConfirmedAtColumn() {
  if (!confirmedAtSupportPromise) {
    confirmedAtSupportPromise = (async () => {
      try {
        await prisma.$queryRawUnsafe('SELECT "confirmedAt" FROM "NewsletterSubscriber" LIMIT 1');
        return true;
      } catch {
        return false;
      }
    })();
  }

  return confirmedAtSupportPromise;
}

export async function GET() {
  try {
    const hasConfirmedAtColumn = await supportsConfirmedAtColumn();

    if (hasConfirmedAtColumn) {
      await prisma.newsletterSubscriber.updateMany({
        where: {
          status: "subscribed",
          confirmedAt: null,
        },
        data: {
          confirmedAt: new Date(),
        },
      });
    }

    const subscribers = hasConfirmedAtColumn
      ? await prisma.newsletterSubscriber.findMany({
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
        })
      : await prisma.newsletterSubscriber.findMany({
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            email: true,
            name: true,
            source: true,
            status: true,
            createdAt: true,
          },
        });

    const counts = subscribers.reduce<Record<string, number>>((accumulator, subscriber) => {
      accumulator[subscriber.status] = (accumulator[subscriber.status] || 0) + 1;
      return accumulator;
    }, { total: subscribers.length });

    return NextResponse.json({
      subscribers: subscribers.map((subscriber) => ({ ...subscriber, confirmedAt: "confirmedAt" in subscriber ? subscriber.confirmedAt : null })),
      counts,
    });
  } catch (error) {
    console.error("[NEWSLETTER-SUBSCRIBERS]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const hasConfirmedAtColumn = await supportsConfirmedAtColumn();
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

    const current = hasConfirmedAtColumn
      ? await prisma.newsletterSubscriber.findUnique({
          where: { email },
          select: {
            id: true,
            confirmedAt: true,
          },
        })
      : await prisma.newsletterSubscriber.findUnique({
          where: { email },
          select: {
            id: true,
          },
        });

    if (!current) {
      return NextResponse.json({ error: "Subscriber not found" }, { status: 404 });
    }

    const updates: Record<string, unknown> = {
      status,
      ...(name ? { name } : {}),
      ...(source ? { source } : {}),
    };
    const currentConfirmedAt = "confirmedAt" in current ? current.confirmedAt : null;

    if (hasConfirmedAtColumn && status === "subscribed" && !currentConfirmedAt) {
      updates.confirmedAt = new Date();
    }

    const subscriber = hasConfirmedAtColumn
      ? await prisma.newsletterSubscriber.update({
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
        })
      : await prisma.newsletterSubscriber.update({
          where: { email },
          data: updates,
          select: {
            id: true,
            email: true,
            name: true,
            source: true,
            status: true,
            createdAt: true,
          },
        });

    return NextResponse.json({
      success: true,
      subscriber: { ...subscriber, confirmedAt: "confirmedAt" in subscriber ? subscriber.confirmedAt : null },
    });
  } catch (error) {
    console.error("[NEWSLETTER-SUBSCRIBERS]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
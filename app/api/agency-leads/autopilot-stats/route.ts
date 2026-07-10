import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type MemoContext = {
  totalCandidates?: number;
};

function parseContext(value: string | null): MemoContext {
  if (!value) return {};
  try {
    return JSON.parse(value) as MemoContext;
  } catch {
    return {};
  }
}

function dateToken(date: Date) {
  return date.toISOString().slice(0, 10);
}

export async function GET() {
  try {
    const since = new Date();
    since.setDate(since.getDate() - 7);

    const [queued, deliveredMemos, sentFollowUps] = await Promise.all([
      prisma.internalBotRun.count({
        where: {
          recurringTaskKey: "agency-review-memo",
          createdAt: { gte: since },
        },
      }),
      prisma.internalBotRun.findMany({
        where: {
          recurringTaskKey: "agency-review-memo",
          answer: "done",
          createdAt: { gte: since },
        },
        select: {
          context: true,
        },
        orderBy: { createdAt: "desc" },
        take: 200,
      }),
      prisma.newsletterSubscriber.count({
        where: {
          source: { contains: "checkout-rescue:agency:upgrade:agency_onboarding_team_" },
          OR: Array.from({ length: 7 }).map((_, offset) => {
            const day = new Date();
            day.setDate(day.getDate() - offset);
            return {
              source: {
                contains: `lastFollowUp:${dateToken(day)}`,
              },
            };
          }),
        },
      }),
    ]);

    const reviewedCandidates = deliveredMemos.reduce((sum, item) => {
      const totalCandidates = Number(parseContext(item.context).totalCandidates || 0);
      return sum + totalCandidates;
    }, 0);

    const reviewToSendRate = reviewedCandidates > 0
      ? Math.min(100, Number(((sentFollowUps / reviewedCandidates) * 100).toFixed(1)))
      : 0;

    return NextResponse.json({
      success: true,
      windowDays: 7,
      reviewMemosQueued: queued,
      reviewMemosDelivered: deliveredMemos.length,
      reviewedCandidates,
      sentFollowUps,
      reviewToSendRate,
    });
  } catch (error) {
    console.error("[AGENCY-LEADS-AUTOPILOT-STATS]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

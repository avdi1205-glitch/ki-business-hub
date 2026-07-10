import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function parseSource(input: string | null) {
  if (!input) return null;
  const [baseSource, ...metaParts] = input.split("|");
  if (!baseSource.startsWith("checkout-rescue:agency:upgrade:agency_onboarding_team_")) return null;

  const teamSize = baseSource.replace("checkout-rescue:agency:upgrade:agency_onboarding_team_", "").split(":")[0] || null;
  const metadata = metaParts.reduce<Record<string, string>>((accumulator, token) => {
    const [key, ...valueParts] = token.split(":");
    if (!key || valueParts.length === 0) return accumulator;
    accumulator[key] = valueParts.join(":");
    return accumulator;
  }, {});

  return { teamSize, metadata };
}

function priority(teamSize: string | null) {
  if (teamSize === "20+") return 4;
  if (teamSize === "11-20") return 3;
  if (teamSize === "6-10") return 2;
  return 1;
}

function isOpenStage(stage: string | undefined) {
  return stage === "new" || stage === "qualified" || stage === "contacted";
}

function buildDraftSubject() {
  return "Nexmoneta Agency Setup: naechster Schritt";
}

function getBerlinParts(date = new Date()) {
  const formatter = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Berlin",
    weekday: "short",
    hour: "2-digit",
    hourCycle: "h23",
  });

  const parts = formatter.formatToParts(date);
  const weekday = parts.find((part) => part.type === "weekday")?.value || "Mon";
  const hour = Number(parts.find((part) => part.type === "hour")?.value || "0");
  return { weekday, hour };
}

function isInSendWindow(date = new Date()) {
  const { weekday, hour } = getBerlinParts(date);
  const isWeekday = ["Mon", "Tue", "Wed", "Thu", "Fri"].includes(weekday);
  const isBusinessHour = hour >= 8 && hour < 18;
  return isWeekday && isBusinessHour;
}

async function countAlreadySentToday() {
  const today = new Date().toISOString().slice(0, 10);
  return prisma.newsletterSubscriber.count({
    where: {
      source: {
        contains: "checkout-rescue:agency:upgrade:agency_onboarding_team_",
      },
      AND: [
        {
          source: {
            contains: `lastFollowUp:${today}`,
          },
        },
      ],
    },
  });
}

async function loadTargets() {
  const rows = await prisma.newsletterSubscriber.findMany({
    where: {
      source: { contains: "checkout-rescue:agency:upgrade:agency_onboarding_team_" },
      status: "lead_new",
    },
    select: {
      email: true,
      name: true,
      source: true,
    },
    orderBy: { createdAt: "desc" },
    take: 60,
  });

  return rows
    .map((row) => {
      const parsed = parseSource(row.source);
      if (!parsed) return null;
      return { ...row, parsed };
    })
    .filter((row): row is NonNullable<typeof row> => Boolean(row))
    .filter((row) => priority(row.parsed.teamSize) >= 3)
    .filter((row) => row.parsed.metadata.consent === "yes")
    .filter((row) => row.parsed.metadata.optOut !== "yes")
    .filter((row) => isOpenStage(row.parsed.metadata.stage))
    .filter((row) => row.parsed.metadata.lastFollowUp !== new Date().toISOString().slice(0, 10));
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const requestedDelay = Number(body?.delayMinutes || 10);
    const delayMinutes = Math.max(1, Math.min(120, Math.round(requestedDelay)));
    const executeAt = new Date(Date.now() + delayMinutes * 60 * 1000);

    const targets = (await loadTargets()).slice(0, 20);
    const dailyLimit = Math.max(1, Math.min(100, Number(process.env.AGENCY_LEADS_DAILY_SEND_LIMIT || "20")));
    const alreadySentToday = await countAlreadySentToday();
    const remainingToday = Math.max(0, dailyLimit - alreadySentToday);

    const drafts = targets.map((target) => ({
      email: target.email,
      name: target.name,
      teamSize: target.parsed.teamSize,
      stage: target.parsed.metadata.stage || "new",
      followUpCount: Number(target.parsed.metadata.followups || "0") || 0,
      subject: buildDraftSubject(),
    }));

    await prisma.internalBotRun.create({
      data: {
        bot: "agency-review-memo",
        role: "owner",
        goal: `Send review memo for agency follow-up at ${executeAt.toISOString()}`,
        context: JSON.stringify({
          executeAt: executeAt.toISOString(),
          createdAt: new Date().toISOString(),
          totalCandidates: drafts.length,
          dailyLimit,
          alreadySentToday,
          remainingToday,
          sendWindowOpen: isInSendWindow(),
          drafts,
        }),
        answer: "pending",
        tags: ["agency", "follow-up", "review-only", "memo"],
        recurringTaskKey: "agency-review-memo",
      },
    });

    return NextResponse.json({
      success: true,
      queued: true,
      delayMinutes,
      executeAt: executeAt.toISOString(),
      totalCandidates: drafts.length,
      sendWindowOpen: isInSendWindow(),
      dailyLimit,
      alreadySentToday,
      remainingToday,
      drafts,
      message: "Autopilot hat Entwuerfe vorbereitet. Review-Memo wird zeitversetzt an Admin gesendet.",
    });
  } catch (error) {
    console.error("[AGENCY-LEADS-AUTOPILOT-REVIEW]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

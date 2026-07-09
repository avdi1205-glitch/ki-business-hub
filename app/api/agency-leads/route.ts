import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const ALLOWED_STAGES = new Set(["new", "qualified", "contacted", "proposal", "won", "lost"]);

type ParsedSource = {
  rawSource: string;
  baseSource: string;
  plan: string;
  intent: string;
  reason: string;
  flowSource: string;
  teamSize: string | null;
  metadata: Record<string, string>;
};

function parseSource(input: string | null): ParsedSource | null {
  if (!input) return null;

  const [baseSource, ...metaParts] = input.split("|");
  if (!baseSource.startsWith("checkout-rescue:")) return null;

  const [, plan = "unknown", intent = "unknown", reason = "unknown", ...tail] = baseSource.split(":");
  const flowSource = tail.join(":");

  if (!flowSource.includes("revenue-navigator:")) return null;

  const metadata = metaParts.reduce<Record<string, string>>((accumulator, token) => {
    const [key, ...valueParts] = token.split(":");
    if (!key || valueParts.length === 0) return accumulator;
    accumulator[key] = valueParts.join(":");
    return accumulator;
  }, {});

  const teamSize = reason.startsWith("agency_onboarding_team_")
    ? reason.replace("agency_onboarding_team_", "")
    : null;

  return {
    rawSource: input,
    baseSource,
    plan,
    intent,
    reason,
    flowSource,
    teamSize,
    metadata,
  };
}

function buildSource(baseSource: string, metadata: Record<string, string>) {
  const suffix = Object.entries(metadata)
    .filter(([, value]) => Boolean(value))
    .map(([key, value]) => `${key}:${value}`);

  if (!suffix.length) return baseSource;
  return `${baseSource}|${suffix.join("|")}`;
}

function priority(teamSize: string | null) {
  if (teamSize === "20+") return 4;
  if (teamSize === "11-20") return 3;
  if (teamSize === "6-10") return 2;
  if (teamSize === "2-5") return 1;
  return 0;
}

function isSlaRelevant(stage: string) {
  return stage === "new" || stage === "qualified";
}

export async function GET() {
  try {
    const rows = await prisma.newsletterSubscriber.findMany({
      where: {
        source: { contains: "checkout-rescue:agency:upgrade:agency_onboarding_team_" },
      },
      select: {
        id: true,
        email: true,
        name: true,
        source: true,
        status: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      take: 200,
    });

    const leads = rows
      .map((row) => {
        const parsed = parseSource(row.source);
        if (!parsed) return null;

        return {
          id: row.id,
          email: row.email,
          name: row.name,
          status: row.status,
          createdAt: row.createdAt,
          teamSize: parsed.teamSize,
          stage: parsed.metadata.stage || "new",
          followUpCount: Number(parsed.metadata.followups || "0") || 0,
          lastFollowUpAt: parsed.metadata.lastFollowUp || null,
          consentGiven: parsed.metadata.consent === "yes",
          consentAt: parsed.metadata.consentAt || null,
          source: parsed.flowSource,
          score: parsed.flowSource.split(":").find((part) => part.startsWith("score-"))?.replace("score-", "") || null,
          priority: priority(parsed.teamSize),
        };
      })
      .filter((row): row is NonNullable<typeof row> => Boolean(row))
      .map((lead) => {
        const ageHours = (Date.now() - new Date(lead.createdAt).getTime()) / (1000 * 60 * 60);
        const slaBreached = lead.priority >= 3 && isSlaRelevant(lead.stage) && ageHours > 24;
        const slaDueAt = new Date(new Date(lead.createdAt).getTime() + 24 * 60 * 60 * 1000);

        return {
          ...lead,
          slaBreached,
          slaDueAt,
          ageHours: Number(ageHours.toFixed(1)),
        };
      })
      .sort((left, right) => {
        if (left.slaBreached !== right.slaBreached) return left.slaBreached ? -1 : 1;
        const prio = right.priority - left.priority;
        if (prio !== 0) return prio;
        return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime();
      });

    const counts = leads.reduce<Record<string, number>>((accumulator, lead) => {
      accumulator[lead.stage] = (accumulator[lead.stage] || 0) + 1;
      return accumulator;
    }, { total: leads.length });

    counts.slaBreached = leads.filter((lead) => lead.slaBreached).length;
    counts.consentMissing = leads.filter((lead) => !lead.consentGiven).length;

    return NextResponse.json({ leads, counts });
  } catch (error) {
    console.error("[AGENCY-LEADS]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const email = String(body.email || "").trim().toLowerCase();
    const stage = String(body.stage || "").trim().toLowerCase();

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    if (!ALLOWED_STAGES.has(stage)) {
      return NextResponse.json({ error: "Invalid stage" }, { status: 400 });
    }

    const current = await prisma.newsletterSubscriber.findUnique({
      where: { email },
      select: { id: true, source: true },
    });

    if (!current || !current.source) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    const parsed = parseSource(current.source);
    if (!parsed) {
      return NextResponse.json({ error: "Lead is not an agency lead" }, { status: 400 });
    }

    const updatedSource = buildSource(parsed.baseSource, {
      ...parsed.metadata,
      stage,
      stageUpdatedAt: new Date().toISOString().slice(0, 10),
    });

    await prisma.newsletterSubscriber.update({
      where: { email },
      data: { source: updatedSource },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[AGENCY-LEADS]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

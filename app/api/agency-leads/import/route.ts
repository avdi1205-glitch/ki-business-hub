import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type ImportRow = {
  email: string;
  name?: string;
  teamSize?: string;
  score?: number;
  stage?: string;
  consent?: boolean;
  optOut?: boolean;
};

const ALLOWED_TEAM_SIZES = new Set(["2-5", "6-10", "11-20", "20+"]);
const ALLOWED_STAGES = new Set(["new", "qualified", "contacted", "proposal", "won", "lost"]);

function normalizeTeamSize(input: string | undefined) {
  const value = String(input || "").trim();
  if (ALLOWED_TEAM_SIZES.has(value)) return value;
  return "2-5";
}

function normalizeStage(input: string | undefined) {
  const value = String(input || "").trim().toLowerCase();
  if (ALLOWED_STAGES.has(value)) return value;
  return "new";
}

function normalizeScore(input: number | undefined) {
  const numeric = Number(input);
  if (!Number.isFinite(numeric)) return 70;
  const rounded = Math.round(numeric);
  return Math.max(0, Math.min(100, rounded));
}

function buildAgencySource(row: Required<Pick<ImportRow, "teamSize" | "score" | "stage" | "consent" | "optOut">>) {
  const today = new Date().toISOString().slice(0, 10);
  const base = `checkout-rescue:agency:upgrade:agency_onboarding_team_${row.teamSize}:revenue-navigator:score-${row.score}`;

  return [
    base,
    `stage:${row.stage}`,
    "followups:0",
    `consent:${row.consent ? "yes" : "no"}`,
    `consentAt:${row.consent ? today : ""}`,
    `optOut:${row.optOut ? "yes" : "no"}`,
    `optOutAt:${row.optOut ? today : ""}`,
  ].join("|");
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const rows = Array.isArray(body?.rows) ? (body.rows as ImportRow[]) : [];

    if (!rows.length) {
      return NextResponse.json({ error: "No rows provided" }, { status: 400 });
    }

    if (rows.length > 1000) {
      return NextResponse.json({ error: "Too many rows. Maximum is 1000." }, { status: 400 });
    }

    const cleaned = rows
      .map((row) => ({
        email: String(row.email || "").trim().toLowerCase(),
        name: String(row.name || "").trim() || null,
        teamSize: normalizeTeamSize(row.teamSize),
        score: normalizeScore(row.score),
        stage: normalizeStage(row.stage),
        consent: Boolean(row.consent),
        optOut: Boolean(row.optOut),
      }))
      .filter((row) => row.email.includes("@"));

    if (!cleaned.length) {
      return NextResponse.json({ error: "No valid emails found in import" }, { status: 400 });
    }

    const operations = cleaned.map((row) =>
      prisma.newsletterSubscriber.upsert({
        where: { email: row.email },
        update: {
          name: row.name,
          status: "subscribed",
          source: buildAgencySource(row),
        },
        create: {
          email: row.email,
          name: row.name,
          status: "subscribed",
          source: buildAgencySource(row),
        },
      })
    );

    const result = await prisma.$transaction(operations);

    return NextResponse.json({
      success: true,
      imported: result.length,
      skipped: rows.length - cleaned.length,
    });
  } catch (error) {
    console.error("[AGENCY-LEADS-IMPORT]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

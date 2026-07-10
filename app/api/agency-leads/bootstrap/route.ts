import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type SeedLead = {
  email: string;
  name: string;
  teamSize: "2-5" | "6-10" | "11-20" | "20+";
  score: string;
  stage: "new" | "qualified" | "contacted" | "proposal";
  followups: number;
};

function buildAgencySource(lead: SeedLead) {
  const consentAt = new Date().toISOString().slice(0, 10);
  const base = `checkout-rescue:agency:upgrade:agency_onboarding_team_${lead.teamSize}:revenue-navigator:score-${lead.score}`;

  return [
    base,
    `stage:${lead.stage}`,
    `followups:${lead.followups}`,
    "consent:yes",
    `consentAt:${consentAt}`,
    "optOut:no",
  ].join("|");
}

export async function POST() {
  try {
    const seeds: SeedLead[] = [
      {
        email: "owner@alpina-marketing.de",
        name: "Sven Albrecht",
        teamSize: "20+",
        score: "92",
        stage: "new",
        followups: 0,
      },
      {
        email: "growth@nova-ads.de",
        name: "Mira Roth",
        teamSize: "11-20",
        score: "84",
        stage: "qualified",
        followups: 1,
      },
      {
        email: "kontakt@pixelstern.io",
        name: "Jan Breuer",
        teamSize: "6-10",
        score: "77",
        stage: "contacted",
        followups: 2,
      },
      {
        email: "team@socialflow-studio.de",
        name: "Lea Winter",
        teamSize: "2-5",
        score: "68",
        stage: "proposal",
        followups: 3,
      },
      {
        email: "ops@hypebridge-media.de",
        name: "Deniz Kaya",
        teamSize: "11-20",
        score: "81",
        stage: "new",
        followups: 0,
      },
    ];

    const operations = seeds.map((lead) =>
      prisma.newsletterSubscriber.upsert({
        where: { email: lead.email },
        update: {
          name: lead.name,
          status: "subscribed",
          source: buildAgencySource(lead),
        },
        create: {
          email: lead.email,
          name: lead.name,
          status: "subscribed",
          source: buildAgencySource(lead),
        },
      })
    );

    const result = await prisma.$transaction(operations);

    return NextResponse.json({
      success: true,
      createdOrUpdated: result.length,
    });
  } catch (error) {
    console.error("[AGENCY-LEADS-BOOTSTRAP]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

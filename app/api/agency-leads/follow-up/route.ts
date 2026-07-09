import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getResend } from "@/lib/resend";

function parseSource(input: string | null) {
  if (!input) return null;
  const [baseSource, ...metaParts] = input.split("|");
  if (!baseSource.startsWith("checkout-rescue:agency:upgrade:agency_onboarding_team_")) return null;

  const teamSize = baseSource.replace("checkout-rescue:agency:upgrade:agency_onboarding_team_", "").split(":")[0] || null;
  const metadata = metaParts.reduce<Record<string, string>>((accumulator, token) => {
    const [key, ...valueParts] = token.split(":");
    if (!key || !valueParts.length) return accumulator;
    accumulator[key] = valueParts.join(":");
    return accumulator;
  }, {});

  return { baseSource, teamSize, metadata };
}

function priority(teamSize: string | null) {
  if (teamSize === "20+") return 4;
  if (teamSize === "11-20") return 3;
  if (teamSize === "6-10") return 2;
  return 1;
}

function buildSource(baseSource: string, metadata: Record<string, string>) {
  const suffix = Object.entries(metadata)
    .filter(([, value]) => Boolean(value))
    .map(([key, value]) => `${key}:${value}`);

  return suffix.length ? `${baseSource}|${suffix.join("|")}` : baseSource;
}

export async function POST() {
  try {
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

    const targets = rows
      .map((row) => {
        const parsed = parseSource(row.source);
        if (!parsed) return null;
        return { ...row, parsed };
      })
      .filter((row): row is NonNullable<typeof row> => Boolean(row))
      .filter((row) => priority(row.parsed.teamSize) >= 3)
      .slice(0, 20);

    if (!targets.length) {
      return NextResponse.json({ success: true, sent: 0, message: "No hot/high agency leads." });
    }

    const fromEmail = process.env.CONTACT_LEAD_FROM_EMAIL || process.env.RESEND_FROM_EMAIL;
    if (!process.env.RESEND_API_KEY || !fromEmail) {
      return NextResponse.json({ error: "Resend is not configured" }, { status: 503 });
    }

    const resend = await getResend();
    const today = new Date().toISOString().slice(0, 10);

    let sent = 0;
    for (const target of targets) {
      await resend.emails.send({
        from: fromEmail,
        to: target.email,
        subject: "Nexmoneta Agency Setup: naechster Schritt",
        html: `
          <div style="font-family:Arial,sans-serif;line-height:1.6;color:#0f172a;max-width:620px;margin:0 auto;padding:24px;">
            <h1 style="margin-bottom:14px;">Naechster Schritt fuer dein Agency Setup</h1>
            <p>Hallo ${target.name || ""},</p>
            <p>danke fuer dein Interesse an der Agency-Stufe. Wenn du willst, planen wir den naechsten Schritt direkt und priorisieren die wichtigsten Hebel fuer dein Team.</p>
            <p style="margin-top:18px;">Antwort auf diese E-Mail mit:</p>
            <ul>
              <li>Teamgroesse und Rollen</li>
              <li>Hauptziel fuer die naechsten 30 Tage</li>
              <li>aktueller Bottleneck (Traffic, Leads oder Conversion)</li>
            </ul>
            <p>Dann schicken wir dir den passenden Agency-Setup-Plan.</p>
          </div>
        `,
      });

      const nextFollowups = (Number(target.parsed.metadata.followups || "0") || 0) + 1;
      const nextSource = buildSource(target.parsed.baseSource, {
        ...target.parsed.metadata,
        followups: String(nextFollowups),
        lastFollowUp: today,
      });

      await prisma.newsletterSubscriber.update({
        where: { email: target.email },
        data: { source: nextSource },
      });

      sent += 1;
    }

    return NextResponse.json({ success: true, sent });
  } catch (error) {
    console.error("[AGENCY-LEADS-FOLLOW-UP]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

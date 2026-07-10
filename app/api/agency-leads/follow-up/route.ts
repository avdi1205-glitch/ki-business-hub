import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getResend } from "@/lib/resend";

type FollowUpRequest = {
  confirmSend?: boolean;
  maxSend?: number;
  allowOutsideWindow?: boolean;
};

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

function isOpenStage(stage: string | undefined) {
  return stage === "new" || stage === "qualified" || stage === "contacted";
}

function buildSource(baseSource: string, metadata: Record<string, string>) {
  const suffix = Object.entries(metadata)
    .filter(([, value]) => Boolean(value))
    .map(([key, value]) => `${key}:${value}`);

  return suffix.length ? `${baseSource}|${suffix.join("|")}` : baseSource;
}

function buildDraftEmail(name: string | null) {
  return {
    subject: "Nexmoneta Agency Setup: naechster Schritt",
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#0f172a;max-width:620px;margin:0 auto;padding:24px;">
        <h1 style="margin-bottom:14px;">Naechster Schritt fuer dein Agency Setup</h1>
        <p>Hallo ${name || ""},</p>
        <p>danke fuer dein Interesse an der Agency-Stufe. Wenn du willst, planen wir den naechsten Schritt direkt und priorisieren die wichtigsten Hebel fuer dein Team.</p>
        <p style="margin-top:18px;">Antwort auf diese E-Mail mit:</p>
        <ul>
          <li>Teamgroesse und Rollen</li>
          <li>Hauptziel fuer die naechsten 30 Tage</li>
          <li>aktueller Bottleneck (Traffic, Leads oder Conversion)</li>
        </ul>
        <p>Dann schicken wir dir den passenden Agency-Setup-Plan.</p>
        <p style="margin-top:10px;color:#475569;font-size:12px;">Transparenz: Teile von Analysen, Empfehlungen oder Entwuerfen koennen mit KI-Unterstuetzung erstellt sein.</p>
        <p style="margin-top:14px;color:#475569;font-size:12px;">Wenn du keine weiteren Follow-up-Mails moechtest, antworte bitte mit STOP.</p>
      </div>
    `,
  };
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
      status: { in: ["lead_new", "subscribed"] },
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

export async function GET() {
  try {
    const targets = await loadTargets();
    const dailyLimit = Math.max(1, Math.min(100, Number(process.env.AGENCY_LEADS_DAILY_SEND_LIMIT || "20")));
    const alreadySentToday = await countAlreadySentToday();

    return NextResponse.json({
      success: true,
      mode: "preview",
      totalCandidates: targets.length,
      sendWindowOpen: isInSendWindow(),
      dailyLimit,
      alreadySentToday,
      remainingToday: Math.max(0, dailyLimit - alreadySentToday),
      drafts: targets.slice(0, 20).map((target) => ({
        email: target.email,
        name: target.name,
        teamSize: target.parsed.teamSize,
        stage: target.parsed.metadata.stage || "new",
        followUpCount: Number(target.parsed.metadata.followups || "0") || 0,
        subject: buildDraftEmail(target.name).subject,
      })),
    });
  } catch (error) {
    console.error("[AGENCY-LEADS-FOLLOW-UP-PREVIEW]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    let body: FollowUpRequest = {};
    try {
      body = (await request.json()) as FollowUpRequest;
    } catch {
      body = {};
    }

    const targets = (await loadTargets()).slice(0, 20);
    const dailyLimit = Math.max(1, Math.min(100, Number(process.env.AGENCY_LEADS_DAILY_SEND_LIMIT || "20")));
    const alreadySentToday = await countAlreadySentToday();
    const remainingToday = Math.max(0, dailyLimit - alreadySentToday);
    const sendWindowOpen = isInSendWindow();

    if (!body.confirmSend) {
      return NextResponse.json({
        success: true,
        mode: "preview",
        message: "Preview only. Send is blocked until confirmSend=true.",
        totalCandidates: targets.length,
        sendWindowOpen,
        dailyLimit,
        alreadySentToday,
        remainingToday,
        drafts: targets.map((target) => ({
          email: target.email,
          name: target.name,
          teamSize: target.parsed.teamSize,
          stage: target.parsed.metadata.stage || "new",
          followUpCount: Number(target.parsed.metadata.followups || "0") || 0,
          subject: buildDraftEmail(target.name).subject,
        })),
      });
    }

    if (!body.allowOutsideWindow && !sendWindowOpen) {
      return NextResponse.json({
        error: "Send blocked outside business window (Mon-Fri, 08:00-18:00 Europe/Berlin).",
      }, { status: 400 });
    }

    if (remainingToday <= 0) {
      return NextResponse.json({
        success: true,
        mode: "sent",
        sent: 0,
        message: "Daily send limit reached. Try again tomorrow or raise AGENCY_LEADS_DAILY_SEND_LIMIT.",
        dailyLimit,
        alreadySentToday,
      });
    }

    if (!targets.length) {
      return NextResponse.json({ success: true, sent: 0, message: "No hot/high agency leads." });
    }

    const fromEmail = process.env.CONTACT_LEAD_FROM_EMAIL || process.env.RESEND_FROM_EMAIL;
    if (!process.env.RESEND_API_KEY || !fromEmail) {
      return NextResponse.json({ error: "Resend is not configured" }, { status: 503 });
    }

    const resend = await getResend();
    const today = new Date().toISOString().slice(0, 10);
    const maxSend = Math.max(1, Math.min(20, Number(body.maxSend || 20)));
    const sendTargets = targets.slice(0, Math.min(maxSend, remainingToday));

    let sent = 0;
    for (const target of sendTargets) {
      const draft = buildDraftEmail(target.name);
      await resend.emails.send({
        from: fromEmail,
        to: target.email,
        subject: draft.subject,
        html: draft.html,
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

    return NextResponse.json({
      success: true,
      mode: "sent",
      sent,
      requested: maxSend,
      totalCandidates: targets.length,
      dailyLimit,
      alreadySentToday,
      remainingToday: Math.max(0, dailyLimit - (alreadySentToday + sent)),
    });
  } catch (error) {
    console.error("[AGENCY-LEADS-FOLLOW-UP]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

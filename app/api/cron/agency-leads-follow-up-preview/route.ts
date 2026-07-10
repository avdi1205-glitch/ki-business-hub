import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getResend } from "@/lib/resend";

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

function isInSendWindow(date = new Date()) {
  const formatter = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Berlin",
    weekday: "short",
    hour: "2-digit",
    hourCycle: "h23",
  });
  const parts = formatter.formatToParts(date);
  const weekday = parts.find((part) => part.type === "weekday")?.value || "Mon";
  const hour = Number(parts.find((part) => part.type === "hour")?.value || "0");
  const isWeekday = ["Mon", "Tue", "Wed", "Thu", "Fri"].includes(weekday);
  return isWeekday && hour >= 8 && hour < 18;
}

export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "CRON_SECRET is not configured" }, { status: 503 });
  }

  const authorization = request.headers.get("authorization");
  if (authorization !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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

    const today = new Date().toISOString().slice(0, 10);
    const candidates = rows
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
      .filter((row) => row.parsed.metadata.lastFollowUp !== today)
      .slice(0, 20);

    const fromEmail = process.env.CONTACT_LEAD_FROM_EMAIL || process.env.RESEND_FROM_EMAIL;
    const adminEmail = process.env.CONTACT_LEAD_NOTIFY_EMAIL || "nexmoneta@gmail.com";

    if (process.env.RESEND_API_KEY && fromEmail) {
      const resend = await getResend();
      await resend.emails.send({
        from: fromEmail,
        to: adminEmail,
        subject: "Agency Follow-up Vorschau (Bot)",
        html: `
          <div style="font-family:Arial,sans-serif;line-height:1.6;color:#0f172a;max-width:640px;margin:0 auto;padding:24px;">
            <h1 style="margin-bottom:12px;">Agency Follow-up Vorschau</h1>
            <p><strong>Kandidaten heute:</strong> ${candidates.length}</p>
            <p><strong>Versandfenster offen:</strong> ${isInSendWindow() ? "ja" : "nein"} (Mo-Fr, 08:00-18:00 Europe/Berlin)</p>
            <p style="margin-top:14px;">Bitte in der Admin-Ansicht die Vorschau pruefen und Versand manuell freigeben.</p>
            <ul>
              ${candidates.slice(0, 10).map((candidate) => `<li>${candidate.email} (${candidate.parsed.teamSize || "-"}, stage: ${candidate.parsed.metadata.stage || "new"})</li>`).join("")}
            </ul>
          </div>
        `,
      });
    }

    return NextResponse.json({
      success: true,
      candidates: candidates.length,
      sendWindowOpen: isInSendWindow(),
    });
  } catch (error) {
    console.error("[CRON-AGENCY-LEADS-FOLLOW-UP-PREVIEW]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

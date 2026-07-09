import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getResend } from "@/lib/resend";

function parseMeta(source: string | null) {
  if (!source) return { stage: "new" };
  const tokens = source.split("|").slice(1);
  const meta = tokens.reduce<Record<string, string>>((accumulator, token) => {
    const [key, ...values] = token.split(":");
    if (!key || !values.length) return accumulator;
    accumulator[key] = values.join(":");
    return accumulator;
  }, {});
  return { stage: meta.stage || "new" };
}

export async function POST() {
  try {
    const since = new Date();
    since.setDate(since.getDate() - 7);

    const leads = await prisma.newsletterSubscriber.findMany({
      where: {
        source: { contains: "checkout-rescue:agency:upgrade:agency_onboarding_team_" },
        createdAt: { gte: since },
      },
      select: {
        email: true,
        source: true,
        status: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      take: 200,
    });

    const byStage = leads.reduce<Record<string, number>>((accumulator, row) => {
      const stage = parseMeta(row.source).stage;
      accumulator[stage] = (accumulator[stage] || 0) + 1;
      return accumulator;
    }, {});

    const byStatus = leads.reduce<Record<string, number>>((accumulator, row) => {
      accumulator[row.status] = (accumulator[row.status] || 0) + 1;
      return accumulator;
    }, {});

    const fromEmail = process.env.CONTACT_LEAD_FROM_EMAIL || process.env.RESEND_FROM_EMAIL;
    const toEmail = process.env.CONTACT_LEAD_NOTIFY_EMAIL || "nexmoneta@gmail.com";

    if (!process.env.RESEND_API_KEY || !fromEmail) {
      return NextResponse.json({ error: "Resend is not configured" }, { status: 503 });
    }

    const resend = await getResend();
    await resend.emails.send({
      from: fromEmail,
      to: toEmail,
      subject: "Weekly Agency Lead Report",
      html: `
        <div style="font-family:Arial,sans-serif;line-height:1.6;color:#0f172a;max-width:640px;margin:0 auto;padding:24px;">
          <h1 style="margin-bottom:12px;">Weekly Agency Lead Report</h1>
          <p>Zeitraum: letzte 7 Tage</p>
          <p><strong>Total Leads:</strong> ${leads.length}</p>
          <h2 style="margin-top:20px;">Nach Stage</h2>
          <ul>${Object.entries(byStage).map(([key, value]) => `<li>${key}: ${value}</li>`).join("")}</ul>
          <h2 style="margin-top:20px;">Nach Status</h2>
          <ul>${Object.entries(byStatus).map(([key, value]) => `<li>${key}: ${value}</li>`).join("")}</ul>
        </div>
      `,
    });

    return NextResponse.json({ success: true, total: leads.length });
  } catch (error) {
    console.error("[AGENCY-LEADS-WEEKLY-REPORT]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

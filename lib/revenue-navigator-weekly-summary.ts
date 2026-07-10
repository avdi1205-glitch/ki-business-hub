import { prisma } from "@/lib/prisma";
import { getResend } from "@/lib/resend";
import { getSiteUrl } from "@/lib/site-url";

type ScanRow = {
  email: string;
  plan: string;
  focus: string;
  opportunityScore: number;
  projectedMonthlyLift: number;
  summary: string;
  createdAt: Date;
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);
}

function focusLabel(focus: string) {
  if (focus === "leadgen") return "Leadgen";
  if (focus === "ads") return "Ads";
  if (focus === "membership") return "Mitgliedschaft";
  return "Affiliate";
}

export async function sendRevenueNavigatorWeeklySummary() {
  const fromEmail = process.env.CONTACT_LEAD_FROM_EMAIL || process.env.RESEND_FROM_EMAIL;
  if (!process.env.RESEND_API_KEY || !fromEmail) {
    throw new Error("Resend is not configured");
  }

  const since = new Date();
  since.setDate(since.getDate() - 7);

  const scans = await prisma.revenueNavigatorScan.findMany({
    where: { createdAt: { gte: since } },
    orderBy: { createdAt: "desc" },
    select: {
      email: true,
      plan: true,
      focus: true,
      opportunityScore: true,
      projectedMonthlyLift: true,
      summary: true,
      createdAt: true,
    },
    take: 500,
  }).catch(() => [] as ScanRow[]);

  if (!scans.length) {
    return { success: true, sent: 0, customers: 0, message: "No recent scans." };
  }

  const activeEntitlements = await prisma.customerEntitlement.findMany({
    where: { status: { in: ["active", "trialing", "past_due"] } },
    select: { email: true },
  });
  const allowedEmails = new Set(activeEntitlements.map((row) => row.email));

  const grouped = scans.reduce<Record<string, ScanRow[]>>((accumulator, scan) => {
    if (!allowedEmails.has(scan.email)) return accumulator;
    accumulator[scan.email] = accumulator[scan.email] || [];
    accumulator[scan.email].push(scan);
    return accumulator;
  }, {});

  const resend = await getResend();
  const workspaceUrl = `${getSiteUrl()}/konto/revenue-navigator`;
  const adminEmail = process.env.CONTACT_LEAD_NOTIFY_EMAIL || "nexmoneta@gmail.com";

  let sent = 0;
  for (const [email, customerScans] of Object.entries(grouped)) {
    const latest = customerScans[0];
    const averageLift = Math.round(customerScans.reduce((sum, scan) => sum + scan.projectedMonthlyLift, 0) / customerScans.length);
    const averageScore = Math.round(customerScans.reduce((sum, scan) => sum + scan.opportunityScore, 0) / customerScans.length);
    const bulletList = customerScans.slice(0, 3).map((scan) => `<li>${focusLabel(scan.focus)} • ${formatCurrency(scan.projectedMonthlyLift)} • ${scan.opportunityScore}/100</li>`).join("");

    await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: "Dein Revenue Navigator Wochenupdate",
      html: `
        <div style="font-family:Arial,sans-serif;line-height:1.6;color:#0f172a;max-width:640px;margin:0 auto;padding:24px;">
          <div style="padding:24px;border-radius:24px;background:linear-gradient(135deg,#082f49 0%,#0f766e 100%);color:#f8fafc;">
            <p style="margin:0 0 8px;font-size:12px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:#a5f3fc;">Revenue Navigator</p>
            <h1 style="margin:0 0 12px;font-size:30px;line-height:1.1;">Dein Wochenupdate ist da</h1>
            <p style="margin:0;color:#d1fae5;">Scans diese Woche: <strong>${customerScans.length}</strong> • Durchschnittlicher Lift: <strong>${formatCurrency(averageLift)}</strong> • Score: <strong>${averageScore}/100</strong></p>
          </div>

          <div style="margin-top:20px;padding:20px;border:1px solid rgba(15,23,42,0.08);border-radius:20px;background:#ffffff;">
            <p style="margin:0 0 8px;font-size:12px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#0f766e;">Letzter Scan</p>
            <p style="margin:0 0 12px;font-size:24px;font-weight:800;color:#059669;">${formatCurrency(latest.projectedMonthlyLift)}</p>
            <p style="margin:0;color:#334155;">${latest.summary}</p>
          </div>

          <div style="margin-top:18px;padding:20px;border:1px solid rgba(15,23,42,0.08);border-radius:20px;background:#f8fafc;">
            <p style="margin:0 0 8px;font-size:12px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#0891b2;">Scans dieser Woche</p>
            <ul style="margin:0;padding-left:18px;color:#334155;">${bulletList}</ul>
          </div>

          <div style="margin-top:24px;text-align:center;">
            <a href="${workspaceUrl}" style="display:inline-block;padding:14px 20px;border-radius:14px;background:#0891b2;color:#ffffff;text-decoration:none;font-weight:700;">Workspace oeffnen</a>
          </div>
        </div>
      `,
    });

    sent += 1;
  }

  await resend.emails.send({
    from: fromEmail,
    to: adminEmail,
    subject: `Revenue Navigator Wochenupdate versendet (${sent})`,
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#0f172a;max-width:560px;margin:0 auto;padding:24px;">
        <h1 style="margin-bottom:12px;">Revenue Navigator Weekly Summary</h1>
        <p><strong>Kunden erreicht:</strong> ${sent}</p>
        <p><strong>Scans ausgewertet:</strong> ${scans.length}</p>
        <p><strong>Zeitraum:</strong> letzte 7 Tage</p>
      </div>
    `,
  });

  return { success: true, sent, customers: Object.keys(grouped).length };
}
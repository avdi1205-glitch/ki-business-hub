import { prisma } from "@/lib/prisma";
import { getResend } from "@/lib/resend";
import { getSiteUrl } from "@/lib/site-url";

type EntitlementRow = {
  email: string;
  plan: string;
};

export async function sendRevenueNavigatorInactivityReminders() {
  const fromEmail = process.env.CONTACT_LEAD_FROM_EMAIL || process.env.RESEND_FROM_EMAIL;
  if (!process.env.RESEND_API_KEY || !fromEmail) {
    throw new Error("Resend is not configured");
  }

  const activeEntitlements = await prisma.customerEntitlement.findMany({
    where: {
      status: { in: ["active", "trialing", "past_due"] },
      plan: { in: ["pro", "agency"] },
    },
    select: {
      email: true,
      plan: true,
    },
  }).catch(() => [] as EntitlementRow[]);

  if (!activeEntitlements.length) {
    return { success: true, sent: 0, customers: 0, message: "No active customers." };
  }

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const recentScans = await prisma.revenueNavigatorScan.findMany({
    where: {
      createdAt: { gte: sevenDaysAgo },
      email: { in: activeEntitlements.map((row) => row.email) },
    },
    select: { email: true },
  }).catch(() => [] as Array<{ email: string }>);

  const activeEmails = new Set(recentScans.map((row) => row.email));
  const targets = activeEntitlements.filter((row) => !activeEmails.has(row.email));

  if (!targets.length) {
    return { success: true, sent: 0, customers: 0, message: "No inactive customers." };
  }

  const resend = await getResend();
  const workspaceUrl = `${getSiteUrl()}/konto/revenue-navigator`;
  const adminEmail = process.env.CONTACT_LEAD_NOTIFY_EMAIL || "nexmoneta@gmail.com";

  let sent = 0;
  for (const target of targets) {
    await resend.emails.send({
      from: fromEmail,
      to: target.email,
      subject: "Zeit für deinen nächsten Revenue Navigator Scan",
      html: `
        <div style="font-family:Arial,sans-serif;line-height:1.6;color:#0f172a;max-width:640px;margin:0 auto;padding:24px;">
          <div style="padding:24px;border-radius:24px;background:linear-gradient(135deg,#0f172a 0%,#0f766e 100%);color:#f8fafc;">
            <p style="margin:0 0 8px;font-size:12px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:#a5f3fc;">Revenue Navigator</p>
            <h1 style="margin:0 0 12px;font-size:30px;line-height:1.1;">Dein Workspace wartet auf das nächste Update</h1>
            <p style="margin:0;color:#d1fae5;">Du hast seit 7 Tagen keinen neuen Scan erzeugt. Gerade jetzt lohnt sich ein frischer Blick auf Lift, Fokus und Prioritäten.</p>
          </div>

          <div style="margin-top:20px;padding:20px;border:1px solid rgba(15,23,42,0.08);border-radius:20px;background:#ffffff;">
            <p style="margin:0 0 8px;font-size:12px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#0891b2;">Warum jetzt?</p>
            <ul style="margin:0;padding-left:18px;color:#334155;">
              <li>Neue Wochen-Priorität setzen</li>
              <li>Lift und Score mit den letzten Scans vergleichen</li>
              <li>Dein ${target.plan.toUpperCase()}-Paket wieder aktiv nutzen</li>
            </ul>
          </div>

          <div style="margin-top:24px;text-align:center;">
            <a href="${workspaceUrl}" style="display:inline-block;padding:14px 20px;border-radius:14px;background:#0891b2;color:#ffffff;text-decoration:none;font-weight:700;">Workspace öffnen</a>
          </div>
        </div>
      `,
    });
    sent += 1;
  }

  await resend.emails.send({
    from: fromEmail,
    to: adminEmail,
    subject: `Revenue Navigator Reminder versendet (${sent})`,
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#0f172a;max-width:560px;margin:0 auto;padding:24px;">
        <h1 style="margin-bottom:12px;">Revenue Navigator Reminder</h1>
        <p><strong>Erinnerungen versendet:</strong> ${sent}</p>
        <p><strong>Inaktive Kunden:</strong> ${targets.length}</p>
      </div>
    `,
  });

  return { success: true, sent, customers: targets.length };
}
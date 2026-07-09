import { prisma } from "@/lib/prisma";
import { getResend } from "@/lib/resend";

type LeadPayload = {
  email?: string;
  name?: string;
  plan?: string;
  source?: string;
  intent?: string;
  reason?: string;
};

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function buildLeadSource(payload: LeadPayload) {
  const plan = (payload.plan || "unknown").toLowerCase();
  const intent = (payload.intent || "contact").toLowerCase();
  const reason = (payload.reason || "none").toLowerCase();
  const source = (payload.source || "website").toLowerCase();
  return `checkout-rescue:${plan}:${intent}:${reason}:${source}`;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as LeadPayload;
    const normalizedEmail = String(body.email || "").trim().toLowerCase();
    const normalizedName = body.name ? String(body.name).trim() : undefined;
    const normalizedPlan = body.plan ? String(body.plan).trim().toLowerCase() : "unknown";
    const normalizedSource = body.source ? String(body.source).trim() : "website";
    const normalizedIntent = body.intent ? String(body.intent).trim() : "contact";
    const normalizedReason = body.reason ? String(body.reason).trim() : "none";

    if (!normalizedEmail || !isValidEmail(normalizedEmail)) {
      return Response.json({ error: "Valid email is required" }, { status: 400 });
    }

    const leadSource = buildLeadSource(body);

    const existing = await prisma.newsletterSubscriber.findUnique({
      where: { email: normalizedEmail },
      select: { email: true, status: true },
    });


    const adminEmail = process.env.CONTACT_LEAD_NOTIFY_EMAIL || "nexmoneta@gmail.com";
    const fromEmail = process.env.CONTACT_LEAD_FROM_EMAIL || process.env.RESEND_FROM_EMAIL;

    if (process.env.RESEND_API_KEY && fromEmail) {
      try {
        const resend = await getResend();
        await resend.emails.send({
          from: fromEmail,
          to: adminEmail,
          subject: `Neue Lead-Anfrage: ${normalizedEmail}`,
          html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #0f172a; max-width: 640px; margin: 0 auto; padding: 24px;">
              <h1 style="margin-bottom: 16px;">Neue Lead-Anfrage bei Nexmoneta</h1>
              <p><strong>Name:</strong> ${normalizedName || "-"}</p>
              <p><strong>E-Mail:</strong> ${normalizedEmail}</p>
              <p><strong>Plan:</strong> ${normalizedPlan}</p>
              <p><strong>Quelle:</strong> ${normalizedSource}</p>
              <p><strong>Intent:</strong> ${normalizedIntent}</p>
              <p><strong>Grund:</strong> ${normalizedReason}</p>
              <p><strong>Lead-Status:</strong> lead_new</p>
              <p style="margin-top: 20px; color: #475569;">Die Anfrage wurde bereits in der Datenbank gespeichert.</p>
            </div>
          `,
        });
      } catch (mailError) {
        console.warn("[CONTACT-LEAD] Admin notification could not be sent", mailError);
      }
    }
    if (existing) {
      const keepSubscribed = existing.status === "subscribed";
      await prisma.newsletterSubscriber.update({
        where: { email: normalizedEmail },
        data: {
          name: normalizedName,
          source: leadSource,
          status: keepSubscribed ? "subscribed" : "lead_new",
        },
      });
    } else {
      await prisma.newsletterSubscriber.create({
        data: {
          email: normalizedEmail,
          name: normalizedName,
          source: leadSource,
          status: "lead_new",
        },
      });
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error("[CONTACT-LEAD]", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

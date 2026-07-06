import { prisma } from "@/lib/prisma";

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

    if (!normalizedEmail || !isValidEmail(normalizedEmail)) {
      return Response.json({ error: "Valid email is required" }, { status: 400 });
    }

    const leadSource = buildLeadSource(body);

    const existing = await prisma.newsletterSubscriber.findUnique({
      where: { email: normalizedEmail },
      select: { email: true, status: true },
    });

    if (existing) {
      const keepSubscribed = existing.status === "subscribed";
      await prisma.newsletterSubscriber.update({
        where: { email: normalizedEmail },
        data: {
          name: normalizedName,
          source: leadSource,
          status: keepSubscribed ? "subscribed" : "lead",
        },
      });
    } else {
      await prisma.newsletterSubscriber.create({
        data: {
          email: normalizedEmail,
          name: normalizedName,
          source: leadSource,
          status: "lead",
        },
      });
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error("[CONTACT-LEAD]", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

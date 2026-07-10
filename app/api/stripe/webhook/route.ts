import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { getResend } from "@/lib/resend";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

const stripe = stripeSecretKey ? new Stripe(stripeSecretKey) : null;

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function getPriceMapping() {
  return {
    pro: process.env.STRIPE_PRO_PRICE_ID,
    agency: process.env.STRIPE_AGENCY_PRICE_ID,
  };
}

function normalizeEntitlementStatus(status: string | null | undefined) {
  if (
    status === "active" ||
    status === "trialing" ||
    status === "past_due" ||
    status === "unpaid" ||
    status === "canceled"
  ) {
    return status;
  }

  return "active";
}

function getGraceUntil() {
  return new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
}

async function sendBillingFailedNotice(email: string, plan: string, graceUntil: Date) {
  const fromEmail = process.env.CONTACT_LEAD_FROM_EMAIL || process.env.RESEND_FROM_EMAIL;
  if (!process.env.RESEND_API_KEY || !fromEmail) {
    return;
  }

  const resend = await getResend();
  await resend.emails.send({
    from: fromEmail,
    to: email,
    subject: "Dein Nexmoneta-Zugang: Zahlung braucht deine Aufmerksamkeit",
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#0f172a;max-width:600px;margin:0 auto;padding:24px;">
        <h1 style="margin-bottom:12px;">Zahlung ausstehend</h1>
        <p>Hallo,</p>
        <p>wir konnten die letzte Zahlung fuer dein <strong>${plan.toUpperCase()}</strong>-Paket nicht einziehen.</p>
        <p>Dein Zugang bleibt noch bis <strong>${graceUntil.toLocaleDateString("de-DE")}</strong> aktiv. Danach wird er automatisch gesperrt, falls keine Zahlung erfolgt.</p>
        <p style="margin-top:18px;">Bitte pruefe deine Zahlungsmethode oder buche den Plan erneut, damit dein Zugang aktiv bleibt.</p>
        <p style="margin-top:14px;color:#475569;font-size:12px;">Diese Nachricht ist Teil der automatischen Billing-Kommunikation.</p>
      </div>
    `,
  });
}

async function sendBillingRestoredNotice(email: string, plan: string) {
  const fromEmail = process.env.CONTACT_LEAD_FROM_EMAIL || process.env.RESEND_FROM_EMAIL;
  if (!process.env.RESEND_API_KEY || !fromEmail) {
    return;
  }

  const resend = await getResend();
  await resend.emails.send({
    from: fromEmail,
    to: email,
    subject: "Dein Nexmoneta-Zugang ist wieder aktiv",
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#0f172a;max-width:600px;margin:0 auto;padding:24px;">
        <h1 style="margin-bottom:12px;">Zugang wieder freigeschaltet</h1>
        <p>Hallo,</p>
        <p>deine Zahlung fuer das <strong>${plan.toUpperCase()}</strong>-Paket ist wieder erfolgreich eingegangen.</p>
        <p>Dein Nexmoneta-Zugang ist jetzt wieder aktiv.</p>
        <p style="margin-top:14px;color:#475569;font-size:12px;">Diese Nachricht bestaetigt die erfolgreiche Reaktivierung.</p>
      </div>
    `,
  });
}

async function loadEntitlementMatch(input: { customerId?: string | null; subscriptionId?: string | null; email?: string | null }) {
  const conditions: Array<Record<string, string>> = [];

  if (input.customerId) {
    conditions.push({ stripeCustomerId: input.customerId });
  }

  if (input.subscriptionId) {
    conditions.push({ stripeSubscriptionId: input.subscriptionId });
  }

  if (input.email) {
    conditions.push({ email: normalizeEmail(input.email) });
  }

  if (!conditions.length) {
    return null;
  }

  return prisma.customerEntitlement.findFirst({
    where: { OR: conditions },
    orderBy: { updatedAt: "desc" },
  });
}

function planFromAmount(amountTotal: number | null) {
  if (typeof amountTotal !== "number") return null;
  if (amountTotal >= 12000) return "agency";
  if (amountTotal >= 2500) return "pro";
  return null;
}

async function resolvePlanFromCheckoutSession(session: Stripe.Checkout.Session) {
  const metadataPlan = session.metadata?.plan?.toLowerCase();
  if (metadataPlan === "pro" || metadataPlan === "agency") return metadataPlan;

  if (!stripe) return planFromAmount(session.amount_total);

  try {
    const lineItems = await stripe.checkout.sessions.listLineItems(session.id, { limit: 10 });
    const prices = lineItems.data.map((item) => item.price?.id).filter(Boolean) as string[];
    const mapping = getPriceMapping();

    if (mapping.pro && prices.includes(mapping.pro)) return "pro";
    if (mapping.agency && prices.includes(mapping.agency)) return "agency";
  } catch (error) {
    console.warn("[Stripe webhook] Could not resolve plan from line items", error);
  }

  return planFromAmount(session.amount_total);
}

async function upsertEntitlementFromCheckout(session: Stripe.Checkout.Session) {
  const email = session.customer_details?.email || session.customer_email;
  if (!email) {
    console.warn("[Stripe webhook] checkout completed without customer email");
    return;
  }

  const normalizedEmail = normalizeEmail(email);
  const plan = await resolvePlanFromCheckoutSession(session);
  const stripeSubscriptionId = typeof session.subscription === "string" ? session.subscription : null;
  const status = session.payment_status === "paid" ? "active" : "trialing";

  if (!plan) {
    console.warn("[Stripe webhook] could not determine plan for checkout session", session.id);
    return;
  }

  const existingBySession = await prisma.customerEntitlement.findFirst({
    where: {
      stripeSessionId: session.id,
    },
  });

  if (existingBySession) {
    await prisma.customerEntitlement.update({
      where: { id: existingBySession.id },
      data: {
        email: normalizedEmail,
        plan,
        status,
        stripeCustomerId: typeof session.customer === "string" ? session.customer : null,
        stripeSubscriptionId,
        source: session.metadata?.source || "stripe_webhook",
      },
    });
    return;
  }

  const existingByEmailPlan = await prisma.customerEntitlement.findFirst({
    where: {
      email: normalizedEmail,
      plan,
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  if (existingByEmailPlan) {
    await prisma.customerEntitlement.update({
      where: { id: existingByEmailPlan.id },
      data: {
        status,
        stripeCustomerId: typeof session.customer === "string" ? session.customer : null,
        stripeSubscriptionId,
        stripeSessionId: session.id,
        source: session.metadata?.source || "stripe_webhook",
      },
    });
    return;
  }

  await prisma.customerEntitlement.create({
    data: {
      email: normalizedEmail,
      plan,
      status,
      stripeCustomerId: typeof session.customer === "string" ? session.customer : null,
      stripeSubscriptionId,
      stripeSessionId: session.id,
      source: session.metadata?.source || "stripe_webhook",
    },
  });
}

async function syncEntitlementStatus(input: {
  customerId?: string | null;
  subscriptionId?: string | null;
  email?: string | null;
  status: string;
  graceUntil?: Date | null;
}) {
  const conditions: Array<Record<string, string>> = [];

  if (input.customerId) {
    conditions.push({ stripeCustomerId: input.customerId });
  }

  if (input.subscriptionId) {
    conditions.push({ stripeSubscriptionId: input.subscriptionId });
  }

  if (input.email) {
    conditions.push({ email: normalizeEmail(input.email) });
  }

  if (!conditions.length) {
    return;
  }

  await prisma.customerEntitlement.updateMany({
    where: {
      OR: conditions,
    },
    data: {
      status: normalizeEntitlementStatus(input.status),
      graceUntil: input.status === "past_due" ? input.graceUntil || getGraceUntil() : null,
    },
  });
}

export async function POST(req: NextRequest) {
  if (!stripe || !stripeWebhookSecret) {
    return NextResponse.json({ ok: false, error: "stripe_not_configured" }, { status: 503 });
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ ok: false, error: "missing_signature" }, { status: 400 });
  }

  const body = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, stripeWebhookSecret);
  } catch (error) {
    console.error("[Stripe webhook] signature verification failed", error);
    return NextResponse.json({ ok: false, error: "invalid_signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
      case "checkout.session.async_payment_succeeded": {
        const session = event.data.object as Stripe.Checkout.Session;
        await upsertEntitlementFromCheckout(session);
        break;
      }
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const match = await loadEntitlementMatch({
          customerId: typeof subscription.customer === "string" ? subscription.customer : null,
          subscriptionId: subscription.id,
        });

        await syncEntitlementStatus({
          customerId: typeof subscription.customer === "string" ? subscription.customer : null,
          subscriptionId: subscription.id,
          status: subscription.status,
          graceUntil: subscription.status === "past_due" || subscription.status === "unpaid" ? getGraceUntil() : null,
        });

        if (match?.status === "past_due" && subscription.status === "active") {
          try {
            await sendBillingRestoredNotice(match.email, match.plan);
          } catch (error) {
            console.warn("[Stripe webhook] Restored notice could not be sent", error);
          }
        }
        break;
      }
      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice & { subscription?: string | null };
        const match = await loadEntitlementMatch({
          customerId: typeof invoice.customer === "string" ? invoice.customer : null,
          subscriptionId: typeof invoice.subscription === "string" ? invoice.subscription : null,
        });

        await syncEntitlementStatus({
          customerId: typeof invoice.customer === "string" ? invoice.customer : null,
          subscriptionId: typeof invoice.subscription === "string" ? invoice.subscription : null,
          status: "past_due",
          graceUntil: getGraceUntil(),
        });

        if (match) {
          try {
            await sendBillingFailedNotice(match.email, match.plan, getGraceUntil());
          } catch (error) {
            console.warn("[Stripe webhook] Billing notice could not be sent", error);
          }
        }
        break;
      }
      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice & { subscription?: string | null };
        const match = await loadEntitlementMatch({
          customerId: typeof invoice.customer === "string" ? invoice.customer : null,
          subscriptionId: typeof invoice.subscription === "string" ? invoice.subscription : null,
        });

        await syncEntitlementStatus({
          customerId: typeof invoice.customer === "string" ? invoice.customer : null,
          subscriptionId: typeof invoice.subscription === "string" ? invoice.subscription : null,
          status: "active",
          graceUntil: null,
        });

        if (match?.status === "past_due") {
          try {
            await sendBillingRestoredNotice(match.email, match.plan);
          } catch (error) {
            console.warn("[Stripe webhook] Restored notice could not be sent", error);
          }
        }
        break;
      }
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await syncEntitlementStatus({
          customerId: typeof subscription.customer === "string" ? subscription.customer : null,
          subscriptionId: subscription.id,
          status: "canceled",
          graceUntil: null,
        });
        break;
      }
      default:
        break;
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[Stripe webhook] handler error", error);
    return NextResponse.json({ ok: false, error: "handler_failed" }, { status: 500 });
  }
}

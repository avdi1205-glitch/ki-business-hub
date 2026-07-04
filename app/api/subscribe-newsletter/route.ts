import { prisma } from "@/lib/prisma";
import { getResend } from "@/lib/resend";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, name, source } = body;

    if (!email) {
      return Response.json({ error: "Email is required" }, { status: 400 });
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    // Check if already subscribed
    const existing = await prisma.newsletterSubscriber.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      if (existing.status === "subscribed") {
        return Response.json(
          { error: "Email already subscribed" },
          { status: 400 }
        );
      }
      // Reactivate subscription
      await prisma.newsletterSubscriber.update({
        where: { email: normalizedEmail },
        data: {
          status: "subscribed",
          name: name || existing.name,
          source: source || existing.source,
        },
      });
    } else {
      // Create new subscriber
      await prisma.newsletterSubscriber.create({
        data: { email: normalizedEmail, name, source, status: "subscribed" },
      });
    }

    const fromEmail = process.env.NEWSLETTER_FROM_EMAIL || process.env.RESEND_FROM_EMAIL;
    if (process.env.RESEND_API_KEY && fromEmail) {
      const resend = await getResend();
      await resend.emails.send({
        from: fromEmail,
        to: normalizedEmail,
        subject: "Willkommen im KI Business Hub Newsletter",
        html: `
          <div style="font-family:Arial,sans-serif;line-height:1.6;color:#0f172a;max-width:560px;margin:0 auto;padding:24px;">
            <h1 style="margin-bottom:12px;">Willkommen ${name ? String(name) : "im KI Business Hub"}</h1>
            <p>Du bist jetzt im Newsletter für Affiliate-Chancen, KI-Tools und Umsatz-Strategien.</p>
            <p>Als Nächstes bekommst du konkrete Empfehlungen, neue Artikel und Tools mit echtem Monetarisierungspotenzial.</p>
            <p style="margin-top:24px;"><strong>Bonus:</strong> Halte Ausschau nach den Top AI Tools und Conversion-Tipps in den nächsten Mails.</p>
          </div>
        `,
      });
    }

    return Response.json({
      success: true,
      message: "Erfolgreich angemeldet! 🎉",
    });
  } catch (error) {
    console.error("Newsletter Subscription Error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

// GET - Subscriber Count
export async function GET() {
  try {
    const subscribers = await prisma.newsletterSubscriber.findMany({
      where: { status: "subscribed" },
      select: { source: true },
    });

    const sourceBreakdown = subscribers.reduce<Record<string, number>>((accumulator, subscriber) => {
      const key = subscriber.source || "unknown";
      accumulator[key] = (accumulator[key] || 0) + 1;
      return accumulator;
    }, {});

    return Response.json({
      subscriberCount: subscribers.length,
      sourceBreakdown,
    });
  } catch (error) {
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

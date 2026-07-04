import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getResend } from "@/lib/resend";

export async function POST(req: NextRequest) {
  try {
    const { action, segmentId, subject, template, variables } = await req.json();

    if (action === "send-segment") {
      const subscribers = await prisma.newsletterSubscriber.findMany({
        where: { status: "subscribed" },
      });

      const fromEmail = process.env.NEWSLETTER_FROM_EMAIL || process.env.RESEND_FROM_EMAIL;

      if (!process.env.RESEND_API_KEY || !fromEmail) {
        return NextResponse.json({
          success: false,
          error: "RESEND_API_KEY oder NEWSLETTER_FROM_EMAIL fehlt",
        }, { status: 400 });
      }

      if (!subscribers.length) {
        return NextResponse.json({
          success: false,
          message: "No subscribers in segment",
        });
      }

      const resend = await getResend();

      const results = [];
      for (const subscriber of subscribers) {
        try {
          const html = renderTemplate(
            template === "welcome"
              ? "<h1>Willkommen {{name}}</h1><p>{{subject}}</p>"
              : "<h1>{{subject}}</h1><p>Hallo {{name}}, hier sind deine neuesten KI Business Updates.</p>",
            {
              ...variables,
              subject,
              name: subscriber.name || subscriber.email,
              segmentId: segmentId || "all",
            }
          );

          await resend.emails.send({
            from: fromEmail,
            to: subscriber.email,
            subject,
            html,
          });

          results.push({ email: subscriber.email, sent: true });
        } catch (error) {
          results.push({ email: subscriber.email, sent: false, error: String(error) });
        }
      }

      return NextResponse.json({
        success: true,
        sent: results.filter(r => r.sent).length,
        failed: results.filter(r => !r.sent).length,
        results,
      });
    }

    if (action === "get-metrics") {
      const totalSubscribers = await prisma.newsletterSubscriber.count();
      const weeklyGrowth = await prisma.newsletterSubscriber.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
      });

      return NextResponse.json({
        success: true,
        metrics: {
          totalSubscribers,
          weeklyGrowth,
          estimatedRevenue: totalSubscribers * 0.5, // €0.50 per subscriber
        },
      });
    }

    return NextResponse.json({
      success: false,
      message: "Invalid action",
    });
  } catch (error) {
    console.error("[NEWSLETTER-AUTOMATION]", error);
    return NextResponse.json({
      success: false,
      error: String(error),
    }, { status: 500 });
  }
}

function renderTemplate(template: string, variables: Record<string, any>): string {
  let html = template || "<h1>{{subject}}</h1>";
  Object.entries(variables).forEach(([key, value]) => {
    html = html.replace(new RegExp(`{{${key}}}`, "g"), String(value));
  });
  return html;
}

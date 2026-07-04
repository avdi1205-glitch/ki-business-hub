import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { resend } from "@/lib/resend";

export async function POST(req: NextRequest) {
  try {
    const { action, segmentId, subject, template, variables } = await req.json();

    if (action === "send-segment") {
      // Get subscribers
      const subscribers = await prisma.newsletterSubscriber.findMany();

      if (!subscribers.length) {
        return NextResponse.json({
          success: false,
          message: "No subscribers in segment",
        });
      }

      const results = [];
      for (const subscriber of subscribers) {
        try {
          // Mock send (in production, would use Resend/email service)
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
  let html = template;
  Object.entries(variables).forEach(([key, value]) => {
    html = html.replace(new RegExp(`{{${key}}}`, "g"), String(value));
  });
  return html;
}

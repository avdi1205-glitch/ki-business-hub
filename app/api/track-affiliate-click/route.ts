import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { affiliateLinkId, articleSlug } = body;

    const headersList = await headers();
    const userAgent = headersList.get("user-agent") || "unknown";
    const referrer = headersList.get("referer") || "";

    if (!affiliateLinkId) {
      return Response.json(
        { error: "affiliateLinkId is required" },
        { status: 400 }
      );
    }

    // Inkrementiere Clicks auf dem Affiliate Link
    await prisma.affiliateLink.update({
      where: { id: affiliateLinkId },
      data: { clicks: { increment: 1 } },
    });

    // Erstelle Affiliate Click Log
    const click = await prisma.affiliateClick.create({
      data: {
        affiliateLinkId,
        articleSlug,
        userAgent,
        referrer,
        status: "pending",
      },
    });

    // Wenn dieser Click konvertiert (später tracking), kann revenue hinzugefügt werden
    // Für jetzt: 0.5€ - 2€ pro Click (durchschnittlich)
    const estimatedRevenue = Math.random() * 1.5 + 0.5;

    await prisma.affiliateClick.update({
      where: { id: click.id },
      data: { revenue: estimatedRevenue },
    });

    return Response.json({
      success: true,
      clickId: click.id,
      estimatedRevenue,
    });
  } catch (error) {
    console.error("Affiliate Click Tracking Error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

// GET für Analytics
export async function GET() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayClicks = await prisma.affiliateClick.findMany({
      where: { createdAt: { gte: today } },
    });

    const totalRevenue = todayClicks.reduce(
      (sum, click) => sum + (click.revenue || 0),
      0
    );

    return Response.json({
      clicks: todayClicks.length,
      revenue: totalRevenue.toFixed(2),
      average: (totalRevenue / todayClicks.length).toFixed(2),
    });
  } catch (error) {
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

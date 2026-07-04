import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { affiliateLinkId, articleSlug, source } = body;

    const headersList = await headers();
    const userAgent = headersList.get("user-agent") || "unknown";
    const referrer = headersList.get("referer") || "";

    if (!affiliateLinkId) {
      return Response.json(
        { error: "affiliateLinkId is required" },
        { status: 400 }
      );
    }

    const affiliate = await prisma.affiliateLink.findUnique({
      where: { id: affiliateLinkId },
    });

    if (!affiliate) {
      return Response.json({ error: "Affiliate Link not found" }, { status: 404 });
    }

    const estimatedRevenue = calculateEstimatedRevenue(affiliate.price, affiliate.rating);

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
        source,
        userAgent,
        referrer,
        status: "pending",
        revenue: estimatedRevenue,
      },
    });

    return Response.json({
      success: true,
      clickId: click.id,
      estimatedRevenue: Number(estimatedRevenue.toFixed(2)),
    });
  } catch (error) {
    console.error("Affiliate Click Tracking Error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

function calculateEstimatedRevenue(price: string | null, rating: number): number {
  const numericPrice = Number((price || "").replace(/[^\d,.-]/g, "").replace(",", "."));

  if (!Number.isNaN(numericPrice) && numericPrice > 0) {
    return Math.max(0.35, Math.min(8, numericPrice * 0.12));
  }

  return Math.max(0.35, Math.min(3, rating * 0.18));
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
      average: todayClicks.length ? (totalRevenue / todayClicks.length).toFixed(2) : "0.00",
    });
  } catch (error) {
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

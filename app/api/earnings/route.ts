import { prisma } from "@/lib/prisma";
import { startOfDay, endOfDay, subDays } from "date-fns";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get("days") || "30");

    // Today's earnings
    const today = new Date();
    const todayStart = startOfDay(today);
    const todayEnd = endOfDay(today);

    const todayClicks = await prisma.affiliateClick.findMany({
      where: {
        createdAt: { gte: todayStart, lte: todayEnd },
      },
    });

    const todayAffiliateRevenue = todayClicks.reduce(
      (sum, click) => sum + (click.revenue || 0),
      0
    );

    // All time stats
    const allClicks = await prisma.affiliateClick.findMany();
    const allRevenue = allClicks.reduce(
      (sum, click) => sum + (click.revenue || 0),
      0
    );

    // Last 30 days breakdown
    const dailyBreakdown = [];
    for (let i = 0; i < days; i++) {
      const date = subDays(today, i);
      const dayStart = startOfDay(date);
      const dayEnd = endOfDay(date);

      const dayClicks = await prisma.affiliateClick.findMany({
        where: { createdAt: { gte: dayStart, lte: dayEnd } },
      });

      const dayRevenue = dayClicks.reduce(
        (sum, click) => sum + (click.revenue || 0),
        0
      );

      dailyBreakdown.push({
        date: date.toISOString().split("T")[0],
        clicks: dayClicks.length,
        revenue: dayRevenue.toFixed(2),
      });
    }

    // Top Affiliate Links
    const topAffiliates = await prisma.affiliateLink.findMany({
      orderBy: { clicks: "desc" },
      take: 10,
      select: { id: true, name: true, clicks: true, category: true },
    });

    return Response.json({
      today: {
        clicks: todayClicks.length,
        revenue: todayAffiliateRevenue.toFixed(2),
        estimatedMonthly: (todayAffiliateRevenue * 30).toFixed(2),
      },
      allTime: {
        clicks: allClicks.length,
        revenue: allRevenue.toFixed(2),
      },
      topAffiliates,
      dailyBreakdown,
    });
  } catch (error) {
    console.error("Earnings API Error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST - Create earnings log (for daily summarization)
export async function POST() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayStart = startOfDay(today);
    const todayEnd = endOfDay(today);

    const affiliateClicks = await prisma.affiliateClick.findMany({
      where: { createdAt: { gte: todayStart, lte: todayEnd } },
    });

    const totalRevenue = affiliateClicks.reduce(
      (sum, click) => sum + (click.revenue || 0),
      0
    );

    await prisma.earningsLog.create({
      data: {
        date: today,
        affiliateRevenue: totalRevenue,
        adRevenue: 0, // Will be calculated from AdImpressions
        sponsorRevenue: 0, // Will be updated manually
        totalRevenue: totalRevenue,
      },
    });

    return Response.json({ success: true });
  } catch {
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

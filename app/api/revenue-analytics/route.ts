import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const period = searchParams.get("period") || "month"; // week, month, year, all

    const dateRange = getDateRange(period);

    // Get all revenue sources
    const [clicks, adImpressions, newsletterSubs] = await Promise.all([
      prisma.affiliateClick.findMany({
        where: { createdAt: { gte: dateRange.start } },
      }),
      prisma.adImpression.findMany({
        where: { createdAt: { gte: dateRange.start } },
      }),
      prisma.newsletterSubscriber.findMany({
        where: { createdAt: { gte: dateRange.start } },
      }),
      prisma.earningsLog.findMany({
        where: { createdAt: { gte: dateRange.start } },
      }),
    ]);

    const affiliateRevenue = clicks.reduce((sum, click) => sum + (click.revenue || 0), 0);
    const adRevenue = adImpressions.reduce((sum, imp) => sum + (imp.revenue || 0), 0);
    const newsletterRevenue = newsletterSubs.length * 0.5; // €0.50 per subscriber
    const totalRevenue = affiliateRevenue + adRevenue + newsletterRevenue;

    const articles = await prisma.article.findMany({
      select: { id: true, title: true, slug: true },
    });

    const articleMap = new Map(
      articles
        .filter((article) => article.slug)
        .map((article) => [article.slug as string, article])
    );

    const byArticle = new Map<string, { id: number; title: string; clicks: number; revenue: number }>();

    for (const click of clicks) {
      const slug = click.articleSlug || "unknown";
      const article = articleMap.get(slug);
      const current = byArticle.get(slug) || {
        id: article?.id || 0,
        title: article?.title || (slug === "unknown" ? "Direkte Klicks" : slug),
        clicks: 0,
        revenue: 0,
      };

      current.clicks += 1;
      current.revenue += click.revenue || 0;
      byArticle.set(slug, current);
    }

    const topPerforming = Array.from(byArticle.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)
      .map((item) => ({
        ...item,
        revenue: parseFloat(item.revenue.toFixed(2)),
      }));

    const safeTotalRevenue = totalRevenue || 1;

    return NextResponse.json({
      success: true,
      period,
      summary: {
        totalRevenue: parseFloat(totalRevenue.toFixed(2)),
        affiliateRevenue: parseFloat(affiliateRevenue.toFixed(2)),
        adRevenue: parseFloat(adRevenue.toFixed(2)),
        newsletterRevenue: parseFloat(newsletterRevenue.toFixed(2)),
        metrics: {
          totalClicks: clicks.length,
          totalImpressions: adImpressions.length,
          newSubscribers: newsletterSubs.length,
        },
      },
      topPerforming,
      breakdown: {
        affiliate: ((affiliateRevenue / safeTotalRevenue) * 100).toFixed(1),
        ads: ((adRevenue / safeTotalRevenue) * 100).toFixed(1),
        newsletter: ((newsletterRevenue / safeTotalRevenue) * 100).toFixed(1),
      },
      projection: {
        daily: totalRevenue / getDayCount(period),
        monthly: (totalRevenue / getDayCount(period)) * 30,
        yearly: (totalRevenue / getDayCount(period)) * 365,
      },
    });
  } catch (error) {
    console.error("[REVENUE-ANALYTICS]", error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

function getDateRange(period: string) {
  const now = new Date();
  let start = new Date();

  switch (period) {
    case "week":
      start.setDate(now.getDate() - 7);
      break;
    case "month":
      start.setMonth(now.getMonth() - 1);
      break;
    case "year":
      start.setFullYear(now.getFullYear() - 1);
      break;
    default:
      start = new Date("2026-01-01");
  }

  return { start, end: now };
}

function getDayCount(period: string): number {
  switch (period) {
    case "week":
      return 7;
    case "month":
      return 30;
    case "year":
      return 365;
    default:
      return 180;
  }
}

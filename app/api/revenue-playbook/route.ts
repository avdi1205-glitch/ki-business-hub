import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type UserPlan = "starter" | "pro" | "agency";

type Recommendation = {
  id: string;
  priority: "high" | "medium" | "low";
  title: string;
  why: string;
  action: string;
  estimatedMonthlyLift: number;
};

function normalizePlan(value: string | null): UserPlan {
  if (value === "agency") return "agency";
  if (value === "pro") return "pro";
  return "starter";
}

function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export async function GET(req: NextRequest) {
  try {
    const requestedPlan = normalizePlan(req.nextUrl.searchParams.get("plan"));

    if (requestedPlan === "starter") {
      return NextResponse.json({
        success: false,
        locked: true,
        message: "Umsatz-Navigator ist ab Pro verfuegbar.",
      }, { status: 403 });
    }

    const weekStart = getWeekStart(new Date());
    let canPersistPlaybook = true;

    try {
      const cached = await prisma.revenuePlaybook.findUnique({
        where: {
          weekStart_plan: {
            weekStart,
            plan: requestedPlan,
          },
        },
      });

      if (cached) {
        return NextResponse.json({
          success: true,
          plan: requestedPlan,
          weekStart: cached.weekStart,
          summary: cached.summary,
          projectedMonthlyLift: cached.projectedMonthlyLift,
          recommendations: cached.recommendations,
          cached: true,
        });
      }
    } catch {
      canPersistPlaybook = false;
    }

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    let clicks: Array<{ source: string | null; articleSlug: string | null; revenue: number | null; affiliateLinkId: number }> = [];
    let affiliates: Array<{ id: number; name: string; clicks: number; rating: number; category: string }> = [];
    let activeTests: Array<{ impressionsA: number; clicksA: number; impressionsB: number; clicksB: number; confidence: number; affiliateLink: { name: string } }> = [];
    let completedTests: Array<{ affiliateLink: { name: string } }> = [];
    let subscribedCount = 0;

    try {
      const [fetchedClicks, fetchedAffiliates, fetchedActiveTests, fetchedCompletedTests, fetchedSubscribedCount] = await Promise.all([
        prisma.affiliateClick.findMany({
          where: { createdAt: { gte: thirtyDaysAgo } },
          select: { source: true, articleSlug: true, revenue: true, affiliateLinkId: true },
        }),
        prisma.affiliateLink.findMany({
          select: { id: true, name: true, clicks: true, rating: true, category: true },
          orderBy: { clicks: "desc" },
        }),
        prisma.aBTest.findMany({
          where: { status: "active" },
          include: { affiliateLink: { select: { name: true } } },
        }),
        prisma.aBTest.findMany({
          where: { status: "complete" },
          include: { affiliateLink: { select: { name: true } } },
        }),
        prisma.newsletterSubscriber.count({ where: { status: "subscribed" } }),
      ]);

      clicks = fetchedClicks;
      affiliates = fetchedAffiliates;
      activeTests = fetchedActiveTests;
      completedTests = fetchedCompletedTests;
      subscribedCount = fetchedSubscribedCount;
    } catch {
      canPersistPlaybook = false;
    }

    const totalRevenue = clicks.reduce((sum, c) => sum + (c.revenue || 0), 0);
    const totalClicks = clicks.length;
    const epc = totalClicks ? totalRevenue / totalClicks : 0;

    const sourceStats = clicks.reduce<Record<string, { clicks: number; revenue: number }>>((acc, c) => {
      const key = c.source || "unknown";
      if (!acc[key]) acc[key] = { clicks: 0, revenue: 0 };
      acc[key].clicks += 1;
      acc[key].revenue += c.revenue || 0;
      return acc;
    }, {});

    const topSource = Object.entries(sourceStats)
      .map(([source, stats]) => ({
        source,
        clicks: stats.clicks,
        revenue: stats.revenue,
        epc: stats.clicks ? stats.revenue / stats.clicks : 0,
      }))
      .sort((a, b) => b.revenue - a.revenue)[0];

    const topAffiliate = affiliates[0];
    const lowClickHighRating = affiliates
      .filter((a) => a.clicks < 3 && a.rating >= 8.8)
      .slice(0, 2);

    const recommendations: Recommendation[] = [];

    if (activeTests.length > 0) {
      const bestTest = activeTests
        .map((t) => {
          const rateA = t.impressionsA ? t.clicksA / t.impressionsA : 0;
          const rateB = t.impressionsB ? t.clicksB / t.impressionsB : 0;
          const winnerRate = Math.max(rateA, rateB);
          const loserRate = Math.min(rateA, rateB);
          return {
            name: t.affiliateLink.name,
            winnerRate,
            gap: winnerRate - loserRate,
            confidence: t.confidence,
          };
        })
        .sort((a, b) => b.gap - a.gap)[0];

      if (bestTest) {
        recommendations.push({
          id: "ab-winner-rollout",
          priority: "high",
          title: `Gewinner-CTA fuer ${bestTest.name} ausrollen`,
          why: `Aktiver Test mit CTR-Luecke von ${(bestTest.gap * 100).toFixed(2)}% und ${bestTest.confidence.toFixed(1)}% Konfidenz.`,
          action: "Gewinner in allen passenden CTA-Slots uebernehmen und 7 Tage Performance beobachten.",
          estimatedMonthlyLift: Number((Math.max(25, bestTest.gap * 1200) * Math.max(epc, 0.8)).toFixed(2)),
        });
      }
    }

    if (topSource) {
      recommendations.push({
        id: "scale-top-source",
        priority: "high",
        title: `Top-Quelle ${topSource.source} skalieren`,
        why: `${topSource.clicks} Klicks in 30 Tagen bei EPC ${topSource.epc.toFixed(2)} EUR.`,
        action: "Diese Source als CTA-Variante auf Startseite, Blog und Tool-Detailseiten duplizieren.",
        estimatedMonthlyLift: Number((Math.max(30, topSource.clicks * 1.4) * Math.max(topSource.epc, 0.8)).toFixed(2)),
      });
    }

    if (topAffiliate) {
      recommendations.push({
        id: "pillar-affiliate-cluster",
        priority: "medium",
        title: `Content-Cluster fuer ${topAffiliate.name}`,
        why: `Top-Tool mit ${topAffiliate.clicks} Klicks und Rating ${topAffiliate.rating.toFixed(1)}.`,
        action: "3 Money-Artikel planen: Vergleich, Erfahrungsbericht, Alternatives-Guide inkl. interner Verlinkung.",
        estimatedMonthlyLift: Number((Math.max(40, topAffiliate.clicks * 18 * Math.max(epc, 0.6))).toFixed(2)),
      });
    }

    const leadRatio = totalClicks ? subscribedCount / totalClicks : 0;
    recommendations.push({
      id: "newsletter-capture",
      priority: leadRatio < 0.2 ? "high" : "medium",
      title: "Lead-Capture nach Affiliate-Klick verbessern",
      why: `Subscriber/Klick Ratio aktuell ${(leadRatio * 100).toFixed(1)}%.`,
      action: "2-Step Lead Magnet vor Exit einsetzen (Quick-Wins PDF + Tool-Stack Checkliste).",
      estimatedMonthlyLift: Number((Math.max(20, totalClicks * 0.15) * Math.max(epc, 0.9)).toFixed(2)),
    });

    if (lowClickHighRating.length > 0) {
      recommendations.push({
        id: "underused-high-rating-tools",
        priority: "medium",
        title: "High-Rating Tools sichtbarer machen",
        why: `${lowClickHighRating.map((t) => t.name).join(", ")} haben starkes Rating, aber kaum Klicks.`,
        action: "In Top-Listen nach oben ziehen und prominente CTA-Bloecke auf den meistgelesenen Seiten setzen.",
        estimatedMonthlyLift: Number((lowClickHighRating.length * 35 * Math.max(epc, 0.7)).toFixed(2)),
      });
    }

    const maxItems = requestedPlan === "agency" ? 10 : 4;
    const selectedRecommendations = recommendations
      .sort((a, b) => b.estimatedMonthlyLift - a.estimatedMonthlyLift)
      .slice(0, maxItems);

    const projectedMonthlyLift = Number(
      selectedRecommendations.reduce((sum, r) => sum + r.estimatedMonthlyLift, 0).toFixed(2)
    );

    const summary =
      requestedPlan === "agency"
        ? `Agency Playbook: ${selectedRecommendations.length} priorisierte Hebel fuer Team-Umsetzung mit potenziell +${projectedMonthlyLift.toFixed(2)} EUR/Monat.`
        : `Pro Playbook: ${selectedRecommendations.length} Hebel fuer die naechsten 7 Tage mit potenziell +${projectedMonthlyLift.toFixed(2)} EUR/Monat.`;

    if (canPersistPlaybook) {
      try {
        await prisma.revenuePlaybook.upsert({
          where: {
            weekStart_plan: {
              weekStart,
              plan: requestedPlan,
            },
          },
          update: {
            summary,
            projectedMonthlyLift,
            recommendations: selectedRecommendations,
          },
          create: {
            weekStart,
            plan: requestedPlan,
            summary,
            projectedMonthlyLift,
            recommendations: selectedRecommendations,
          },
        });
      } catch {
        // Keep endpoint functional even before migration is applied in production.
      }
    }

    return NextResponse.json({
      success: true,
      cached: false,
      plan: requestedPlan,
      weekStart,
      summary,
      projectedMonthlyLift,
      recommendations: selectedRecommendations,
      baseline: {
        totalRevenue30Days: Number(totalRevenue.toFixed(2)),
        totalClicks30Days: totalClicks,
        epc: Number(epc.toFixed(2)),
        subscribers: subscribedCount,
        activeTests: activeTests.length,
        completedTests: completedTests.length,
      },
    });
  } catch (error) {
    console.error("[revenue-playbook]", error);
    return NextResponse.json({ success: false, error: "Revenue playbook could not be generated." }, { status: 500 });
  }
}

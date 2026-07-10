import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseCustomerSessionToken, CUSTOMER_SESSION_COOKIE } from "@/lib/customer-auth";
import { hasCustomerAccess } from "@/lib/customer-entitlement";
import { buildCustomerPlaybook, normalizeFocus, normalizePlan as normalizeWorkspacePlan, planRank, sanitizeInputs } from "@/lib/revenue-navigator";
import { getResend } from "@/lib/resend";
import { getSiteUrl } from "@/lib/site-url";

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

function normalizeCustomerPlan(value: string | null | undefined): UserPlan {
  return normalizeWorkspacePlan(value);
}

function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);
}

async function sendCustomerPlaybookEmail(input: {
  email: string;
  plan: UserPlan;
  focus: string;
  opportunityScore: number;
  projectedMonthlyLift: number;
  summary: string;
  recommendations: Recommendation[];
}) {
  const fromEmail = process.env.CONTACT_LEAD_FROM_EMAIL || process.env.RESEND_FROM_EMAIL;
  if (!process.env.RESEND_API_KEY || !fromEmail) {
    return;
  }

  const workspaceUrl = `${getSiteUrl()}/konto/revenue-navigator`;
  const resend = await getResend();
  const recommendationMarkup = input.recommendations.slice(0, 3).map((recommendation, index) => `
    <div style="margin-top:16px;padding:16px;border:1px solid rgba(15,23,42,0.08);border-radius:16px;background:#f8fafc;">
      <p style="margin:0 0 8px;font-size:12px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#0891b2;">Schritt ${index + 1}</p>
      <h3 style="margin:0 0 8px;font-size:18px;color:#0f172a;">${recommendation.title}</h3>
      <p style="margin:0 0 8px;color:#334155;"><strong>Warum:</strong> ${recommendation.why}</p>
      <p style="margin:0 0 8px;color:#334155;"><strong>Aktion:</strong> ${recommendation.action}</p>
      <p style="margin:0;color:#059669;font-weight:700;">Potenzial: ${formatCurrency(recommendation.estimatedMonthlyLift)}</p>
    </div>
  `).join("");

  await resend.emails.send({
    from: fromEmail,
    to: input.email,
    subject: `Dein Revenue Navigator Playbook (${input.plan.toUpperCase()})`,
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#0f172a;max-width:640px;margin:0 auto;padding:24px;">
        <div style="padding:24px;border-radius:24px;background:linear-gradient(135deg,#082f49 0%,#0f766e 100%);color:#f8fafc;">
          <p style="margin:0 0 8px;font-size:12px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:#a5f3fc;">Revenue Navigator</p>
          <h1 style="margin:0 0 12px;font-size:30px;line-height:1.1;">Dein neues Playbook ist fertig</h1>
          <p style="margin:0;color:#d1fae5;">Plan: <strong>${input.plan.toUpperCase()}</strong> • Fokus: <strong>${input.focus}</strong> • Score: <strong>${input.opportunityScore}/100</strong></p>
        </div>

        <div style="margin-top:20px;padding:20px;border:1px solid rgba(15,23,42,0.08);border-radius:20px;background:#ffffff;">
          <p style="margin:0 0 8px;font-size:12px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#0f766e;">Monatspotenzial</p>
          <p style="margin:0 0 12px;font-size:28px;font-weight:800;color:#059669;">${formatCurrency(input.projectedMonthlyLift)}</p>
          <p style="margin:0;color:#334155;">${input.summary}</p>
        </div>

        ${recommendationMarkup}

        <div style="margin-top:24px;text-align:center;">
          <a href="${workspaceUrl}" style="display:inline-block;padding:14px 20px;border-radius:14px;background:#0891b2;color:#ffffff;text-decoration:none;font-weight:700;">Workspace oeffnen</a>
        </div>

        <p style="margin-top:18px;color:#64748b;font-size:12px;">Transparenz: Teile der Analysen und Empfehlungen koennen mit KI-Unterstuetzung erstellt und anschliessend menschlich strukturiert worden sein.</p>
      </div>
    `,
  });
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

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Record<string, unknown>;
    const requestedPlan = normalizeCustomerPlan(typeof body.plan === "string" ? body.plan : null);
    const inputs = sanitizeInputs({
      plan: requestedPlan,
      focus: normalizeFocus(typeof body.focus === "string" ? body.focus : null),
      monthlyVisitors: typeof body.monthlyVisitors === "number" ? body.monthlyVisitors : undefined,
      affiliateClicks: typeof body.affiliateClicks === "number" ? body.affiliateClicks : undefined,
      newsletterSignups: typeof body.newsletterSignups === "number" ? body.newsletterSignups : undefined,
      contentPieces: typeof body.contentPieces === "number" ? body.contentPieces : undefined,
      teamSize: typeof body.teamSize === "number" ? body.teamSize : undefined,
    });

    if (requestedPlan === "starter") {
      return NextResponse.json(buildCustomerPlaybook({ ...inputs, plan: "starter" }));
    }

    const sessionToken = req.cookies.get(CUSTOMER_SESSION_COOKIE)?.value;
    const sessionEmail = sessionToken ? parseCustomerSessionToken(sessionToken) : null;

    if (!sessionEmail) {
      return NextResponse.json({
        success: false,
        locked: true,
        message: "Bitte melde dich mit deinem Kundenkonto an, um Pro oder Agency zu nutzen.",
      }, { status: 403 });
    }

    const entitlement = await prisma.customerEntitlement.findFirst({
      where: {
        email: sessionEmail,
        status: { in: ["active", "trialing", "past_due"] },
      },
      orderBy: { updatedAt: "desc" },
    });

    if (!hasCustomerAccess(entitlement)) {
      return NextResponse.json({
        success: false,
        locked: true,
        message: "Dein Kundenkonto hat aktuell keinen aktiven Revenue-Navigator-Zugang.",
      }, { status: 403 });
    }

    const activeEntitlement = entitlement!;
    const customerPlan = normalizeCustomerPlan(activeEntitlement.plan);
    if (planRank(requestedPlan) > planRank(customerPlan)) {
      return NextResponse.json({
        success: false,
        locked: true,
        message: requestedPlan === "agency"
          ? "Agency ist in deinem aktuellen Paket noch nicht freigeschaltet."
          : "Dieses Playbook liegt ueber deinem aktuellen Paket.",
      }, { status: 403 });
    }

    const result = buildCustomerPlaybook({ ...inputs, plan: requestedPlan });
    let savedScan: { id: number; plan: string; focus: string; opportunityScore: number; projectedMonthlyLift: number; summary: string; createdAt: string } | null = null;

    try {
      const scan = await prisma.revenueNavigatorScan.create({
        data: {
          email: sessionEmail,
          plan: requestedPlan,
          focus: inputs.focus,
          monthlyVisitors: inputs.monthlyVisitors,
          affiliateClicks: inputs.affiliateClicks,
          newsletterSignups: inputs.newsletterSignups,
          contentPieces: inputs.contentPieces,
          teamSize: inputs.teamSize,
          opportunityScore: result.opportunityScore,
          projectedMonthlyLift: result.projectedMonthlyLift,
          summary: result.summary,
          recommendations: result.recommendations,
        },
        select: {
          id: true,
          plan: true,
          focus: true,
          opportunityScore: true,
          projectedMonthlyLift: true,
          summary: true,
          createdAt: true,
        },
      });

      savedScan = {
        ...scan,
        createdAt: scan.createdAt.toISOString(),
      };
    } catch {
      // Keep customer flow working even if the scan table is not migrated yet.
    }

    try {
      await sendCustomerPlaybookEmail({
        email: sessionEmail,
        plan: requestedPlan,
        focus: inputs.focus,
        opportunityScore: result.opportunityScore,
        projectedMonthlyLift: result.projectedMonthlyLift,
        summary: result.summary,
        recommendations: result.recommendations,
      });
    } catch (mailError) {
      console.warn("[revenue-playbook-post] Playbook email could not be sent", mailError);
    }

    return NextResponse.json({
      ...result,
      savedScan,
    });
  } catch (error) {
    console.error("[revenue-playbook-post]", error);
    return NextResponse.json({ success: false, error: "Revenue playbook could not be generated." }, { status: 500 });
  }
}

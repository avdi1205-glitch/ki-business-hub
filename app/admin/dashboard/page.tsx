import Link from "next/link";
import { prisma } from "../../../lib/prisma";

function prettifySource(source: string) {
  if (source === "homepage-top-tools") return "Homepage Top Tools";
  if (source === "homepage-final-cta") return "Homepage Final CTA";
  if (source === "exit-intent-popup") return "Exit Intent Popup";
  if (source === "affiliate-directory") return "Affiliate directory";
  if (source === "best-tools-table") return "Best tools table";
  if (source.startsWith("tool-detail-")) return `Tool Detail: ${source.replace("tool-detail-", "")}`;
  if (source.startsWith("blog-") && source.endsWith("-hero")) return `Blog Hero: ${source.replace("blog-", "").replace("-hero", "")}`;
  if (source.startsWith("blog-") && source.endsWith("-mid")) return `Blog Mid CTA: ${source.replace("blog-", "").replace("-mid", "")}`;
  if (source.startsWith("blog-") && source.endsWith("-grid")) return `Blog Tool Grid: ${source.replace("blog-", "").replace("-grid", "")}`;
  return source;
}

export default async function DashboardPage() {
  let articleCount = 0;
  let affiliateCount = 0;
  let affiliateLinks: Awaited<ReturnType<typeof prisma.affiliateLink.findMany>> = [];
  let latestArticle: Awaited<ReturnType<typeof prisma.article.findFirst>> = null;
  let totalClicks = 0;
  let topAffiliate: Awaited<ReturnType<typeof prisma.affiliateLink.findMany>>[number] | undefined;
  let todayClicks: Awaited<ReturnType<typeof prisma.affiliateClick.findMany>> = [];
  let todayRevenue = 0;
  let subscriberCount = 0;
  let rescueLeadCount = 0;
  let leadSources: Array<{ source: string | null }> = [];
  let activeTests = 0;
  let completedTests = 0;
  let dbUnavailable = false;

  try {
    articleCount = await prisma.article.count();
    affiliateCount = await prisma.affiliateLink.count();
    affiliateLinks = await prisma.affiliateLink.findMany({
      orderBy: { clicks: "desc" },
    });
    latestArticle = await prisma.article.findFirst({
      orderBy: { createdAt: "desc" },
    });
    totalClicks = affiliateLinks.reduce((sum, link) => sum + link.clicks, 0);
    topAffiliate = affiliateLinks[0];

    // Calculate today's revenue
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    todayClicks = await prisma.affiliateClick.findMany({
      where: { createdAt: { gte: today, lt: tomorrow } },
    });
    todayRevenue = todayClicks.reduce(
      (sum, click) => sum + (click.revenue || 0),
      0
    );

    subscriberCount = await prisma.newsletterSubscriber.count({
      where: { status: "subscribed" },
    });

    rescueLeadCount = await prisma.newsletterSubscriber.count({
      where: {
        status: "lead",
        source: { startsWith: "checkout-rescue:" },
      },
    });

    [leadSources, activeTests, completedTests] = await Promise.all([
      prisma.newsletterSubscriber.findMany({
        where: { status: "subscribed" },
        select: { source: true },
      }),
      prisma.aBTest.count({ where: { status: "active" } }),
      prisma.aBTest.count({ where: { status: "complete" } }),
    ]);
  } catch (error) {
    dbUnavailable = true;
    console.error("[admin/dashboard] Query failed", error);
  }

  const topLeadSource = Object.entries(
    leadSources.reduce<Record<string, number>>((accumulator, subscriber) => {
      const key = subscriber.source || "unknown";
      accumulator[key] = (accumulator[key] || 0) + 1;
      return accumulator;
    }, {})
  ).sort((left, right) => right[1] - left[1])[0];

  return (
    <div style={{ background: "var(--background)", minHeight: "100vh" }} className="py-10 px-6">
      <h1 className="mb-10 text-5xl font-bold" style={{ color: "var(--text-dark)" }}>📊 Admin dashboard</h1>

      {dbUnavailable && (
        <div className="mb-6 rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-4 text-yellow-100">
          Mindestens eine Dashboard-Abfrage ist fehlgeschlagen. Einige Kennzahlen sind temporaere Fallback-Werte.
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid md:grid-cols-4 gap-6 mb-10">
        <Link href="/admin" className="rounded-xl p-8 border transition-colors" style={{ background: "var(--background-elevated)", borderColor: "rgba(255,255,255,0.1)" }}>
          <h2 className="text-xl" style={{ color: "var(--text-light)" }}>Articles</h2>
          <p className="mt-4 text-5xl font-bold" style={{ color: "var(--text-dark)" }}>{articleCount}</p>
        </Link>

        <Link href="/admin/affiliate" className="rounded-xl p-8 border transition-colors" style={{ background: "var(--background-elevated)", borderColor: "rgba(255,255,255,0.1)" }}>
          <h2 className="text-xl" style={{ color: "var(--text-light)" }}>Affiliate links</h2>
          <p className="mt-4 text-5xl font-bold" style={{ color: "var(--text-dark)" }}>{affiliateCount}</p>
        </Link>

        <Link href="/admin/affiliate" className="rounded-xl p-8 border transition-colors" style={{ background: "var(--background-elevated)", borderColor: "rgba(255,255,255,0.1)" }}>
          <h2 className="text-xl" style={{ color: "var(--text-light)" }}>Affiliate clicks</h2>
          <p className="mt-4 text-5xl font-bold" style={{ color: "var(--text-dark)" }}>{totalClicks}</p>
        </Link>

        <Link href="/admin/earnings" className="bg-green-500/10 p-8 rounded-xl hover:bg-green-500/20 border border-green-500/30">
          <h2 className="text-xl text-green-400">💰 Earned today</h2>
          <p className="text-5xl font-bold mt-4">€{todayRevenue.toFixed(2)}</p>
        </Link>
      </div>

      {/* Secondary Stats */}
      <div className="grid md:grid-cols-6 gap-6 mb-10">
        <div className="rounded-xl border p-8" style={{ background: "var(--background-elevated)", borderColor: "rgba(255,255,255,0.1)" }}>
          <h2 className="text-xl" style={{ color: "var(--text-light)" }}>Newsletter subscribers</h2>
          <p className="mt-4 text-5xl font-bold" style={{ color: "var(--text-dark)" }}>{subscriberCount}</p>
        </div>

        <div className="rounded-xl border p-8" style={{ background: "var(--background-elevated)", borderColor: "rgba(255,255,255,0.1)" }}>
          <h2 className="text-xl" style={{ color: "var(--text-light)" }}>Today: clicks</h2>
          <p className="mt-4 text-5xl font-bold" style={{ color: "var(--text-dark)" }}>{todayClicks.length}</p>
        </div>

        <div className="rounded-xl border p-8" style={{ background: "var(--background-elevated)", borderColor: "rgba(255,255,255,0.1)" }}>
          <h2 className="text-xl" style={{ color: "var(--text-light)" }}>Monthly projection</h2>
          <p className="mt-4 text-5xl font-bold" style={{ color: "var(--text-dark)" }}>€{(todayRevenue * 30).toFixed(2)}</p>
        </div>

        <div className="rounded-xl border p-8" style={{ background: "var(--background-elevated)", borderColor: "rgba(255,255,255,0.1)" }}>
          <h2 className="text-xl" style={{ color: "var(--text-light)" }}>Active A/B tests</h2>
          <p className="mt-4 text-5xl font-bold" style={{ color: "var(--text-dark)" }}>{activeTests}</p>
        </div>

        <Link href="/admin/checkout-rescue" className="rounded-xl border p-8 transition-colors" style={{ background: "var(--background-elevated)", borderColor: "rgba(255,255,255,0.1)" }}>
          <h2 className="text-xl" style={{ color: "var(--text-light)" }}>Checkout Rescue Leads</h2>
          <p className="mt-4 text-5xl font-bold" style={{ color: "var(--text-dark)" }}>{rescueLeadCount}</p>
          <p className="mt-2" style={{ color: "var(--text-light)" }}>Manuelle Upgrade-Chancen</p>
        </Link>

        <div className="rounded-xl border p-8" style={{ background: "var(--background-elevated)", borderColor: "rgba(255,255,255,0.1)" }}>
          <h2 className="text-xl" style={{ color: "var(--text-light)" }}>Top lead source</h2>
          <p className="mt-4 text-lg font-bold" style={{ color: "var(--text-dark)" }}>{topLeadSource ? prettifySource(topLeadSource[0]) : "-"}</p>
          <p className="mt-2" style={{ color: "var(--text-light)" }}>{topLeadSource ? `${topLeadSource[1]} leads` : "No leads yet"}</p>
        </div>
      </div>

      {/* Details Section */}
      <div className="grid md:grid-cols-2 gap-6">
        <Link href="/admin/affiliate" className="rounded-xl border p-8 transition-colors" style={{ background: "var(--background-elevated)", borderColor: "rgba(255,255,255,0.1)" }}>
          <h2 className="mb-4 text-2xl font-bold" style={{ color: "var(--text-dark)" }}>🏆 Top affiliate link</h2>

          {topAffiliate ? (
            <>
              <p className="text-3xl font-bold" style={{ color: "var(--text-dark)" }}>{topAffiliate.name}</p>
              <p className="mt-2" style={{ color: "var(--text-light)" }}>
                Category: {topAffiliate.category}
              </p>
              <p className="text-yellow-400 text-xl mt-4">
                Clicks: {topAffiliate.clicks}
              </p>
            </>
          ) : (
            <p style={{ color: "var(--text-light)" }}>No affiliate links available.</p>
          )}
        </Link>

        <Link
          href={latestArticle ? `/admin/edit/${latestArticle.id}` : "/admin"}
          className="rounded-xl border p-8 transition-colors"
          style={{ background: "var(--background-elevated)", borderColor: "rgba(255,255,255,0.1)" }}
        >
          <h2 className="mb-4 text-2xl font-bold" style={{ color: "var(--text-dark)" }}>🕒 Latest article</h2>

          {latestArticle ? (
            <>
              <p className="text-2xl font-bold" style={{ color: "var(--text-dark)" }}>{latestArticle.title}</p>
              <p className="mt-2" style={{ color: "var(--text-light)" }}>
                {new Date(latestArticle.createdAt).toLocaleString()}
              </p>
            </>
          ) : (
            <p style={{ color: "var(--text-light)" }}>No articles yet.</p>
          )}
        </Link>
      </div>

      <div className="mt-10 grid md:grid-cols-2 gap-6">
        <Link href="/admin/ab-testing" className="rounded-xl border p-8 transition-colors" style={{ background: "var(--background-elevated)", borderColor: "rgba(255,255,255,0.1)" }}>
          <h2 className="mb-4 text-2xl font-bold" style={{ color: "var(--text-dark)" }}>🧪 Conversion engine</h2>
          <p style={{ color: "var(--text-light)" }}>Active tests: {activeTests} • Applied winners: {completedTests}</p>
          <p className="mt-3" style={{ color: "var(--success-light)" }}>Go to CTA tests →</p>
        </Link>

        <Link href="/stats" className="rounded-xl border p-8 transition-colors" style={{ background: "var(--background-elevated)", borderColor: "rgba(255,255,255,0.1)" }}>
          <h2 className="mb-4 text-2xl font-bold" style={{ color: "var(--text-dark)" }}>📈 Funnel analytics</h2>
          <p style={{ color: "var(--text-light)" }}>See which pages and sources generate revenue, clicks, and leads.</p>
          <p className="mt-3" style={{ color: "var(--primary-light)" }}>Go to revenue dashboard →</p>
        </Link>

        <Link href="/admin/checkout-rescue" className="rounded-xl border p-8 transition-colors" style={{ background: "var(--background-elevated)", borderColor: "rgba(255,255,255,0.1)" }}>
          <h2 className="mb-4 text-2xl font-bold" style={{ color: "var(--text-dark)" }}>🛟 Checkout rescue queue</h2>
          <p style={{ color: "var(--text-light)" }}>Arbeite plan- und quellenbezogene Upgrade-Anfragen direkt ab.</p>
          <p className="mt-3" style={{ color: "var(--success-light)" }}>Zur Lead-Queue →</p>
        </Link>
      </div>

      {/* Quick Actions */}
      <div className="mt-10 grid md:grid-cols-4 gap-4">
        <Link href="/admin" className="bg-blue-500/20 p-4 rounded-lg hover:bg-blue-500/30 border border-blue-500/30 text-center font-bold">
          ➕ Manage articles
        </Link>
        <Link href="/admin/affiliate" className="bg-purple-500/20 p-4 rounded-lg hover:bg-purple-500/30 border border-purple-500/30 text-center font-bold">
          🔗 Manage affiliates
        </Link>
        <Link href="/admin/earnings" className="bg-green-500/20 p-4 rounded-lg hover:bg-green-500/30 border border-green-500/30 text-center font-bold">
          💰 View earnings
        </Link>
        <Link href="/content-factory" className="bg-orange-500/20 p-4 rounded-lg hover:bg-orange-500/30 border border-orange-500/30 text-center font-bold">
          🤖 Content factory
        </Link>
      </div>
    </div>
  );
}
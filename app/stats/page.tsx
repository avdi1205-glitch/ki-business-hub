import { prisma } from "../../lib/prisma";

function prettifyKey(key: string) {
  if (key === "homepage-top-tools") return "Homepage Top Tools";
  if (key === "homepage-final-cta") return "Homepage Final CTA";
  if (key === "exit-intent-popup") return "Exit Intent Popup";
  if (key === "affiliate-directory") return "Affiliate Verzeichnis";
  if (key === "best-tools-table") return "Beste Tools Tabelle";
  if (key === "newsletter-form") return "Standard Newsletter Formular";
  if (key.startsWith("tool-detail-")) return `Tool Detail: ${key.replace("tool-detail-", "")}`;
  if (key.startsWith("blog-") && key.endsWith("-hero")) return `Blog Hero: ${key.replace("blog-", "").replace("-hero", "")}`;
  if (key.startsWith("blog-") && key.endsWith("-mid")) return `Blog Mid CTA: ${key.replace("blog-", "").replace("-mid", "")}`;
  if (key.startsWith("blog-") && key.endsWith("-grid")) return `Blog Tool Grid: ${key.replace("blog-", "").replace("-grid", "")}`;
  if (key.startsWith("blog-")) return `Blog: ${key.replace("blog-", "")}`;
  return key;
}

function percentageChange(current: number, previous: number) {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

function formatChange(value: number) {
  const rounded = Math.round(value * 10) / 10;
  return `${rounded >= 0 ? "+" : ""}${rounded}% vs. Vormonat`;
}

export default async function Stats() {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  const [monthClicks, lastMonthClicks, subscribers, allArticles, topAffiliates] = await Promise.all([
    prisma.affiliateClick.findMany({
      where: { createdAt: { gte: monthStart, lt: nextMonthStart } },
    }),
    prisma.affiliateClick.findMany({
      where: { createdAt: { gte: lastMonthStart, lt: monthStart } },
    }),
    prisma.newsletterSubscriber.findMany({
      where: { status: "subscribed" },
      select: { source: true },
    }),
    prisma.article.findMany({
      select: { id: true, title: true, status: true, seoScore: true },
    }),
    prisma.affiliateLink.findMany({
      orderBy: { clicks: "desc" },
      take: 5,
      select: { id: true, name: true, clicks: true, price: true, rating: true },
    }),
  ]);

  const monthRevenue = monthClicks.reduce((sum, click) => sum + (click.revenue || 0), 0);
  const lastMonthRevenue = lastMonthClicks.reduce((sum, click) => sum + (click.revenue || 0), 0);
  const clickChange = percentageChange(monthClicks.length, lastMonthClicks.length);
  const revenueChange = percentageChange(monthRevenue, lastMonthRevenue);

  const sourceBreakdown = subscribers.reduce<Record<string, number>>((accumulator, subscriber) => {
    const key = subscriber.source || "unknown";
    accumulator[key] = (accumulator[key] || 0) + 1;
    return accumulator;
  }, {});

  const topLeadSources = Object.entries(sourceBreakdown)
    .sort((left, right) => right[1] - left[1])
    .slice(0, 4);

  const pageClickBreakdown = monthClicks.reduce<Record<string, { clicks: number; revenue: number }>>((accumulator, click) => {
    const key = click.source || click.articleSlug || "unknown";
    if (!accumulator[key]) {
      accumulator[key] = { clicks: 0, revenue: 0 };
    }
    accumulator[key].clicks += 1;
    accumulator[key].revenue += click.revenue || 0;
    return accumulator;
  }, {});

  const topMoneyPages = Object.entries(pageClickBreakdown)
    .map(([key, value]) => ({
      key,
      label: prettifyKey(key),
      clicks: value.clicks,
      revenue: value.revenue,
    }))
    .sort((left, right) => right.revenue - left.revenue)
    .slice(0, 5);

  const funnelRows = Object.entries(sourceBreakdown)
    .map(([source, leads]) => {
      const clicksFromSameSurface = pageClickBreakdown[source]?.clicks || 0;
      const revenueFromSameSurface = pageClickBreakdown[source]?.revenue || 0;
      const leadRate = clicksFromSameSurface > 0 ? (leads / clicksFromSameSurface) * 100 : 0;

      return {
        source,
        label: prettifyKey(source),
        leads,
        clicks: clicksFromSameSurface,
        revenue: revenueFromSameSurface,
        leadRate,
      };
    })
    .sort((left, right) => right.leads - left.leads)
    .slice(0, 6);

  const publishedArticles = allArticles.filter((article) => article.status === "Veröffentlicht" || article.status === "published").length;
  const scheduledArticles = allArticles.filter((article) => article.status === "Geplant" || article.status === "scheduled").length;
  const averageSeoScore = allArticles.length
    ? Math.round(allArticles.reduce((sum, article) => sum + article.seoScore, 0) / allArticles.length)
    : 0;

  return (
    <main className="min-h-screen p-12" style={{ background: "var(--background)", color: "var(--text-dark)" }}>
      <div className="mx-auto max-w-6xl">
        <h1 className="text-5xl font-bold">📊 Business Statistiken</h1>

        <p className="mt-4" style={{ color: "var(--text-light)" }}>
          Echte Kennzahlen für Umsatz, Klicks, Leads und Content-Output.
        </p>

        <div className="mt-12 grid gap-8 md:grid-cols-4">
          <div className="rounded-2xl p-8" style={{ background: "var(--background-elevated)", border: "1px solid rgba(255,255,255,0.1)" }}>
            <h2 className="text-xl font-bold">🔗 Affiliate Klicks</h2>
            <p className="mt-4 text-4xl font-bold">{monthClicks.length}</p>
            <p style={{ color: "var(--success-light)" }}>{formatChange(clickChange)}</p>
          </div>

          <div className="rounded-2xl p-8" style={{ background: "var(--background-elevated)", border: "1px solid rgba(255,255,255,0.1)" }}>
            <h2 className="text-xl font-bold">💰 Umsatz</h2>
            <p className="mt-4 text-4xl font-bold">€{monthRevenue.toFixed(2)}</p>
            <p style={{ color: "var(--success-light)" }}>{formatChange(revenueChange)}</p>
          </div>

          <div className="rounded-2xl p-8" style={{ background: "var(--background-elevated)", border: "1px solid rgba(255,255,255,0.1)" }}>
            <h2 className="text-xl font-bold">📧 Subscriber</h2>
            <p className="mt-4 text-4xl font-bold">{subscribers.length}</p>
            <p style={{ color: "var(--text-light)" }}>Top Source: {topLeadSources[0] ? prettifyKey(topLeadSources[0][0]) : "-"}</p>
          </div>

          <div className="rounded-2xl p-8" style={{ background: "var(--background-elevated)", border: "1px solid rgba(255,255,255,0.1)" }}>
            <h2 className="text-xl font-bold">📝 Live Content</h2>
            <p className="mt-4 text-4xl font-bold">{publishedArticles}</p>
            <p style={{ color: "var(--text-light)" }}>{scheduledArticles} geplant • SEO {averageSeoScore}</p>
          </div>
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-2">
          <section className="rounded-2xl p-8" style={{ background: "var(--background-elevated)", border: "1px solid rgba(255,255,255,0.1)" }}>
            <h2 className="mb-6 text-2xl font-bold">🎯 Beste Lead-Quellen</h2>
            <div className="space-y-4">
              {topLeadSources.length === 0 ? (
                <p style={{ color: "var(--text-light)" }}>Noch keine Lead-Quellen vorhanden.</p>
              ) : (
                topLeadSources.map(([source, count]) => (
                  <div key={source} className="flex items-center justify-between rounded-xl p-4" style={{ background: "rgba(59, 130, 246, 0.06)", border: "1px solid rgba(59, 130, 246, 0.18)" }}>
                    <span style={{ color: "var(--text-light)" }}>{prettifyKey(source)}</span>
                    <span className="font-bold">{count}</span>
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="rounded-2xl p-8" style={{ background: "var(--background-elevated)", border: "1px solid rgba(255,255,255,0.1)" }}>
            <h2 className="mb-6 text-2xl font-bold">🏆 Top Affiliate-Assets</h2>
            <div className="space-y-4">
              {topAffiliates.map((tool) => (
                <div key={tool.id} className="rounded-xl p-4" style={{ background: "rgba(16, 185, 129, 0.06)", border: "1px solid rgba(16, 185, 129, 0.18)" }}>
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-bold">{tool.name}</p>
                      <p style={{ color: "var(--text-light)" }}>{tool.clicks} Klicks • Rating {tool.rating.toFixed(1)}</p>
                    </div>
                    <p className="font-bold" style={{ color: "var(--success-light)" }}>{tool.price || "ohne Preis"}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-2">
          <section className="rounded-2xl p-8" style={{ background: "var(--background-elevated)", border: "1px solid rgba(255,255,255,0.1)" }}>
            <h2 className="mb-6 text-2xl font-bold">💸 Umsatzstärkste Seiten</h2>
            <div className="space-y-4">
              {topMoneyPages.length === 0 ? (
                <p style={{ color: "var(--text-light)" }}>Noch keine klickbasierten Umsatzdaten vorhanden.</p>
              ) : (
                topMoneyPages.map((page) => (
                  <div key={page.key} className="rounded-xl p-4" style={{ background: "rgba(245, 158, 11, 0.06)", border: "1px solid rgba(245, 158, 11, 0.18)" }}>
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="font-bold">{page.label}</p>
                        <p style={{ color: "var(--text-light)" }}>{page.clicks} Klicks diesen Monat</p>
                      </div>
                      <p className="font-bold" style={{ color: "var(--accent-light)" }}>€{page.revenue.toFixed(2)}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="rounded-2xl p-8" style={{ background: "var(--background-elevated)", border: "1px solid rgba(255,255,255,0.1)" }}>
            <h2 className="mb-6 text-2xl font-bold">🧭 Funnel nach Quelle</h2>
            <div className="space-y-4">
              {funnelRows.length === 0 ? (
                <p style={{ color: "var(--text-light)" }}>Noch keine Funnel-Daten vorhanden.</p>
              ) : (
                funnelRows.map((row) => (
                  <div key={row.source} className="rounded-xl p-4" style={{ background: "rgba(139, 92, 246, 0.06)", border: "1px solid rgba(139, 92, 246, 0.18)" }}>
                    <div className="mb-2 flex items-center justify-between gap-4">
                      <p className="font-bold">{row.label}</p>
                      <p className="font-bold" style={{ color: "var(--premium-light)" }}>{row.leads} Leads</p>
                    </div>
                    <div className="grid grid-cols-3 gap-3 text-sm" style={{ color: "var(--text-light)" }}>
                      <span>{row.clicks} Klicks</span>
                      <span>{row.leadRate.toFixed(1)}% Lead-Rate</span>
                      <span>€{row.revenue.toFixed(2)} Revenue</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
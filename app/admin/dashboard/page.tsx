import Link from "next/link";
import { prisma } from "../../../lib/prisma";

function prettifySource(source: string) {
  if (source === "homepage-top-tools") return "Homepage Top Tools";
  if (source === "homepage-final-cta") return "Homepage Final CTA";
  if (source === "exit-intent-popup") return "Exit Intent Popup";
  if (source === "affiliate-directory") return "Affiliate Verzeichnis";
  if (source === "best-tools-table") return "Beste Tools Tabelle";
  if (source.startsWith("tool-detail-")) return `Tool Detail: ${source.replace("tool-detail-", "")}`;
  if (source.startsWith("blog-") && source.endsWith("-hero")) return `Blog Hero: ${source.replace("blog-", "").replace("-hero", "")}`;
  if (source.startsWith("blog-") && source.endsWith("-mid")) return `Blog Mid CTA: ${source.replace("blog-", "").replace("-mid", "")}`;
  if (source.startsWith("blog-") && source.endsWith("-grid")) return `Blog Tool Grid: ${source.replace("blog-", "").replace("-grid", "")}`;
  return source;
}

export default async function DashboardPage() {
  const articleCount = await prisma.article.count();
  const affiliateCount = await prisma.affiliateLink.count();
  const affiliateLinks = await prisma.affiliateLink.findMany({
    orderBy: { clicks: "desc" },
  });
  const latestArticle = await prisma.article.findFirst({
    orderBy: { createdAt: "desc" },
  });
  const totalClicks = affiliateLinks.reduce((sum, link) => sum + link.clicks, 0);
  const topAffiliate = affiliateLinks[0];

  // Calculate today's revenue
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const todayClicks = await prisma.affiliateClick.findMany({
    where: { createdAt: { gte: today, lt: tomorrow } },
  });
  const todayRevenue = todayClicks.reduce(
    (sum, click) => sum + (click.revenue || 0),
    0
  );

  const subscriberCount = await prisma.newsletterSubscriber.count({
    where: { status: "subscribed" },
  });

  const [leadSources, activeTests, completedTests] = await Promise.all([
    prisma.newsletterSubscriber.findMany({
      where: { status: "subscribed" },
      select: { source: true },
    }),
    prisma.aBTest.count({ where: { status: "active" } }),
    prisma.aBTest.count({ where: { status: "complete" } }),
  ]);

  const topLeadSource = Object.entries(
    leadSources.reduce<Record<string, number>>((accumulator, subscriber) => {
      const key = subscriber.source || "unknown";
      accumulator[key] = (accumulator[key] || 0) + 1;
      return accumulator;
    }, {})
  ).sort((left, right) => right[1] - left[1])[0];

  return (
    <div style={{ background: "var(--background)", minHeight: "100vh" }} className="py-10 px-6">
      <h1 className="mb-10 text-5xl font-bold" style={{ color: "var(--text-dark)" }}>📊 Admin Dashboard</h1>

      {/* KPI Cards */}
      <div className="grid md:grid-cols-4 gap-6 mb-10">
        <Link href="/admin" className="rounded-xl p-8 border transition-colors" style={{ background: "var(--background-elevated)", borderColor: "rgba(255,255,255,0.1)" }}>
          <h2 className="text-xl" style={{ color: "var(--text-light)" }}>Artikel</h2>
          <p className="mt-4 text-5xl font-bold" style={{ color: "var(--text-dark)" }}>{articleCount}</p>
        </Link>

        <Link href="/admin/affiliate" className="rounded-xl p-8 border transition-colors" style={{ background: "var(--background-elevated)", borderColor: "rgba(255,255,255,0.1)" }}>
          <h2 className="text-xl" style={{ color: "var(--text-light)" }}>Affiliate Links</h2>
          <p className="mt-4 text-5xl font-bold" style={{ color: "var(--text-dark)" }}>{affiliateCount}</p>
        </Link>

        <Link href="/admin/affiliate" className="rounded-xl p-8 border transition-colors" style={{ background: "var(--background-elevated)", borderColor: "rgba(255,255,255,0.1)" }}>
          <h2 className="text-xl" style={{ color: "var(--text-light)" }}>Affiliate Klicks</h2>
          <p className="mt-4 text-5xl font-bold" style={{ color: "var(--text-dark)" }}>{totalClicks}</p>
        </Link>

        <Link href="/admin/earnings" className="bg-green-500/10 p-8 rounded-xl hover:bg-green-500/20 border border-green-500/30">
          <h2 className="text-xl text-green-400">💰 Heute Verdient</h2>
          <p className="text-5xl font-bold mt-4">€{todayRevenue.toFixed(2)}</p>
        </Link>
      </div>

      {/* Secondary Stats */}
      <div className="grid md:grid-cols-5 gap-6 mb-10">
        <div className="rounded-xl border p-8" style={{ background: "var(--background-elevated)", borderColor: "rgba(255,255,255,0.1)" }}>
          <h2 className="text-xl" style={{ color: "var(--text-light)" }}>Newsletter Abos</h2>
          <p className="mt-4 text-5xl font-bold" style={{ color: "var(--text-dark)" }}>{subscriberCount}</p>
        </div>

        <div className="rounded-xl border p-8" style={{ background: "var(--background-elevated)", borderColor: "rgba(255,255,255,0.1)" }}>
          <h2 className="text-xl" style={{ color: "var(--text-light)" }}>Heute: Klicks</h2>
          <p className="mt-4 text-5xl font-bold" style={{ color: "var(--text-dark)" }}>{todayClicks.length}</p>
        </div>

        <div className="rounded-xl border p-8" style={{ background: "var(--background-elevated)", borderColor: "rgba(255,255,255,0.1)" }}>
          <h2 className="text-xl" style={{ color: "var(--text-light)" }}>Monatl. Projektion</h2>
          <p className="mt-4 text-5xl font-bold" style={{ color: "var(--text-dark)" }}>€{(todayRevenue * 30).toFixed(2)}</p>
        </div>

        <div className="rounded-xl border p-8" style={{ background: "var(--background-elevated)", borderColor: "rgba(255,255,255,0.1)" }}>
          <h2 className="text-xl" style={{ color: "var(--text-light)" }}>Aktive A/B Tests</h2>
          <p className="mt-4 text-5xl font-bold" style={{ color: "var(--text-dark)" }}>{activeTests}</p>
        </div>

        <div className="rounded-xl border p-8" style={{ background: "var(--background-elevated)", borderColor: "rgba(255,255,255,0.1)" }}>
          <h2 className="text-xl" style={{ color: "var(--text-light)" }}>Top Lead-Quelle</h2>
          <p className="mt-4 text-lg font-bold" style={{ color: "var(--text-dark)" }}>{topLeadSource ? prettifySource(topLeadSource[0]) : "-"}</p>
          <p className="mt-2" style={{ color: "var(--text-light)" }}>{topLeadSource ? `${topLeadSource[1]} Leads` : "Noch keine Leads"}</p>
        </div>
      </div>

      {/* Details Section */}
      <div className="grid md:grid-cols-2 gap-6">
        <Link href="/admin/affiliate" className="rounded-xl border p-8 transition-colors" style={{ background: "var(--background-elevated)", borderColor: "rgba(255,255,255,0.1)" }}>
          <h2 className="mb-4 text-2xl font-bold" style={{ color: "var(--text-dark)" }}>🏆 Top Affiliate Link</h2>

          {topAffiliate ? (
            <>
              <p className="text-3xl font-bold" style={{ color: "var(--text-dark)" }}>{topAffiliate.name}</p>
              <p className="mt-2" style={{ color: "var(--text-light)" }}>
                Kategorie: {topAffiliate.category}
              </p>
              <p className="text-yellow-400 text-xl mt-4">
                Klicks: {topAffiliate.clicks}
              </p>
            </>
          ) : (
            <p style={{ color: "var(--text-light)" }}>Keine Affiliate Links vorhanden.</p>
          )}
        </Link>

        <Link
          href={latestArticle ? `/admin/edit/${latestArticle.id}` : "/admin"}
          className="rounded-xl border p-8 transition-colors"
          style={{ background: "var(--background-elevated)", borderColor: "rgba(255,255,255,0.1)" }}
        >
          <h2 className="mb-4 text-2xl font-bold" style={{ color: "var(--text-dark)" }}>🕒 Letzter Artikel</h2>

          {latestArticle ? (
            <>
              <p className="text-2xl font-bold" style={{ color: "var(--text-dark)" }}>{latestArticle.title}</p>
              <p className="mt-2" style={{ color: "var(--text-light)" }}>
                {new Date(latestArticle.createdAt).toLocaleString("de-DE")}
              </p>
            </>
          ) : (
            <p style={{ color: "var(--text-light)" }}>Keine Artikel vorhanden.</p>
          )}
        </Link>
      </div>

      <div className="mt-10 grid md:grid-cols-2 gap-6">
        <Link href="/admin/ab-testing" className="rounded-xl border p-8 transition-colors" style={{ background: "var(--background-elevated)", borderColor: "rgba(255,255,255,0.1)" }}>
          <h2 className="mb-4 text-2xl font-bold" style={{ color: "var(--text-dark)" }}>🧪 Conversion Engine</h2>
          <p style={{ color: "var(--text-light)" }}>Aktive Tests: {activeTests} • Übernommene Gewinner: {completedTests}</p>
          <p className="mt-3" style={{ color: "var(--success-light)" }}>Zu den CTA-Tests →</p>
        </Link>

        <Link href="/stats" className="rounded-xl border p-8 transition-colors" style={{ background: "var(--background-elevated)", borderColor: "rgba(255,255,255,0.1)" }}>
          <h2 className="mb-4 text-2xl font-bold" style={{ color: "var(--text-dark)" }}>📈 Funnel Analytics</h2>
          <p style={{ color: "var(--text-light)" }}>Sieh, welche Seiten und Quellen Umsatz, Klicks und Leads erzeugen.</p>
          <p className="mt-3" style={{ color: "var(--primary-light)" }}>Zum Revenue-Dashboard →</p>
        </Link>
      </div>

      {/* Quick Actions */}
      <div className="mt-10 grid md:grid-cols-4 gap-4">
        <Link href="/admin" className="bg-blue-500/20 p-4 rounded-lg hover:bg-blue-500/30 border border-blue-500/30 text-center font-bold">
          ➕ Artikel Verwalten
        </Link>
        <Link href="/admin/affiliate" className="bg-purple-500/20 p-4 rounded-lg hover:bg-purple-500/30 border border-purple-500/30 text-center font-bold">
          🔗 Affiliates Verwalten
        </Link>
        <Link href="/admin/earnings" className="bg-green-500/20 p-4 rounded-lg hover:bg-green-500/30 border border-green-500/30 text-center font-bold">
          💰 Earnings Einsehen
        </Link>
        <Link href="/content-factory" className="bg-orange-500/20 p-4 rounded-lg hover:bg-orange-500/30 border border-orange-500/30 text-center font-bold">
          🤖 Content Factory
        </Link>
      </div>
    </div>
  );
}
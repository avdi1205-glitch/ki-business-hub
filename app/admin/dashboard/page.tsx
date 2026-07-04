import Link from "next/link";
import { prisma } from "../../../lib/prisma";

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

  return (
    <div style={{ background: "var(--background)", minHeight: "100vh" }} className="py-10 px-6">
      <h1 className="text-5xl font-bold mb-10">📊 Admin Dashboard</h1>

      {/* KPI Cards */}
      <div className="grid md:grid-cols-4 gap-6 mb-10">
        <Link href="/admin" className="bg-white/10 p-8 rounded-xl hover:bg-white/20 border border-white/10">
          <h2 className="text-xl text-gray-300">Artikel</h2>
          <p className="text-5xl font-bold mt-4">{articleCount}</p>
        </Link>

        <Link href="/admin/affiliate" className="bg-white/10 p-8 rounded-xl hover:bg-white/20 border border-white/10">
          <h2 className="text-xl text-gray-300">Affiliate Links</h2>
          <p className="text-5xl font-bold mt-4">{affiliateCount}</p>
        </Link>

        <Link href="/admin/affiliate" className="bg-white/10 p-8 rounded-xl hover:bg-white/20 border border-white/10">
          <h2 className="text-xl text-gray-300">Affiliate Klicks</h2>
          <p className="text-5xl font-bold mt-4">{totalClicks}</p>
        </Link>

        <Link href="/admin/earnings" className="bg-green-500/10 p-8 rounded-xl hover:bg-green-500/20 border border-green-500/30">
          <h2 className="text-xl text-green-400">💰 Heute Verdient</h2>
          <p className="text-5xl font-bold mt-4">€{todayRevenue.toFixed(2)}</p>
        </Link>
      </div>

      {/* Secondary Stats */}
      <div className="grid md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white/10 p-8 rounded-xl border border-white/10">
          <h2 className="text-xl text-gray-300">Newsletter Abos</h2>
          <p className="text-5xl font-bold mt-4">{subscriberCount}</p>
        </div>

        <div className="bg-white/10 p-8 rounded-xl border border-white/10">
          <h2 className="text-xl text-gray-300">Heute: Klicks</h2>
          <p className="text-5xl font-bold mt-4">{todayClicks.length}</p>
        </div>

        <div className="bg-white/10 p-8 rounded-xl border border-white/10">
          <h2 className="text-xl text-gray-300">Monatl. Projektion</h2>
          <p className="text-5xl font-bold mt-4">€{(todayRevenue * 30).toFixed(2)}</p>
        </div>
      </div>

      {/* Details Section */}
      <div className="grid md:grid-cols-2 gap-6">
        <Link href="/admin/affiliate" className="bg-white/10 p-8 rounded-xl hover:bg-white/20 border border-white/10">
          <h2 className="text-2xl font-bold mb-4">🏆 Top Affiliate Link</h2>

          {topAffiliate ? (
            <>
              <p className="text-3xl font-bold">{topAffiliate.name}</p>
              <p className="text-gray-400 mt-2">
                Kategorie: {topAffiliate.category}
              </p>
              <p className="text-yellow-400 text-xl mt-4">
                Klicks: {topAffiliate.clicks}
              </p>
            </>
          ) : (
            <p>Keine Affiliate Links vorhanden.</p>
          )}
        </Link>

        <Link
          href={latestArticle ? `/admin/edit/${latestArticle.id}` : "/admin"}
          className="bg-white/10 p-8 rounded-xl hover:bg-white/20 border border-white/10"
        >
          <h2 className="text-2xl font-bold mb-4">🕒 Letzter Artikel</h2>

          {latestArticle ? (
            <>
              <p className="text-2xl font-bold">{latestArticle.title}</p>
              <p className="text-gray-400 mt-2">
                {new Date(latestArticle.createdAt).toLocaleString("de-DE")}
              </p>
            </>
          ) : (
            <p>Keine Artikel vorhanden.</p>
          )}
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
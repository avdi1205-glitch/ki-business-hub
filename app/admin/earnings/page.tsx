import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function EarningsDashboard() {
  // Get today's earnings
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const todayClicks = await prisma.affiliateClick.findMany({
    where: {
      createdAt: { gte: today, lt: tomorrow },
    },
  });

  const todayRevenue = todayClicks.reduce(
    (sum, click) => sum + (click.revenue || 0),
    0
  );

  // All time stats
  const allClicks = await prisma.affiliateClick.findMany();
  const allRevenue = allClicks.reduce(
    (sum, click) => sum + (click.revenue || 0),
    0
  );

  // Top affiliates
  const topAffiliates = await prisma.affiliateLink.findMany({
    orderBy: { clicks: "desc" },
    take: 10,
  });

  // Get subscriber count
  const subscriberCount = await prisma.newsletterSubscriber.count({
    where: { status: "subscribed" },
  });

  return (
    <div className="space-y-8">
      {/* KPI Cards */}
      <div className="grid gap-6 md:grid-cols-4">
        {/* Today Revenue */}
        <div className="rounded-2xl border border-green-500/30 bg-green-500/10 p-6">
          <p className="text-sm text-green-400">Heute Verdient</p>
          <p className="mt-2 text-4xl font-bold">
            €{todayRevenue.toFixed(2)}
          </p>
          <p className="mt-2 text-xs text-gray-400">
            {todayClicks.length} Klicks
          </p>
        </div>

        {/* Monthly Projection */}
        <div className="rounded-2xl border border-cyan-500/30 bg-cyan-500/10 p-6">
          <p className="text-sm text-cyan-400">Monatliche Projektion</p>
          <p className="mt-2 text-4xl font-bold">
            €{(todayRevenue * 30).toFixed(2)}
          </p>
          <p className="mt-2 text-xs text-gray-400">Basierend auf heute</p>
        </div>

        {/* All Time Revenue */}
        <div className="rounded-2xl border border-purple-500/30 bg-purple-500/10 p-6">
          <p className="text-sm text-purple-400">Gesamte Einnahmen</p>
          <p className="mt-2 text-4xl font-bold">
            €{allRevenue.toFixed(2)}
          </p>
          <p className="mt-2 text-xs text-gray-400">
            {allClicks.length} Klicks gesamt
          </p>
        </div>

        {/* Newsletter */}
        <div className="rounded-2xl border border-orange-500/30 bg-orange-500/10 p-6">
          <p className="text-sm text-orange-400">Newsletter Abos</p>
          <p className="mt-2 text-4xl font-bold">{subscriberCount}</p>
          <p className="mt-2 text-xs text-gray-400">Aktive Abonnenten</p>
        </div>
      </div>

      {/* Top Performing Affiliates */}
      <div className="rounded-2xl border border-white/10 bg-white/10 p-6">
        <h2 className="mb-6 text-2xl font-bold">🏆 Top Affiliate Links</h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-white/20">
              <tr>
                <th className="pb-3 text-gray-400">Tool Name</th>
                <th className="pb-3 text-gray-400">Kategorie</th>
                <th className="pb-3 text-gray-400">Klicks</th>
                <th className="pb-3 text-gray-400">Geschätzter Umsatz</th>
                <th className="pb-3 text-gray-400">Rating</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {topAffiliates.map((affiliate, index) => {
                const affiliateClicks = allClicks.filter(
                  (click) => click.affiliateLinkId === affiliate.id
                );
                const affiliateRevenue = affiliateClicks.reduce(
                  (sum, click) => sum + (click.revenue || 0),
                  0
                );

                return (
                  <tr key={affiliate.id} className="hover:bg-white/5">
                    <td className="py-4 font-bold">
                      #{index + 1} {affiliate.name}
                    </td>
                    <td className="py-4 text-gray-400">{affiliate.category}</td>
                    <td className="py-4">
                      <span className="rounded-lg bg-cyan-500/20 px-3 py-1 text-cyan-300">
                        {affiliate.clicks}
                      </span>
                    </td>
                    <td className="py-4 font-bold text-green-400">
                      €{affiliateRevenue.toFixed(2)}
                    </td>
                    <td className="py-4">⭐ {affiliate.rating.toFixed(1)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <Link
          href="/admin/affiliate"
          className="mt-6 inline-block rounded-lg border border-white/20 bg-white/10 px-4 py-2 font-bold hover:bg-white/20"
        >
          → Alle Affiliates verwalten
        </Link>
      </div>

      {/* Recent Clicks */}
      <div className="rounded-2xl border border-white/10 bg-white/10 p-6">
        <h2 className="mb-6 text-2xl font-bold">📊 Letzte Clicks (heute)</h2>

        {todayClicks.length === 0 ? (
          <p className="text-gray-400">Noch keine Klicks heute</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-white/20">
                <tr>
                  <th className="pb-3 text-gray-400">Uhrzeit</th>
                  <th className="pb-3 text-gray-400">Tool</th>
                  <th className="pb-3 text-gray-400">Artikel</th>
                  <th className="pb-3 text-gray-400">Geschätzte Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {todayClicks.slice(-10).map((click) => (
                  <tr key={click.id} className="hover:bg-white/5">
                    <td className="py-4 text-gray-400">
                      {click.createdAt.toLocaleTimeString("de-DE")}
                    </td>
                    <td className="py-4 font-bold">
                      {topAffiliates.find((a) => a.id === click.affiliateLinkId)
                        ?.name || "Unbekannt"}
                    </td>
                    <td className="py-4 text-gray-400">
                      {click.articleSlug || "-"}
                    </td>
                    <td className="py-4 text-green-400">
                      €{(click.revenue || 0).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

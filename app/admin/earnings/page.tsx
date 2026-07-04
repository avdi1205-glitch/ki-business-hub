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
    <div className="space-y-8 p-8" style={{ background: "var(--background)", minHeight: "100vh" }}>
      <div className="max-w-7xl mx-auto">
      {/* KPI Cards */}
      <div className="grid gap-6 md:grid-cols-4">
        {/* Today Revenue */}
        <div className="rounded-2xl border p-6" style={{ background: "rgba(16, 185, 129, 0.1)", borderColor: "rgba(16, 185, 129, 0.3)" }}>
          <p className="text-sm" style={{ color: "var(--success-light)" }}>Heute Verdient</p>
          <p className="mt-2 text-4xl font-bold" style={{ color: "var(--text-dark)" }}>
            €{todayRevenue.toFixed(2)}
          </p>
          <p className="mt-2 text-xs" style={{ color: "var(--text-muted)" }}>
            {todayClicks.length} Klicks
          </p>
        </div>

        {/* Monthly Projection */}
        <div className="rounded-2xl border p-6" style={{ background: "rgba(6, 182, 212, 0.1)", borderColor: "rgba(6, 182, 212, 0.3)" }}>
          <p className="text-sm" style={{ color: "#22d3ee" }}>Monatliche Projektion</p>
          <p className="mt-2 text-4xl font-bold" style={{ color: "var(--text-dark)" }}>
            €{(todayRevenue * 30).toFixed(2)}
          </p>
          <p className="mt-2 text-xs" style={{ color: "var(--text-muted)" }}>Basierend auf heute</p>
        </div>

        {/* All Time Revenue */}
        <div className="rounded-2xl border p-6" style={{ background: "rgba(139, 92, 246, 0.1)", borderColor: "rgba(139, 92, 246, 0.3)" }}>
          <p className="text-sm" style={{ color: "var(--premium-light)" }}>Gesamte Einnahmen</p>
          <p className="mt-2 text-4xl font-bold" style={{ color: "var(--text-dark)" }}>
            €{allRevenue.toFixed(2)}
          </p>
          <p className="mt-2 text-xs" style={{ color: "var(--text-muted)" }}>
            {allClicks.length} Klicks gesamt
          </p>
        </div>

        {/* Newsletter */}
        <div className="rounded-2xl border p-6" style={{ background: "rgba(245, 158, 11, 0.1)", borderColor: "rgba(245, 158, 11, 0.3)" }}>
          <p className="text-sm" style={{ color: "var(--accent-light)" }}>Newsletter Abos</p>
          <p className="mt-2 text-4xl font-bold" style={{ color: "var(--text-dark)" }}>{subscriberCount}</p>
          <p className="mt-2 text-xs" style={{ color: "var(--text-muted)" }}>Aktive Abonnenten</p>
        </div>
      </div>

      {/* Top Performing Affiliates */}
      <div className="rounded-2xl border p-6" style={{ background: "var(--background-elevated)", borderColor: "rgba(255,255,255,0.1)" }}>
        <h2 className="mb-6 text-2xl font-bold" style={{ color: "var(--text-dark)" }}>🏆 Top Affiliate Links</h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
              <tr>
                <th className="pb-3" style={{ color: "var(--text-light)" }}>Tool Name</th>
                <th className="pb-3" style={{ color: "var(--text-light)" }}>Kategorie</th>
                <th className="pb-3" style={{ color: "var(--text-light)" }}>Klicks</th>
                <th className="pb-3" style={{ color: "var(--text-light)" }}>Geschätzter Umsatz</th>
                <th className="pb-3" style={{ color: "var(--text-light)" }}>Rating</th>
              </tr>
            </thead>
            <tbody style={{ borderColor: "rgba(255,255,255,0.05)" }}>
              {topAffiliates.map((affiliate, index) => {
                const affiliateClicks = allClicks.filter(
                  (click) => click.affiliateLinkId === affiliate.id
                );
                const affiliateRevenue = affiliateClicks.reduce(
                  (sum, click) => sum + (click.revenue || 0),
                  0
                );

                return (
                  <tr key={affiliate.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                    <td className="py-4 font-bold" style={{ color: "var(--text-dark)" }}>
                      #{index + 1} {affiliate.name}
                    </td>
                    <td className="py-4" style={{ color: "var(--text-light)" }}>{affiliate.category}</td>
                    <td className="py-4">
                      <span className="rounded-lg px-3 py-1" style={{ background: "rgba(6, 182, 212, 0.2)", color: "#22d3ee" }}>
                        {affiliate.clicks}
                      </span>
                    </td>
                    <td className="py-4 font-bold" style={{ color: "var(--success-light)" }}>
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
          className="mt-6 inline-block rounded-lg border px-4 py-2 font-bold"
          style={{ background: "var(--primary)", borderColor: "var(--primary)", color: "white" }}
        >
          → Alle Affiliates verwalten
        </Link>
      </div>

      {/* Recent Clicks */}
      <div className="rounded-2xl border p-6" style={{ background: "var(--background-elevated)", borderColor: "rgba(255,255,255,0.1)" }}>
        <h2 className="mb-6 text-2xl font-bold" style={{ color: "var(--text-dark)" }}>📊 Letzte Clicks (heute)</h2>

        {todayClicks.length === 0 ? (
          <p style={{ color: "var(--text-light)" }}>Noch keine Klicks heute</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                <tr>
                  <th className="pb-3" style={{ color: "var(--text-light)" }}>Uhrzeit</th>
                  <th className="pb-3" style={{ color: "var(--text-light)" }}>Tool</th>
                  <th className="pb-3" style={{ color: "var(--text-light)" }}>Artikel</th>
                  <th className="pb-3" style={{ color: "var(--text-light)" }}>Geschätzte Revenue</th>
                </tr>
              </thead>
              <tbody style={{ borderColor: "rgba(255,255,255,0.05)" }}>
                {todayClicks.slice(-10).map((click) => (
                  <tr key={click.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                    <td className="py-4" style={{ color: "var(--text-light)" }}>
                      {click.createdAt.toLocaleTimeString("de-DE")}
                    </td>
                    <td className="py-4 font-bold" style={{ color: "var(--text-dark)" }}>
                      {topAffiliates.find((a) => a.id === click.affiliateLinkId)
                        ?.name || "Unbekannt"}
                    </td>
                    <td className="py-4" style={{ color: "var(--text-light)" }}>
                      {click.articleSlug || "-"}
                    </td>
                    <td className="py-4" style={{ color: "var(--success-light)" }}>
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
    </div>
  );
}

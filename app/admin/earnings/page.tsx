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

  const revenuePerClick = allClicks.length ? allRevenue / allClicks.length : 0;

  // Top affiliates
  const topAffiliates = await prisma.affiliateLink.findMany({
    orderBy: { clicks: "desc" },
    take: 10,
  });

  // Get subscriber count
  const subscriberCount = await prisma.newsletterSubscriber.count({
    where: { status: "subscribed" },
  });

  const sourcePerformance = Array.from(
    allClicks.reduce((map, click) => {
      const key = click.source || click.articleSlug || "unknown";
      const current = map.get(key) || { source: key, clicks: 0, revenue: 0 };
      current.clicks += 1;
      current.revenue += click.revenue || 0;
      map.set(key, current);
      return map;
    }, new Map<string, { source: string; clicks: number; revenue: number }>())
      .values()
  )
    .map((item) => ({
      ...item,
      epc: item.clicks ? item.revenue / item.clicks : 0,
    }))
    .sort((left, right) => right.revenue - left.revenue)
    .slice(0, 6);

  const affiliatePerformance = topAffiliates.map((affiliate) => {
    const affiliateClicks = allClicks.filter(
      (click) => click.affiliateLinkId === affiliate.id
    );
    const affiliateRevenue = affiliateClicks.reduce(
      (sum, click) => sum + (click.revenue || 0),
      0
    );

    return {
      ...affiliate,
      revenue: affiliateRevenue,
      epc: affiliateClicks.length ? affiliateRevenue / affiliateClicks.length : 0,
    };
  });

  const bestEpcAffiliates = [...affiliatePerformance]
    .sort((left, right) => right.epc - left.epc)
    .slice(0, 5);

  function prettifySource(source: string) {
    if (source === "homepage-top-tools") return "Homepage Top Tools";
    if (source === "homepage-final-cta") return "Homepage Final CTA";
    if (source === "exit-intent-popup") return "Exit Intent Popup";
    if (source === "affiliate-directory") return "Affiliate directory";
    if (source === "best-tools-table") return "Best tools table";
    if (source.startsWith("tool-detail-")) return `Tool detail: ${source.replace("tool-detail-", "")}`;
    if (source.startsWith("blog-") && source.endsWith("-hero")) return `Blog hero: ${source.replace("blog-", "").replace("-hero", "")}`;
    if (source.startsWith("blog-") && source.endsWith("-mid")) return `Blog mid CTA: ${source.replace("blog-", "").replace("-mid", "")}`;
    if (source.startsWith("blog-") && source.endsWith("-grid")) return `Blog tool grid: ${source.replace("blog-", "").replace("-grid", "")}`;
    return source;
  }

  return (
    <div className="space-y-8 p-8" style={{ background: "var(--background)", minHeight: "100vh" }}>
      <div className="max-w-7xl mx-auto">
      {/* KPI Cards */}
      <div className="grid gap-6 md:grid-cols-4">
        {/* Today Revenue */}
        <div className="rounded-2xl border p-6" style={{ background: "rgba(16, 185, 129, 0.1)", borderColor: "rgba(16, 185, 129, 0.3)" }}>
          <p className="text-sm" style={{ color: "var(--success-light)" }}>Earned today</p>
          <p className="mt-2 text-4xl font-bold" style={{ color: "var(--text-dark)" }}>
            €{todayRevenue.toFixed(2)}
          </p>
          <p className="mt-2 text-xs" style={{ color: "var(--text-muted)" }}>
            {todayClicks.length} clicks
          </p>
        </div>

        {/* Monthly Projection */}
        <div className="rounded-2xl border p-6" style={{ background: "rgba(6, 182, 212, 0.1)", borderColor: "rgba(6, 182, 212, 0.3)" }}>
          <p className="text-sm" style={{ color: "#22d3ee" }}>Monthly projection</p>
          <p className="mt-2 text-4xl font-bold" style={{ color: "var(--text-dark)" }}>
            €{(todayRevenue * 30).toFixed(2)}
          </p>
          <p className="mt-2 text-xs" style={{ color: "var(--text-muted)" }}>Based on today</p>
        </div>

        {/* All Time Revenue */}
        <div className="rounded-2xl border p-6" style={{ background: "rgba(139, 92, 246, 0.1)", borderColor: "rgba(139, 92, 246, 0.3)" }}>
          <p className="text-sm" style={{ color: "var(--premium-light)" }}>Total revenue</p>
          <p className="mt-2 text-4xl font-bold" style={{ color: "var(--text-dark)" }}>
            €{allRevenue.toFixed(2)}
          </p>
          <p className="mt-2 text-xs" style={{ color: "var(--text-muted)" }}>
            {allClicks.length} clicks total
          </p>
        </div>

        {/* Newsletter */}
        <div className="rounded-2xl border p-6" style={{ background: "rgba(245, 158, 11, 0.1)", borderColor: "rgba(245, 158, 11, 0.3)" }}>
          <p className="text-sm" style={{ color: "var(--accent-light)" }}>Newsletter subscribers</p>
          <p className="mt-2 text-4xl font-bold" style={{ color: "var(--text-dark)" }}>{subscriberCount}</p>
          <p className="mt-2 text-xs" style={{ color: "var(--text-muted)" }}>Active subscribers</p>
        </div>

        <div className="rounded-2xl border p-6" style={{ background: "rgba(59, 130, 246, 0.1)", borderColor: "rgba(59, 130, 246, 0.3)" }}>
          <p className="text-sm" style={{ color: "var(--primary-light)" }}>Durchschn. EPC</p>
          <p className="mt-2 text-4xl font-bold" style={{ color: "var(--text-dark)" }}>
            €{revenuePerClick.toFixed(2)}
          </p>
          <p className="mt-2 text-xs" style={{ color: "var(--text-muted)" }}>Overall revenue per click</p>
        </div>
      </div>

      {/* Top Performing Affiliates */}
      <div className="rounded-2xl border p-6" style={{ background: "var(--background-elevated)", borderColor: "rgba(255,255,255,0.1)" }}>
        <h2 className="mb-6 text-2xl font-bold" style={{ color: "var(--text-dark)" }}>🏆 Top affiliate links</h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
              <tr>
                <th className="pb-3" style={{ color: "var(--text-light)" }}>Tool name</th>
                <th className="pb-3" style={{ color: "var(--text-light)" }}>Category</th>
                <th className="pb-3" style={{ color: "var(--text-light)" }}>Clicks</th>
                <th className="pb-3" style={{ color: "var(--text-light)" }}>Estimated revenue</th>
                <th className="pb-3" style={{ color: "var(--text-light)" }}>Rating</th>
              </tr>
            </thead>
            <tbody style={{ borderColor: "rgba(255,255,255,0.05)" }}>
              {affiliatePerformance.map((affiliate, index) => {
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
                      €{affiliate.revenue.toFixed(2)}
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
          → Manage all affiliates
        </Link>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="rounded-2xl border p-6" style={{ background: "var(--background-elevated)", borderColor: "rgba(255,255,255,0.1)" }}>
          <h2 className="mb-6 text-2xl font-bold" style={{ color: "var(--text-dark)" }}>💸 Strongest CTA sources</h2>
          <div className="space-y-4">
            {sourcePerformance.length === 0 ? (
              <p style={{ color: "var(--text-light)" }}>No source data yet.</p>
            ) : (
              sourcePerformance.map((item) => (
                <div key={item.source} className="rounded-xl p-4" style={{ background: "rgba(245, 158, 11, 0.06)", border: "1px solid rgba(245, 158, 11, 0.18)" }}>
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-bold" style={{ color: "var(--text-dark)" }}>{prettifySource(item.source)}</p>
                      <p style={{ color: "var(--text-light)" }}>{item.clicks} clicks • EPC €{item.epc.toFixed(2)}</p>
                    </div>
                    <p className="font-bold" style={{ color: "var(--accent-light)" }}>€{item.revenue.toFixed(2)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-2xl border p-6" style={{ background: "var(--background-elevated)", borderColor: "rgba(255,255,255,0.1)" }}>
          <h2 className="mb-6 text-2xl font-bold" style={{ color: "var(--text-dark)" }}>⚡ Highest EPC per tool</h2>
          <div className="space-y-4">
            {bestEpcAffiliates.length === 0 ? (
              <p style={{ color: "var(--text-light)" }}>No tool data yet.</p>
            ) : (
              bestEpcAffiliates.map((affiliate) => (
                <div key={affiliate.id} className="rounded-xl p-4" style={{ background: "rgba(59, 130, 246, 0.06)", border: "1px solid rgba(59, 130, 246, 0.18)" }}>
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-bold" style={{ color: "var(--text-dark)" }}>{affiliate.name}</p>
                      <p style={{ color: "var(--text-light)" }}>{affiliate.clicks} clicks • Revenue €{affiliate.revenue.toFixed(2)}</p>
                    </div>
                    <p className="font-bold" style={{ color: "var(--primary-light)" }}>EPC €{affiliate.epc.toFixed(2)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Recent Clicks */}
      <div className="rounded-2xl border p-6" style={{ background: "var(--background-elevated)", borderColor: "rgba(255,255,255,0.1)" }}>
        <h2 className="mb-6 text-2xl font-bold" style={{ color: "var(--text-dark)" }}>📊 Recent clicks today</h2>

        {todayClicks.length === 0 ? (
          <p style={{ color: "var(--text-light)" }}>No clicks today yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                <tr>
                  <th className="pb-3" style={{ color: "var(--text-light)" }}>Time</th>
                  <th className="pb-3" style={{ color: "var(--text-light)" }}>Tool</th>
                  <th className="pb-3" style={{ color: "var(--text-light)" }}>Source</th>
                  <th className="pb-3" style={{ color: "var(--text-light)" }}>Estimated revenue</th>
                </tr>
              </thead>
              <tbody style={{ borderColor: "rgba(255,255,255,0.05)" }}>
                {todayClicks.slice(-10).map((click) => (
                  <tr key={click.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                    <td className="py-4" style={{ color: "var(--text-light)" }}>
                      {click.createdAt.toLocaleTimeString()}
                    </td>
                    <td className="py-4 font-bold" style={{ color: "var(--text-dark)" }}>
                      {topAffiliates.find((a) => a.id === click.affiliateLinkId)
                        ?.name || "Unknown"}
                    </td>
                    <td className="py-4" style={{ color: "var(--text-light)" }}>
                      {prettifySource(click.source || click.articleSlug || "-")}
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

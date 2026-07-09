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
  if (source.startsWith("revenue-navigator:")) {
    const parsed = parseRevenueNavigatorSource(source);
    if (!parsed) return "Revenue Navigator";
    return `Revenue Navigator (${focusLabel(parsed.focus)} / ${parsed.plan.toUpperCase()})`;
  }
  return source;
}

function parseRevenueNavigatorSource(source: string | null) {
  if (!source || !source.includes("revenue-navigator:")) return null;

  const pivot = source.indexOf("revenue-navigator:");
  const token = source.slice(pivot);
  const [key, focus, plan, scoreRaw] = token.split(":");

  if (key !== "revenue-navigator" || !focus || !plan || !scoreRaw) return null;
  if (plan !== "starter" && plan !== "pro" && plan !== "agency") return null;

  return {
    focus,
    plan,
    score: scoreRaw.startsWith("score-") ? Number(scoreRaw.replace("score-", "")) || null : null,
  };
}

function parseCheckoutRescueSource(source: string | null) {
  if (!source || !source.startsWith("checkout-rescue:")) return null;

  const [, plan, intent, reason, ...rest] = source.split(":");
  return {
    plan: plan || "unknown",
    intent: intent || "unknown",
    reason: reason || "unknown",
    source: rest.join(":"),
  };
}

function teamSizeFromReason(reason: string | null) {
  if (!reason || !reason.startsWith("agency_onboarding_team_")) return null;
  return reason.replace("agency_onboarding_team_", "");
}

function teamPriority(teamSize: string | null) {
  if (teamSize === "20+") return 4;
  if (teamSize === "11-20") return 3;
  if (teamSize === "6-10") return 2;
  if (teamSize === "2-5") return 1;
  return 0;
}

function priorityLabel(teamSize: string | null, isAgency: boolean) {
  if (!isAgency) return "Normal";
  const rank = teamPriority(teamSize);
  if (rank >= 4) return "Hot";
  if (rank >= 3) return "High";
  if (rank >= 2) return "Medium";
  return "Agency";
}

function focusLabel(focus: string) {
  if (focus === "affiliate") return "Affiliate";
  if (focus === "leadgen") return "Leadgen";
  if (focus === "ads") return "Ads";
  if (focus === "membership") return "Membership";
  return focus;
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

  const [subscribedSources, revenueNavigatorLeads, activeTests, completedTests] = await Promise.all([
    prisma.newsletterSubscriber.findMany({
      where: { status: "subscribed" },
      select: { source: true },
    }),
    prisma.newsletterSubscriber.findMany({
      where: {
        source: { contains: "revenue-navigator" },
      },
      select: {
        email: true,
        source: true,
        status: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      take: 12,
    }),
    prisma.aBTest.count({ where: { status: "active" } }),
    prisma.aBTest.count({ where: { status: "complete" } }),
  ]);

  const topLeadSource = Object.entries(
    subscribedSources.reduce<Record<string, number>>((accumulator, subscriber) => {
      const key = subscriber.source || "unknown";
      accumulator[key] = (accumulator[key] || 0) + 1;
      return accumulator;
    }, {})
  ).sort((left, right) => right[1] - left[1])[0];

  const revenueNavigatorByStatus = revenueNavigatorLeads.reduce<Record<string, number>>((accumulator, row) => {
    accumulator[row.status] = (accumulator[row.status] || 0) + 1;
    return accumulator;
  }, {});

  const revenueNavigatorByPlan = revenueNavigatorLeads.reduce<Record<string, number>>((accumulator, row) => {
    const parsed = parseRevenueNavigatorSource(row.source);
    const key = parsed?.plan || "unknown";
    accumulator[key] = (accumulator[key] || 0) + 1;
    return accumulator;
  }, {});

  const revenueNavigatorTopFocus = Object.entries(
    revenueNavigatorLeads.reduce<Record<string, number>>((accumulator, row) => {
      const parsed = parseRevenueNavigatorSource(row.source);
      const key = parsed?.focus || "unknown";
      accumulator[key] = (accumulator[key] || 0) + 1;
      return accumulator;
    }, {})
  ).sort((a, b) => b[1] - a[1])[0];

  const prioritizedRevenueNavigatorLeads = [...revenueNavigatorLeads]
    .map((row) => {
      const checkout = parseCheckoutRescueSource(row.source);
      const parsed = parseRevenueNavigatorSource(row.source);
      const teamSize = teamSizeFromReason(checkout?.reason || null);
      const isAgency = (parsed?.plan === "agency") || checkout?.plan === "agency";

      return {
        ...row,
        parsed,
        teamSize,
        isAgency,
      };
    })
    .sort((left, right) => {
      if (left.isAgency !== right.isAgency) return left.isAgency ? -1 : 1;
      const teamDiff = teamPriority(right.teamSize) - teamPriority(left.teamSize);
      if (teamDiff !== 0) return teamDiff;
      return right.createdAt.getTime() - left.createdAt.getTime();
    });

  const agencyPriorityCount = prioritizedRevenueNavigatorLeads.filter((row) => row.isAgency).length;

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

      <div className="mt-10 rounded-2xl border p-6" style={{ background: "var(--background-elevated)", borderColor: "rgba(16,185,129,0.35)" }}>
        <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold" style={{ color: "var(--text-dark)" }}>🚀 Revenue Navigator Leads</h2>
            <p className="mt-1 text-sm" style={{ color: "var(--text-light)" }}>
              Eigene Tracking-Sicht fuer Scan-basierte Newsletter- und Upgrade-Kontakte.
            </p>
          </div>
          <Link href="/revenue-navigator" className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-300 hover:bg-emerald-500/20">
            Zum Tool
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-5">
          <div className="rounded-xl border p-4" style={{ borderColor: "rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.03)" }}>
            <p className="text-xs uppercase tracking-[0.18em]" style={{ color: "var(--text-light)" }}>Gesamt</p>
            <p className="mt-2 text-3xl font-bold" style={{ color: "var(--text-dark)" }}>{revenueNavigatorLeads.length}</p>
          </div>
          <div className="rounded-xl border p-4" style={{ borderColor: "rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.03)" }}>
            <p className="text-xs uppercase tracking-[0.18em]" style={{ color: "var(--text-light)" }}>Lead neu</p>
            <p className="mt-2 text-3xl font-bold" style={{ color: "var(--text-dark)" }}>{revenueNavigatorByStatus.lead_new || 0}</p>
          </div>
          <div className="rounded-xl border p-4" style={{ borderColor: "rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.03)" }}>
            <p className="text-xs uppercase tracking-[0.18em]" style={{ color: "var(--text-light)" }}>Subscribed</p>
            <p className="mt-2 text-3xl font-bold" style={{ color: "var(--text-dark)" }}>{revenueNavigatorByStatus.subscribed || 0}</p>
          </div>
          <div className="rounded-xl border p-4" style={{ borderColor: "rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.03)" }}>
            <p className="text-xs uppercase tracking-[0.18em]" style={{ color: "var(--text-light)" }}>Top Fokus</p>
            <p className="mt-2 text-xl font-bold" style={{ color: "var(--text-dark)" }}>
              {revenueNavigatorTopFocus ? `${focusLabel(revenueNavigatorTopFocus[0])} (${revenueNavigatorTopFocus[1]})` : "-"}
            </p>
          </div>
          <div className="rounded-xl border p-4" style={{ borderColor: "rgba(251,191,36,0.35)", background: "rgba(251,191,36,0.08)" }}>
            <p className="text-xs uppercase tracking-[0.18em]" style={{ color: "var(--text-light)" }}>Agency Prioritaet</p>
            <p className="mt-2 text-3xl font-bold" style={{ color: "var(--text-dark)" }}>{agencyPriorityCount}</p>
          </div>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border p-4" style={{ borderColor: "rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.03)" }}>
            <p className="text-xs uppercase tracking-[0.18em]" style={{ color: "var(--text-light)" }}>Starter</p>
            <p className="mt-2 text-2xl font-bold" style={{ color: "var(--text-dark)" }}>{revenueNavigatorByPlan.starter || 0}</p>
          </div>
          <div className="rounded-xl border p-4" style={{ borderColor: "rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.03)" }}>
            <p className="text-xs uppercase tracking-[0.18em]" style={{ color: "var(--text-light)" }}>Pro</p>
            <p className="mt-2 text-2xl font-bold" style={{ color: "var(--text-dark)" }}>{revenueNavigatorByPlan.pro || 0}</p>
          </div>
          <div className="rounded-xl border p-4" style={{ borderColor: "rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.03)" }}>
            <p className="text-xs uppercase tracking-[0.18em]" style={{ color: "var(--text-light)" }}>Agency</p>
            <p className="mt-2 text-2xl font-bold" style={{ color: "var(--text-dark)" }}>{revenueNavigatorByPlan.agency || 0}</p>
          </div>
        </div>

        <div className="mt-5 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-xs uppercase tracking-[0.18em]" style={{ color: "var(--text-light)" }}>
                <th className="px-3 py-2 font-semibold">E-Mail</th>
                <th className="px-3 py-2 font-semibold">Fokus</th>
                <th className="px-3 py-2 font-semibold">Plan</th>
                <th className="px-3 py-2 font-semibold">Team</th>
                <th className="px-3 py-2 font-semibold">Prioritaet</th>
                <th className="px-3 py-2 font-semibold">Status</th>
                <th className="px-3 py-2 font-semibold">Datum</th>
              </tr>
            </thead>
            <tbody>
              {prioritizedRevenueNavigatorLeads.map((row) => {
                const parsed = row.parsed;
                const priority = priorityLabel(row.teamSize, row.isAgency);
                return (
                  <tr key={`${row.email}-${row.createdAt.toISOString()}`} className="border-b border-white/10">
                    <td className="px-3 py-2" style={{ color: "var(--text-dark)" }}>{row.email}</td>
                    <td className="px-3 py-2" style={{ color: "var(--text-light)" }}>{parsed ? focusLabel(parsed.focus) : "-"}</td>
                    <td className="px-3 py-2" style={{ color: "var(--text-light)" }}>{parsed ? parsed.plan.toUpperCase() : "-"}</td>
                    <td className="px-3 py-2" style={{ color: "var(--text-light)" }}>
                      {row.teamSize ? (
                        <span className="rounded-full border border-amber-400/35 bg-amber-500/12 px-2 py-1 text-xs font-semibold text-amber-200">
                          {row.teamSize}
                        </span>
                      ) : "-"}
                    </td>
                    <td className="px-3 py-2" style={{ color: "var(--text-light)" }}>
                      <span
                        className="rounded-full px-2 py-1 text-xs font-semibold"
                        style={{
                          background:
                            priority === "Hot"
                              ? "rgba(239, 68, 68, 0.2)"
                              : priority === "High"
                                ? "rgba(245, 158, 11, 0.2)"
                                : priority === "Medium"
                                  ? "rgba(16, 185, 129, 0.2)"
                                  : "rgba(148, 163, 184, 0.2)",
                          color:
                            priority === "Hot"
                              ? "#fecaca"
                              : priority === "High"
                                ? "#fde68a"
                                : priority === "Medium"
                                  ? "#bbf7d0"
                                  : "#e2e8f0",
                        }}
                      >
                        {priority}
                      </span>
                    </td>
                    <td className="px-3 py-2" style={{ color: "var(--text-light)" }}>{row.status}</td>
                    <td className="px-3 py-2" style={{ color: "var(--text-light)" }}>{new Date(row.createdAt).toLocaleDateString("de-DE")}</td>
                  </tr>
                );
              })}
              {!prioritizedRevenueNavigatorLeads.length && (
                <tr>
                  <td colSpan={7} className="px-3 py-6 text-center" style={{ color: "var(--text-light)" }}>
                    Noch keine Revenue-Navigator-Leads vorhanden.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
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
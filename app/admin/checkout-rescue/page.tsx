import Link from "next/link";
import { prisma } from "@/lib/prisma";

type ParsedRescueSource = {
  plan: string;
  intent: string;
  reason: string;
  source: string;
};

function parseRescueSource(raw: string | null): ParsedRescueSource {
  const fallback: ParsedRescueSource = {
    plan: "unknown",
    intent: "contact",
    reason: "none",
    source: "website",
  };

  if (!raw) return fallback;
  if (!raw.startsWith("checkout-rescue:")) {
    return { ...fallback, source: raw };
  }

  const [, plan, intent, reason, source] = raw.split(":");
  return {
    plan: plan || fallback.plan,
    intent: intent || fallback.intent,
    reason: reason || fallback.reason,
    source: source || fallback.source,
  };
}

function prettySource(source: string) {
  if (source.startsWith("tools-")) return "Tools";
  if (source.startsWith("tool-")) return "Tool-Detail";
  if (source.startsWith("blog-")) return "Blog";
  if (source.startsWith("affiliate-")) return "Affiliate";
  if (source.startsWith("factory-")) return "Content-Factory";
  return source.replaceAll("-", " ");
}

function prettyReason(reason: string) {
  if (reason === "checkout_url_missing") return "Checkout-Link fehlt";
  if (reason === "invalid_plan") return "Plan ungültig";
  if (reason === "none") return "Kein Fallback-Grund";
  return reason.replaceAll("_", " ");
}

export default async function CheckoutRescueAdminPage() {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - 7);

  const [recentLeads, monthLeadsCount, weekLeadsCount] = await Promise.all([
    prisma.newsletterSubscriber.findMany({
      where: {
        status: "lead",
        source: { startsWith: "checkout-rescue:" },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
      select: {
        id: true,
        email: true,
        name: true,
        source: true,
        createdAt: true,
      },
    }),
    prisma.newsletterSubscriber.count({
      where: {
        status: "lead",
        source: { startsWith: "checkout-rescue:" },
        createdAt: { gte: monthStart },
      },
    }),
    prisma.newsletterSubscriber.count({
      where: {
        status: "lead",
        source: { startsWith: "checkout-rescue:" },
        createdAt: { gte: weekStart },
      },
    }),
  ]);

  const parsed = recentLeads.map((lead) => ({
    ...lead,
    parsed: parseRescueSource(lead.source),
  }));

  const planBreakdown = parsed.reduce<Record<string, number>>((acc, lead) => {
    const key = lead.parsed.plan;
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  const reasonBreakdown = parsed.reduce<Record<string, number>>((acc, lead) => {
    const key = lead.parsed.reason;
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  const sourceBreakdown = parsed.reduce<Record<string, number>>((acc, lead) => {
    const key = lead.parsed.source;
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  const topPlans = Object.entries(planBreakdown)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  const topReasons = Object.entries(reasonBreakdown)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  const topSources = Object.entries(sourceBreakdown)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  return (
    <main className="min-h-screen px-6 py-10" style={{ background: "var(--background)", color: "var(--text-dark)" }}>
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="rounded-2xl border p-8" style={{ background: "var(--background-elevated)", borderColor: "rgba(255,255,255,0.1)" }}>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-300">Checkout Rescue</p>
          <h1 className="mt-3 text-4xl font-black">🛟 Rescue-Leads</h1>
          <p className="mt-4 max-w-3xl" style={{ color: "var(--text-light)" }}>
            Diese Ansicht zeigt alle Leads aus dem Checkout-Fallback. So siehst du sofort, welche Plan-Anfragen durch fehlende Checkout-Links abgefangen wurden.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/admin/dashboard" className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-bold text-slate-200 hover:bg-white/10">
              ← Zurück zum Dashboard
            </Link>
            <Link href="/stats" className="rounded-lg border border-cyan-400/30 bg-cyan-500/10 px-4 py-2 text-sm font-bold text-cyan-100 hover:bg-cyan-500/20">
              Funnel-Kennzahlen öffnen
            </Link>
          </div>
        </div>

        <section className="grid gap-6 md:grid-cols-4">
          <div className="rounded-2xl border p-6" style={{ background: "rgba(16,185,129,0.08)", borderColor: "rgba(16,185,129,0.3)" }}>
            <p className="text-sm" style={{ color: "var(--success-light)" }}>Leads gesamt</p>
            <p className="mt-2 text-4xl font-black">{recentLeads.length}</p>
          </div>
          <div className="rounded-2xl border p-6" style={{ background: "rgba(6,182,212,0.08)", borderColor: "rgba(6,182,212,0.3)" }}>
            <p className="text-sm" style={{ color: "#22d3ee" }}>Diesen Monat</p>
            <p className="mt-2 text-4xl font-black">{monthLeadsCount}</p>
          </div>
          <div className="rounded-2xl border p-6" style={{ background: "rgba(245,158,11,0.08)", borderColor: "rgba(245,158,11,0.3)" }}>
            <p className="text-sm" style={{ color: "var(--accent-light)" }}>Letzte 7 Tage</p>
            <p className="mt-2 text-4xl font-black">{weekLeadsCount}</p>
          </div>
          <div className="rounded-2xl border p-6" style={{ background: "rgba(139,92,246,0.08)", borderColor: "rgba(139,92,246,0.3)" }}>
            <p className="text-sm" style={{ color: "var(--premium-light)" }}>Top Plan</p>
            <p className="mt-2 text-2xl font-black uppercase">{topPlans[0]?.[0] || "-"}</p>
            <p className="mt-1 text-xs" style={{ color: "var(--text-light)" }}>{topPlans[0] ? `${topPlans[0][1]} Leads` : "Keine Daten"}</p>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-2xl border p-6" style={{ background: "var(--background-elevated)", borderColor: "rgba(255,255,255,0.1)" }}>
            <h2 className="mb-4 text-xl font-bold">Top Plaene</h2>
            <div className="space-y-3">
              {topPlans.length === 0 ? (
                <p style={{ color: "var(--text-light)" }}>Keine Plan-Daten vorhanden.</p>
              ) : (
                topPlans.map(([plan, count]) => (
                  <div key={plan} className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-4 py-3">
                    <span className="font-semibold uppercase">{plan}</span>
                    <span className="font-bold">{count}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-2xl border p-6" style={{ background: "var(--background-elevated)", borderColor: "rgba(255,255,255,0.1)" }}>
            <h2 className="mb-4 text-xl font-bold">Top Fallback-Gruende</h2>
            <div className="space-y-3">
              {topReasons.length === 0 ? (
                <p style={{ color: "var(--text-light)" }}>Keine Grund-Daten vorhanden.</p>
              ) : (
                topReasons.map(([reason, count]) => (
                  <div key={reason} className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-4 py-3">
                    <span className="font-semibold">{prettyReason(reason)}</span>
                    <span className="font-bold">{count}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-2xl border p-6" style={{ background: "var(--background-elevated)", borderColor: "rgba(255,255,255,0.1)" }}>
            <h2 className="mb-4 text-xl font-bold">Top Quellen</h2>
            <div className="space-y-3">
              {topSources.length === 0 ? (
                <p style={{ color: "var(--text-light)" }}>Keine Quellen-Daten vorhanden.</p>
              ) : (
                topSources.map(([source, count]) => (
                  <div key={source} className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-4 py-3">
                    <span className="font-semibold">{prettySource(source)}</span>
                    <span className="font-bold">{count}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        <section className="rounded-2xl border p-6" style={{ background: "var(--background-elevated)", borderColor: "rgba(255,255,255,0.1)" }}>
          <h2 className="mb-4 text-2xl font-bold">Neueste Rescue-Leads</h2>

          {parsed.length === 0 ? (
            <p style={{ color: "var(--text-light)" }}>Noch keine Rescue-Leads vorhanden.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[860px] text-left text-sm">
                <thead style={{ borderBottom: "1px solid rgba(255,255,255,0.12)" }}>
                  <tr>
                    <th className="pb-3">Zeit</th>
                    <th className="pb-3">Kontakt</th>
                    <th className="pb-3">Plan</th>
                    <th className="pb-3">Quelle</th>
                    <th className="pb-3">Grund</th>
                    <th className="pb-3">Aktion</th>
                  </tr>
                </thead>
                <tbody>
                  {parsed.map((lead) => {
                    const mailSubject = encodeURIComponent(`Rescue Lead ${lead.parsed.plan.toUpperCase()} - ${prettySource(lead.parsed.source)}`);
                    const mailBody = encodeURIComponent([
                      `Lead-ID: ${lead.id}`,
                      `Plan: ${lead.parsed.plan}`,
                      `Intent: ${lead.parsed.intent}`,
                      `Grund: ${lead.parsed.reason}`,
                      `Quelle: ${lead.parsed.source}`,
                      "",
                      "Antwort:",
                    ].join("\n"));

                    return (
                      <tr key={lead.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                        <td className="py-3" style={{ color: "var(--text-light)" }}>{lead.createdAt.toLocaleString()}</td>
                        <td className="py-3">
                          <p className="font-semibold" style={{ color: "var(--text-dark)" }}>{lead.name || "Ohne Namen"}</p>
                          <p style={{ color: "var(--text-light)" }}>{lead.email}</p>
                        </td>
                        <td className="py-3 uppercase" style={{ color: "var(--text-dark)" }}>{lead.parsed.plan}</td>
                        <td className="py-3" style={{ color: "var(--text-light)" }}>{prettySource(lead.parsed.source)}</td>
                        <td className="py-3" style={{ color: "var(--text-light)" }}>{prettyReason(lead.parsed.reason)}</td>
                        <td className="py-3">
                          <Link
                            href={`mailto:${lead.email}?subject=${mailSubject}&body=${mailBody}`}
                            className="inline-flex rounded-lg border border-cyan-400/30 bg-cyan-500/10 px-3 py-1.5 font-semibold text-cyan-100 hover:bg-cyan-500/20"
                          >
                            Antworten
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

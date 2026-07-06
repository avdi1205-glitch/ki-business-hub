import Link from "next/link";
import { prisma } from "@/lib/prisma";

type ParsedRescueSource = {
  plan: string;
  intent: string;
  reason: string;
  source: string;
};

type LeadWorkflowStatus = "lead" | "lead_new" | "lead_contacted" | "lead_won" | "lead_lost";
type QueueFilter = "all" | "open" | "new" | "contacted" | "won" | "lost";

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

function prettyStatus(status: LeadWorkflowStatus) {
  if (status === "lead_won") return "Gewonnen";
  if (status === "lead_lost") return "Verloren";
  if (status === "lead_contacted") return "Kontaktiert";
  return "Neu";
}

function statusClassName(status: LeadWorkflowStatus) {
  if (status === "lead_won") {
    return "border-emerald-400/35 bg-emerald-500/12 text-emerald-100";
  }
  if (status === "lead_lost") {
    return "border-rose-400/35 bg-rose-500/12 text-rose-100";
  }
  if (status === "lead_contacted") {
    return "border-cyan-400/35 bg-cyan-500/12 text-cyan-100";
  }
  return "border-amber-400/35 bg-amber-500/12 text-amber-100";
}

function normalizeFilter(raw: string | undefined): QueueFilter {
  if (raw === "open" || raw === "new" || raw === "contacted" || raw === "won" || raw === "lost") {
    return raw;
  }
  return "all";
}

function buildStatusFilter(filter: QueueFilter) {
  if (filter === "all") {
    return { startsWith: "lead" };
  }

  if (filter === "open") {
    return { in: ["lead", "lead_new", "lead_contacted"] };
  }

  if (filter === "new") {
    return { in: ["lead", "lead_new"] };
  }

  if (filter === "contacted") {
    return "lead_contacted";
  }

  if (filter === "won") {
    return "lead_won";
  }

  return "lead_lost";
}

function formatRate(won: number, total: number) {
  if (!total) return "0.0%";
  return `${((won / total) * 100).toFixed(1)}%`;
}

export default async function CheckoutRescueAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status: statusParam } = await searchParams;
  const activeFilter = normalizeFilter(statusParam);
  const statusFilter = buildStatusFilter(activeFilter);

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - 7);

  const [recentLeads, allRescueStates, monthLeadsCount, weekLeadsCount] = await Promise.all([
    prisma.newsletterSubscriber.findMany({
      where: {
        status: statusFilter,
        source: { startsWith: "checkout-rescue:" },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
      select: {
        id: true,
        email: true,
        name: true,
        status: true,
        source: true,
        createdAt: true,
      },
    }),
    prisma.newsletterSubscriber.findMany({
      where: {
        status: { startsWith: "lead" },
        source: { startsWith: "checkout-rescue:" },
      },
      select: {
        status: true,
        source: true,
      },
    }),
    prisma.newsletterSubscriber.count({
      where: {
        status: { startsWith: "lead" },
        source: { startsWith: "checkout-rescue:" },
        createdAt: { gte: monthStart },
      },
    }),
    prisma.newsletterSubscriber.count({
      where: {
        status: { startsWith: "lead" },
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

  const conversionByPlan = Object.entries(
    allRescueStates.reduce<Record<string, { total: number; won: number }>>((acc, lead) => {
      const parsedSource = parseRescueSource(lead.source);
      const plan = parsedSource.plan || "unknown";
      const current = acc[plan] || { total: 0, won: 0 };
      current.total += 1;
      if (lead.status === "lead_won") {
        current.won += 1;
      }
      acc[plan] = current;
      return acc;
    }, {})
  )
    .map(([plan, values]) => ({
      plan,
      total: values.total,
      won: values.won,
      rate: formatRate(values.won, values.total),
    }))
    .sort((left, right) => right.total - left.total)
    .slice(0, 6);

  const conversionBySource = Object.entries(
    allRescueStates.reduce<Record<string, { total: number; won: number }>>((acc, lead) => {
      const parsedSource = parseRescueSource(lead.source);
      const source = parsedSource.source || "website";
      const current = acc[source] || { total: 0, won: 0 };
      current.total += 1;
      if (lead.status === "lead_won") {
        current.won += 1;
      }
      acc[source] = current;
      return acc;
    }, {})
  )
    .map(([source, values]) => ({
      source,
      total: values.total,
      won: values.won,
      rate: formatRate(values.won, values.total),
    }))
    .sort((left, right) => right.total - left.total)
    .slice(0, 8);

  const stageBreakdown = parsed.reduce<Record<LeadWorkflowStatus, number>>((acc, lead) => {
    const stage = (lead.status as LeadWorkflowStatus) || "lead_new";
    acc[stage] = (acc[stage] || 0) + 1;
    return acc;
  }, {
    lead: 0,
    lead_new: 0,
    lead_contacted: 0,
    lead_won: 0,
    lead_lost: 0,
  });

  const filterTabs: Array<{ key: QueueFilter; label: string }> = [
    { key: "all", label: "Alle" },
    { key: "open", label: "Offen" },
    { key: "new", label: "Neu" },
    { key: "contacted", label: "Kontaktiert" },
    { key: "won", label: "Gewonnen" },
    { key: "lost", label: "Verloren" },
  ];

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

        <section className="grid gap-6 md:grid-cols-5">
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
          <div className="rounded-2xl border p-6" style={{ background: "rgba(34,197,94,0.08)", borderColor: "rgba(34,197,94,0.3)" }}>
            <p className="text-sm" style={{ color: "var(--success-light)" }}>Gewonnen</p>
            <p className="mt-2 text-4xl font-black">{stageBreakdown.lead_won}</p>
            <p className="mt-1 text-xs" style={{ color: "var(--text-light)" }}>
              Offen: {stageBreakdown.lead + stageBreakdown.lead_new + stageBreakdown.lead_contacted}
            </p>
          </div>
        </section>

        <section className="rounded-2xl border p-6" style={{ background: "var(--background-elevated)", borderColor: "rgba(255,255,255,0.1)" }}>
          <h2 className="mb-4 text-xl font-bold">Queue-Filter</h2>
          <div className="flex flex-wrap gap-2">
            {filterTabs.map((tab) => {
              const isActive = activeFilter === tab.key;
              const href = tab.key === "all" ? "/admin/checkout-rescue" : `/admin/checkout-rescue?status=${tab.key}`;

              return (
                <Link
                  key={tab.key}
                  href={href}
                  className="rounded-lg border px-4 py-2 text-sm font-semibold transition-colors"
                  style={{
                    borderColor: isActive ? "rgba(6, 182, 212, 0.5)" : "rgba(255,255,255,0.14)",
                    background: isActive ? "rgba(6, 182, 212, 0.14)" : "rgba(255,255,255,0.03)",
                    color: isActive ? "#cffafe" : "#e2e8f0",
                  }}
                >
                  {tab.label}
                </Link>
              );
            })}
          </div>
          <p className="mt-3 text-sm" style={{ color: "var(--text-light)" }}>
            Aktiver Filter: <span className="font-semibold text-slate-100">{filterTabs.find((tab) => tab.key === activeFilter)?.label}</span>
          </p>
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

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border p-6" style={{ background: "var(--background-elevated)", borderColor: "rgba(255,255,255,0.1)" }}>
            <h2 className="mb-4 text-xl font-bold">Conversion nach Plan</h2>
            <div className="space-y-3">
              {conversionByPlan.length === 0 ? (
                <p style={{ color: "var(--text-light)" }}>Keine Plan-Konvertierung vorhanden.</p>
              ) : (
                conversionByPlan.map((row) => (
                  <div key={row.plan} className="rounded-lg border border-white/10 bg-white/5 px-4 py-3">
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-semibold uppercase">{row.plan}</span>
                      <span className="font-bold text-emerald-200">{row.rate}</span>
                    </div>
                    <p className="mt-1 text-sm" style={{ color: "var(--text-light)" }}>
                      {row.won} gewonnen / {row.total} gesamt
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-2xl border p-6" style={{ background: "var(--background-elevated)", borderColor: "rgba(255,255,255,0.1)" }}>
            <h2 className="mb-4 text-xl font-bold">Conversion nach Quelle</h2>
            <div className="space-y-3">
              {conversionBySource.length === 0 ? (
                <p style={{ color: "var(--text-light)" }}>Keine Quellen-Konvertierung vorhanden.</p>
              ) : (
                conversionBySource.map((row) => (
                  <div key={row.source} className="rounded-lg border border-white/10 bg-white/5 px-4 py-3">
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-semibold">{prettySource(row.source)}</span>
                      <span className="font-bold text-emerald-200">{row.rate}</span>
                    </div>
                    <p className="mt-1 text-sm" style={{ color: "var(--text-light)" }}>
                      {row.won} gewonnen / {row.total} gesamt
                    </p>
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
                    <th className="pb-3">Status</th>
                    <th className="pb-3">Grund</th>
                    <th className="pb-3">Aktion</th>
                  </tr>
                </thead>
                <tbody>
                  {parsed.map((lead) => {
                    const workflowStatus = (lead.status as LeadWorkflowStatus) || "lead_new";
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
                        <td className="py-3">
                          <span className={`inline-flex rounded-md border px-2 py-1 text-xs font-semibold ${statusClassName(workflowStatus)}`}>
                            {prettyStatus(workflowStatus)}
                          </span>
                        </td>
                        <td className="py-3" style={{ color: "var(--text-light)" }}>{prettyReason(lead.parsed.reason)}</td>
                        <td className="py-3">
                          <div className="flex flex-wrap gap-2">
                            <Link
                              href={`mailto:${lead.email}?subject=${mailSubject}&body=${mailBody}`}
                              className="inline-flex rounded-lg border border-cyan-400/30 bg-cyan-500/10 px-3 py-1.5 font-semibold text-cyan-100 hover:bg-cyan-500/20"
                            >
                              Antworten
                            </Link>

                            {workflowStatus !== "lead_contacted" && workflowStatus !== "lead_won" && workflowStatus !== "lead_lost" && (
                              <form action="/api/contact-lead/status" method="post">
                                <input type="hidden" name="leadId" value={lead.id} />
                                <input type="hidden" name="status" value="lead_contacted" />
                                <input type="hidden" name="redirectTo" value="/admin/checkout-rescue" />
                                <button type="submit" className="inline-flex rounded-lg border border-cyan-400/30 bg-cyan-500/10 px-3 py-1.5 font-semibold text-cyan-100 hover:bg-cyan-500/20">
                                  Kontaktiert
                                </button>
                              </form>
                            )}

                            {workflowStatus !== "lead_won" && (
                              <form action="/api/contact-lead/status" method="post">
                                <input type="hidden" name="leadId" value={lead.id} />
                                <input type="hidden" name="status" value="lead_won" />
                                <input type="hidden" name="redirectTo" value="/admin/checkout-rescue" />
                                <button type="submit" className="inline-flex rounded-lg border border-emerald-400/30 bg-emerald-500/10 px-3 py-1.5 font-semibold text-emerald-100 hover:bg-emerald-500/20">
                                  Gewonnen
                                </button>
                              </form>
                            )}

                            {workflowStatus !== "lead_lost" && (
                              <form action="/api/contact-lead/status" method="post">
                                <input type="hidden" name="leadId" value={lead.id} />
                                <input type="hidden" name="status" value="lead_lost" />
                                <input type="hidden" name="redirectTo" value="/admin/checkout-rescue" />
                                <button type="submit" className="inline-flex rounded-lg border border-rose-400/30 bg-rose-500/10 px-3 py-1.5 font-semibold text-rose-100 hover:bg-rose-500/20">
                                  Verloren
                                </button>
                              </form>
                            )}
                          </div>
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

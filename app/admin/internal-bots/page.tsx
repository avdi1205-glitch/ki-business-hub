"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

type BotType = "sales" | "seo" | "content-ops" | "support";
type TeamRole = "owner" | "growth" | "content" | "support";

type BotResponse = {
  success: boolean;
  answer?: string;
  error?: string;
  persistenceAvailable?: boolean;
  runId?: number | null;
};

type HistoryItem = {
  id: number;
  createdAt: string;
  bot: BotType;
  role: TeamRole;
  playbook: string | null;
  goal: string;
  context: string | null;
  answer: string;
  tags?: unknown;
  favorite: boolean;
  recurringTaskKey: string | null;
};

const botLabels: Record<BotType, { title: string; subtitle: string }> = {
  sales: { title: "Sales Bot", subtitle: "Upsell, Pricing, Offer-Positionierung" },
  seo: { title: "SEO Bot", subtitle: "Rankings, Cluster, interne Verlinkung" },
  "content-ops": { title: "Content Ops Bot", subtitle: "Pipeline, Sprint-Plan, Automationen" },
  support: { title: "Support Bot", subtitle: "Nutzerantworten und Team-Playbooks" },
};

const roleLabels: Record<TeamRole, string> = {
  owner: "Owner (alle Bots)",
  growth: "Growth (Sales/SEO/Ops)",
  content: "Content (SEO/Ops)",
  support: "Support (nur Support Bot)",
};

const playbooks: Record<BotType, { name: string; goal: string; context: string }[]> = {
  sales: [
    {
      name: "Umsatz-Navigator Upsell",
      goal: "Mehr Pro-Upgrades aus dem Umsatz-Navigator holen",
      context: "Starter-Lock aktiv. Bitte 3 konkrete Conversion-Hebel fuer die naechsten 7 Tage.",
    },
    {
      name: "Agency-Pipeline",
      goal: "Mehr Agency-Abschluesse fuer Teamkunden",
      context: "Fokus auf B2B-Use-Cases, ROI-Kommunikation und klaren Upgrade-Triggern.",
    },
  ],
  seo: [
    {
      name: "Top-Cluster Woche",
      goal: "Schnellster SEO-Cluster fuer mehr Affiliate-Traffic",
      context: "Bitte 1 Cluster + 5 Artikelideen + interne Linkstruktur.",
    },
    {
      name: "Bestandscontent Refresh",
      goal: "Bestehende Top-Seiten fuer mehr Klicks optimieren",
      context: "Fokus auf Titel, Intro, CTA-Platzierung und FAQ-Erweiterung.",
    },
  ],
  "content-ops": [
    {
      name: "7-Tage Publishing Sprint",
      goal: "Content-Produktion fuer 7 Tage planbar machen",
      context: "Bitte Sprint-Plan mit Verantwortlichkeiten und Kontrollpunkten.",
    },
    {
      name: "Workflow-Entstauung",
      goal: "Bottlenecks in der Content-Pipeline reduzieren",
      context: "Nenne die groessten Reibungsverluste und jeweils einen direkten Fix.",
    },
  ],
  support: [
    {
      name: "Antwortvorlagen Pro/Agency",
      goal: "Schnelle Vorlagen fuer Upgrade-Rueckfragen",
      context: "Freundlich, konkret, mit klarem naechstem Schritt und passendem Link.",
    },
    {
      name: "Einwandbehandlung",
      goal: "Haeufige Einwaende strukturiert beantworten",
      context: "Einwaende: Preis, Aufwand, Unsicherheit. Bitte kurze Antwort-Bausteine.",
    },
  ],
};

export default function InternalBotsPage() {
  const [bot, setBot] = useState<BotType>("sales");
  const [role, setRole] = useState<TeamRole>("owner");
  const [playbook, setPlaybook] = useState("");
  const [goal, setGoal] = useState("");
  const [context, setContext] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [recurringTaskKey, setRecurringTaskKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState("");
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [allHistory, setAllHistory] = useState<HistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [persistenceAvailable, setPersistenceAvailable] = useState(true);
  const [favoriteOnly, setFavoriteOnly] = useState(false);
  const [recurringOnly, setRecurringOnly] = useState(false);
  const [trendScope, setTrendScope] = useState<"filtered" | "global">(() => {
    if (typeof window === "undefined") return "filtered";

    const stored = window.localStorage.getItem("internal-bots-trend-scope");
    return stored === "global" ? "global" : "filtered";
  });

  const allowedBots = useMemo(() => {
    if (role === "owner") return ["sales", "seo", "content-ops", "support"] as BotType[];
    if (role === "growth") return ["sales", "seo", "content-ops"] as BotType[];
    if (role === "content") return ["seo", "content-ops"] as BotType[];
    return ["support"] as BotType[];
  }, [role]);

  const effectiveBot = allowedBots.includes(bot) ? bot : allowedBots[0];

  const parseTags = (value: string) =>
    value
      .split(",")
      .map((item) => item.trim().toLowerCase())
      .filter(Boolean)
      .slice(0, 10);

  const toTagList = (value: unknown): string[] => {
    if (!Array.isArray(value)) return [];
    return value.map((item) => String(item || "")).filter(Boolean);
  };

  const loadHistory = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      params.set("limit", "50");
      if (favoriteOnly) params.set("favoriteOnly", "true");
      if (recurringOnly) params.set("recurringOnly", "true");

      const res = await fetch(`/api/internal-bots/history?${params.toString()}`, { cache: "no-store" });
      const json = (await res.json()) as { success: boolean; persistenceAvailable?: boolean; items?: HistoryItem[] };
      if (json.success) {
        setHistory(Array.isArray(json.items) ? json.items : []);
      }
      setPersistenceAvailable(json.persistenceAvailable !== false);
    } catch {
      setPersistenceAvailable(false);
    } finally {
      setHistoryLoading(false);
    }
  }, [favoriteOnly, recurringOnly]);

  const loadAllHistory = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      params.set("limit", "200");
      const res = await fetch(`/api/internal-bots/history?${params.toString()}`, { cache: "no-store" });
      const json = (await res.json()) as { success: boolean; items?: HistoryItem[] };
      if (json.success) {
        setAllHistory(Array.isArray(json.items) ? json.items : []);
      }
    } catch {
      setAllHistory([]);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadHistory();
  }, [loadHistory]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadAllHistory();
  }, [loadAllHistory]);

  useEffect(() => {
    window.localStorage.setItem("internal-bots-trend-scope", trendScope);
  }, [trendScope]);

  const historyKpis = useMemo(() => {
    const now = new Date();
    const isSameDay = (a: Date, b: Date) =>
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate();

    const totalRuns = history.length;
    const favoriteRuns = history.filter((item) => item.favorite).length;
    const recurringRuns = history.filter((item) => Boolean(item.recurringTaskKey)).length;
    const runsToday = history.filter((item) => isSameDay(new Date(item.createdAt), now)).length;
    const favoriteRate = totalRuns > 0 ? Math.round((favoriteRuns / totalRuns) * 100) : 0;

    return { totalRuns, favoriteRuns, recurringRuns, runsToday, favoriteRate };
  }, [history]);

  const trendSource = trendScope === "global" ? allHistory : history;

  const sevenDayTrend = useMemo(() => {
    const startOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const toKey = (date: Date) => {
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, "0");
      const d = String(date.getDate()).padStart(2, "0");
      return `${y}-${m}-${d}`;
    };

    const buckets = new Map<string, { label: string; runs: number; favorites: number }>();
    const today = startOfDay(new Date());

    for (let i = 6; i >= 0; i -= 1) {
      const day = new Date(today);
      day.setDate(today.getDate() - i);
      const key = toKey(day);
      const label = day.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit" });
      buckets.set(key, { label, runs: 0, favorites: 0 });
    }

    for (const item of trendSource) {
      const key = toKey(startOfDay(new Date(item.createdAt)));
      const existing = buckets.get(key);
      if (!existing) continue;
      existing.runs += 1;
      if (item.favorite) existing.favorites += 1;
    }

    const rows = Array.from(buckets.values());
    const maxRuns = Math.max(1, ...rows.map((row) => row.runs));

    return rows.map((row) => ({
      ...row,
      favoriteRate: row.runs > 0 ? Math.round((row.favorites / row.runs) * 100) : 0,
      widthPct: Math.round((row.runs / maxRuns) * 100),
    }));
  }, [trendSource]);

  const applyPlaybook = (preset: { name: string; goal: string; context: string }) => {
    setPlaybook(preset.name);
    setGoal(preset.goal);
    setContext(preset.context);
  };

  const generate = async (overrides?: Partial<{
    bot: BotType;
    role: TeamRole;
    playbook: string;
    goal: string;
    context: string;
    tagsInput: string;
    recurringTaskKey: string;
  }>) => {
    const payload = {
      bot: overrides?.bot ?? effectiveBot,
      role: overrides?.role ?? role,
      playbook: overrides?.playbook ?? playbook,
      goal: overrides?.goal ?? goal,
      context: overrides?.context ?? context,
      tagsInput: overrides?.tagsInput ?? tagsInput,
      recurringTaskKey: overrides?.recurringTaskKey ?? recurringTaskKey,
    };

    setLoading(true);
    setError("");
    setAnswer("");

    try {
      const res = await fetch("/api/internal-bots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bot: payload.bot,
          role: payload.role,
          playbook: payload.playbook,
          goal: payload.goal,
          context: payload.context,
          tags: parseTags(payload.tagsInput),
          recurringTaskKey: payload.recurringTaskKey,
        }),
      });

      const json = (await res.json()) as BotResponse;

      if (!res.ok || !json.success) {
        setError(json.error || "Antwort konnte nicht generiert werden.");
      } else {
        setAnswer(json.answer || "");
        setPersistenceAvailable(json.persistenceAvailable !== false);
        await Promise.all([loadHistory(), loadAllHistory()]);
      }
    } catch {
      setError("Antwort konnte nicht generiert werden.");
    } finally {
      setLoading(false);
    }
  };

  const updateHistoryItem = async (id: number, patch: { favorite?: boolean; tags?: string[]; recurringTaskKey?: string | null }) => {
    const res = await fetch(`/api/internal-bots/history/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });

    if (!res.ok) {
      setError("Verlauf konnte nicht aktualisiert werden.");
      return;
    }

    await Promise.all([loadHistory(), loadAllHistory()]);
  };

  const recurringTasks = useMemo(() => {
    const byKey = new Map<string, HistoryItem>();
    for (const item of history) {
      if (!item.recurringTaskKey) continue;
      if (!byKey.has(item.recurringTaskKey)) {
        byKey.set(item.recurringTaskKey, item);
      }
    }
    return Array.from(byKey.values());
  }, [history]);

  return (
    <div className="min-h-screen px-6 py-10" style={{ background: "var(--background)", color: "var(--text-dark)" }}>
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="mb-2 text-4xl font-bold">🧠 Interne Bots</h1>
          <p style={{ color: "var(--text-light)" }}>
            Dein internes KI-Team fuer Sales, SEO, Content-Ops und Support.
          </p>
        </div>

        <div className="mb-6 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          {allowedBots.map((key) => (
            <button
              key={key}
              onClick={() => setBot(key)}
              className="rounded-xl border p-4 text-left transition"
              style={{
                background: effectiveBot === key ? "rgba(16,185,129,0.18)" : "var(--background-elevated)",
                borderColor: effectiveBot === key ? "rgba(16,185,129,0.6)" : "rgba(255,255,255,0.1)",
              }}
            >
              <p className="font-semibold">{botLabels[key].title}</p>
              <p className="text-sm" style={{ color: "var(--text-light)" }}>{botLabels[key].subtitle}</p>
            </button>
          ))}
        </div>

        <div className="mb-6 rounded-xl border p-5" style={{ background: "var(--background-elevated)", borderColor: "rgba(255,255,255,0.1)" }}>
          <label className="mb-2 block text-sm font-semibold">Rolle</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as TeamRole)}
            className="mb-4 w-full rounded-lg border px-4 py-3"
            style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.15)", color: "var(--text-dark)" }}
          >
            {(Object.keys(roleLabels) as TeamRole[]).map((key) => (
              <option key={key} value={key}>{roleLabels[key]}</option>
            ))}
          </select>

          <label className="mb-2 block text-sm font-semibold">Playbook-Quickstart</label>
          <div className="mb-4 grid gap-2 md:grid-cols-2">
            {playbooks[effectiveBot].map((preset) => (
              <button
                key={preset.name}
                type="button"
                onClick={() => applyPlaybook(preset)}
                className="rounded-lg border px-3 py-2 text-left text-sm"
                style={{
                  borderColor: playbook === preset.name ? "rgba(16,185,129,0.65)" : "rgba(255,255,255,0.15)",
                  background: playbook === preset.name ? "rgba(16,185,129,0.15)" : "rgba(255,255,255,0.03)",
                }}
              >
                {preset.name}
              </button>
            ))}
          </div>

          <label className="mb-2 block text-sm font-semibold">Ziel</label>
          <input
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            placeholder="Beispiel: Mehr Pro-Upgrades aus dem Umsatz-Navigator"
            className="mb-4 w-full rounded-lg border px-4 py-3"
            style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.15)", color: "var(--text-dark)" }}
          />

          <label className="mb-2 block text-sm font-semibold">Kontext</label>
          <textarea
            value={context}
            onChange={(e) => setContext(e.target.value)}
            placeholder="Kurzer Kontext, aktuelle Zahlen, Problemstellen..."
            rows={6}
            className="w-full rounded-lg border px-4 py-3"
            style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.15)", color: "var(--text-dark)" }}
          />

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold">Tags (Komma-getrennt)</label>
              <input
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="upsell, revenue, q3"
                className="w-full rounded-lg border px-4 py-3"
                style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.15)", color: "var(--text-dark)" }}
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold">Recurring Task Key (optional)</label>
              <input
                value={recurringTaskKey}
                onChange={(e) => setRecurringTaskKey(e.target.value)}
                placeholder="weekly-upsell-sprint"
                className="w-full rounded-lg border px-4 py-3"
                style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.15)", color: "var(--text-dark)" }}
              />
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            <button
              onClick={() => {
                void generate();
              }}
              disabled={loading}
              className="rounded-lg bg-emerald-600 px-5 py-2 font-semibold text-white hover:bg-emerald-500"
            >
              {loading ? "Analysiere..." : "Bot-Antwort generieren"}
            </button>
          </div>
        </div>

        {!persistenceAvailable && (
          <div className="mb-6 rounded-xl border border-yellow-500/40 bg-yellow-500/10 p-4 text-yellow-100">
            Team-Verlauf ist aktuell nicht verfuegbar. Pruefe, ob die neue Datenbank-Migration bereits angewendet wurde.
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-red-200">{error}</div>
        )}

        {answer && (
          <div className="rounded-xl border p-5" style={{ background: "var(--background-elevated)", borderColor: "rgba(255,255,255,0.1)" }}>
            <h2 className="mb-3 text-xl font-bold">Antwort</h2>
            <pre className="whitespace-pre-wrap text-sm" style={{ color: "var(--text-light)", fontFamily: "inherit" }}>{answer}</pre>
          </div>
        )}

        <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          <div className="rounded-xl border p-4" style={{ background: "var(--background-elevated)", borderColor: "rgba(255,255,255,0.1)" }}>
            <p className="text-xs uppercase tracking-wide" style={{ color: "var(--text-light)" }}>Runs</p>
            <p className="mt-1 text-2xl font-bold">{historyKpis.totalRuns}</p>
          </div>
          <div className="rounded-xl border p-4" style={{ background: "var(--background-elevated)", borderColor: "rgba(255,255,255,0.1)" }}>
            <p className="text-xs uppercase tracking-wide" style={{ color: "var(--text-light)" }}>Heute</p>
            <p className="mt-1 text-2xl font-bold">{historyKpis.runsToday}</p>
          </div>
          <div className="rounded-xl border p-4" style={{ background: "var(--background-elevated)", borderColor: "rgba(255,255,255,0.1)" }}>
            <p className="text-xs uppercase tracking-wide" style={{ color: "var(--text-light)" }}>Favoriten</p>
            <p className="mt-1 text-2xl font-bold">{historyKpis.favoriteRuns}</p>
          </div>
          <div className="rounded-xl border p-4" style={{ background: "var(--background-elevated)", borderColor: "rgba(255,255,255,0.1)" }}>
            <p className="text-xs uppercase tracking-wide" style={{ color: "var(--text-light)" }}>Favoritenquote</p>
            <p className="mt-1 text-2xl font-bold">{historyKpis.favoriteRate}%</p>
          </div>
          <div className="rounded-xl border p-4" style={{ background: "var(--background-elevated)", borderColor: "rgba(255,255,255,0.1)" }}>
            <p className="text-xs uppercase tracking-wide" style={{ color: "var(--text-light)" }}>Recurring</p>
            <p className="mt-1 text-2xl font-bold">{historyKpis.recurringRuns}</p>
          </div>
        </div>

        <div className="mt-6 rounded-xl border p-5" style={{ background: "var(--background-elevated)", borderColor: "rgba(255,255,255,0.1)" }}>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-lg font-bold">7-Tage Trend</h2>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                className="rounded-md border px-2 py-1 text-xs"
                style={{
                  borderColor: trendScope === "filtered" ? "rgba(16,185,129,0.7)" : "rgba(255,255,255,0.2)",
                  background: trendScope === "filtered" ? "rgba(16,185,129,0.15)" : "transparent",
                }}
                onClick={() => setTrendScope("filtered")}
              >
                Aktuelle Filter
              </button>
              <button
                type="button"
                className="rounded-md border px-2 py-1 text-xs"
                style={{
                  borderColor: trendScope === "global" ? "rgba(16,185,129,0.7)" : "rgba(255,255,255,0.2)",
                  background: trendScope === "global" ? "rgba(16,185,129,0.15)" : "transparent",
                }}
                onClick={() => setTrendScope("global")}
              >
                Alle Runs
              </button>
              <p className="text-xs" style={{ color: "var(--text-light)" }}>Runs und Favoritenquote pro Tag</p>
            </div>
          </div>
          <div className="space-y-2">
            {sevenDayTrend.map((row) => (
              <div key={row.label} className="grid grid-cols-[56px_1fr_auto] items-center gap-3">
                <p className="text-xs font-semibold" style={{ color: "var(--text-light)" }}>{row.label}</p>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-emerald-500"
                    style={{ width: `${row.widthPct}%` }}
                  />
                </div>
                <p className="text-xs" style={{ color: "var(--text-light)" }}>
                  {row.runs} Runs · {row.favoriteRate}% Fav
                </p>
              </div>
            ))}
          </div>
        </div>

        {recurringTasks.length > 0 && (
          <div className="mt-6 rounded-xl border p-5" style={{ background: "var(--background-elevated)", borderColor: "rgba(255,255,255,0.1)" }}>
            <h2 className="mb-4 text-xl font-bold">Wiederkehrende Tasks (1-Klick)</h2>
            <div className="space-y-3">
              {recurringTasks.map((item) => (
                <div key={`rec-${item.id}`} className="rounded-lg border p-3" style={{ borderColor: "rgba(255,255,255,0.12)" }}>
                  <p className="text-sm font-semibold">{item.recurringTaskKey}</p>
                  <p className="text-sm" style={{ color: "var(--text-light)" }}>{item.goal}</p>
                  <div className="mt-2">
                    <button
                      type="button"
                      className="rounded-lg bg-cyan-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-cyan-500"
                      onClick={() => {
                        setBot(item.bot);
                        setRole(item.role);
                        setPlaybook(item.playbook || "");
                        setGoal(item.goal);
                        setContext(item.context || "");
                        setTagsInput(toTagList(item.tags).join(", "));
                        setRecurringTaskKey(item.recurringTaskKey || "");
                        void generate({
                          bot: item.bot,
                          role: item.role,
                          playbook: item.playbook || "",
                          goal: item.goal,
                          context: item.context || "",
                          tagsInput: toTagList(item.tags).join(", "),
                          recurringTaskKey: item.recurringTaskKey || "",
                        });
                      }}
                    >
                      1-Klick ausfuehren
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {historyLoading ? (
          <div className="mt-6 rounded-xl border p-5" style={{ background: "var(--background-elevated)", borderColor: "rgba(255,255,255,0.1)" }}>
            Verlauf wird geladen...
          </div>
        ) : history.length > 0 ? (
          <div className="mt-6 rounded-xl border p-5" style={{ background: "var(--background-elevated)", borderColor: "rgba(255,255,255,0.1)" }}>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-xl font-bold">Verlauf</h2>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  className="rounded-md border px-2 py-1 text-xs"
                  style={{
                    borderColor: favoriteOnly ? "rgba(16,185,129,0.7)" : "rgba(255,255,255,0.2)",
                    background: favoriteOnly ? "rgba(16,185,129,0.15)" : "transparent",
                  }}
                  onClick={() => setFavoriteOnly((prev) => !prev)}
                >
                  Nur Favoriten
                </button>
                <button
                  type="button"
                  className="rounded-md border px-2 py-1 text-xs"
                  style={{
                    borderColor: recurringOnly ? "rgba(16,185,129,0.7)" : "rgba(255,255,255,0.2)",
                    background: recurringOnly ? "rgba(16,185,129,0.15)" : "transparent",
                  }}
                  onClick={() => setRecurringOnly((prev) => !prev)}
                >
                  Nur Recurring
                </button>
                <button
                  type="button"
                  className="rounded-md border px-2 py-1 text-xs"
                  style={{ borderColor: "rgba(255,255,255,0.2)" }}
                  onClick={() => {
                    void loadHistory();
                  }}
                >
                  Neu laden
                </button>
              </div>
            </div>
            <div className="space-y-3">
              {history.map((item) => (
                <div
                  key={item.id}
                  className="w-full rounded-lg border p-3"
                  style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.12)" }}
                >
                  <p className="text-sm font-semibold">
                    {item.bot.toUpperCase()} · {item.role.toUpperCase()} · {item.playbook || "Freier Modus"}
                  </p>
                  <p className="text-sm" style={{ color: "var(--text-light)" }}>{item.goal}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    {toTagList(item.tags).map((tag) => (
                      <span key={`${item.id}-${tag}`} className="rounded-full bg-white/10 px-2 py-0.5 text-xs">#{tag}</span>
                    ))}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      className="rounded-md border px-2 py-1 text-xs"
                      style={{ borderColor: "rgba(255,255,255,0.2)" }}
                      onClick={() => {
                        setBot(item.bot);
                        setRole(item.role);
                        setPlaybook(item.playbook || "");
                        setGoal(item.goal);
                        setContext(item.context || "");
                        setAnswer(item.answer);
                        setTagsInput(toTagList(item.tags).join(", "));
                        setRecurringTaskKey(item.recurringTaskKey || "");
                      }}
                    >
                      Laden
                    </button>
                    <button
                      type="button"
                      className="rounded-md border px-2 py-1 text-xs"
                      style={{ borderColor: "rgba(255,255,255,0.2)" }}
                      onClick={() => {
                        void updateHistoryItem(item.id, { favorite: !item.favorite });
                      }}
                    >
                      {item.favorite ? "★ Favorit" : "☆ Favorisieren"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="mt-6 rounded-xl border p-5" style={{ background: "var(--background-elevated)", borderColor: "rgba(255,255,255,0.1)" }}>
            Kein Verlauf fuer den aktuellen Filter gefunden.
          </div>
        )}
      </div>
    </div>
  );
}

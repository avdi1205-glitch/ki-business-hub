"use client";

import { useMemo, useState } from "react";

type BotType = "sales" | "seo" | "content-ops" | "support";
type TeamRole = "owner" | "growth" | "content" | "support";

type BotResponse = {
  success: boolean;
  answer?: string;
  error?: string;
};

type HistoryItem = {
  id: string;
  createdAt: string;
  bot: BotType;
  role: TeamRole;
  playbook: string;
  goal: string;
  context: string;
  answer: string;
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
  const [loading, setLoading] = useState(false);
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState("");
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    if (typeof window === "undefined") {
      return [];
    }

    const raw = window.localStorage.getItem("internal-bots-history");
    if (!raw) {
      return [];
    }

    try {
      const parsed = JSON.parse(raw) as HistoryItem[];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  const allowedBots = useMemo(() => {
    if (role === "owner") return ["sales", "seo", "content-ops", "support"] as BotType[];
    if (role === "growth") return ["sales", "seo", "content-ops"] as BotType[];
    if (role === "content") return ["seo", "content-ops"] as BotType[];
    return ["support"] as BotType[];
  }, [role]);

  const effectiveBot = allowedBots.includes(bot) ? bot : allowedBots[0];

  const applyPlaybook = (preset: { name: string; goal: string; context: string }) => {
    setPlaybook(preset.name);
    setGoal(preset.goal);
    setContext(preset.context);
  };

  const persistHistory = (item: HistoryItem) => {
    const next = [item, ...history].slice(0, 20);
    setHistory(next);
    localStorage.setItem("internal-bots-history", JSON.stringify(next));
  };

  const generate = async () => {
    setLoading(true);
    setError("");
    setAnswer("");

    try {
      const res = await fetch("/api/internal-bots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bot: effectiveBot, role, playbook, goal, context }),
      });

      const json = (await res.json()) as BotResponse;

      if (!res.ok || !json.success) {
        setError(json.error || "Antwort konnte nicht generiert werden.");
      } else {
        const responseText = json.answer || "";
        setAnswer(responseText);

        persistHistory({
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          createdAt: new Date().toISOString(),
          bot: effectiveBot,
          role,
          playbook,
          goal,
          context,
          answer: responseText,
        });
      }
    } catch {
      setError("Antwort konnte nicht generiert werden.");
    } finally {
      setLoading(false);
    }
  };

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

          <div className="mt-4 flex flex-wrap gap-3">
            <button
              onClick={generate}
              disabled={loading}
              className="rounded-lg bg-emerald-600 px-5 py-2 font-semibold text-white hover:bg-emerald-500"
            >
              {loading ? "Analysiere..." : "Bot-Antwort generieren"}
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-red-200">{error}</div>
        )}

        {answer && (
          <div className="rounded-xl border p-5" style={{ background: "var(--background-elevated)", borderColor: "rgba(255,255,255,0.1)" }}>
            <h2 className="mb-3 text-xl font-bold">Antwort</h2>
            <pre className="whitespace-pre-wrap text-sm" style={{ color: "var(--text-light)", fontFamily: "inherit" }}>{answer}</pre>
          </div>
        )}

        {history.length > 0 && (
          <div className="mt-6 rounded-xl border p-5" style={{ background: "var(--background-elevated)", borderColor: "rgba(255,255,255,0.1)" }}>
            <h2 className="mb-4 text-xl font-bold">Verlauf</h2>
            <div className="space-y-3">
              {history.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setBot(item.bot);
                    setRole(item.role);
                    setPlaybook(item.playbook);
                    setGoal(item.goal);
                    setContext(item.context);
                    setAnswer(item.answer);
                  }}
                  className="w-full rounded-lg border p-3 text-left"
                  style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.12)" }}
                >
                  <p className="text-sm font-semibold">
                    {item.bot.toUpperCase()} · {item.role.toUpperCase()} · {item.playbook || "Freier Modus"}
                  </p>
                  <p className="text-sm" style={{ color: "var(--text-light)" }}>{item.goal}</p>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

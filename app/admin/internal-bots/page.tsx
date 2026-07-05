"use client";

import { useState } from "react";

type BotType = "sales" | "seo" | "content-ops" | "support";

type BotResponse = {
  success: boolean;
  answer?: string;
  error?: string;
};

const botLabels: Record<BotType, { title: string; subtitle: string }> = {
  sales: { title: "Sales Bot", subtitle: "Upsell, Pricing, Offer-Positionierung" },
  seo: { title: "SEO Bot", subtitle: "Rankings, Cluster, interne Verlinkung" },
  "content-ops": { title: "Content Ops Bot", subtitle: "Pipeline, Sprint-Plan, Automationen" },
  support: { title: "Support Bot", subtitle: "Nutzerantworten und Team-Playbooks" },
};

export default function InternalBotsPage() {
  const [bot, setBot] = useState<BotType>("sales");
  const [goal, setGoal] = useState("");
  const [context, setContext] = useState("");
  const [loading, setLoading] = useState(false);
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState("");

  const generate = async () => {
    setLoading(true);
    setError("");
    setAnswer("");

    try {
      const res = await fetch("/api/internal-bots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bot, goal, context }),
      });

      const json = (await res.json()) as BotResponse;

      if (!res.ok || !json.success) {
        setError(json.error || "Antwort konnte nicht generiert werden.");
      } else {
        setAnswer(json.answer || "");
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
          {(Object.keys(botLabels) as BotType[]).map((key) => (
            <button
              key={key}
              onClick={() => setBot(key)}
              className="rounded-xl border p-4 text-left transition"
              style={{
                background: bot === key ? "rgba(16,185,129,0.18)" : "var(--background-elevated)",
                borderColor: bot === key ? "rgba(16,185,129,0.6)" : "rgba(255,255,255,0.1)",
              }}
            >
              <p className="font-semibold">{botLabels[key].title}</p>
              <p className="text-sm" style={{ color: "var(--text-light)" }}>{botLabels[key].subtitle}</p>
            </button>
          ))}
        </div>

        <div className="mb-6 rounded-xl border p-5" style={{ background: "var(--background-elevated)", borderColor: "rgba(255,255,255,0.1)" }}>
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
      </div>
    </div>
  );
}

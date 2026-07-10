"use client";

import Link from "next/link";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";

type Plan = "starter" | "pro" | "agency";

type Recommendation = {
  id: string;
  priority: "high" | "medium" | "low";
  title: string;
  why: string;
  action: string;
  estimatedMonthlyLift: number;
};

type PlaybookResponse = {
  success: boolean;
  locked?: boolean;
  message?: string;
  error?: string;
  plan?: Plan;
  summary?: string;
  projectedMonthlyLift?: number;
  recommendations?: Recommendation[];
  baseline?: {
    totalRevenue30Days: number;
    totalClicks30Days: number;
    epc: number;
    subscribers: number;
    activeTests: number;
    completedTests: number;
  };
};

function normalizePlan(value: string | null): Plan {
  if (value === "starter" || value === "pro" || value === "agency") {
    return value;
  }

  return "pro";
}

export default function RevenueNavigatorPage() {
  const searchParams = useSearchParams();
  const plan = normalizePlan(searchParams.get("plan"));
  const [loading, setLoading] = useState(false);
  const [weeklySending, setWeeklySending] = useState(false);
  const [data, setData] = useState<PlaybookResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const router = useRouter();

  const sorted = data?.recommendations
    ? [...data.recommendations].sort((a, b) => b.estimatedMonthlyLift - a.estimatedMonthlyLift)
    : [];

  const loadPlaybook = async (nextPlan = plan) => {
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch(`/api/revenue-playbook?plan=${nextPlan}`, { cache: "no-store" });
      const json = (await res.json()) as PlaybookResponse;
      setData(json);
      if (!res.ok && !json.locked) {
        setError(json.error || "Playbook konnte nicht geladen werden.");
      }
    } catch {
      setError("Playbook konnte nicht geladen werden.");
    } finally {
      setLoading(false);
    }
  };

  const sendWeeklySummary = async () => {
    setWeeklySending(true);
    setError(null);
    setMessage(null);
    try {
      const response = await fetch("/api/admin/revenue-navigator/weekly-summary", { method: "POST" });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || "Wochenupdate konnte nicht versendet werden.");
      }
      setMessage(`Wochenupdate versendet: ${payload.sent || 0} Kunden erreicht.`);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Wochenupdate konnte nicht versendet werden.");
    } finally {
      setWeeklySending(false);
    }
  };

  const priorityColor = (priority: Recommendation["priority"]) => {
    if (priority === "high") return "#ef4444";
    if (priority === "medium") return "#f59e0b";
    return "#22c55e";
  };

  return (
    <div className="min-h-screen px-6 py-10" style={{ background: "var(--background)", color: "var(--text-dark)" }}>
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="mb-2 text-4xl font-bold">💸 Umsatz-Navigator</h1>
          <p style={{ color: "var(--text-light)" }}>
            Weekly Revenue Playbook mit konkreten Maßnahmen und Euro-Prognose.
          </p>
        </div>

        <div className="mb-8 rounded-xl border p-5" style={{ background: "var(--background-elevated)", borderColor: "rgba(255,255,255,0.1)" }}>
          <div className="mb-4 flex flex-wrap items-center gap-3">
            {(["starter", "pro", "agency"] as Plan[]).map((option) => (
              <button
                key={option}
                onClick={() => {
                  const params = new URLSearchParams(searchParams.toString());
                  params.set("plan", option);
                  router.replace(`/admin/revenue-navigator?${params.toString()}`);
                  loadPlaybook(option);
                }}
                className="rounded-lg px-4 py-2 font-semibold transition"
                style={{
                  background: plan === option ? "var(--primary)" : "rgba(255,255,255,0.06)",
                  color: plan === option ? "#fff" : "var(--text-light)",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                {option.toUpperCase()}
              </button>
            ))}
            <button
              onClick={() => loadPlaybook(plan)}
              className="rounded-lg bg-emerald-600 px-4 py-2 font-semibold text-white hover:bg-emerald-700"
              disabled={loading}
            >
              {loading ? "Generiere..." : "Playbook generieren"}
            </button>
            <button
              onClick={() => void sendWeeklySummary()}
              className="rounded-lg bg-cyan-600 px-4 py-2 font-semibold text-white hover:bg-cyan-500"
              disabled={weeklySending}
            >
              {weeklySending ? "Versende..." : "Wochenupdate senden"}
            </button>
          </div>

          {error && <p className="text-red-300">{error}</p>}
          {message && <p className="text-emerald-300">{message}</p>}

          {data?.locked && (
            <div className="rounded-lg border border-yellow-500/40 bg-yellow-500/10 p-4 text-yellow-100">
              <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-yellow-300">Starter-Limit erreicht</p>
              <p className="mb-3 font-semibold">{data.message}</p>
              <p className="mb-3 text-sm text-yellow-100/90">
                Mit Pro oder Agency bekommst du jede Woche priorisierte Maßnahmen mit Euro-Potenzial,
                damit du schneller siehst, welcher Hebel als Nächstes Umsatz bringt.
              </p>
              <div className="mb-4 grid gap-2 text-sm text-yellow-100/95 md:grid-cols-3">
                <div className="rounded-md border border-yellow-500/30 bg-yellow-500/10 px-3 py-2">Top-4 Hebel mit Priorität</div>
                <div className="rounded-md border border-yellow-500/30 bg-yellow-500/10 px-3 py-2">Monatliche Lift-Prognose in EUR</div>
                <div className="rounded-md border border-yellow-500/30 bg-yellow-500/10 px-3 py-2">Klare nächste Schritte fürs Team</div>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link href="/api/checkout?plan=pro&source=revenue-navigator-lock-pro" className="rounded-lg bg-cyan-600 px-4 py-2 font-semibold text-white hover:bg-cyan-500">
                  Pro fuer 39 EUR aktivieren
                </Link>
                <Link href="/api/checkout?plan=agency&source=revenue-navigator-lock-agency" className="rounded-lg bg-amber-600 px-4 py-2 font-semibold text-white hover:bg-amber-500">
                  Agency fuer Teams starten
                </Link>
              </div>
            </div>
          )}
        </div>

        {data?.success && !data.locked && (
          <>
            <div className="mb-8 grid gap-4 md:grid-cols-4">
              <div className="rounded-xl border p-5" style={{ background: "var(--background-elevated)", borderColor: "rgba(255,255,255,0.1)" }}>
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>Potenzial/Monat</p>
                <p className="text-3xl font-bold text-emerald-300">+€{(data.projectedMonthlyLift || 0).toFixed(2)}</p>
              </div>
              <div className="rounded-xl border p-5" style={{ background: "var(--background-elevated)", borderColor: "rgba(255,255,255,0.1)" }}>
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>Revenue 30 Tage</p>
                <p className="text-3xl font-bold">€{(data.baseline?.totalRevenue30Days || 0).toFixed(2)}</p>
              </div>
              <div className="rounded-xl border p-5" style={{ background: "var(--background-elevated)", borderColor: "rgba(255,255,255,0.1)" }}>
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>EPC</p>
                <p className="text-3xl font-bold">€{(data.baseline?.epc || 0).toFixed(2)}</p>
              </div>
              <div className="rounded-xl border p-5" style={{ background: "var(--background-elevated)", borderColor: "rgba(255,255,255,0.1)" }}>
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>Aktive Tests</p>
                <p className="text-3xl font-bold">{data.baseline?.activeTests || 0}</p>
              </div>
            </div>

            <div className="mb-6 rounded-xl border p-5" style={{ background: "rgba(16, 185, 129, 0.12)", borderColor: "rgba(16,185,129,0.45)" }}>
              <p className="font-semibold text-emerald-100">{data.summary}</p>
            </div>

            <div className="space-y-4">
              {sorted.map((rec, idx) => (
                <div key={rec.id} className="rounded-xl border p-6" style={{ background: "var(--background-elevated)", borderColor: "rgba(255,255,255,0.1)" }}>
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                    <h2 className="text-2xl font-bold">{idx + 1}. {rec.title}</h2>
                    <div className="flex items-center gap-3">
                      <span
                        className="rounded-full px-3 py-1 text-xs font-bold uppercase"
                        style={{ background: `${priorityColor(rec.priority)}20`, color: priorityColor(rec.priority), border: `1px solid ${priorityColor(rec.priority)}60` }}
                      >
                        {rec.priority}
                      </span>
                      <span className="rounded-full bg-emerald-600/20 px-3 py-1 text-sm font-semibold text-emerald-200">
                        +€{rec.estimatedMonthlyLift.toFixed(2)}/Monat
                      </span>
                    </div>
                  </div>

                  <p className="mb-2" style={{ color: "var(--text-light)" }}><strong>Warum:</strong> {rec.why}</p>
                  <p style={{ color: "var(--text-light)" }}><strong>Naechster Schritt:</strong> {rec.action}</p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

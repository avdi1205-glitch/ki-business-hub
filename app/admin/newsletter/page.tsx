"use client";

import React, { useEffect, useMemo, useState } from "react";
import { ActionButton, StatCard } from "@/app/components/ProUIComponents";

type NewsletterStatus = "pending" | "subscribed" | "lead_new";

type Subscriber = {
  id: number;
  email: string;
  name: string | null;
  source: string | null;
  status: NewsletterStatus;
  createdAt: string;
  confirmedAt: string | null;
};

type SubscribersResponse = {
  subscribers: Subscriber[];
  counts: Record<string, number> & { total: number };
};

const statusLabel: Record<NewsletterStatus, string> = {
  pending: "Pending",
  subscribed: "Subscribed",
  lead_new: "Lead neu",
};

const statusAccent: Record<NewsletterStatus, string> = {
  pending: "#f59e0b",
  subscribed: "#10b981",
  lead_new: "#06b6d4",
};

export default function NewsletterAutomationPage() {
  const [loading, setLoading] = useState(false);
  const [savingEmail, setSavingEmail] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | NewsletterStatus>("all");
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [counts, setCounts] = useState<SubscribersResponse["counts"]>({ total: 0 });

  useEffect(() => {
    void loadSubscribers();
  }, []);

  const filteredSubscribers = useMemo(() => {
    if (filter === "all") return subscribers;
    return subscribers.filter((subscriber) => subscriber.status === filter);
  }, [subscribers, filter]);

  async function loadSubscribers() {
    setLoading(true);
    try {
      const response = await fetch("/api/newsletter-subscribers");
      const text = await response.text();
      const data = text ? (JSON.parse(text) as SubscribersResponse) : null;

      if (response.status === 401) {
        throw new Error("Bitte als Admin anmelden, damit die Newsletter-Daten geladen werden können.");
      }

      if (!response.ok) throw new Error((data as { error?: string } | null)?.error || "Could not load subscribers");

      setSubscribers(data?.subscribers || []);
      setCounts(data?.counts || { total: 0 });
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not load subscribers");
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(email: string, nextStatus: NewsletterStatus) {
    setSavingEmail(email);
    setStatus(null);
    try {
      const subscriber = subscribers.find((entry) => entry.email === email);
      const response = await fetch("/api/newsletter-subscribers", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          status: nextStatus,
          name: subscriber?.name,
          source: subscriber?.source,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || "Update failed");
      }

      setSubscribers((current) => current.map((entry) => (entry.email === email ? data.subscriber : entry)));
      await loadSubscribers();
      setStatus(`Updated ${email} to ${statusLabel[nextStatus]}.`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Update failed");
    } finally {
      setSavingEmail(null);
    }
  }

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8" style={{ background: "var(--background)" }}>
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 sm:mb-8">
          <p className="mb-2 text-sm font-bold uppercase tracking-[0.24em] text-cyan-300">Admin</p>
          <h1 className="text-2xl font-bold sm:text-3xl" style={{ color: "var(--text-dark)" }}>Newsletter Status Panel</h1>
          <p className="mt-2 max-w-2xl text-sm sm:text-base" style={{ color: "var(--text-light)" }}>
            Subscribers, double opt-in status and lead labels in one place.
          </p>
        </div>

        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 sm:mb-8">
          <StatCard title="Total" value={counts.total || 0} change="All records" icon="👥" trend="up" />
          <StatCard title="Pending" value={counts.pending || 0} change="Waiting for confirmation" icon="⏳" trend="up" />
          <StatCard title="Subscribed" value={counts.subscribed || 0} change="Confirmed" icon="✅" trend="up" />
          <StatCard title="Lead neu" value={counts.lead_new || 0} change="Inbound leads" icon="🛟" trend="up" />
        </div>

        <div className="mb-5 flex flex-wrap gap-2 sm:mb-6 sm:gap-3">
          {(["all", "pending", "subscribed", "lead_new"] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setFilter(option)}
              className="rounded-full border px-3 py-2 text-sm font-semibold transition sm:px-4"
              style={{
                borderColor: filter === option ? "rgba(34, 211, 238, 0.5)" : "rgba(255,255,255,0.12)",
                background: filter === option ? "rgba(34, 211, 238, 0.14)" : "rgba(255,255,255,0.05)",
                color: "var(--text-dark)",
              }}
            >
              {option === "all" ? "Alle" : statusLabel[option]}
            </button>
          ))}
          <button
            type="button"
            onClick={() => void loadSubscribers()}
            className="rounded-full border px-3 py-2 text-sm font-semibold transition sm:px-4"
            style={{ borderColor: "rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.05)", color: "var(--text-dark)" }}
          >
            Aktualisieren
          </button>
        </div>

        {status && (
          <div className="mb-6 rounded-2xl border border-cyan-400/20 bg-cyan-500/10 px-4 py-3 text-sm" style={{ color: "var(--text-dark)" }}>
            {status}
          </div>
        )}

        <div className="overflow-hidden rounded-[1.5rem] border border-white/10 bg-white/5 sm:rounded-[2rem]" style={{ background: "var(--background-elevated)" }}>
          <div className="border-b border-white/10 px-4 py-4 sm:px-6 sm:py-5">
            <h2 className="text-lg font-semibold sm:text-xl" style={{ color: "var(--text-dark)" }}>Subscriber table</h2>
            <p className="text-sm" style={{ color: "var(--text-light)" }}>
              {loading ? "Lade Daten..." : `${filteredSubscribers.length} Einträge sichtbar`}
            </p>
          </div>

          <div className="md:hidden">
            <div className="space-y-3 p-4">
              {filteredSubscribers.map((subscriber) => (
                <article key={subscriber.email} className="rounded-2xl border border-white/10 bg-slate-950/25 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="break-all text-sm font-semibold" style={{ color: "var(--text-dark)" }}>{subscriber.email}</p>
                      <p className="mt-1 text-sm" style={{ color: "var(--text-light)" }}>{subscriber.name || "-"}</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.16em] text-slate-500">{subscriber.source || "-"}</p>
                    </div>
                    <span
                      className="inline-flex shrink-0 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em]"
                      style={{
                        background: `${statusAccent[subscriber.status]}22`,
                        color: statusAccent[subscriber.status],
                      }}
                    >
                      {statusLabel[subscriber.status]}
                    </span>
                  </div>

                  <div className="mt-4 flex flex-col gap-2 text-sm text-slate-300">
                    <div>
                      <span className="text-slate-500">Datum: </span>
                      {new Date(subscriber.createdAt).toLocaleDateString("de-DE")}
                    </div>
                    <div className="text-xs text-slate-500">
                      {subscriber.confirmedAt
                        ? `Bestätigt: ${new Date(subscriber.confirmedAt).toLocaleDateString("de-DE")}`
                        : subscriber.status === "subscribed"
                          ? "Bestätigt"
                          : "Noch nicht bestätigt"}
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {(["pending", "subscribed", "lead_new"] as NewsletterStatus[]).map((nextStatus) => (
                      <button
                        key={nextStatus}
                        type="button"
                        disabled={savingEmail === subscriber.email || subscriber.status === nextStatus}
                        onClick={() => void updateStatus(subscriber.email, nextStatus)}
                        className="rounded-full border px-3 py-1.5 text-xs font-semibold transition disabled:opacity-50"
                        style={{
                          borderColor: `${statusAccent[nextStatus]}55`,
                          background: `${statusAccent[nextStatus]}14`,
                          color: statusAccent[nextStatus],
                        }}
                      >
                        {savingEmail === subscriber.email && subscriber.status !== nextStatus ? "..." : statusLabel[nextStatus]}
                      </button>
                    ))}
                  </div>
                </article>
              ))}

              {!filteredSubscribers.length && (
                <div className="rounded-2xl border border-white/10 px-4 py-8 text-center text-sm text-slate-400">
                  Keine Einträge für diesen Filter.
                </div>
              )}
            </div>
          </div>

          <div className="hidden overflow-x-auto md:block">
            <table className="min-w-full divide-y divide-white/10 text-left">
              <thead>
                <tr className="text-xs uppercase tracking-[0.18em] text-slate-400">
                  <th className="px-6 py-4 font-semibold">E-Mail</th>
                  <th className="px-6 py-4 font-semibold">Name</th>
                  <th className="px-6 py-4 font-semibold">Quelle</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold">Datum</th>
                  <th className="px-6 py-4 font-semibold">Aktion</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {filteredSubscribers.map((subscriber) => (
                  <tr key={subscriber.email} className="align-top">
                    <td className="px-6 py-4 font-medium" style={{ color: "var(--text-dark)" }}>{subscriber.email}</td>
                    <td className="px-6 py-4" style={{ color: "var(--text-light)" }}>{subscriber.name || "-"}</td>
                    <td className="px-6 py-4" style={{ color: "var(--text-light)" }}>{subscriber.source || "-"}</td>
                    <td className="px-6 py-4">
                      <span
                        className="inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]"
                        style={{
                          background: `${statusAccent[subscriber.status]}22`,
                          color: statusAccent[subscriber.status],
                        }}
                      >
                        {statusLabel[subscriber.status]}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm" style={{ color: "var(--text-light)" }}>
                      <div>{new Date(subscriber.createdAt).toLocaleDateString("de-DE")}</div>
                      <div className="text-xs text-slate-500">
                        {subscriber.confirmedAt
                          ? `Bestätigt: ${new Date(subscriber.confirmedAt).toLocaleDateString("de-DE")}`
                          : subscriber.status === "subscribed"
                            ? "Bestätigt"
                            : "Noch nicht bestätigt"}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-2">
                        {(["pending", "subscribed", "lead_new"] as NewsletterStatus[]).map((nextStatus) => (
                          <button
                            key={nextStatus}
                            type="button"
                            disabled={savingEmail === subscriber.email || subscriber.status === nextStatus}
                            onClick={() => void updateStatus(subscriber.email, nextStatus)}
                            className="rounded-full border px-3 py-1.5 text-xs font-semibold transition disabled:opacity-50"
                            style={{
                              borderColor: `${statusAccent[nextStatus]}55`,
                              background: `${statusAccent[nextStatus]}14`,
                              color: statusAccent[nextStatus],
                            }}
                          >
                            {savingEmail === subscriber.email && subscriber.status !== nextStatus ? "..." : statusLabel[nextStatus]}
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}

                {!filteredSubscribers.length && (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-sm text-slate-400">
                      Keine Einträge für diesen Filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-6 rounded-[1.5rem] border border-white/10 bg-white/5 p-5 sm:mt-8 sm:rounded-[2rem] sm:p-6" style={{ background: "var(--background-elevated)" }}>
          <h2 className="text-lg font-semibold sm:text-xl" style={{ color: "var(--text-dark)" }}>Warum das wichtig ist</h2>
          <p className="mt-3 text-sm leading-7" style={{ color: "var(--text-light)" }}>
            Double Opt-In schützt die Zustellbarkeit, reduziert Spam-Einträge und macht deine Newsletter-Liste später wertvoller für echte Kampagnen.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <ActionButton label="Neu laden" onClick={() => void loadSubscribers()} disabled={loading} />
          </div>
        </div>
      </div>
    </div>
  );
}
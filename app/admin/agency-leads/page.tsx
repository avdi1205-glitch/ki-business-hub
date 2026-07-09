"use client";

import { useEffect, useMemo, useState } from "react";

type Lead = {
  id: number;
  email: string;
  name: string | null;
  status: string;
  createdAt: string;
  teamSize: string | null;
  stage: string;
  followUpCount: number;
  lastFollowUpAt: string | null;
  source: string;
  score: string | null;
  priority: number;
  consentGiven: boolean;
  consentAt: string | null;
  slaBreached: boolean;
  slaDueAt: string;
  ageHours: number;
};

type ApiResponse = {
  leads: Lead[];
  counts: Record<string, number>;
};

const STAGES = ["new", "qualified", "contacted", "proposal", "won", "lost"] as const;

function badgeColor(priority: number) {
  if (priority >= 4) return "rgba(239, 68, 68, 0.2)";
  if (priority >= 3) return "rgba(245, 158, 11, 0.2)";
  if (priority >= 2) return "rgba(16, 185, 129, 0.2)";
  return "rgba(148, 163, 184, 0.2)";
}

export default function AgencyLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({ total: 0 });
  const [loading, setLoading] = useState(true);
  const [savingEmail, setSavingEmail] = useState<string | null>(null);
  const [message, setMessage] = useState<string>("");

  async function loadLeads() {
    setLoading(true);
    try {
      const response = await fetch("/api/agency-leads", { cache: "no-store" });
      const payload = (await response.json()) as ApiResponse;
      if (!response.ok) {
        throw new Error("Agency leads could not be loaded.");
      }
      setLeads(payload.leads || []);
      setCounts(payload.counts || { total: 0 });
    } catch {
      setMessage("Agency-Leads konnten nicht geladen werden.");
    } finally {
      setLoading(false);
    }
  }

  async function setStage(email: string, stage: string) {
    setSavingEmail(email);
    try {
      const response = await fetch("/api/agency-leads", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, stage }),
      });

      if (!response.ok) {
        throw new Error("Stage update failed");
      }

      await loadLeads();
    } catch {
      setMessage("Stage konnte nicht aktualisiert werden.");
    } finally {
      setSavingEmail(null);
    }
  }

  async function runFollowUp() {
    setMessage("Follow-up wird gestartet...");
    try {
      const response = await fetch("/api/agency-leads/follow-up", { method: "POST" });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || "Follow-up failed");
      }

      setMessage(`Follow-up abgeschlossen: ${payload.sent || 0} E-Mails versendet.`);
      await loadLeads();
    } catch {
      setMessage("Follow-up konnte nicht ausgefuehrt werden.");
    }
  }

  async function sendWeeklyReport() {
    setMessage("Weekly Report wird versendet...");
    try {
      const response = await fetch("/api/agency-leads/weekly-report", { method: "POST" });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || "Report failed");
      }

      setMessage(`Weekly Report versendet. Leads im Zeitraum: ${payload.total || 0}.`);
    } catch {
      setMessage("Weekly Report konnte nicht gesendet werden.");
    }
  }

  useEffect(() => {
    void loadLeads();
  }, []);

  const hotLeads = useMemo(() => leads.filter((lead) => lead.priority >= 3).length, [leads]);
  const slaCritical = useMemo(() => leads.filter((lead) => lead.slaBreached).length, [leads]);

  return (
    <main className="min-h-screen p-4 sm:p-6 lg:p-8" style={{ background: "var(--background)" }}>
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 sm:mb-8">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.24em] text-amber-300">Agency CRM</p>
          <h1 className="text-2xl font-bold sm:text-3xl" style={{ color: "var(--text-dark)" }}>Agency Lead Pipeline</h1>
          <p className="mt-2 text-sm sm:text-base" style={{ color: "var(--text-light)" }}>
            Hot/High Leads priorisieren, Stages verwalten und Follow-up Automationen ausloesen.
          </p>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-5">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Total</p>
            <p className="mt-2 text-3xl font-bold text-white">{counts.total || 0}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Hot/High</p>
            <p className="mt-2 text-3xl font-bold text-amber-200">{hotLeads}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Contacted</p>
            <p className="mt-2 text-3xl font-bold text-cyan-200">{counts.contacted || 0}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Won</p>
            <p className="mt-2 text-3xl font-bold text-emerald-200">{counts.won || 0}</p>
          </div>
          <div className="rounded-2xl border border-rose-400/30 bg-rose-500/10 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-300">SLA kritisch</p>
            <p className="mt-2 text-3xl font-bold text-rose-200">{slaCritical}</p>
          </div>
        </div>

        <div className="mb-5 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => void runFollowUp()}
            className="rounded-full border border-amber-300/30 bg-amber-500/12 px-4 py-2 text-sm font-bold text-amber-100 transition hover:bg-amber-500/20"
          >
            Hot/High Follow-up starten
          </button>
          <button
            type="button"
            onClick={() => void sendWeeklyReport()}
            className="rounded-full border border-cyan-300/30 bg-cyan-500/12 px-4 py-2 text-sm font-bold text-cyan-100 transition hover:bg-cyan-500/20"
          >
            Weekly Report senden
          </button>
          <button
            type="button"
            onClick={() => void loadLeads()}
            className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:bg-white/10"
          >
            Aktualisieren
          </button>
        </div>

        {message && (
          <div className="mb-5 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
            {message}
          </div>
        )}

        <div className="overflow-hidden rounded-[1.5rem] border border-white/10 bg-white/5 sm:rounded-[2rem]">
          <div className="hidden overflow-x-auto md:block">
            <table className="min-w-full divide-y divide-white/10 text-left">
              <thead>
                <tr className="text-xs uppercase tracking-[0.16em] text-slate-400">
                  <th className="px-4 py-3 font-semibold">E-Mail</th>
                  <th className="px-4 py-3 font-semibold">Team</th>
                  <th className="px-4 py-3 font-semibold">Prio</th>
                  <th className="px-4 py-3 font-semibold">Consent</th>
                  <th className="px-4 py-3 font-semibold">SLA</th>
                  <th className="px-4 py-3 font-semibold">Stage</th>
                  <th className="px-4 py-3 font-semibold">Follow-up</th>
                  <th className="px-4 py-3 font-semibold">Datum</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {leads.map((lead) => (
                  <tr
                    key={lead.id}
                    className={lead.slaBreached ? "bg-rose-500/10" : undefined}
                  >
                    <td className="px-4 py-3 text-sm text-slate-100">{lead.email}</td>
                    <td className="px-4 py-3 text-sm text-slate-300">{lead.teamSize || "-"}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full px-2 py-1 text-xs font-semibold" style={{ background: badgeColor(lead.priority), color: "#f8fafc" }}>
                        {lead.priority >= 4 ? "Hot" : lead.priority >= 3 ? "High" : lead.priority >= 2 ? "Medium" : "Normal"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-200">
                      <span className={`rounded-full px-2 py-1 font-semibold ${lead.consentGiven ? "bg-emerald-500/20 text-emerald-200" : "bg-rose-500/20 text-rose-200"}`}>
                        {lead.consentGiven ? "OK" : "Missing"}
                      </span>
                      <div className="mt-1 text-[11px] text-slate-400">{lead.consentAt || "-"}</div>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-200">
                      <span className={`rounded-full px-2 py-1 font-semibold ${lead.slaBreached ? "bg-rose-500/20 text-rose-200" : "bg-emerald-500/20 text-emerald-200"}`}>
                        {lead.slaBreached ? "Kritisch" : "OK"}
                      </span>
                      <div className="mt-1 text-[11px] text-slate-400">Due: {new Date(lead.slaDueAt).toLocaleDateString("de-DE")}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {STAGES.map((stage) => (
                          <button
                            key={stage}
                            type="button"
                            onClick={() => void setStage(lead.email, stage)}
                            disabled={savingEmail === lead.email}
                            className="rounded-full border px-2 py-1 text-[11px] uppercase tracking-[0.12em] transition disabled:opacity-50"
                            style={{
                              borderColor: lead.stage === stage ? "rgba(34,211,238,0.55)" : "rgba(255,255,255,0.2)",
                              background: lead.stage === stage ? "rgba(34,211,238,0.16)" : "rgba(255,255,255,0.04)",
                              color: lead.stage === stage ? "#67e8f9" : "#cbd5e1",
                            }}
                          >
                            {stage}
                          </button>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-300">
                      {lead.followUpCount}x
                      <br />
                      {lead.lastFollowUpAt || "-"}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-300">{new Date(lead.createdAt).toLocaleDateString("de-DE")}</td>
                  </tr>
                ))}
                {!loading && !leads.length && (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-sm text-slate-400">
                      Noch keine Agency-Leads vorhanden.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="space-y-3 p-4 md:hidden">
            {leads.map((lead) => (
              <article key={lead.id} className="rounded-2xl border border-white/10 bg-slate-950/30 p-4">
                <p className="text-sm font-semibold text-slate-100 break-all">{lead.email}</p>
                <p className="mt-1 text-xs text-slate-400">Team: {lead.teamSize || "-"}</p>
                <p className="mt-1 text-xs text-slate-400">Stage: {lead.stage}</p>
                <p className="mt-1 text-xs text-slate-400">Follow-up: {lead.followUpCount}x</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}

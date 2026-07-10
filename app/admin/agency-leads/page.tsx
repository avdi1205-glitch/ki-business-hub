"use client";

import Link from "next/link";
import { type ChangeEvent, useEffect, useMemo, useRef, useState } from "react";

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
  optOut: boolean;
  optOutAt: string | null;
  slaBreached: boolean;
  slaDueAt: string;
  ageHours: number;
};

type FollowUpDraft = {
  email: string;
  name: string | null;
  teamSize: string | null;
  stage: string;
  followUpCount: number;
  subject: string;
};

type FollowUpMeta = {
  sendWindowOpen: boolean;
  dailyLimit: number;
  alreadySentToday: number;
  remainingToday: number;
};

type ApiResponse = {
  leads: Lead[];
  counts: Record<string, number>;
};

type CsvLeadRow = {
  email: string;
  name?: string;
  teamSize?: string;
  score?: number;
  stage?: string;
  consent?: boolean;
  optOut?: boolean;
};

const STAGES = ["new", "qualified", "contacted", "proposal", "won", "lost"] as const;

function parseDelimitedLine(line: string, delimiter: string) {
  const fields: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (!inQuotes && char === delimiter) {
      fields.push(current.trim());
      current = "";
      continue;
    }

    current += char;
  }

  fields.push(current.trim());
  return fields;
}

function normalizeHeader(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]/g, "");
}

function toBoolean(value: string) {
  const normalized = value.trim().toLowerCase();
  return ["1", "yes", "ja", "true", "y"].includes(normalized);
}

function parseCsvLeads(raw: string): CsvLeadRow[] {
  const lines = raw
    .replace(/\r/g, "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length < 2) {
    throw new Error("CSV braucht mindestens Header + eine Zeile.");
  }

  const headerLine = lines[0];
  const delimiterCandidates = [",", ";", "\t"];
  const delimiter = delimiterCandidates.reduce((winner, candidate) => {
    const winnerCount = winner ? headerLine.split(winner).length : 0;
    const candidateCount = headerLine.split(candidate).length;
    return candidateCount > winnerCount ? candidate : winner;
  }, ",");

  const headerColumns = parseDelimitedLine(headerLine, delimiter).map(normalizeHeader);
  const requiredEmailIndex = headerColumns.indexOf("email");

  if (requiredEmailIndex === -1) {
    throw new Error("CSV Header braucht mindestens die Spalte email.");
  }

  const rows: CsvLeadRow[] = [];

  for (const line of lines.slice(1)) {
    const columns = parseDelimitedLine(line, delimiter);
    const row: Record<string, string> = {};

    for (let i = 0; i < headerColumns.length; i += 1) {
      const key = headerColumns[i];
      row[key] = columns[i] || "";
    }

    const email = String(row.email || "").trim().toLowerCase();
    if (!email || !email.includes("@")) continue;

    rows.push({
      email,
      name: String(row.name || "").trim() || undefined,
      teamSize: String(row.teamsize || row.team || "").trim() || undefined,
      score: Number(row.score || "") || undefined,
      stage: String(row.stage || "").trim() || undefined,
      consent: toBoolean(String(row.consent || "")),
      optOut: toBoolean(String(row.optout || "")),
    });
  }

  return rows;
}

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
  const [importing, setImporting] = useState(false);
  const [savingEmail, setSavingEmail] = useState<string | null>(null);
  const [message, setMessage] = useState<string>("");
  const [drafts, setDrafts] = useState<FollowUpDraft[]>([]);
  const [followUpMeta, setFollowUpMeta] = useState<FollowUpMeta | null>(null);
  const [reviewPreparedAt, setReviewPreparedAt] = useState<string | null>(null);
  const csvInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    void loadLeads();
  }, []);

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
    if (!drafts.length) {
      setMessage("Bitte erst Autopilot/Vorschau laufen lassen und Entwuerfe pruefen.");
      return;
    }

    setMessage("Follow-up wird mit Freigabe gestartet...");
    try {
      const response = await fetch("/api/agency-leads/follow-up", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirmSend: true, maxSend: 20 }),
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || "Follow-up failed");
      }

      setFollowUpMeta({
        sendWindowOpen: Boolean(payload.sendWindowOpen),
        dailyLimit: Number(payload.dailyLimit || 0),
        alreadySentToday: Number(payload.alreadySentToday || 0),
        remainingToday: Number(payload.remainingToday || 0),
      });

      setMessage(`Follow-up abgeschlossen: ${payload.sent || 0} E-Mails versendet (von ${payload.totalCandidates || 0} Kandidaten).`);
      await loadLeads();
      setDrafts([]);
      setReviewPreparedAt(null);
    } catch {
      setMessage("Follow-up konnte nicht ausgefuehrt werden.");
    }
  }

  async function previewFollowUp() {
    setMessage("Follow-up Vorschau wird geladen...");
    try {
      const response = await fetch("/api/agency-leads/follow-up", { cache: "no-store" });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || "Preview failed");
      }

      setDrafts(payload.drafts || []);
      setFollowUpMeta({
        sendWindowOpen: Boolean(payload.sendWindowOpen),
        dailyLimit: Number(payload.dailyLimit || 0),
        alreadySentToday: Number(payload.alreadySentToday || 0),
        remainingToday: Number(payload.remainingToday || 0),
      });
      setReviewPreparedAt(new Date().toISOString());
      setMessage(`Vorschau geladen: ${payload.totalCandidates || 0} Kandidaten. Verfuegbar heute: ${payload.remainingToday || 0}.`);
    } catch {
      setMessage("Vorschau konnte nicht geladen werden.");
    }
  }

  async function runAutopilotReview() {
    setMessage("Autopilot analysiert Leads und erstellt Entwuerfe zur Pruefung...");
    await loadLeads();
    await previewFollowUp();
  }

  async function toggleOptOut(email: string, current: boolean) {
    setSavingEmail(email);
    try {
      const response = await fetch("/api/agency-leads", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, optOut: !current }),
      });

      if (!response.ok) {
        throw new Error("Opt-out update failed");
      }

      await loadLeads();
    } catch {
      setMessage("Opt-out konnte nicht aktualisiert werden.");
    } finally {
      setSavingEmail(null);
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

  async function seedDemoLeads() {
    setMessage("Demo-Leads werden erzeugt...");
    try {
      const response = await fetch("/api/agency-leads/bootstrap", { method: "POST" });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || "Bootstrap failed");
      }

      setMessage(`Demo-Leads bereit: ${payload.createdOrUpdated || 0} Datensaetze.`);
      await loadLeads();
    } catch {
      setMessage("Demo-Leads konnten nicht erzeugt werden.");
    }
  }

  async function importCsvFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setImporting(true);
    setMessage("CSV wird importiert...");

    try {
      const text = await file.text();
      const rows = parseCsvLeads(text);

      if (!rows.length) {
        throw new Error("Keine gueltigen E-Mails in der CSV gefunden.");
      }

      const response = await fetch("/api/agency-leads/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rows }),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || "CSV import failed");
      }

      setMessage(`CSV importiert: ${payload.imported || 0} Leads, uebersprungen: ${payload.skipped || 0}.`);
      await loadLeads();
    } catch (error) {
      const detail = error instanceof Error ? error.message : "CSV konnte nicht importiert werden.";
      setMessage(detail);
    } finally {
      setImporting(false);
      if (event.target) event.target.value = "";
    }
  }

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

        <div className="mb-6 flex flex-wrap gap-3">
          <Link
            href="/admin/internal-bots"
            className="rounded-full border border-cyan-300/30 bg-cyan-500/12 px-4 py-2 text-sm font-bold text-cyan-100 transition hover:bg-cyan-500/20"
          >
            Zu Internal Bots
          </Link>
          <Link
            href="/admin/revenue-navigator"
            className="rounded-full border border-emerald-300/30 bg-emerald-500/12 px-4 py-2 text-sm font-bold text-emerald-100 transition hover:bg-emerald-500/20"
          >
            Zu Revenue Navigator Admin
          </Link>
          <Link
            href="/admin"
            className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:bg-white/10"
          >
            Zur Admin Uebersicht
          </Link>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-6">
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
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Opt-out</p>
            <p className="mt-2 text-3xl font-bold text-slate-200">{counts.optedOut || 0}</p>
          </div>
        </div>

        <div className="mb-5 flex flex-wrap gap-3">
          <input
            ref={csvInputRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={(event) => void importCsvFile(event)}
          />
          <button
            type="button"
            onClick={() => csvInputRef.current?.click()}
            disabled={importing}
            className="rounded-full border border-emerald-300/30 bg-emerald-500/12 px-4 py-2 text-sm font-bold text-emerald-100 transition hover:bg-emerald-500/20 disabled:opacity-60"
          >
            {importing ? "CSV wird importiert..." : "CSV Leads importieren"}
          </button>
          <button
            type="button"
            onClick={() => void seedDemoLeads()}
            className="rounded-full border border-fuchsia-300/30 bg-fuchsia-500/12 px-4 py-2 text-sm font-bold text-fuchsia-100 transition hover:bg-fuchsia-500/20"
          >
            Demo-Leads erzeugen
          </button>
          <button
            type="button"
            onClick={() => void runAutopilotReview()}
            className="rounded-full border border-indigo-300/30 bg-indigo-500/12 px-4 py-2 text-sm font-bold text-indigo-100 transition hover:bg-indigo-500/20"
          >
            Autopilot vorbereiten (nur Review)
          </button>
          <button
            type="button"
            onClick={() => void previewFollowUp()}
            className="rounded-full border border-cyan-300/30 bg-cyan-500/12 px-4 py-2 text-sm font-bold text-cyan-100 transition hover:bg-cyan-500/20"
          >
            Follow-up Vorschau laden
          </button>
          <button
            type="button"
            onClick={() => void runFollowUp()}
            className="rounded-full border border-amber-300/30 bg-amber-500/12 px-4 py-2 text-sm font-bold text-amber-100 transition hover:bg-amber-500/20"
          >
            Freigegebenes Follow-up senden
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
            <p className="mt-2 text-xs text-slate-400">CSV Header: email,name,teamSize,score,stage,consent,optOut</p>
            <p className="mt-1 text-xs text-slate-400">
              Versand bleibt blockiert, bis Entwuerfe in der Vorschau geladen wurden.
            </p>
            {reviewPreparedAt && (
              <p className="mt-1 text-xs text-indigo-200">Autopilot-Review bereit seit: {new Date(reviewPreparedAt).toLocaleString("de-DE")}</p>
            )}
          </div>
        )}

        {followUpMeta && (
          <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-4">
            <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-3">
              <p className="text-[11px] uppercase tracking-[0.14em] text-slate-400">Versandfenster</p>
              <p className={`mt-1 text-sm font-semibold ${followUpMeta.sendWindowOpen ? "text-emerald-200" : "text-rose-200"}`}>
                {followUpMeta.sendWindowOpen ? "Offen" : "Gesperrt"}
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-3">
              <p className="text-[11px] uppercase tracking-[0.14em] text-slate-400">Tageslimit</p>
              <p className="mt-1 text-sm font-semibold text-slate-100">{followUpMeta.dailyLimit}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-3">
              <p className="text-[11px] uppercase tracking-[0.14em] text-slate-400">Bereits gesendet</p>
              <p className="mt-1 text-sm font-semibold text-slate-100">{followUpMeta.alreadySentToday}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-3">
              <p className="text-[11px] uppercase tracking-[0.14em] text-slate-400">Rest heute</p>
              <p className="mt-1 text-sm font-semibold text-cyan-200">{followUpMeta.remainingToday}</p>
            </div>
          </div>
        )}

        {!!drafts.length && (
          <div className="mb-5 rounded-2xl border border-cyan-400/20 bg-cyan-500/10 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-cyan-200">Vorschau Entwuerfe</p>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              {drafts.slice(0, 10).map((draft) => (
                <article key={draft.email} className="rounded-xl border border-white/10 bg-slate-950/30 p-3">
                  <p className="text-sm font-semibold text-white break-all">{draft.email}</p>
                  <p className="mt-1 text-xs text-slate-300">{draft.subject}</p>
                  <p className="mt-1 text-xs text-slate-400">Stage: {draft.stage} | Follow-up: {draft.followUpCount}x</p>
                </article>
              ))}
            </div>
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
                  <th className="px-4 py-3 font-semibold">Opt-out</th>
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
                      <button
                        type="button"
                        onClick={() => void toggleOptOut(lead.email, lead.optOut)}
                        disabled={savingEmail === lead.email}
                        className={`rounded-full px-2 py-1 font-semibold disabled:opacity-50 ${lead.optOut ? "bg-rose-500/20 text-rose-200" : "bg-emerald-500/20 text-emerald-200"}`}
                      >
                        {lead.optOut ? "Opt-out" : "Active"}
                      </button>
                      <div className="mt-1 text-[11px] text-slate-400">{lead.optOutAt || "-"}</div>
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
                    <td colSpan={9} className="px-4 py-8 text-center text-sm text-slate-400">
                      <p>Noch keine Agency-Leads vorhanden.</p>
                      <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => csvInputRef.current?.click()}
                          className="rounded-full border border-emerald-300/30 bg-emerald-500/12 px-3 py-1.5 text-xs font-bold text-emerald-100 transition hover:bg-emerald-500/20"
                        >
                          CSV importieren
                        </button>
                        <button
                          type="button"
                          onClick={() => void seedDemoLeads()}
                          className="rounded-full border border-fuchsia-300/30 bg-fuchsia-500/12 px-3 py-1.5 text-xs font-bold text-fuchsia-100 transition hover:bg-fuchsia-500/20"
                        >
                          Demo-Leads erzeugen
                        </button>
                        <Link
                          href="/revenue-navigator"
                          className="rounded-full border border-cyan-300/30 bg-cyan-500/12 px-3 py-1.5 text-xs font-bold text-cyan-100 transition hover:bg-cyan-500/20"
                        >
                          Lead-Flow starten
                        </Link>
                      </div>
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
                <p className="mt-1 text-xs text-slate-400">Opt-out: {lead.optOut ? "ja" : "nein"}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}

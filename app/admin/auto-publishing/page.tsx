"use client";

import React, { useEffect, useState } from "react";
import { StatCard, ActionButton } from "@/app/components/ProUIComponents";

type DraftArticle = {
  id: number;
  title: string;
  category: string | null;
};

type ScheduledArticle = {
  id: number;
  title: string;
  category: string | null;
  publishAt: string | null;
  recurring: boolean;
  status: string;
};

type PublishedArticle = {
  id: number;
  title: string;
  createdAt: string;
};

export default function AutoPublishingPage() {
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [status, setStatus] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<DraftArticle[]>([]);
  const [scheduled, setScheduled] = useState<ScheduledArticle[]>([]);
  const [history, setHistory] = useState<PublishedArticle[]>([]);
  const [selectedArticleId, setSelectedArticleId] = useState("");
  const [date, setDate] = useState("2026-07-10");
  const [time, setTime] = useState("09:00");
  const [recurring, setRecurring] = useState(false);

  async function loadSchedule() {
    const response = await fetch("/api/auto-publishing", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "get-schedule" }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.error || "Auto-Publishing-Daten konnten nicht geladen werden");
    }

    setDrafts(data.drafts || []);
    setScheduled(data.scheduled || []);
    setHistory(data.history || []);

    if (!selectedArticleId && data.drafts?.[0]?.id) {
      setSelectedArticleId(String(data.drafts[0].id));
    }
  }

  useEffect(() => {
    const init = async () => {
      try {
        await loadSchedule();
      } catch (error) {
        setStatus(error instanceof Error ? error.message : "Auto-Publishing-Daten konnten nicht geladen werden");
      } finally {
        setInitialLoading(false);
      }
    };

    init();
  }, []);

  async function scheduleArticle() {
    if (!selectedArticleId) {
      setStatus("Bitte zuerst einen Entwurf auswählen.");
      return;
    }

    setLoading(true);
    setStatus(null);

    try {
      const publishAt = new Date(`${date}T${time}:00`);
      const response = await fetch("/api/auto-publishing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "schedule",
          articleId: Number(selectedArticleId),
          publishAt: publishAt.toISOString(),
          recurring,
        }),
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Planung fehlgeschlagen");
      }

      setStatus(data.message);
      await loadSchedule();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Planung fehlgeschlagen");
    } finally {
      setLoading(false);
    }
  }

  async function cancelSchedule(articleId: number) {
    setLoading(true);
    setStatus(null);

    try {
      const response = await fetch("/api/auto-publishing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "cancel-schedule", articleId }),
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Planung konnte nicht entfernt werden");
      }

      setStatus(data.message);
      await loadSchedule();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Planung konnte nicht entfernt werden");
    } finally {
      setLoading(false);
    }
  }

  async function publishDueArticles() {
    setLoading(true);
    setStatus(null);

    try {
      const response = await fetch("/api/auto-publishing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "auto-publish-drafts" }),
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Auto-Publishing fehlgeschlagen");
      }

      setStatus(`${data.publishedCount} geplante Artikel veröffentlicht.`);
      await loadSchedule();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Auto-Publishing fehlgeschlagen");
    } finally {
      setLoading(false);
    }
  }

  const publishedThisMonth = history.filter((item) => {
    const publishedAt = new Date(item.createdAt);
    const now = new Date();
    return publishedAt.getMonth() === now.getMonth() && publishedAt.getFullYear() === now.getFullYear();
  }).length;

  return (
    <div className="min-h-screen p-8" style={{ background: "var(--background)" }}>
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{ color: "var(--text-dark)" }}>📅 Auto-Publishing</h1>
          <p style={{ color: "var(--text-light)" }}>Automatische Veröffentlichung deiner Artikel nach Zeitplan</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard title="Geplant" value={scheduled.length} change="aktive Veröffentlichungen" icon="📋" />
          <StatCard title="Veröffentlicht diesen Monat" value={publishedThisMonth} change="über Auto-Publishing" icon="✅" trend="up" />
          <StatCard title="Entwürfe verfügbar" value={drafts.length} change="bereit für Planung" icon="⚡" />
        </div>

        <div className="mb-8 rounded-lg p-6" style={{ background: "var(--background-elevated)", border: "1px solid rgba(255,255,255,0.1)" }}>
          <h2 className="mb-4 text-xl font-semibold" style={{ color: "var(--text-dark)" }}>📝 Geplante Artikel</h2>
          <div className="space-y-3">
            {initialLoading ? (
              <p style={{ color: "var(--text-light)" }}>Lade Planungen...</p>
            ) : scheduled.length === 0 ? (
              <p style={{ color: "var(--text-light)" }}>Noch keine Artikel geplant.</p>
            ) : (
              scheduled.map((article) => {
                const publishDate = article.publishAt ? new Date(article.publishAt) : null;

                return (
                  <div
                    key={article.id}
                    className="flex items-center justify-between rounded-lg border-l-4 p-4 transition-colors"
                    style={{ background: "rgba(255,255,255,0.04)", borderColor: "var(--primary)" }}
                  >
                    <div className="flex-1">
                      <p className="mb-1 font-medium" style={{ color: "var(--text-dark)" }}>{article.title}</p>
                      <div className="flex gap-3 text-sm" style={{ color: "var(--text-light)" }}>
                        <span>📅 {publishDate ? publishDate.toLocaleString("de-DE") : "Kein Datum"}</span>
                        <span>•</span>
                        <span>🏷️ {article.category || "Ohne Kategorie"}</span>
                        {article.recurring && (
                          <>
                            <span>•</span>
                            <span>🔁 Wiederkehrend</span>
                          </>
                        )}
                      </div>
                    </div>
                    <button
                      className="rounded px-3 py-1 text-sm transition-colors"
                      style={{ background: "rgba(239, 68, 68, 0.18)", color: "#fca5a5" }}
                      onClick={() => cancelSchedule(article.id)}
                      disabled={loading}
                    >
                      Planung entfernen
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="mb-8 rounded-lg p-6" style={{ background: "rgba(16, 185, 129, 0.08)", border: "1px solid rgba(16, 185, 129, 0.25)" }}>
          <h2 className="mb-4 text-xl font-semibold" style={{ color: "var(--text-dark)" }}>⏰ Neuen Artikel planen</h2>
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium" style={{ color: "var(--text-light)" }}>Artikel</label>
              <select
                className="w-full rounded-lg px-4 py-2"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "var(--text-dark)" }}
                value={selectedArticleId}
                onChange={(event) => setSelectedArticleId(event.target.value)}
              >
                <option value="">-- Wähle Artikel --</option>
                {drafts.map((article) => (
                  <option key={article.id} value={article.id}>
                    {article.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-2 block text-sm font-medium" style={{ color: "var(--text-light)" }}>Datum</label>
                <input
                  type="date"
                  className="w-full rounded-lg px-4 py-2"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "var(--text-dark)" }}
                  value={date}
                  onChange={(event) => setDate(event.target.value)}
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium" style={{ color: "var(--text-light)" }}>Uhrzeit</label>
                <input
                  type="time"
                  className="w-full rounded-lg px-4 py-2"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "var(--text-dark)" }}
                  value={time}
                  onChange={(event) => setTime(event.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="flex cursor-pointer items-center gap-2 text-sm font-medium" style={{ color: "var(--text-light)" }}>
                <input type="checkbox" className="w-4 h-4 rounded" checked={recurring} onChange={(event) => setRecurring(event.target.checked)} />
                <span>Wöchentlich wiederholen</span>
              </label>
            </div>

            <div className="flex flex-wrap gap-3">
              <ActionButton label={loading ? "Plane..." : "Artikel planen"} onClick={scheduleArticle} disabled={loading || drafts.length === 0} />
              <ActionButton label={loading ? "Veröffentliche..." : "Fällige Artikel veröffentlichen"} onClick={publishDueArticles} disabled={loading} variant="secondary" />
            </div>
            {status && <p className="text-sm" style={{ color: "var(--text-light)" }}>{status}</p>}
          </div>
        </div>

        <div className="rounded-lg p-6" style={{ background: "var(--background-elevated)", border: "1px solid rgba(255,255,255,0.1)" }}>
          <h2 className="mb-4 text-xl font-semibold" style={{ color: "var(--text-dark)" }}>📊 Veröffentlichungsverlauf</h2>
          <div className="space-y-3">
            {history.length === 0 ? (
              <p style={{ color: "var(--text-light)" }}>Noch keine automatisch veröffentlichten Artikel sichtbar.</p>
            ) : (
              history.map((item) => (
                <div key={item.id} className="flex justify-between rounded-lg p-3" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <div>
                    <p className="font-medium" style={{ color: "var(--text-dark)" }}>{item.title}</p>
                    <p className="text-sm" style={{ color: "var(--text-light)" }}>
                      Veröffentlicht am {new Date(item.createdAt).toLocaleString("de-DE")}
                    </p>
                  </div>
                  <p className="text-right font-medium" style={{ color: "var(--success-light)" }}>Live</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

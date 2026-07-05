"use client";

import React, { useCallback, useEffect, useState } from "react";
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

  const loadSchedule = useCallback(async () => {
    const response = await fetch("/api/auto-publishing", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "get-schedule" }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.error || "Could not load auto-publishing data");
    }

    setDrafts(data.drafts || []);
    setScheduled(data.scheduled || []);
    setHistory(data.history || []);

    if (!selectedArticleId && data.drafts?.[0]?.id) {
      setSelectedArticleId(String(data.drafts[0].id));
    }
  }, [selectedArticleId]);

  useEffect(() => {
    const init = async () => {
      try {
        await loadSchedule();
      } catch (error) {
        setStatus(error instanceof Error ? error.message : "Could not load auto-publishing data");
      } finally {
        setInitialLoading(false);
      }
    };

    init();
  }, [loadSchedule]);

  async function scheduleArticle() {
    if (!selectedArticleId) {
      setStatus("Please select a draft first.");
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
        throw new Error(data.error || "Could not schedule article");
      }

      setStatus(data.message);
      await loadSchedule();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not schedule article");
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
        throw new Error(data.error || "Could not cancel schedule");
      }

      setStatus(data.message);
      await loadSchedule();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not cancel schedule");
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
        throw new Error(data.error || "Auto-publishing failed");
      }

      setStatus(`${data.publishedCount} scheduled articles published.`);
      await loadSchedule();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Auto-publishing failed");
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
          <h1 className="text-3xl font-bold mb-2" style={{ color: "var(--text-dark)" }}>📅 Auto-publishing</h1>
          <p style={{ color: "var(--text-light)" }}>Automatically publish your articles on schedule</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard title="Scheduled" value={scheduled.length} change="active publications" icon="📋" />
          <StatCard title="Published this month" value={publishedThisMonth} change="via auto-publishing" icon="✅" trend="up" />
          <StatCard title="Drafts available" value={drafts.length} change="ready to schedule" icon="⚡" />
        </div>

        <div className="mb-8 rounded-lg p-6" style={{ background: "var(--background-elevated)", border: "1px solid rgba(255,255,255,0.1)" }}>
          <h2 className="mb-4 text-xl font-semibold" style={{ color: "var(--text-dark)" }}>📝 Scheduled articles</h2>
          <div className="space-y-3">
            {initialLoading ? (
              <p style={{ color: "var(--text-light)" }}>Loading schedules...</p>
            ) : scheduled.length === 0 ? (
              <p style={{ color: "var(--text-light)" }}>No articles scheduled yet.</p>
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
                        <span>📅 {publishDate ? publishDate.toLocaleString() : "No date"}</span>
                        <span>•</span>
                        <span>🏷️ {article.category || "No category"}</span>
                        {article.recurring && (
                          <>
                            <span>•</span>
                            <span>🔁 Recurring</span>
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
                      Remove schedule
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="mb-8 rounded-lg p-6" style={{ background: "rgba(16, 185, 129, 0.08)", border: "1px solid rgba(16, 185, 129, 0.25)" }}>
          <h2 className="mb-4 text-xl font-semibold" style={{ color: "var(--text-dark)" }}>⏰ Schedule new article</h2>
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium" style={{ color: "var(--text-light)" }}>Article</label>
              <select
                className="w-full rounded-lg px-4 py-2"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "var(--text-dark)" }}
                value={selectedArticleId}
                onChange={(event) => setSelectedArticleId(event.target.value)}
              >
                <option value="">-- Choose article --</option>
                {drafts.map((article) => (
                  <option key={article.id} value={article.id}>
                    {article.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-2 block text-sm font-medium" style={{ color: "var(--text-light)" }}>Date</label>
                <input
                  type="date"
                  className="w-full rounded-lg px-4 py-2"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "var(--text-dark)" }}
                  value={date}
                  onChange={(event) => setDate(event.target.value)}
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium" style={{ color: "var(--text-light)" }}>Time</label>
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
                <span>Repeat weekly</span>
              </label>
            </div>

            <div className="flex flex-wrap gap-3">
              <ActionButton label={loading ? "Scheduling..." : "Schedule article"} onClick={scheduleArticle} disabled={loading || drafts.length === 0} />
              <ActionButton label={loading ? "Publishing..." : "Publish due articles"} onClick={publishDueArticles} disabled={loading} variant="secondary" />
            </div>
            {status && <p className="text-sm" style={{ color: "var(--text-light)" }}>{status}</p>}
          </div>
        </div>

        <div className="rounded-lg p-6" style={{ background: "var(--background-elevated)", border: "1px solid rgba(255,255,255,0.1)" }}>
          <h2 className="mb-4 text-xl font-semibold" style={{ color: "var(--text-dark)" }}>📊 Publishing history</h2>
          <div className="space-y-3">
            {history.length === 0 ? (
              <p style={{ color: "var(--text-light)" }}>No automatically published articles yet.</p>
            ) : (
              history.map((item) => (
                <div key={item.id} className="flex justify-between rounded-lg p-3" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <div>
                    <p className="font-medium" style={{ color: "var(--text-dark)" }}>{item.title}</p>
                    <p className="text-sm" style={{ color: "var(--text-light)" }}>
                      Published on {new Date(item.createdAt).toLocaleString()}
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

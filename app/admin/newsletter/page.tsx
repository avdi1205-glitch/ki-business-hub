"use client";

import React, { useState } from "react";
import { StatCard, ActionButton } from "@/app/components/ProUIComponents";

export default function NewsletterAutomationPage() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [sources, setSources] = useState<Record<string, number>>({});
  const [metrics, setMetrics] = useState({
    totalSubscribers: 1250,
    weeklyGrowth: 45,
    estimatedRevenue: 625,
  });

  React.useEffect(() => {
    const loadNewsletterMetrics = async () => {
      try {
        const response = await fetch("/api/subscribe-newsletter");
        const data = await response.json();
        if (!response.ok) return;

        setMetrics((current) => ({
          ...current,
          totalSubscribers: data.subscriberCount ?? current.totalSubscribers,
        }));
        setSources(data.sourceBreakdown || {});
      } catch {
        // Non-blocking dashboard enrichment.
      }
    };

    loadNewsletterMetrics();
  }, []);

  const handleSendNewsletter = async () => {
    setLoading(true);
    setStatus(null);
    try {
      const response = await fetch("/api/newsletter-automation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "send-segment",
          subject: "Weekly AI Business Tips 🚀",
          template: "default",
          variables: { week: "Latest" },
        }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || "Newsletter-Versand fehlgeschlagen");
      }
      setStatus(`Newsletter an ${data.sent} Abos versendet.`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Newsletter-Versand fehlgeschlagen");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-8" style={{ background: "var(--background)" }}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{ color: "var(--text-dark)" }}>📧 Newsletter-Automatisierung</h1>
          <p style={{ color: "var(--text-light)" }}>Verwalte automatisierte Email-Kampagnen an deine Subscriber</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard
            title="Gesamt Abos"
            value={metrics.totalSubscribers}
            change="+45 diese Woche"
            icon="👥"
            trend="up"
          />
          <StatCard
            title="Wöchentliche Steigerung"
            value={metrics.weeklyGrowth}
            change="+12%"
            icon="📈"
            trend="up"
          />
          <StatCard
            title="Geschätzte Einnahmen"
            value={`€${metrics.estimatedRevenue}`}
            change="+€125 diese Woche"
            icon="💰"
            trend="up"
          />
        </div>

        {/* Campaign Manager */}
        <div className="rounded-lg border p-6 mb-8" style={{ background: "var(--background-elevated)", border: "1px solid rgba(255,255,255,0.1)" }}>
          <h2 className="text-xl font-semibold mb-4" style={{ color: "var(--text-dark)" }}>📤 Kampagne versenden</h2>
          
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-light)" }}>Betreff</label>
              <input
                type="text"
                defaultValue="Weekly AI Business Tips 🚀"
                className="w-full px-4 py-2 rounded-lg"
                style={{ background: "rgba(59, 130, 246, 0.05)", border: "1px solid rgba(59, 130, 246, 0.2)", color: "var(--text-dark)" }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-light)" }}>Template</label>
              <select className="w-full px-4 py-2 rounded-lg" style={{ background: "rgba(59, 130, 246, 0.05)", border: "1px solid rgba(59, 130, 246, 0.2)", color: "var(--text-dark)" }}>
                <option>Weekly Digest</option>
                <option>Promotional</option>
                <option>Welcome</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-light)" }}>Segment</label>
              <select className="w-full px-4 py-2 rounded-lg" style={{ background: "rgba(59, 130, 246, 0.05)", border: "1px solid rgba(59, 130, 246, 0.2)", color: "var(--text-dark)" }}>
                <option>Alle (1.250)</option>
                <option>Aktive Nutzer (892)</option>
                <option>Neue (358)</option>
              </select>
            </div>
          </div>

          <ActionButton
            label={loading ? "Wird versendet..." : "Jetzt versenden"}
            onClick={handleSendNewsletter}
            disabled={loading}
          />
          {status && (
            <p className="mt-3 text-sm" style={{ color: "var(--text-light)" }}>
              {status}
            </p>
          )}
        </div>

        {/* Recent Campaigns */}
        <div className="rounded-lg border p-6" style={{ background: "var(--background-elevated)", border: "1px solid rgba(255,255,255,0.1)" }}>
          <h2 className="text-xl font-semibold mb-4" style={{ color: "var(--text-dark)" }}>📊 Letzte Kampagnen</h2>
          
          <div className="space-y-3">
            {[
              { subject: "AI Tools für 2026", sent: 1200, opens: 456, rate: "38%" },
              { subject: "ChatGPT Tipps", sent: 1180, opens: 412, rate: "35%" },
              { subject: "Business Automation", sent: 1150, opens: 398, rate: "35%" },
            ].map((campaign, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-lg transition-colors" style={{ background: "rgba(59, 130, 246, 0.05)", border: "1px solid rgba(59, 130, 246, 0.2)" }}>
                <div>
                  <p className="font-medium" style={{ color: "var(--text-dark)" }}>{campaign.subject}</p>
                  <p className="text-sm" style={{ color: "var(--text-light)" }}>{campaign.sent} versendet</p>
                </div>
                <div className="text-right">
                  <p className="font-medium" style={{ color: "var(--text-dark)" }}>{campaign.opens} Öffnungen</p>
                  <p className="text-sm" style={{ color: "var(--success-light)" }}>{campaign.rate} Öffnungsrate</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 rounded-lg border p-6" style={{ background: "var(--background-elevated)", border: "1px solid rgba(255,255,255,0.1)" }}>
          <h2 className="mb-4 text-xl font-semibold" style={{ color: "var(--text-dark)" }}>🎯 Lead-Quellen</h2>
          <div className="space-y-3">
            {Object.keys(sources).length === 0 ? (
              <p style={{ color: "var(--text-light)" }}>Noch keine Quell-Daten vorhanden.</p>
            ) : (
              Object.entries(sources)
                .sort((left, right) => right[1] - left[1])
                .map(([source, count]) => (
                  <div key={source} className="flex items-center justify-between rounded-lg p-3" style={{ background: "rgba(59, 130, 246, 0.05)", border: "1px solid rgba(59, 130, 246, 0.2)" }}>
                    <span style={{ color: "var(--text-light)" }}>{source}</span>
                    <span className="font-semibold" style={{ color: "var(--text-dark)" }}>{count}</span>
                  </div>
                ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

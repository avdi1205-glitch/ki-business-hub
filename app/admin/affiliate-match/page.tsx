"use client";

import React, { useState } from "react";
import { StatCard, ActionButton } from "@/app/components/ProUIComponents";

export default function AffiliateMatchPage() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const suggestions = [
    { tool: "OpenAI API", description: "KI-API für Entwickler", relevance: 95, url: "https://openai.com" },
    { tool: "Zapier", description: "Automation & Integration", relevance: 88, url: "https://zapier.com" },
    { tool: "Make.com", description: "Visual Workflow Builder", relevance: 82, url: "https://make.com" },
    { tool: "HubSpot", description: "CRM & Marketing", relevance: 78, url: "https://hubspot.com" },
  ];

  return (
    <div className="min-h-screen p-8" style={{ background: "var(--background)" }}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{ color: "var(--text-dark)" }}>🎯 Affiliate-Match Engine</h1>
          <p style={{ color: "var(--text-light)" }}>Intelligente Tool-Vorschläge für maximale Affiliate-Einnahmen</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Aktive Affiliates"
            value="47"
            change="+8 diese Woche"
            icon="🔗"
            trend="up"
          />
          <StatCard
            title="Durchschn. Provision"
            value="€1.25"
            change="pro Click"
            icon="💵"
          />
          <StatCard
            title="Match-Vorschläge"
            value="182"
            change="optimiert"
            icon="✨"
          />
          <StatCard
            title="Konversion"
            value="8.5%"
            change="+2.1% trend"
            icon="📈"
            trend="up"
          />
        </div>

        {/* Suggestions */}
        <div className="mb-8 rounded-lg p-6" style={{ background: "var(--background-elevated)", border: "1px solid rgba(255,255,255,0.1)" }}>
          <h2 className="mb-4 text-xl font-semibold" style={{ color: "var(--text-dark)" }}>🎁 Beste Affiliate-Matches</h2>
          
          <div className="space-y-3">
            {suggestions.map((item, idx) => (
              <div
                key={idx}
                className="group flex items-center justify-between rounded-lg p-4 transition-colors"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium" style={{ color: "var(--text-dark)" }}>{item.tool}</p>
                    <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium" style={{ background: "rgba(16, 185, 129, 0.18)", color: "#86efac" }}>
                      {item.relevance}% Match
                    </span>
                  </div>
                  <p className="text-sm" style={{ color: "var(--text-light)" }}>{item.description}</p>
                </div>
                <div className="flex gap-2">
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg px-4 py-2 text-sm font-medium transition-colors"
                    style={{ background: "rgba(59, 130, 246, 0.18)", color: "#93c5fd" }}
                  >
                    Besuchen
                  </a>
                  <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-sm opacity-0 group-hover:opacity-100">
                    Hinzufügen
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Auto-Linking */}
        <div className="rounded-lg p-6" style={{ background: "rgba(139, 92, 246, 0.08)", border: "1px solid rgba(139, 92, 246, 0.28)" }}>
          <h2 className="mb-4 text-xl font-semibold" style={{ color: "var(--text-dark)" }}>🔄 Auto-Linking</h2>
          
          <p className="mb-4" style={{ color: "var(--text-light)" }}>
            Automatisch passende Affiliate-Links zu bestehenden Artikeln hinzufügen
          </p>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="rounded-lg p-4" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <p className="mb-1 text-sm" style={{ color: "var(--text-light)" }}>Artikel ohne Links</p>
              <p className="text-2xl font-bold" style={{ color: "var(--text-dark)" }}>5</p>
            </div>
            <div className="rounded-lg p-4" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <p className="mb-1 text-sm" style={{ color: "var(--text-light)" }}>Verfügbare Matches</p>
              <p className="text-2xl font-bold" style={{ color: "var(--text-dark)" }}>23</p>
            </div>
            <div className="rounded-lg p-4" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <p className="mb-1 text-sm" style={{ color: "var(--text-light)" }}>Est. zusätzliche Revenue</p>
              <p className="text-2xl font-bold" style={{ color: "var(--success-light)" }}>€285/Mo</p>
            </div>
          </div>

          <ActionButton
            label={loading ? "Verlinke..." : "Jetzt Auto-Linking starten"}
            onClick={async () => {
              setLoading(true);
              setStatus(null);
              try {
                const response = await fetch("/api/affiliate-match", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ action: "auto-link" }),
                });
                const data = await response.json();
                if (!response.ok || !data.success) throw new Error(data.error || "Auto-Linking fehlgeschlagen");
                setStatus(`${data.articlesNeedingLinks} Artikel gescannt, ${data.updates.length} Link-Kandidaten erzeugt.`);
              } catch (error) {
                setStatus(error instanceof Error ? error.message : "Auto-Linking fehlgeschlagen");
              } finally {
                setLoading(false);
              }
            }}
            disabled={loading}
          />
          {status && <p className="mt-3 text-sm" style={{ color: "var(--text-light)" }}>{status}</p>}
        </div>
      </div>
    </div>
  );
}

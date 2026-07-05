"use client";

import React, { useState } from "react";
import { StatCard, ActionButton } from "@/app/components/ProUIComponents";

export default function AffiliateMatchPage() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const suggestions = [
    { tool: "OpenAI API", description: "AI API for developers", relevance: 95, url: "https://openai.com" },
    { tool: "Zapier", description: "Automation & integration", relevance: 88, url: "https://zapier.com" },
    { tool: "Make.com", description: "Visual workflow builder", relevance: 82, url: "https://make.com" },
    { tool: "HubSpot", description: "CRM & marketing", relevance: 78, url: "https://hubspot.com" },
  ];

  return (
    <div className="min-h-screen p-8" style={{ background: "var(--background)" }}>
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{ color: "var(--text-dark)" }}>🎯 Affiliate-match engine</h1>
          <p style={{ color: "var(--text-light)" }}>Smart tool suggestions for maximum affiliate revenue</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard title="Active affiliates" value="47" change="+8 this week" icon="🔗" trend="up" />
          <StatCard title="Avg. commission" value="€1.25" change="per click" icon="💵" />
          <StatCard title="Match suggestions" value="182" change="optimized" icon="✨" />
          <StatCard title="Conversion" value="8.5%" change="+2.1% trend" icon="📈" trend="up" />
        </div>

        <div className="mb-8 rounded-lg p-6" style={{ background: "var(--background-elevated)", border: "1px solid rgba(255,255,255,0.1)" }}>
          <h2 className="mb-4 text-xl font-semibold" style={{ color: "var(--text-dark)" }}>🎁 Best affiliate matches</h2>

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
                      {item.relevance}% match
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
                    Visit
                  </a>
                  <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-sm opacity-0 group-hover:opacity-100">
                    Add
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg p-6" style={{ background: "rgba(139, 92, 246, 0.08)", border: "1px solid rgba(139, 92, 246, 0.28)" }}>
          <h2 className="mb-4 text-xl font-semibold" style={{ color: "var(--text-dark)" }}>🔄 Auto-linking</h2>

          <p className="mb-4" style={{ color: "var(--text-light)" }}>
            Automatically add matching affiliate links to existing articles
          </p>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="rounded-lg p-4" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <p className="mb-1 text-sm" style={{ color: "var(--text-light)" }}>Articles without links</p>
              <p className="text-2xl font-bold" style={{ color: "var(--text-dark)" }}>5</p>
            </div>
            <div className="rounded-lg p-4" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <p className="mb-1 text-sm" style={{ color: "var(--text-light)" }}>Available matches</p>
              <p className="text-2xl font-bold" style={{ color: "var(--text-dark)" }}>23</p>
            </div>
            <div className="rounded-lg p-4" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <p className="mb-1 text-sm" style={{ color: "var(--text-light)" }}>Est. additional revenue</p>
              <p className="text-2xl font-bold" style={{ color: "var(--success-light)" }}>€285/Mo</p>
            </div>
          </div>

          <ActionButton
            label={loading ? "Linking..." : "Start auto-linking now"}
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
                if (!response.ok || !data.success) throw new Error(data.error || "Auto-linking failed");
                setStatus(`${data.articlesNeedingLinks} articles scanned, ${data.updates.length} link candidates generated.`);
              } catch (error) {
                setStatus(error instanceof Error ? error.message : "Auto-linking failed");
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

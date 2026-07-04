"use client";

import React, { useState } from "react";
import { StatCard, SimpleChart, ActionButton } from "@/app/components/ProUIComponents";

export default function SEOAnalyzerPage() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const handleAnalyze = async () => {
    setLoading(true);
    setStatus(null);
    try {
      const response = await fetch("/api/seo-analyzer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "bulk-analyze" }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || "Analyse fehlgeschlagen");
      }
      setStatus(`${data.results.length} Artikel analysiert. Neuer Durchschnitt: ${data.average} Punkte.`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Analyse fehlgeschlagen");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-8" style={{ background: "var(--background)" }}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{ color: "var(--text-dark)" }}>🔍 SEO-Analyzer</h1>
          <p style={{ color: "var(--text-light)" }}>Optimiere deine Artikel für bessere Rankings</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard
            title="Durchschn. SEO-Score"
            value="78"
            change="+5 von letztem Monat"
            icon="📊"
            trend="up"
          />
          <StatCard
            title="Artikel analysiert"
            value="39"
            change="100% der Artikel"
            icon="📝"
            trend="up"
          />
          <StatCard
            title="Optimierungspotential"
            value="245 Punkte"
            change="über alle Artikel"
            icon="⚡"
            trend="up"
          />
        </div>

        {/* Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <SimpleChart
            title="SEO-Score Verteilung"
            data={[
              { label: "Exzellent (90-100)", value: 12 },
              { label: "Sehr gut (80-89)", value: 18 },
              { label: "Gut (70-79)", value: 7 },
              { label: "Okay (60-69)", value: 2 },
            ]}
          />

          <SimpleChart
            title="Top Keywords Rankings"
            data={[
              { label: "KI Business Tools", value: 95 },
              { label: "Content Factory", value: 87 },
              { label: "Affiliate Marketing", value: 76 },
              { label: "Auto-Publishing", value: 65 },
            ]}
          />
        </div>

        {/* Top Performers */}
        <div className="rounded-lg p-6 mb-8" style={{ background: "var(--background-elevated)", border: "1px solid rgba(255,255,255,0.1)" }}>
          <h2 className="text-xl font-semibold mb-4" style={{ color: "var(--text-dark)" }}>⭐ Top Artikel</h2>
          
          <div className="space-y-3">
            {[
              { title: "10 beste KI Tools für 2026", score: 94, words: "2.450", keywords: 8 },
              { title: "Affiliate Marketing Guide", score: 91, words: "2.120", keywords: 6 },
              { title: "Content Factory Automation", score: 88, words: "1.890", keywords: 5 },
            ].map((article, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 rounded-lg transition-colors cursor-pointer" style={{ background: "rgba(59, 130, 246, 0.05)", border: "1px solid rgba(59, 130, 246, 0.2)" }}>
                <div className="flex-1">
                  <p className="font-medium" style={{ color: "var(--text-dark)" }}>{article.title}</p>
                  <p className="text-sm" style={{ color: "var(--text-light)" }}>{article.words} Wörter • {article.keywords} Keywords</p>
                </div>
                <div className="text-right">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-blue-500">
                    <span className="font-bold text-white text-lg">{article.score}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recommendations */}
        <div className="rounded-lg p-6" style={{ background: "rgba(59, 130, 246, 0.08)", border: "1px solid rgba(59, 130, 246, 0.3)" }}>
          <h2 className="text-xl font-semibold mb-4" style={{ color: "var(--text-dark)" }}>💡 Empfehlungen</h2>
          
          <ul className="space-y-2">
            <li className="flex items-start gap-3">
              <span className="font-bold" style={{ color: "var(--success)" }}>✓</span>
              <span style={{ color: "var(--text-light)" }}>Alle Artikel haben 1.500+ Wörter (Best Practice erfüllt)</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="font-bold" style={{ color: "var(--accent)" }}>⚠</span>
              <span style={{ color: "var(--text-light)" }}>3 Artikel könnten mit H2-Überschriften optimiert werden</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="font-bold" style={{ color: "var(--accent)" }}>⚠</span>
              <span style={{ color: "var(--text-light)" }}>Fokus-Keyword-Dichte bei 5 Artikeln optimierbar</span>
            </li>
          </ul>

          <div className="mt-6">
            <ActionButton
              label={loading ? "Analysiere..." : "Alle Artikel analysieren"}
              onClick={handleAnalyze}
              disabled={loading}
            />
            {status && (
              <p className="mt-3 text-sm" style={{ color: "var(--text-light)" }}>
                {status}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

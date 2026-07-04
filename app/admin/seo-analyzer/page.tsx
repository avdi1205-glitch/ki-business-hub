"use client";

import React, { useState } from "react";
import { StatCard, SimpleChart, ActionButton } from "@/app/components/ProUIComponents";

export default function SEOAnalyzerPage() {
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/seo-analyzer", {
        method: "POST",
        body: JSON.stringify({ action: "bulk-analyze" }),
      });
      const data = await response.json();
      console.log(data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🔍 SEO-Analyzer</h1>
          <p className="text-gray-600">Optimiere deine Artikel für bessere Rankings</p>
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
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">⭐ Top Artikel</h2>
          
          <div className="space-y-3">
            {[
              { title: "10 beste KI Tools für 2026", score: 94, words: "2.450", keywords: 8 },
              { title: "Affiliate Marketing Guide", score: 91, words: "2.120", keywords: 6 },
              { title: "Content Factory Automation", score: 88, words: "1.890", keywords: 5 },
            ].map((article, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer">
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{article.title}</p>
                  <p className="text-sm text-gray-600">{article.words} Wörter • {article.keywords} Keywords</p>
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
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">💡 Empfehlungen</h2>
          
          <ul className="space-y-2">
            <li className="flex items-start gap-3">
              <span className="text-green-600 font-bold">✓</span>
              <span className="text-gray-700">Alle Artikel haben 1.500+ Wörter (Best Practice erfüllt)</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-yellow-600 font-bold">⚠</span>
              <span className="text-gray-700">3 Artikel könnten mit H2-Überschriften optimiert werden</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-yellow-600 font-bold">⚠</span>
              <span className="text-gray-700">Fokus-Keyword-Dichte bei 5 Artikeln optimierbar</span>
            </li>
          </ul>

          <div className="mt-6">
            <ActionButton
              label={loading ? "Analysiere..." : "Alle Artikel analysieren"}
              onClick={handleAnalyze}
              disabled={loading}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

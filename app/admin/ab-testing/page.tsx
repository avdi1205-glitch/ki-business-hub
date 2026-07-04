"use client";

import React, { useState } from "react";
import { StatCard, ActionButton } from "@/app/components/ProUIComponents";

export default function ABTestingPage() {
  const [loading, setLoading] = useState(false);

  const tests = [
    {
      id: 1,
      article: "10 beste KI Tools",
      variantA: "Kostenlos testen",
      variantB: "Jetzt starten",
      clicksA: 245,
      clicksB: 198,
      conversionsA: 18,
      conversionsB: 22,
      rateA: "7.35%",
      rateB: "11.11%",
      winner: "B",
      confidence: 94,
      status: "active",
    },
    {
      id: 2,
      article: "Affiliate Marketing Guide",
      variantA: "Mehr erfahren",
      variantB: "Tool vergleichen",
      clicksA: 156,
      clicksB: 189,
      conversionsA: 12,
      conversionsB: 19,
      rateA: "7.69%",
      rateB: "10.05%",
      winner: "B",
      confidence: 88,
      status: "complete",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🧪 A/B-Testing</h1>
          <p className="text-gray-600">Optimiere deine Call-to-Action Texte für maximale Konversion</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Aktive Tests"
            value="2"
            change="laufen parallel"
            icon="⚙️"
          />
          <StatCard
            title="Durchschn. Konversion"
            value="9.2%"
            change="über alle Tests"
            icon="📈"
            trend="up"
          />
          <StatCard
            title="Gewinner-Texte"
            value="12"
            change="statistisch signifikant"
            icon="🏆"
          />
          <StatCard
            title="Geschätzte Extra-Revenue"
            value="€2.450"
            change="monatlich"
            icon="💰"
            trend="up"
          />
        </div>

        {/* Active Tests */}
        <div className="space-y-6 mb-8">
          {tests
            .filter(t => t.status === "active")
            .map(test => (
              <div key={test.id} className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">{test.article}</h2>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    🔄 Läuft
                  </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                  {/* Variant A */}
                  <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <h3 className="font-semibold text-gray-900 mb-3">Variant A</h3>
                    <div className="bg-blue-100 text-blue-900 px-3 py-2 rounded-lg font-medium mb-4">
                      "{test.variantA}"
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Klicks</span>
                        <span className="font-medium text-gray-900">{test.clicksA}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Konversionen</span>
                        <span className="font-medium text-gray-900">{test.conversionsA}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Rate</span>
                        <span className="font-medium text-gray-900">{test.rateA}</span>
                      </div>
                    </div>
                  </div>

                  {/* Variant B */}
                  <div className="border-2 border-green-400 rounded-lg p-4 bg-green-50">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-gray-900">Variant B</h3>
                      <span className="inline-flex items-center px-2 py-1 rounded text-xs font-bold bg-green-100 text-green-800">
                        🏆 WINNER
                      </span>
                    </div>
                    <div className="bg-green-100 text-green-900 px-3 py-2 rounded-lg font-medium mb-4">
                      "{test.variantB}"
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Klicks</span>
                        <span className="font-medium text-gray-900">{test.clicksB}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Konversionen</span>
                        <span className="font-medium text-green-600">{test.conversionsB}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Rate</span>
                        <span className="font-medium text-green-600">{test.rateB}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Statistische Signifikanz</p>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full"
                          style={{ width: `${test.confidence}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-900">{test.confidence}%</span>
                    </div>
                  </div>
                  <ActionButton
                    label="Variant B anwenden"
                    onClick={() => alert("✅ Variant B wurde auf alle Artikel angewendet!")}
                  />
                </div>
              </div>
            ))}
        </div>

        {/* Completed Tests */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">✅ Abgeschlossene Tests</h2>
          
          <div className="space-y-3">
            {tests
              .filter(t => t.status === "complete")
              .map(test => (
                <div key={test.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{test.article}</p>
                    <p className="text-sm text-gray-600">
                      Gewinner: "{test.variantB}" (+{((parseFloat(test.rateB) - parseFloat(test.rateA)) / parseFloat(test.rateA) * 100).toFixed(1)}%)
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                      ✅ {test.confidence}% Konfidenz
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}

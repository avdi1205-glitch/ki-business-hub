"use client";

import React, { useState } from "react";
import { StatCard, ActionButton } from "@/app/components/ProUIComponents";

export default function AffiliateMatchPage() {
  const [loading, setLoading] = useState(false);

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
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">🎁 Beste Affiliate-Matches</h2>
          
          <div className="space-y-3">
            {suggestions.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-colors group"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-gray-900">{item.tool}</p>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {item.relevance}% Match
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{item.description}</p>
                </div>
                <div className="flex gap-2">
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors font-medium text-sm"
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
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">🔄 Auto-Linking</h2>
          
          <p className="text-gray-700 mb-4">
            Automatisch passende Affiliate-Links zu bestehenden Artikeln hinzufügen
          </p>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Artikel ohne Links</p>
              <p className="text-2xl font-bold text-gray-900">5</p>
            </div>
            <div className="bg-white p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Verfügbare Matches</p>
              <p className="text-2xl font-bold text-gray-900">23</p>
            </div>
            <div className="bg-white p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Est. zusätzliche Revenue</p>
              <p className="text-2xl font-bold text-green-600">€285/Mo</p>
            </div>
          </div>

          <ActionButton
            label={loading ? "Verlinke..." : "Jetzt Auto-Linking starten"}
            onClick={() => setLoading(!loading)}
            disabled={loading}
          />
        </div>
      </div>
    </div>
  );
}

"use client";

import React from "react";
import Link from "next/link";

const comparisonData = [
  {
    feature: "📝 Artikel-Generierung",
    starter: "5/Monat",
    pro: "50/Monat",
    agency: "Unbegrenzt",
  },
  {
    feature: "🤖 KI Quality",
    starter: "Basis",
    pro: "Premium (85+ SEO)",
    agency: "Enterprise",
  },
  {
    feature: "💰 Affiliate Links",
    starter: "10 Partner",
    pro: "47 Partner",
    agency: "47 + Custom",
  },
  {
    feature: "📧 Newsletter Auto",
    starter: "❌",
    pro: "✅ Vollständig",
    agency: "✅ + Segmentierung",
  },
  {
    feature: "🔍 SEO Analytics",
    starter: "Basis",
    pro: "Erweitert",
    agency: "Enterprise + API",
  },
  {
    feature: "⚡ Auto-Publishing",
    starter: "Manuell",
    pro: "Schedule + Auto",
    agency: "✅ + Webhooks",
  },
  {
    feature: "🧪 A/B Testing",
    starter: "❌",
    pro: "✅ Basic",
    agency: "✅ Advanced",
  },
  {
    feature: "👥 Team Member",
    starter: "Nur Sie",
    pro: "Nur Sie",
    agency: "5 Member",
  },
  {
    feature: "📞 Support",
    starter: "Email",
    pro: "Email + Chat",
    agency: "24/7 Phone",
  },
  {
    feature: "💳 Kosten",
    starter: "€0",
    pro: "€29/Monat",
    agency: "€99/Monat",
  },
];

export function ComparisonTable() {
  return (
    <div style={{ background: "var(--background)" }} className="py-24">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: "var(--text-dark)" }}>
            📊 Vergleich der Plans
          </h2>
          <p className="text-xl" style={{ color: "var(--text-light)" }}>
            Finde den perfekten Plan für deine Bedürfnisse
          </p>
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ background: "var(--background-elevated)", borderBottom: "2px solid rgba(255,255,255,0.1)" }}>
                <th className="px-6 py-4 text-left font-bold" style={{ color: "var(--text-dark)" }}>
                  Features
                </th>
                <th className="px-6 py-4 text-center">
                  <div className="text-2xl mb-2">🚀</div>
                  <div className="font-bold" style={{ color: "var(--text-dark)" }}>Starter</div>
                  <div className="text-sm" style={{ color: "var(--text-light)" }}>Kostenlos</div>
                </th>
                <th className="px-6 py-4 text-center" style={{ background: "rgba(139, 92, 246, 0.12)", borderLeft: "2px solid rgba(139, 92, 246, 0.3)", borderRight: "2px solid rgba(139, 92, 246, 0.3)" }}>
                  <div className="text-2xl mb-2">💎</div>
                  <div className="font-bold" style={{ color: "#c4b5fd" }}>Pro</div>
                  <div className="text-sm" style={{ color: "#ddd6fe" }}>€29/Monat</div>
                </th>
                <th className="px-6 py-4 text-center">
                  <div className="text-2xl mb-2">👑</div>
                  <div className="font-bold" style={{ color: "var(--text-dark)" }}>Agency</div>
                  <div className="text-sm" style={{ color: "var(--text-light)" }}>€99/Monat</div>
                </th>
              </tr>
            </thead>
            <tbody style={{ borderTop: "1px solid rgba(255,255,255,0.1)" }}>
              {comparisonData.map((row, idx) => (
                <tr
                  key={idx}
                  style={{
                    background: idx % 2 === 0 ? "var(--background)" : "rgba(255,255,255,0.02)",
                    borderBottom: "1px solid rgba(255,255,255,0.05)",
                  }}
                >
                  <td className="px-6 py-4 font-semibold" style={{ color: "var(--text-dark)" }}>
                    {row.feature}
                  </td>
                  <td className="px-6 py-4 text-center" style={{ color: "var(--text-light)" }}>
                    {row.starter}
                  </td>
                  <td className="px-6 py-4 text-center font-bold" style={{ background: "rgba(139, 92, 246, 0.12)", color: "#e9d5ff" }}>
                    {row.pro}
                  </td>
                  <td className="px-6 py-4 text-center" style={{ color: "var(--text-light)" }}>
                    {row.agency}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden space-y-6">
          {[
            {
              title: "🚀 Starter",
              price: "Kostenlos",
              color: "#3b82f6",
            },
            {
              title: "💎 Pro",
              price: "€29/Monat",
              color: "#8b5cf6",
            },
            {
              title: "👑 Agency",
              price: "€99/Monat",
              color: "#f59e0b",
            },
          ].map((plan, idx) => (
            <div
              key={idx}
              className="p-6 rounded-xl"
              style={{
                background: "var(--background-elevated)",
                border: `1px solid ${plan.color}40`,
              }}
            >
              <h3 className="text-xl font-bold mb-2" style={{ color: "var(--text-dark)" }}>
                {plan.title}
              </h3>
              <p className="text-lg font-bold mb-4" style={{ color: plan.color }}>
                {plan.price}
              </p>
              <div className="space-y-2 text-sm" style={{ color: "var(--text-light)" }}>
                {comparisonData.map((row, jdx) => (
                  <div key={jdx} className="flex justify-between">
                    <span>{row.feature}</span>
                    <span className="font-semibold">
                      {idx === 0 && row.starter}
                      {idx === 1 && row.pro}
                      {idx === 2 && row.agency}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <p className="text-lg mb-8" style={{ color: "var(--text-light)" }}>
            Alle Plans haben 30 Tage Geld-Zurück-Garantie 🛡️
          </p>
          <Link href="/api/checkout?plan=pro&source=comparison-table" className="inline-block px-10 py-4 text-white font-bold text-lg rounded-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105" style={{ background: "var(--success)" }}>
            Jetzt upgraden
          </Link>
        </div>
      </div>
    </div>
  );
}

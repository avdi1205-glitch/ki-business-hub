"use client";

import React from "react";

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
    <div className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            📊 Vergleich der Plans
          </h2>
          <p className="text-xl text-slate-600">
            Finde den perfekten Plan für deine Bedürfnisse
          </p>
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-slate-50 to-slate-100 border-b-2 border-slate-200">
                <th className="px-6 py-4 text-left font-bold text-slate-900">
                  Features
                </th>
                <th className="px-6 py-4 text-center">
                  <div className="text-2xl mb-2">🚀</div>
                  <div className="font-bold text-slate-900">Starter</div>
                  <div className="text-sm text-slate-600">Kostenlos</div>
                </th>
                <th className="px-6 py-4 text-center bg-gradient-to-br from-purple-100 to-violet-100 ring-2 ring-purple-300">
                  <div className="text-2xl mb-2">💎</div>
                  <div className="font-bold text-slate-900">Pro</div>
                  <div className="text-sm text-purple-600">€29/Monat</div>
                </th>
                <th className="px-6 py-4 text-center">
                  <div className="text-2xl mb-2">👑</div>
                  <div className="font-bold text-slate-900">Agency</div>
                  <div className="text-sm text-slate-600">€99/Monat</div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {comparisonData.map((row, idx) => (
                <tr
                  key={idx}
                  className={idx % 2 === 0 ? "bg-white" : "bg-slate-50"}
                >
                  <td className="px-6 py-4 font-semibold text-slate-900">
                    {row.feature}
                  </td>
                  <td className="px-6 py-4 text-center text-slate-700">
                    {row.starter}
                  </td>
                  <td className="px-6 py-4 text-center font-bold bg-gradient-to-br from-purple-50 to-violet-50 text-purple-600">
                    {row.pro}
                  </td>
                  <td className="px-6 py-4 text-center text-slate-700">
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
              gradient: "from-blue-100 to-cyan-100",
            },
            {
              title: "💎 Pro",
              price: "€29/Monat",
              gradient: "from-purple-100 to-violet-100",
            },
            {
              title: "👑 Agency",
              price: "€99/Monat",
              gradient: "from-amber-100 to-yellow-100",
            },
          ].map((plan, idx) => (
            <div
              key={idx}
              className={`p-6 rounded-xl bg-gradient-to-br ${plan.gradient} border-2 border-gray-200`}
            >
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                {plan.title}
              </h3>
              <p className="text-lg font-bold text-slate-700 mb-4">
                {plan.price}
              </p>
              <div className="space-y-2 text-sm text-slate-700">
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
          <p className="text-lg text-slate-600 mb-8">
            Alle Plans haben 30 Tage Geld-Zurück-Garantie 🛡️
          </p>
          <button className="px-10 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold text-lg rounded-lg hover:shadow-2xl hover:shadow-green-500/50 transition-all duration-300 transform hover:scale-105">
            Jetzt upgraden
          </button>
        </div>
      </div>
    </div>
  );
}

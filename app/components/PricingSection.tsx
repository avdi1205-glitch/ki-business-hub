"use client";

import React from "react";

const pricingPlans = [
  {
    name: "Starter",
    emoji: "🚀",
    price: "Kostenlos",
    period: "Für immer",
    description: "Perfect für Anfänger",
    features: [
      "✅ 5 Artikel/Monat mit KI",
      "✅ Basis-Affiliate Links",
      "✅ Email-Support",
      "✅ Basic Analytics",
      "❌ Newsletter Automation",
      "❌ Advanced SEO Tools",
    ],
    cta: "Jetzt Starten",
    color: "from-blue-500 to-cyan-500",
    bgGradient: "from-blue-50 to-cyan-50",
    badge: "",
  },
  {
    name: "Pro",
    emoji: "💎",
    price: "€29",
    period: "pro Monat",
    description: "Für ernsthaft Verdienende",
    features: [
      "✅ 50 Artikel/Monat mit KI",
      "✅ Premium-Affiliate Links (47 Partner)",
      "✅ Priority Email & Chat Support",
      "✅ Advanced Analytics & Reports",
      "✅ Newsletter Automation",
      "✅ Keyword Research Tool",
    ],
    cta: "Pro Starten",
    color: "from-purple-500 to-violet-500",
    bgGradient: "from-purple-50 to-violet-50",
    badge: "BESTSELLER",
    highlight: true,
  },
  {
    name: "Agency",
    emoji: "👑",
    price: "€99",
    period: "pro Monat",
    description: "Für Agenturen & Teams",
    features: [
      "✅ Unbegrenzte Artikel mit KI",
      "✅ Alle Affiliate Links + Custom",
      "✅ 24/7 Priority Phone Support",
      "✅ Custom Reports & API Access",
      "✅ Team Management (5 Member)",
      "✅ White Label Option",
    ],
    cta: "Agency Kontaktieren",
    color: "from-amber-500 to-yellow-500",
    bgGradient: "from-amber-50 to-yellow-50",
    badge: "ENTERPRISE",
  },
];

export function PricingSection() {
  return (
    <div className="py-24 bg-gradient-to-b from-white to-slate-50">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            💰 Einfache, transparente Preise
          </h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Starte kostenlos. Upgrade jederzeit. Kein Vertrag erforderlich.
          </p>
        </div>

        {/* Pricing Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {pricingPlans.map((plan, idx) => (
            <div
              key={idx}
              className={`relative rounded-2xl overflow-hidden transition-all duration-300 transform hover:scale-105 ${
                plan.highlight ? "ring-2 ring-purple-500 md:scale-105" : ""
              }`}
            >
              {/* Background */}
              <div className={`absolute inset-0 bg-gradient-to-br ${plan.bgGradient}`} />

              {/* Badge */}
              {plan.badge && (
                <div className={`absolute top-4 right-4 px-4 py-1 bg-gradient-to-r ${plan.color} text-white text-xs font-bold rounded-full`}>
                  {plan.badge}
                </div>
              )}

              {/* Content */}
              <div className="relative z-10 p-8 h-full flex flex-col">
                {/* Header */}
                <div className="mb-6">
                  <div className="text-5xl mb-3">{plan.emoji}</div>
                  <h3 className="text-2xl font-bold text-slate-900">{plan.name}</h3>
                  <p className="text-sm text-slate-600">{plan.description}</p>
                </div>

                {/* Price */}
                <div className="mb-6">
                  <div className={`text-4xl font-bold bg-gradient-to-r ${plan.color} bg-clip-text text-transparent`}>
                    {plan.price}
                  </div>
                  <p className="text-sm text-slate-600">{plan.period}</p>
                </div>

                {/* Features */}
                <div className="flex-1 mb-6 space-y-3">
                  {plan.features.map((feature, fidx) => (
                    <div key={fidx} className="flex items-start gap-2">
                      <span className="text-lg mt-1">{feature.includes("✅") ? "✅" : "❌"}</span>
                      <span className={feature.includes("✅") ? "text-slate-700" : "text-slate-400"}>
                        {feature.replace("✅ ", "").replace("❌ ", "")}
                      </span>
                    </div>
                  ))}
                </div>

                {/* CTA Button */}
                <button
                  className={`w-full py-3 px-4 rounded-lg font-bold text-white transition-all duration-300 transform hover:scale-105 bg-gradient-to-r ${plan.color} hover:shadow-lg ${
                    plan.highlight ? "ring-2 ring-offset-2 ring-purple-500" : ""
                  }`}
                >
                  {plan.cta}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Money-Back Guarantee */}
        <div className="max-w-2xl mx-auto p-8 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 text-center">
          <h3 className="text-2xl font-bold text-slate-900 mb-2">
            🛡️ 30-Tage Geld-zurück-Garantie
          </h3>
          <p className="text-slate-600">
            Nicht zufrieden? Volle Rückerstattung. Keine Fragen gestellt.
          </p>
        </div>
      </div>
    </div>
  );
}

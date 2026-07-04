"use client";

import React from "react";
import Link from "next/link";

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
    color: "#3b82f6",
    badge: "",
    href: "/content-factory",
  },
  {
    name: "Pro",
    emoji: "💎",
    price: "€39",
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
    color: "#8b5cf6",
    badge: "BESTSELLER",
    highlight: true,
    href: "/api/checkout?plan=pro&source=pricing-card-pro",
  },
  {
    name: "Agency",
    emoji: "👑",
    price: "€149",
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
    color: "#f59e0b",
    badge: "ENTERPRISE",
    href: "/api/checkout?plan=agency&source=pricing-card-agency",
  },
];

export function PricingSection() {
  return (
    <div style={{ background: "var(--background)" }} className="py-24">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: "var(--text-dark)" }}>
            💰 Einfache, transparente Preise
          </h2>
          <p className="text-xl max-w-2xl mx-auto" style={{ color: "#cbd5e1" }}>
            Starte kostenlos. Upgrade jederzeit. Kein Vertrag erforderlich.
          </p>
        </div>

        {/* Pricing Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {pricingPlans.map((plan, idx) => (
            <div
              key={idx}
              className="relative rounded-2xl overflow-hidden transition-all duration-300 transform hover:scale-105"
              style={{
                background: "var(--background-elevated)",
                border: plan.highlight ? `2px solid ${plan.color}` : `1px solid rgba(255,255,255,0.1)`,
                transform: plan.highlight ? "scale(1.05)" : "scale(1)",
              }}
            >
              {/* Badge */}
              {plan.badge && (
                <div className="absolute top-4 right-4 px-4 py-1 text-white text-xs font-bold rounded-full" style={{ background: plan.color }}>
                  {plan.badge}
                </div>
              )}

              {/* Content */}
              <div className="relative z-10 p-8 h-full flex flex-col">
                {/* Header */}
                <div className="mb-6">
                  <div className="text-5xl mb-3">{plan.emoji}</div>
                  <h3 className="text-2xl font-bold" style={{ color: "var(--text-dark)" }}>{plan.name}</h3>
                  <p className="text-sm" style={{ color: "#cbd5e1" }}>{plan.description}</p>
                </div>

                {/* Price */}
                <div className="mb-6">
                  <div className="text-4xl font-bold" style={{ color: plan.color }}>
                    {plan.price}
                  </div>
                  <p className="text-sm" style={{ color: "#94a3b8" }}>{plan.period}</p>
                </div>

                {/* Features */}
                <div className="flex-1 mb-6 space-y-3">
                  {plan.features.map((feature, fidx) => (
                    <div key={fidx} className="flex items-start gap-2">
                      <span className="text-lg mt-1">{feature.includes("✅") ? "✅" : "❌"}</span>
                        <span style={{ color: feature.includes("✅") ? "#e2e8f0" : "#cbd5e1" }}>
                        {feature.replace("✅ ", "").replace("❌ ", "")}
                      </span>
                    </div>
                  ))}
                </div>

                {/* CTA Button */}
                <Link
                  href={plan.href}
                  className="block w-full rounded-lg px-4 py-3 text-center font-bold text-white transition-all duration-300 hover:scale-105 hover:shadow-lg"
                  style={{ background: plan.color }}
                >
                  {plan.cta}
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Money-Back Guarantee */}
        <div className="max-w-2xl mx-auto p-8 rounded-xl text-center" style={{ background: "rgba(16, 185, 129, 0.1)", border: "1px solid var(--success)" }}>
          <h3 className="text-2xl font-bold mb-2" style={{ color: "var(--text-dark)" }}>
            🛡️ 30-Tage Geld-zurück-Garantie
          </h3>
          <p style={{ color: "#e2e8f0" }}>
            Nicht zufrieden? Volle Rückerstattung. Keine Fragen gestellt.
          </p>
          <p className="mt-4 text-sm" style={{ color: "var(--text-muted)" }}>
            Für bezahlte Pläne kannst du `PRO_CHECKOUT_URL` und `AGENCY_CHECKOUT_URL` in Vercel hinterlegen.
          </p>
        </div>
      </div>
    </div>
  );
}

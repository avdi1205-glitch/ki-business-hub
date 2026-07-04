"use client";

import React from "react";

const features = [
  {
    icon: "🤖",
    title: "AI Content Factory",
    description: "Generiere 50+ professionelle Artikel/Monat automatisch",
    benefits: ["+2.000 Wörter pro Artikel", "SEO-optimiert", "Deutsche Qualität"],
    color: "#3b82f6",
    badge: "Most Popular",
  },
  {
    icon: "💰",
    title: "Affiliate Income",
    description: "Verdiene €1-€5 pro Click mit Best-In-Class Tools",
    benefits: ["47 Premium Partner", "€1.25 Durchschnitt", "Real-Time Tracking"],
    color: "#10b981",
    badge: "Highest Revenue",
  },
  {
    icon: "📧",
    title: "Newsletter Automation",
    description: "Sende automatisierte Kampagnen an 1.000+ Subscriber",
    benefits: ["35% Öffnungsrate", "Segmentierung", "A/B Testing"],
    color: "#8b5cf6",
    badge: "High Engagement",
  },
  {
    icon: "🔍",
    title: "SEO Analytics",
    description: "Optimiere deine Artikel für bessere Rankings",
    benefits: ["Score bis 100", "Keyword-Analyse", "Auto-Linking"],
    color: "#f59e0b",
    badge: "Rank Booster",
  },
];

export function FeaturesSection() {
  return (
    <div style={{ background: "var(--background)" }} className="py-24">
      <div className="max-w-6xl mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: "var(--text-dark)" }}>
            Die 4 Säulen deines Erfolgs
          </h2>
          <p className="text-xl max-w-2xl mx-auto" style={{ color: "var(--text-light)" }}>
            Alle Tools, die du brauchst um sofort €2.000+/Monat zu verdienen
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 gap-8">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className="relative group rounded-2xl overflow-hidden transition-all duration-300 transform hover:-translate-y-2"
              style={{
                background: "var(--background-elevated)",
                border: `2px solid ${feature.color}40`,
              }}
            >
              {/* Gradient Header */}
              <div className="h-1" style={{ background: feature.color }} />

              {/* Badge */}
              <div className="absolute top-4 right-4">
                <span className="px-3 py-1 rounded-full text-xs font-semibold text-white" style={{ background: feature.color }}>
                  {feature.badge}
                </span>
              </div>

              {/* Content */}
              <div className="p-8">
                {/* Icon */}
                <div className="text-5xl mb-4 w-16 h-16 flex items-center justify-center rounded-xl" style={{ background: `${feature.color}20` }}>
                  {feature.icon}
                </div>

                {/* Title */}
                <h3 className="text-2xl font-bold mb-2" style={{ color: feature.color }}>
                  {feature.title}
                </h3>

                {/* Description */}
                <p className="mb-6" style={{ color: "var(--text-light)" }}>
                  {feature.description}
                </p>

                {/* Benefits */}
                <ul className="space-y-2 mb-6">
                  {feature.benefits.map((benefit, bidx) => (
                    <li key={bidx} className="flex items-center gap-2 text-sm" style={{ color: "var(--text-muted)" }}>
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: feature.color }} />
                      {benefit}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <button className="w-full py-2 px-4 rounded-lg font-semibold transition-all duration-300 text-white hover:shadow-lg group-hover:scale-105" style={{ background: feature.color }}>
                  Jetzt aktivieren →
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <p className="mb-4" style={{ color: "var(--text-light)" }}>
            🚀 Alle Features sind in der kostenlosen Version enthalten
          </p>
          <button className="px-8 py-4 text-white font-bold text-lg rounded-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105" style={{ background: "var(--primary)" }}>
            Kostenlos Starten
          </button>
        </div>
      </div>
    </div>
  );
}

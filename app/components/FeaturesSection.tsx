"use client";

import React from "react";

const features = [
  {
    icon: "🤖",
    title: "AI Content Factory",
    description: "Generiere 50+ professionelle Artikel/Monat automatisch",
    benefits: ["+2.000 Wörter pro Artikel", "SEO-optimiert", "Deutsche Qualität"],
    color: "from-blue-500 to-cyan-500",
    bgColor: "bg-blue-50",
    textColor: "text-blue-600",
    badge: "Most Popular",
  },
  {
    icon: "💰",
    title: "Affiliate Income",
    description: "Verdiene €1-€5 pro Click mit Best-In-Class Tools",
    benefits: ["47 Premium Partner", "€1.25 Durchschnitt", "Real-Time Tracking"],
    color: "from-green-500 to-emerald-500",
    bgColor: "bg-green-50",
    textColor: "text-green-600",
    badge: "Highest Revenue",
  },
  {
    icon: "📧",
    title: "Newsletter Automation",
    description: "Sende automatisierte Kampagnen an 1.000+ Subscriber",
    benefits: ["35% Öffnungsrate", "Segmentierung", "A/B Testing"],
    color: "from-purple-500 to-violet-500",
    bgColor: "bg-purple-50",
    textColor: "text-purple-600",
    badge: "High Engagement",
  },
  {
    icon: "🔍",
    title: "SEO Analytics",
    description: "Optimiere deine Artikel für bessere Rankings",
    benefits: ["Score bis 100", "Keyword-Analyse", "Auto-Linking"],
    color: "from-orange-500 to-red-500",
    bgColor: "bg-orange-50",
    textColor: "text-orange-600",
    badge: "Rank Booster",
  },
];

export function FeaturesSection() {
  return (
    <div className="py-24 bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-6xl mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            Die 4 Säulen deines Erfolgs
          </h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Alle Tools, die du brauchst um sofort €2.000+/Monat zu verdienen
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 gap-8">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className="relative group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
            >
              {/* Gradient Header */}
              <div className={`h-2 bg-gradient-to-r ${feature.color}`} />

              {/* Badge */}
              <div className="absolute top-4 right-4">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold text-white bg-gradient-to-r ${feature.color}`}>
                  {feature.badge}
                </span>
              </div>

              {/* Content */}
              <div className="p-8">
                {/* Icon */}
                <div className={`text-5xl mb-4 ${feature.bgColor} w-16 h-16 flex items-center justify-center rounded-xl`}>
                  {feature.icon}
                </div>

                {/* Title */}
                <h3 className={`text-2xl font-bold mb-2 ${feature.textColor}`}>
                  {feature.title}
                </h3>

                {/* Description */}
                <p className="text-gray-600 mb-6">{feature.description}</p>

                {/* Benefits */}
                <ul className="space-y-2 mb-6">
                  {feature.benefits.map((benefit, bidx) => (
                    <li key={bidx} className="flex items-center gap-2 text-sm text-gray-700">
                      <span className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${feature.color}`} />
                      {benefit}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <button className={`w-full py-2 px-4 rounded-lg font-semibold transition-all duration-300 text-white bg-gradient-to-r ${feature.color} hover:shadow-lg group-hover:scale-105`}>
                  Jetzt aktivieren →
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <p className="text-gray-600 mb-4">
            🚀 Alle Features sind in der kostenlosen Version enthalten
          </p>
          <button className="px-8 py-4 bg-gradient-to-r from-blue-600 to-green-600 text-white font-bold text-lg rounded-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
            Kostenlos Starten
          </button>
        </div>
      </div>
    </div>
  );
}

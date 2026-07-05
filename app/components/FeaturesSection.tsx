"use client";

import Link from "next/link";
import React from "react";
import { useTranslations } from "next-intl";

const features = [
  {
    icon: "🤖",
    titleKey: "feature1Title",
    descriptionKey: "feature1Description",
    benefitsKeys: ["feature1Benefit1", "feature1Benefit2", "feature1Benefit3"],
    color: "#3b82f6",
    badgeKey: "feature1Badge",
    href: "/content-factory",
    ctaKey: "feature1Cta",
  },
  {
    icon: "💰",
    titleKey: "feature2Title",
    descriptionKey: "feature2Description",
    benefitsKeys: ["feature2Benefit1", "feature2Benefit2", "feature2Benefit3"],
    color: "#10b981",
    badgeKey: "feature2Badge",
    href: "/affiliate",
    ctaKey: "feature2Cta",
  },
  {
    icon: "📧",
    titleKey: "feature3Title",
    descriptionKey: "feature3Description",
    benefitsKeys: ["feature3Benefit1", "feature3Benefit2", "feature3Benefit3"],
    color: "#8b5cf6",
    badgeKey: "feature3Badge",
    href: "/content-factory",
    ctaKey: "feature3Cta",
    titleColor: "#c4b5fd",
    badgeTextColor: "#0f172a",
    ctaTextColor: "#0f172a",
  },
  {
    icon: "🔍",
    titleKey: "feature4Title",
    descriptionKey: "feature4Description",
    benefitsKeys: ["feature4Benefit1", "feature4Benefit2", "feature4Benefit3"],
    color: "#f59e0b",
    badgeKey: "feature4Badge",
    href: "/stats",
    ctaKey: "feature4Cta",
    titleColor: "#facc15",
    badgeTextColor: "#0f172a",
    ctaTextColor: "#0f172a",
  },
];

export function FeaturesSection() {
  const t = useTranslations("home");

  return (
    <div style={{ background: "var(--background)" }} className="py-24">
      <div className="max-w-6xl mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: "var(--text-dark)" }}>
            {t("featuresTitle")}
          </h2>
          <p className="text-xl max-w-2xl mx-auto" style={{ color: "var(--text-light)" }}>
            {t("featuresSubtitle")}
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
                <span
                  className="px-3 py-1 rounded-full text-xs font-semibold"
                  style={{ background: feature.color, color: (feature as { badgeTextColor?: string }).badgeTextColor || "#ffffff" }}
                >
                  {t(feature.badgeKey)}
                </span>
              </div>

              {/* Content */}
              <div className="p-8">
                {/* Icon */}
                <div className="text-5xl mb-4 w-16 h-16 flex items-center justify-center rounded-xl" style={{ background: `${feature.color}20` }}>
                  {feature.icon}
                </div>

                {/* Title */}
                <h3
                  className="text-2xl font-bold mb-2"
                  style={{ color: (feature as { titleColor?: string }).titleColor || feature.color }}
                >
                  {t(feature.titleKey)}
                </h3>

                {/* Description */}
                <p className="mb-6 leading-7" style={{ color: "var(--text-light)" }}>
                  {t(feature.descriptionKey)}
                </p>

                {/* Benefits */}
                <ul className="space-y-2 mb-6">
                  {feature.benefitsKeys.map((benefitKey, bidx) => (
                    <li key={bidx} className="flex items-center gap-2 text-sm" style={{ color: "var(--text-muted)" }}>
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: feature.color }} />
                      {t(benefitKey)}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Link
                  href={feature.href}
                  className="block w-full rounded-lg px-4 py-3 text-center font-semibold transition-all duration-300 hover:shadow-lg group-hover:scale-105"
                  style={{ background: feature.color, color: (feature as { ctaTextColor?: string }).ctaTextColor || "#ffffff" }}
                >
                  {t(feature.ctaKey)} →
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <p className="mb-4 text-lg" style={{ color: "var(--text-light)" }}>
            🚀 {t("featuresBottomCopy")}
          </p>
          <Link
            href="/content-factory"
            className="inline-block rounded-lg px-8 py-4 text-lg font-bold text-white transition-all duration-300 hover:scale-105 hover:shadow-2xl"
            style={{ background: "var(--primary)" }}
          >
            {t("featuresBottomCta")}
          </Link>
        </div>
      </div>
    </div>
  );
}

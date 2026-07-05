"use client";

import React from "react";
import Link from "next/link";
import CheckoutCtaButton from "./CheckoutCtaButton";
import { useLocale, useTranslations } from "next-intl";

const pricingPlans = [
  {
    name: "Starter",
    emoji: "🚀",
    price: "Kostenlos",
    period: "Für immer",
    descriptionKey: "pricingStarterDescription",
    features: [
      "pricingStarterFeature1",
      "pricingStarterFeature2",
      "pricingStarterFeature3",
      "pricingStarterFeature4",
      "pricingStarterFeature5",
      "pricingStarterFeature6",
    ],
    ctaKey: "pricingStarterCta",
    color: "#3b82f6",
    badge: "",
    href: "/content-factory",
  },
  {
    name: "Pro",
    emoji: "💎",
    price: "€39",
    period: "pro Monat",
    descriptionKey: "pricingProDescription",
    features: [
      "pricingProFeature1",
      "pricingProFeature2",
      "pricingProFeature3",
      "pricingProFeature4",
      "pricingProFeature5",
      "pricingProFeature6",
    ],
    ctaKey: "pricingProCta",
    color: "#8b5cf6",
    badge: "BESTER START",
    highlight: true,
    href: "/api/checkout?plan=pro&source=pricing-card-pro",
  },
  {
    name: "Agency",
    emoji: "👑",
    price: "€149",
    period: "pro Monat",
    descriptionKey: "pricingAgencyDescription",
    features: [
      "pricingAgencyFeature1",
      "pricingAgencyFeature2",
      "pricingAgencyFeature3",
      "pricingAgencyFeature4",
      "pricingAgencyFeature5",
      "pricingAgencyFeature6",
    ],
    ctaKey: "pricingAgencyCta",
    color: "#f59e0b",
    badge: "FÜR TEAMS",
    href: "/api/checkout?plan=agency&source=pricing-card-agency",
  },
];

export function PricingSection() {
  const t = useTranslations("home");
  const locale = useLocale();
  const isEn = locale === "en";

  const plans = pricingPlans.map((plan) => {
    if (plan.name === "Pro") {
      return {
        ...plan,
        period: isEn ? "per month" : "pro Monat",
        badge: isEn ? "BEST START" : "BESTER START",
      };
    }

    if (plan.name === "Agency") {
      return {
        ...plan,
        period: isEn ? "per month" : "pro Monat",
        badge: isEn ? "FOR TEAMS" : "FÜR TEAMS",
      };
    }

    return {
      ...plan,
      price: isEn ? "Free" : "Kostenlos",
      period: isEn ? "Forever" : "Für immer",
    };
  });

  return (
    <div style={{ background: "linear-gradient(180deg, #111827 0%, #0f172a 100%)" }} className="py-24">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: "var(--text-dark)" }}>
            {t("pricingTitle")}
          </h2>
          <p className="text-xl max-w-2xl mx-auto" style={{ color: "var(--text-light)" }}>
            {t("pricingSubtitle")}
          </p>
        </div>

        {/* Pricing Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {plans.map((plan, idx) => (
            <div
              key={idx}
              className="relative rounded-2xl overflow-hidden transition-all duration-300 transform hover:scale-105"
              style={{
                background: "#1e293b",
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
                  <p className="text-sm" style={{ color: "var(--text-light)" }}>{t(plan.descriptionKey)}</p>
                </div>

                {/* Price */}
                <div className="mb-6">
                  <div className="text-4xl font-bold" style={{ color: plan.color }}>
                    {plan.price}
                  </div>
                  <p className="text-sm" style={{ color: "var(--text-muted)" }}>{plan.period}</p>
                  {plan.name !== "Starter" && (
                    <p className="mt-2 text-sm font-medium" style={{ color: "var(--text-light)" }}>
                      {plan.name === "Pro" ? t("pricingProHint") : t("pricingAgencyHint")}
                    </p>
                  )}
                </div>

                {/* Features */}
                <div className="flex-1 mb-6 space-y-3">
                  {plan.features.map((feature, fidx) => (
                    <div key={fidx} className="flex items-start gap-2">
                      <span className="text-lg mt-1">{t(feature).startsWith("❌") ? "❌" : "✅"}</span>
                        <span style={{ color: t(feature).startsWith("❌") ? "var(--text-muted)" : "var(--text-light)" }}>
                        {t(feature).replace("✅ ", "").replace("❌ ", "")}
                      </span>
                    </div>
                  ))}
                </div>

                {/* CTA Button */}
                {plan.name === "Pro" || plan.name === "Agency" ? (
                  <CheckoutCtaButton
                    href={plan.href}
                    ctaKey={`pricing-${plan.name.toLowerCase()}`}
                    variantA={{
                      label: `🚀 ${t(plan.ctaKey)}`,
                      sourceSuffix: "variant-a",
                      className: "block w-full rounded-lg px-4 py-3 text-center font-bold text-white transition-all duration-300 hover:scale-105 hover:shadow-lg",
                    }}
                    variantB={{
                      label: plan.name === "Pro" ? `⚡ ${t("pricingProVariantB")}` : `🏢 ${t("pricingAgencyVariantB")}`,
                      sourceSuffix: "variant-b",
                      className: "block w-full rounded-lg px-4 py-3 text-center font-bold text-white transition-all duration-300 hover:scale-105 hover:shadow-lg",
                    }}
                  />
                ) : (
                  <Link
                    href={plan.href}
                    className="block w-full rounded-lg px-4 py-3 text-center font-bold text-white transition-all duration-300 hover:scale-105 hover:shadow-lg"
                    style={{ background: plan.color }}
                  >
                    {t(plan.ctaKey)}
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Money-Back Guarantee */}
        <div className="max-w-2xl mx-auto p-8 rounded-xl text-center" style={{ background: "rgba(5, 150, 105, 0.16)", border: "1px solid var(--success)" }}>
          <h3 className="text-2xl font-bold mb-2" style={{ color: "var(--text-dark)" }}>
            {t("pricingGuaranteeTitle")}
          </h3>
          <p style={{ color: "var(--text-light)" }}>
            {t("pricingGuaranteeBody")}
          </p>
          <p className="mt-4 text-sm" style={{ color: "#d1fae5" }}>
            {t("pricingEnvNote")}
          </p>
        </div>
      </div>
    </div>
  );
}

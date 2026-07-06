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
    <section className="relative overflow-hidden py-24">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_10%,rgba(14,165,233,0.09),transparent_25%),radial-gradient(circle_at_88%_18%,rgba(168,85,247,0.08),transparent_22%),linear-gradient(180deg,rgba(15,23,42,0),rgba(15,23,42,0.45))]" />

      <div className="relative mx-auto max-w-7xl px-4">
        {/* Header */}
        <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr] lg:items-end">
          <div>
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.28em] text-cyan-300/80">Pricing</p>
            <h2 className="display-heading max-w-xl text-4xl font-black text-white sm:text-5xl md:text-6xl">
              {t("pricingTitle")}
            </h2>
          </div>
          <p className="max-w-2xl text-lg leading-8 text-slate-300 sm:text-xl lg:justify-self-end">
            {t("pricingSubtitle")}
          </p>
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-3">
          <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5 backdrop-blur-xl transition-transform duration-300 hover:-translate-y-1 md:translate-y-6">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-cyan-300/80">Schnell starten</p>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              Kostenlos testen und den ersten Workflow ohne Risiko aufsetzen.
            </p>
          </div>
          <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5 backdrop-blur-xl transition-transform duration-300 hover:-translate-y-1">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-violet-300/80">Am meisten Nutzen</p>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              Pro ist der klare Sweet Spot fuer mehr Volumen, Automatisierung und Klicks.
            </p>
          </div>
          <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5 backdrop-blur-xl transition-transform duration-300 hover:-translate-y-1 md:-translate-y-4">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-amber-300/80">Fuer Teams</p>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              Agency lohnt sich, wenn mehrere Personen oder Workflows parallel laufen.
            </p>
          </div>
        </div>

        {/* Pricing Grid */}
        <div className="mt-14 grid gap-8 md:grid-cols-3">
          {plans.map((plan, idx) => (
            <div
              key={idx}
              className={`group relative overflow-hidden rounded-[2rem] transition-all duration-300 hover:-translate-y-2 ${plan.highlight ? "md:translate-y-[-1rem]" : idx === 0 ? "md:translate-y-6" : "md:translate-y-2"}`}
              style={{
                background:
                  "linear-gradient(180deg, rgba(15,23,42,0.92) 0%, rgba(15,23,42,0.72) 100%)",
                border: plan.highlight ? `1px solid ${plan.color}66` : "1px solid rgba(255,255,255,0.1)",
                boxShadow: plan.highlight
                  ? `0 30px 80px rgba(139, 92, 246, 0.25), inset 0 1px 0 rgba(255,255,255,0.06)`
                  : "0 22px 60px rgba(2, 6, 23, 0.26)",
              }}
            >
              <div className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" style={{ background: `radial-gradient(circle at top, ${plan.color}18, transparent 48%)` }} />

              {/* Badge */}
              {plan.badge && (
                <div className="absolute right-4 top-4 rounded-full px-4 py-1 text-xs font-black tracking-[0.18em] text-slate-950" style={{ background: plan.color }}>
                  {plan.badge}
                </div>
              )}

              {/* Content */}
              <div className="relative z-10 flex h-full flex-col p-8">
                {/* Header */}
                <div className="mb-6">
                  <div className="mb-3 text-5xl transition-transform duration-300 group-hover:scale-105">{plan.emoji}</div>
                  <h3 className="text-2xl font-black text-white">{plan.name}</h3>
                  <p className="text-sm text-slate-300">{t(plan.descriptionKey)}</p>
                </div>

                {/* Price */}
                <div className="mb-6">
                  <div className="text-4xl font-black" style={{ color: plan.color }}>
                    {plan.price}
                  </div>
                  <p className="text-sm text-slate-400">{plan.period}</p>
                  <p className="mt-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">
                    {plan.name === "Starter"
                      ? (isEn ? "Best for testing" : "Gut zum Testen")
                      : plan.name === "Pro"
                        ? (isEn ? "Best value" : "Bester Nutzen")
                        : (isEn ? "Best for teams" : "Fuer Teams")}
                  </p>
                  {plan.name !== "Starter" && (
                    <p className="mt-2 text-sm font-medium text-slate-300">
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
                      className: "block w-full rounded-2xl px-4 py-3 text-center font-black text-white transition-all duration-300 hover:-translate-y-1 hover:shadow-lg",
                    }}
                    variantB={{
                      label: plan.name === "Pro" ? `⚡ ${t("pricingProVariantB")}` : `🏢 ${t("pricingAgencyVariantB")}`,
                      sourceSuffix: "variant-b",
                      className: "block w-full rounded-2xl px-4 py-3 text-center font-black text-white transition-all duration-300 hover:-translate-y-1 hover:shadow-lg",
                    }}
                  />
                ) : (
                  <Link
                    href={plan.href}
                    className="block w-full rounded-2xl px-4 py-3 text-center font-black text-white transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
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
        <div className="mx-auto mt-16 max-w-3xl rounded-[2rem] border border-emerald-400/20 bg-emerald-500/10 p-8 text-center backdrop-blur-xl">
          <h3 className="mb-2 text-2xl font-black text-white">
            {t("pricingGuaranteeTitle")}
          </h3>
          <p className="text-slate-300">
            {t("pricingGuaranteeBody")}
          </p>
          <p className="mt-4 text-sm text-emerald-200">
            {t("pricingEnvNote")}
          </p>
        </div>
      </div>
    </section>
  );
}

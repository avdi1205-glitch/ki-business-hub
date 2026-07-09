"use client";

import React from "react";
import Link from "next/link";
import CheckoutCtaButton from "./CheckoutCtaButton";
import { useLocale, useTranslations } from "next-intl";

const pricingPlans = [
  {
    name: "Starter",
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
    href: "/content-factory",
    highlight: false,
  },
  {
    name: "Pro",
    price: "EUR39",
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
    badge: "Empfohlen",
    highlight: true,
    href: "/api/checkout?plan=pro&source=pricing-card-pro",
  },
  {
    name: "Agency",
    price: "EUR149",
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
    href: "/api/checkout?plan=agency&source=pricing-card-agency",
    highlight: false,
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
        price: "EUR39",
        period: isEn ? "per month" : "pro Monat",
        badge: isEn ? "Recommended" : "Empfohlen",
      };
    }
    if (plan.name === "Agency") {
      return {
        ...plan,
        price: "EUR149",
        period: isEn ? "per month" : "pro Monat",
      };
    }
    return {
      ...plan,
      price: isEn ? "Free" : "Kostenlos",
      period: isEn ? "Forever" : "Für immer",
    };
  });

  function formatPrice(raw: string) {
    return raw.replace("EUR", "\u20AC");
  }

  return (
    <section className="py-28" style={{ background: "#080e1a" }}>
      <div className="mx-auto max-w-6xl px-6 sm:px-8 lg:px-10">
        <div className="mb-16 max-w-xl">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-500">
            {isEn ? "Pricing" : "Preise"}
          </p>
          <h2 className="text-4xl font-black text-white sm:text-5xl">
            {t("pricingTitle")}
          </h2>
          <p className="mt-4 text-lg text-slate-400">
            {t("pricingSubtitle")}
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={[
                "relative flex flex-col rounded-2xl border p-7 transition-all duration-200 hover:-translate-y-1",
                plan.highlight
                  ? "border-cyan-500/40 bg-cyan-950/20"
                  : "border-white/[0.08] bg-white/[0.025]",
              ].join(" ")}
            >
              {plan.badge && (
                <span className="absolute -top-3 left-6 rounded-full border border-cyan-500/30 bg-[#080e1a] px-3 py-0.5 text-xs font-semibold text-cyan-300">
                  {plan.badge}
                </span>
              )}

              <div className="mb-6">
                <h3 className="text-lg font-bold text-white">{plan.name}</h3>
                <p className="mt-1 text-sm text-slate-500">{t(plan.descriptionKey)}</p>
              </div>

              <div className="mb-8">
                <span className="text-4xl font-black text-white">{formatPrice(plan.price)}</span>
                <span className="ml-2 text-sm text-slate-500">{plan.period}</span>
              </div>

              <ul className="mb-8 flex-1 space-y-3">
                {plan.features.map((feature) => {
                  const text = t(feature);
                  const isNo = text.startsWith("\u274C");
                  return (
                    <li key={feature} className="flex items-start gap-2.5">
                      <span className={["mt-0.5 shrink-0 text-sm", isNo ? "text-slate-700" : "text-emerald-400"].join(" ")}>
                        {isNo ? "\u2014" : "\u2713"}
                      </span>
                      <span className={["text-sm leading-6", isNo ? "text-slate-600" : "text-slate-300"].join(" ")}>
                        {text.replace("\u2705 ", "").replace("\u274C ", "")}
                      </span>
                    </li>
                  );
                })}
              </ul>

              {plan.name === "Starter" ? (
                <Link
                  href={plan.href}
                  className="block w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-center text-sm font-semibold text-slate-200 transition hover:bg-white/10"
                >
                  {t(plan.ctaKey)}
                </Link>
              ) : (
                <CheckoutCtaButton
                  href={plan.href}
                  ctaKey={["pricing", plan.name.toLowerCase()].join("-")}
                  variantA={{
                    label: t(plan.ctaKey),
                    sourceSuffix: "variant-a",
                    className: plan.highlight
                      ? "block w-full rounded-xl bg-cyan-500 px-4 py-3 text-center text-sm font-bold text-slate-950 transition hover:bg-cyan-400"
                      : "block w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-center text-sm font-semibold text-slate-200 transition hover:bg-white/10",
                  }}
                  variantB={{
                    label: plan.name === "Pro" ? t("pricingProVariantB") : t("pricingAgencyVariantB"),
                    sourceSuffix: "variant-b",
                    className: plan.highlight
                      ? "block w-full rounded-xl bg-cyan-500 px-4 py-3 text-center text-sm font-bold text-slate-950 transition hover:bg-cyan-400"
                      : "block w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-center text-sm font-semibold text-slate-200 transition hover:bg-white/10",
                  }}
                />
              )}
            </div>
          ))}
        </div>

        <div className="mt-12 rounded-2xl border border-white/[0.08] bg-white/[0.02] px-8 py-6 text-center">
          <p className="text-sm font-semibold text-white">{t("pricingGuaranteeTitle")}</p>
          <p className="mt-1 text-sm text-slate-500">{t("pricingGuaranteeBody")}</p>
        </div>
      </div>
    </section>
  );
}

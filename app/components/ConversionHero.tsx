"use client";

import React from "react";
import Link from "next/link";
import CheckoutCtaButton from "./CheckoutCtaButton";
import { useLocale, useTranslations } from "next-intl";

export default function ConversionHero() {
  const t = useTranslations("home");
  const locale = useLocale();

  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      {/* Ambient background glow */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-cyan-500/6 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 animate-pulse delay-500" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 py-14 md:py-16 text-center">
        {/* Main Headline */}
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-5 bg-gradient-to-r from-blue-400 via-cyan-400 to-green-400 bg-clip-text text-transparent leading-tight">
          {t("heroTitle1")}
          <br />
          {t("heroTitle2")}
        </h1>

        {/* Subheading */}
        <p className="text-lg md:text-xl text-gray-300 mb-6 max-w-3xl mx-auto leading-8">
          {t("heroSubtitle")}
          <span className="text-green-400 font-semibold"> {t("heroHighlight")}</span>
          {locale === "en"
            ? " and switch up only when it pays off."
            : " und wechsle erst hoch, wenn es sich fuer dich lohnt."}
        </p>

        {/* CTA Section */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
          {/* Primary CTA */}
          <CheckoutCtaButton
            href="/content-factory"
            ctaKey="hero-start"
            variantA={{
              label: `🚀 ${t("heroPrimaryCta")}`,
              sourceSuffix: "free-start",
              className: "group relative px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold text-lg rounded-lg hover:shadow-2xl hover:shadow-green-500/50 transition-all duration-300 transform hover:scale-105 active:scale-95",
            }}
            variantB={{
              label: `⚡ ${t("heroPrimaryAltCta")}`,
              sourceSuffix: "direct-start",
              className: "group relative px-8 py-4 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-bold text-lg rounded-lg hover:shadow-2xl hover:shadow-emerald-500/50 transition-all duration-300 transform hover:scale-105 active:scale-95",
            }}
          />

          {/* Secondary CTA - Pro */}
          <CheckoutCtaButton
            href="/api/checkout?plan=pro"
            ctaKey="hero-pro"
            variantA={{
              label: `Pro – 39 €`,
              sourceSuffix: "price-view",
              className: "px-8 py-4 bg-blue-500/20 border-2 border-blue-400 text-blue-300 font-bold text-lg rounded-lg hover:bg-blue-500/30 transition-all duration-300",
            }}
            variantB={{
              label: `Pro freischalten`,
              sourceSuffix: "direct-pro",
              className: "px-8 py-4 bg-blue-500/20 border-2 border-blue-400 text-blue-300 font-bold text-lg rounded-lg hover:bg-blue-500/30 transition-all duration-300",
            }}
          />

          {/* Agency CTA */}
          <CheckoutCtaButton
            href="/api/checkout?plan=agency"
            ctaKey="hero-agency"
            variantA={{
              label: `Agency – 149 €`,
              sourceSuffix: "price-view",
              className: "px-8 py-4 bg-cyan-500/20 border-2 border-cyan-400 text-cyan-200 font-bold text-lg rounded-lg hover:bg-cyan-500/30 transition-all duration-300",
            }}
            variantB={{
              label: `Agency freischalten`,
              sourceSuffix: "direct-agency",
              className: "px-8 py-4 bg-cyan-500/20 border-2 border-cyan-400 text-cyan-200 font-bold text-lg rounded-lg hover:bg-cyan-500/30 transition-all duration-300",
            }}
          />
        </div>

        <div className="mb-6 text-sm text-gray-300">
          <p className="mb-3">
            {locale === "en"
              ? "Start free, compare tools, or go straight to recommendations."
              : "Kostenlos starten, Tools vergleichen oder direkt zu Empfehlungen gehen."}
          </p>

          <div className="grid gap-3 md:grid-cols-3">
            <Link href="/content-factory" className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-left transition hover:bg-white/10">
              <p className="font-bold text-green-300">{locale === "en" ? "Free start" : "Kostenlos starten"}</p>
              <p className="mt-1 text-sm leading-6 text-gray-300">
                {locale === "en"
                  ? "Use the content factory to create your first workflow."
                  : "Nutze die Content-Factory fuer den ersten Workflow."}
              </p>
            </Link>
            <Link href="/tools" className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-left transition hover:bg-white/10">
              <p className="font-bold text-cyan-300">{locale === "en" ? "Compare tools" : "Tools vergleichen"}</p>
              <p className="mt-1 text-sm leading-6 text-gray-300">
                {locale === "en"
                  ? "Check ratings, pricing, and fit in one place."
                  : "Bewertungen, Preise und Passung an einem Ort sehen."}
              </p>
            </Link>
            <Link href="/affiliate" className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-left transition hover:bg-white/10">
              <p className="font-bold text-emerald-300">{locale === "en" ? "Best recommendations" : "Beste Empfehlungen"}</p>
              <p className="mt-1 text-sm leading-6 text-gray-300">
                {locale === "en"
                  ? "Go directly to the strongest affiliate picks."
                  : "Direkt zu den staerksten Affiliate-Empfehlungen."}
              </p>
            </Link>
          </div>
        </div>

      </div>

    </div>
  );
}

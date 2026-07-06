"use client";

import React from "react";
import Link from "next/link";
import CheckoutCtaButton from "./CheckoutCtaButton";
import { useLocale, useTranslations } from "next-intl";

export default function ConversionHero() {
  const t = useTranslations("home");
  const locale = useLocale();

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 min-h-screen flex items-center">
      {/* Animated Background Gradients */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Primary Glow */}
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" />
        {/* Secondary Glow */}
        <div className="absolute top-1/2 right-0 w-96 h-96 bg-blue-500/8 rounded-full blur-3xl animate-pulse delay-1000" />
        {/* Tertiary Glow */}
        <div className="absolute -bottom-40 left-1/2 w-80 h-80 bg-emerald-500/8 rounded-full blur-3xl animate-pulse delay-500 -translate-x-1/2" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
      {/* Main Headline */}
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black mb-8 bg-gradient-to-r from-blue-300 via-cyan-300 to-emerald-300 bg-clip-text text-transparent leading-[1.1] tracking-tight">
          {t("heroTitle1")}
          <br />
          {t("heroTitle2")}
        </h1>

        {/* Subheading */}
        <p className="text-lg sm:text-xl lg:text-2xl text-slate-300 mb-8 max-w-3xl mx-auto leading-relaxed">
          {t("heroSubtitle")}
          <span className="text-emerald-400 font-bold"> {t("heroHighlight")}</span>
          {locale === "en"
            ? " and switch up only when it pays off."
            : " und wechsle erst hoch, wenn es sich lohnt."}
        </p>

        {/* CTA Section - Enhanced Layout */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          {/* Primary CTA */}
          <CheckoutCtaButton
            href="/content-factory"
            ctaKey="hero-start"
            variantA={{
              label: `🚀 ${t("heroPrimaryCta")}`,
              sourceSuffix: "free-start",
              className: "group relative px-8 py-4 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-bold text-lg rounded-xl hover:shadow-2xl hover:shadow-emerald-500/50 transition-all duration-300 transform hover:scale-105 active:scale-95 hover:-translate-y-1 shadow-lg shadow-emerald-500/30",
            }}
            variantB={{
              label: `⚡ ${t("heroPrimaryAltCta")}`,
              sourceSuffix: "direct-start",
              className: "group relative px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-lg rounded-xl hover:shadow-2xl hover:shadow-cyan-500/50 transition-all duration-300 transform hover:scale-105 active:scale-95 hover:-translate-y-1 shadow-lg shadow-cyan-500/30",
            }}
          />

          {/* Secondary CTA - Pro */}
          <CheckoutCtaButton
            href="/api/checkout?plan=pro"
            ctaKey="hero-pro"
            variantA={{
              label: `💎 Pro – 39 €`,
              sourceSuffix: "price-view",
              className: "px-8 py-4 bg-gradient-to-br from-blue-500/20 to-blue-600/20 backdrop-blur-md border-2 border-blue-400/50 text-blue-200 font-bold text-lg rounded-xl hover:bg-blue-500/30 hover:border-blue-300 hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-300 hover:-translate-y-1",
            }}
            variantB={{
              label: `✨ Pro freischalten`,
              sourceSuffix: "direct-pro",
              className: "px-8 py-4 bg-gradient-to-br from-blue-500/20 to-blue-600/20 backdrop-blur-md border-2 border-blue-400/50 text-blue-200 font-bold text-lg rounded-xl hover:bg-blue-500/30 hover:border-blue-300 hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-300 hover:-translate-y-1",
            }}
          />

          {/* Agency CTA */}
          <CheckoutCtaButton
            href="/api/checkout?plan=agency"
            ctaKey="hero-agency"
            variantA={{
              label: `👑 Agency – 149 €`,
              sourceSuffix: "price-view",
              className: "px-8 py-4 bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-md border-2 border-purple-400/50 text-purple-200 font-bold text-lg rounded-xl hover:bg-purple-500/30 hover:border-purple-300 hover:shadow-lg hover:shadow-purple-500/30 transition-all duration-300 hover:-translate-y-1",
            }}
            variantB={{
              label: `🔥 Agency freischalten`,
              sourceSuffix: "direct-agency",
              className: "px-8 py-4 bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-md border-2 border-purple-400/50 text-purple-200 font-bold text-lg rounded-xl hover:bg-purple-500/30 hover:border-purple-300 hover:shadow-lg hover:shadow-purple-500/30 transition-all duration-300 hover:-translate-y-1",
            }}
          />
        </div>

        {/* Secondary CTA Cards - Improved Design */}
        <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Link href="/content-factory" className="group relative rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 backdrop-blur-md px-6 py-8 transition-all hover:bg-emerald-500/20 hover:border-emerald-500/60 hover:shadow-lg hover:shadow-emerald-500/20">
            <p className="text-2xl mb-2">🎯</p>
            <p className="font-bold text-emerald-300 text-lg">{locale === "en" ? "Free start" : "Kostenlos starten"}</p>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              {locale === "en"
                ? "Use the content factory to create your first workflow."
                : "Nutze die Content-Factory für deinen ersten Workflow."}
            </p>
          </Link>

          <Link href="/tools" className="group relative rounded-2xl border border-cyan-500/30 bg-gradient-to-br from-cyan-500/10 to-cyan-600/5 backdrop-blur-md px-6 py-8 transition-all hover:bg-cyan-500/20 hover:border-cyan-500/60 hover:shadow-lg hover:shadow-cyan-500/20">
            <p className="text-2xl mb-2">🔍</p>
            <p className="font-bold text-cyan-300 text-lg">{locale === "en" ? "Compare tools" : "Tools vergleichen"}</p>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              {locale === "en"
                ? "Check ratings, pricing, and fit in one place."
                : "Bewertungen, Preise und Passung an einem Ort."}
            </p>
          </Link>

          <Link href="/affiliate" className="group relative rounded-2xl border border-blue-500/30 bg-gradient-to-br from-blue-500/10 to-blue-600/5 backdrop-blur-md px-6 py-8 transition-all hover:bg-blue-500/20 hover:border-blue-500/60 hover:shadow-lg hover:shadow-blue-500/20">
            <p className="text-2xl mb-2">⭐</p>
            <p className="font-bold text-blue-300 text-lg">{locale === "en" ? "Best recommendations" : "Beste Empfehlungen"}</p>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              {locale === "en"
                ? "Go directly to the strongest affiliate picks."
                : "Direkt zu den stärksten Affiliate-Empfehlungen."}
            </p>
          </Link>
        </div>

      </div>

    </div>
  );
}

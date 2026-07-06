"use client";

import React from "react";
import Link from "next/link";
import CheckoutCtaButton from "./CheckoutCtaButton";
import { useLocale, useTranslations } from "next-intl";

export default function ConversionHero() {
  const t = useTranslations("home");
  const locale = useLocale();

  return (
    <section className="relative overflow-hidden border-b border-white/5 bg-slate-950">
      <div className="absolute inset-0">
        <div className="absolute -left-24 top-24 h-72 w-72 rounded-full bg-cyan-500/15 blur-3xl animate-pulse-slow" />
        <div className="absolute right-0 top-28 h-96 w-96 rounded-full bg-violet-500/10 blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-emerald-500/10 blur-3xl animate-pulse-slow" />
        <div className="absolute inset-0 opacity-[0.15] [background-image:linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:36px_36px]" />
      </div>

      <div className="relative mx-auto grid min-h-[92svh] max-w-7xl gap-8 px-4 py-16 sm:px-6 lg:grid-cols-[1.25fr_0.75fr] lg:px-8 lg:py-24">
        <div className="flex flex-col justify-center">
          <p className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-500/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.28em] text-cyan-200 animate-fadeInUp">
            <span className="h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_20px_rgba(103,232,249,0.7)]" />
            {locale === "en" ? "Affiliate intelligence" : "Affiliate-Intelligenz"}
          </p>

          <h1 className="display-heading max-w-4xl text-5xl font-black text-white sm:text-6xl lg:text-8xl animate-fadeInUp">
            <span className="block bg-gradient-to-r from-cyan-200 via-sky-200 to-emerald-200 bg-clip-text text-transparent">
              {t("heroTitle1")}
            </span>
            <span className="block text-slate-50">{t("heroTitle2")}</span>
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300 sm:text-xl animate-fadeInUp">
            {t("heroSubtitle")}
            <span className="font-semibold text-emerald-300"> {t("heroHighlight")}</span>
            {locale === "en"
              ? " and switch up only when it pays off."
              : " und wechsle erst hoch, wenn es sich lohnt."}
          </p>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4 backdrop-blur-xl animate-fadeInUp">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Focus</p>
              <p className="mt-2 text-sm leading-6 text-slate-200">Weniger Lärm, mehr klare Pfade.</p>
            </div>
            <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4 backdrop-blur-xl animate-fadeInUp sm:translate-y-4">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Tempo</p>
              <p className="mt-2 text-sm leading-6 text-slate-200">Schneller von der Idee zum Klick.</p>
            </div>
            <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4 backdrop-blur-xl animate-fadeInUp lg:translate-y-8">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Signal</p>
              <p className="mt-2 text-sm leading-6 text-slate-200">Design mit stärkerer visuelle Hierarchie.</p>
            </div>
          </div>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <CheckoutCtaButton
              href="/content-factory"
              ctaKey="hero-start"
              variantA={{
                label: `🚀 ${t("heroPrimaryCta")}`,
                sourceSuffix: "free-start",
                className: "rounded-2xl border border-emerald-300/20 bg-gradient-to-r from-emerald-500 to-cyan-500 px-8 py-4 text-lg font-black text-white shadow-[0_18px_50px_rgba(16,185,129,0.28)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(16,185,129,0.38)] active:scale-95",
              }}
              variantB={{
                label: `⚡ ${t("heroPrimaryAltCta")}`,
                sourceSuffix: "direct-start",
                className: "rounded-2xl border border-cyan-300/20 bg-white/5 px-8 py-4 text-lg font-black text-slate-100 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:bg-white/10 active:scale-95",
              }}
            />

            <CheckoutCtaButton
              href="/api/checkout?plan=pro"
              ctaKey="hero-pro"
              variantA={{
                label: `💎 Pro – 39 €`,
                sourceSuffix: "price-view",
                className: "rounded-2xl border border-sky-300/20 bg-sky-500/10 px-8 py-4 text-lg font-bold text-sky-100 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:bg-sky-500/20 active:scale-95",
              }}
              variantB={{
                label: `✨ Pro freischalten`,
                sourceSuffix: "direct-pro",
                className: "rounded-2xl border border-sky-300/20 bg-sky-500/10 px-8 py-4 text-lg font-bold text-sky-100 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:bg-sky-500/20 active:scale-95",
              }}
            />

            <CheckoutCtaButton
              href="/api/checkout?plan=agency"
              ctaKey="hero-agency"
              variantA={{
                label: `👑 Agency – 149 €`,
                sourceSuffix: "price-view",
                className: "rounded-2xl border border-violet-300/20 bg-violet-500/10 px-8 py-4 text-lg font-bold text-violet-100 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:bg-violet-500/20 active:scale-95",
              }}
              variantB={{
                label: `🔥 Agency freischalten`,
                sourceSuffix: "direct-agency",
                className: "rounded-2xl border border-violet-300/20 bg-violet-500/10 px-8 py-4 text-lg font-bold text-violet-100 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:bg-violet-500/20 active:scale-95",
              }}
            />
          </div>
        </div>

        <div className="relative flex items-end lg:items-center">
          <div className="w-full rounded-[2.25rem] border border-white/10 bg-white/5 p-5 shadow-2xl shadow-slate-950/30 backdrop-blur-2xl lg:translate-y-8">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              <Link href="/content-factory" className="group rounded-[1.75rem] border border-emerald-400/20 bg-gradient-to-br from-emerald-500/10 to-cyan-500/5 p-5 transition-all duration-300 hover:-translate-y-1 hover:border-emerald-300/40 hover:bg-emerald-500/15">
                <p className="text-2xl">🎯</p>
                <p className="mt-3 text-lg font-black text-emerald-200">{locale === "en" ? "Free start" : "Kostenlos starten"}</p>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  {locale === "en"
                    ? "Create your first workflow with a cleaner path."
                    : "Starte mit einem klareren Pfad in deinen ersten Workflow."}
                </p>
              </Link>

              <div className="rounded-[1.75rem] border border-slate-700/80 bg-slate-950/60 p-5">
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-slate-400">Momentum</p>
                <div className="mt-4 space-y-3">
                  <div className="flex items-center justify-between rounded-2xl bg-white/5 px-4 py-3">
                    <span className="text-sm font-semibold text-slate-200">Content</span>
                    <span className="text-sm text-cyan-300">Fast</span>
                  </div>
                  <div className="flex items-center justify-between rounded-2xl bg-white/5 px-4 py-3 sm:translate-x-4">
                    <span className="text-sm font-semibold text-slate-200">Affiliate</span>
                    <span className="text-sm text-emerald-300">Clear</span>
                  </div>
                  <div className="flex items-center justify-between rounded-2xl bg-white/5 px-4 py-3 sm:translate-x-8">
                    <span className="text-sm font-semibold text-slate-200">Upgrade</span>
                    <span className="text-sm text-violet-300">Visible</span>
                  </div>
                </div>
              </div>

              <Link href="/affiliate" className="group rounded-[1.75rem] border border-sky-400/20 bg-gradient-to-br from-sky-500/10 to-blue-600/5 p-5 transition-all duration-300 hover:-translate-y-1 hover:border-sky-300/40 hover:bg-sky-500/15 lg:translate-x-6">
                <p className="text-2xl">⭐</p>
                <p className="mt-3 text-lg font-black text-sky-200">{locale === "en" ? "Best recommendations" : "Beste Empfehlungen"}</p>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  {locale === "en"
                    ? "Go directly to the strongest affiliate picks."
                    : "Direkt zu den stärksten Affiliate-Empfehlungen."}
                </p>
              </Link>

              <Link href="/tools" className="group rounded-[1.75rem] border border-violet-400/20 bg-gradient-to-br from-violet-500/10 to-fuchsia-500/5 p-5 transition-all duration-300 hover:-translate-y-1 hover:border-violet-300/40 hover:bg-violet-500/15 lg:-translate-x-4">
                <p className="text-2xl">🔍</p>
                <p className="mt-3 text-lg font-black text-violet-200">{locale === "en" ? "Compare tools" : "Tools vergleichen"}</p>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  {locale === "en"
                    ? "Check ratings, pricing, and fit in one place."
                    : "Bewertungen, Preise und Passung an einem Ort."}
                </p>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

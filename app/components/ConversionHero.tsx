"use client";

import React from "react";
import Link from "next/link";
import CheckoutCtaButton from "./CheckoutCtaButton";
import { useLocale, useTranslations } from "next-intl";

export default function ConversionHero() {
  const t = useTranslations("home");
  const locale = useLocale();
  const isEn = locale === "en";

  const features = [
    { label: isEn ? "Content Factory" : "Content Factory", value: isEn ? "Active" : "Aktiv", color: "text-emerald-400" },
    { label: "Affiliate Links", value: isEn ? "Tracked" : "Getrackt", color: "text-cyan-400" },
    { label: isEn ? "Revenue" : "Einnahmen", value: isEn ? "Growing" : "Wachsend", color: "text-violet-400" },
    { label: isEn ? "AI Articles" : "KI-Artikel", value: isEn ? "Automated" : "Automatisch", color: "text-amber-400" },
  ];

  return (
    <section className="relative min-h-[90svh] overflow-hidden" style={{ background: "#080e1a" }}>
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-0 top-0 h-96 w-96 -translate-x-1/3 -translate-y-1/4 rounded-full blur-[120px]" style={{ background: "rgba(8,145,178,0.08)" }} />
        <div className="absolute bottom-0 right-0 h-80 w-80 translate-x-1/4 translate-y-1/4 rounded-full blur-[120px]" style={{ background: "rgba(139,92,246,0.06)" }} />
      </div>

      <div className="relative mx-auto grid max-w-6xl gap-16 px-6 pb-20 pt-28 sm:px-8 lg:grid-cols-2 lg:px-10 lg:pt-36">
        <div className="flex flex-col justify-center">
          <div className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            {isEn ? "Now live" : "Jetzt live"}
          </div>

          <h1 className="text-5xl font-black leading-tight tracking-tight text-white sm:text-6xl lg:text-7xl">
            {t("heroTitle1")}
            <br />
            <span className="bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">
              {t("heroTitle2")}
            </span>
          </h1>

          <p className="mt-6 max-w-lg text-lg leading-8 text-slate-400">
            {t("heroSubtitle")}
          </p>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <CheckoutCtaButton
              href="/content-factory"
              ctaKey="hero-start"
              variantA={{
                label: isEn ? "Start free" : "Kostenlos starten",
                sourceSuffix: "free-start",
                className: "rounded-xl bg-white px-6 py-3 text-sm font-bold text-slate-900 transition hover:bg-slate-100 active:scale-95",
              }}
              variantB={{
                label: isEn ? "Start free" : "Kostenlos starten",
                sourceSuffix: "direct-start",
                className: "rounded-xl bg-white px-6 py-3 text-sm font-bold text-slate-900 transition hover:bg-slate-100 active:scale-95",
              }}
            />
            <CheckoutCtaButton
              href="/api/checkout?plan=pro"
              ctaKey="hero-pro"
              variantA={{
                label: isEn ? "Pro — 39 EUR/month" : "Pro — 39 EUR/Monat",
                sourceSuffix: "price-view",
                className: "rounded-xl border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-slate-200 transition hover:bg-white/10 active:scale-95",
              }}
              variantB={{
                label: isEn ? "Pro — 39 EUR/month" : "Pro — 39 EUR/Monat",
                sourceSuffix: "direct-pro",
                className: "rounded-xl border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-slate-200 transition hover:bg-white/10 active:scale-95",
              }}
            />
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-4 text-xs text-slate-600">
            <span>{isEn ? "No credit card required" : "Keine Kreditkarte notig"}</span>
            <span className="h-px w-4 bg-slate-800" />
            <span>{isEn ? "Cancel anytime" : "Jederzeit kundbar"}</span>
            <span className="h-px w-4 bg-slate-800" />
            <span>{isEn ? "GDPR compliant" : "DSGVO-konform"}</span>
          </div>
        </div>

        <div className="flex items-center">
          <div className="w-full overflow-hidden rounded-2xl border border-white/10" style={{ background: "rgba(255,255,255,0.02)" }}>
            <div className="flex items-center gap-2 border-b border-white/8 px-4 py-3">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: "rgba(239,68,68,0.5)" }} />
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: "rgba(245,158,11,0.5)" }} />
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: "rgba(16,185,129,0.5)" }} />
              <span className="ml-3 text-xs text-slate-600">nexmoneta.com</span>
            </div>

            <div className="space-y-3 p-5">
              {features.map((item) => (
                <div key={item.label} className="flex items-center justify-between rounded-xl border border-white/5 px-4 py-3" style={{ background: "rgba(255,255,255,0.025)" }}>
                  <span className="text-sm text-slate-300">{item.label}</span>
                  <span className={"text-xs font-semibold " + item.color}>{item.value}</span>
                </div>
              ))}

              <div className="rounded-xl border border-white/5 px-4 py-4" style={{ background: "rgba(255,255,255,0.025)" }}>
                <p className="mb-2 text-xs text-slate-600">{isEn ? "Quick access" : "Schnellzugriff"}</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    { href: "/tools", label: "Tools" },
                    { href: "/blog", label: "Blog" },
                    { href: "/affiliate", label: "Affiliate" },
                    { href: "/content-factory", label: "Factory" },
                  ].map((link) => (
                    <Link key={link.href} href={link.href} className="rounded-lg px-3 py-1.5 text-xs text-slate-400 transition hover:text-white" style={{ background: "rgba(255,255,255,0.05)" }}>
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

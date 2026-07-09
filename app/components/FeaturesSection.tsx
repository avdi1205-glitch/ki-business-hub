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
    <section className="relative overflow-hidden py-24">
      <div className="absolute inset-0 opacity-70 [background:radial-gradient(circle_at_15%_10%,rgba(14,165,233,0.10),transparent_28%),radial-gradient(circle_at_85%_20%,rgba(168,85,247,0.08),transparent_24%),linear-gradient(180deg,rgba(15,23,42,0.0),rgba(15,23,42,0.35))]" />

      <div className="relative mx-auto max-w-6xl px-4">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
          <div>
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.28em] text-cyan-300/80">Feature Layer</p>
            <h2 className="display-heading max-w-xl text-4xl font-black text-white sm:text-5xl md:text-6xl">
              {t("featuresTitle")}
            </h2>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">
              {t("featuresSubtitle")}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3 lg:translate-y-6">
            <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-cyan-300/80">Schneller Output</p>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                Inhalte, Empfehlungen und Workflows schneller in einen verwertbaren Zustand bringen.
              </p>
            </div>
            <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5 backdrop-blur-xl sm:translate-y-4">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-300/80">Mehr Monetarisierung</p>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                Features sind direkt mit Affiliate-, Upgrade- und Funnel-Zielen verbunden.
              </p>
            </div>
            <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5 backdrop-blur-xl sm:-translate-y-4">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-violet-300/80">Weniger Reibung</p>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                Du findest schneller den nächsten sinnvollen Schritt, ohne lange zu suchen.
              </p>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mt-14 grid gap-8 md:grid-cols-2">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className={`relative group overflow-hidden rounded-[2rem] transition-all duration-300 hover:-translate-y-2 ${
                idx % 2 === 0 ? "md:translate-y-8" : "md:-translate-y-6"
              }`}
              style={{
                background:
                  "linear-gradient(180deg, rgba(15,23,42,0.85) 0%, rgba(15,23,42,0.55) 100%)",
                border: `1px solid ${feature.color}4d`,
                boxShadow: `0 25px 60px rgba(2, 6, 23, 0.35), inset 0 1px 0 rgba(255,255,255,0.05)`,
              }}
            >
              <div className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" style={{ background: `radial-gradient(circle at top left, ${feature.color}20, transparent 42%)` }} />

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
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl text-5xl transition-transform duration-300 group-hover:scale-105" style={{ background: `${feature.color}20` }}>
                  {feature.icon}
                </div>

                {/* Title */}
                <h3 className="mb-2 text-2xl font-black" style={{ color: (feature as { titleColor?: string }).titleColor || feature.color }}>
                  {t(feature.titleKey)}
                </h3>

                {/* Description */}
                <p className="mb-6 leading-7" style={{ color: "var(--text-light)" }}>
                  {t(feature.descriptionKey)}
                </p>

                <div className="mb-6 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm leading-6 text-slate-300">
                  {idx === 0
                    ? "Gut fuer den schnellen Start mit Content- und Workflow-Aufbau."
                    : idx === 1
                      ? "Gut fuer Empfehlungen, Vergleiche und Affiliate-Optimierung."
                      : idx === 2
                        ? "Gut fuer E-Mail- und Conversion-Strecken, die Umsatz nachziehen."
                        : "Gut fuer Analyse, Priorisierung und bessere Entscheidungen."}
                </div>

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
                  className="block w-full rounded-2xl px-4 py-3 text-center font-semibold transition-all duration-300 hover:shadow-lg group-hover:scale-[1.02]"
                  style={{ background: feature.color, color: (feature as { ctaTextColor?: string }).ctaTextColor || "#ffffff" }}
                >
                  {t(feature.ctaKey)} →
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 flex flex-col items-start gap-6 rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur-xl lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-slate-400">Next Step</p>
            <p className="mt-3 text-lg text-slate-200">
            🚀 {t("featuresBottomCopy")}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/content-factory"
              className="inline-block rounded-2xl px-8 py-4 text-lg font-bold text-white transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
              style={{ background: "var(--primary)" }}
            >
              {t("featuresBottomCta")}
            </Link>
            <Link
              href="/affiliate"
              className="inline-block rounded-2xl border border-white/10 bg-white/5 px-8 py-4 text-lg font-bold text-slate-100 transition-all duration-300 hover:-translate-y-1 hover:bg-white/10"
            >
              Empfehlungen ansehen
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

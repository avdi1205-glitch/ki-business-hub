"use client";

import Link from "next/link";
import React from "react";
import { useTranslations } from "next-intl";

const features = [
  {
    accentColor: "#06b6d4",
    titleKey: "feature1Title",
    descriptionKey: "feature1Description",
    benefitsKeys: ["feature1Benefit1", "feature1Benefit2", "feature1Benefit3"],
    href: "/content-factory",
    ctaKey: "feature1Cta",
    tag: "Content",
  },
  {
    accentColor: "#10b981",
    titleKey: "feature2Title",
    descriptionKey: "feature2Description",
    benefitsKeys: ["feature2Benefit1", "feature2Benefit2", "feature2Benefit3"],
    href: "/affiliate",
    ctaKey: "feature2Cta",
    tag: "Affiliate",
  },
  {
    accentColor: "#8b5cf6",
    titleKey: "feature3Title",
    descriptionKey: "feature3Description",
    benefitsKeys: ["feature3Benefit1", "feature3Benefit2", "feature3Benefit3"],
    href: "/content-factory",
    ctaKey: "feature3Cta",
    tag: "Automation",
  },
  {
    accentColor: "#f59e0b",
    titleKey: "feature4Title",
    descriptionKey: "feature4Description",
    benefitsKeys: ["feature4Benefit1", "feature4Benefit2", "feature4Benefit3"],
    href: "/stats",
    ctaKey: "feature4Cta",
    tag: "Analytics",
  },
];

export function FeaturesSection() {
  const t = useTranslations("home");

  return (
    <section className="py-28" style={{ background: "#080e1a" }}>
      <div className="mx-auto max-w-6xl px-6 sm:px-8 lg:px-10">

        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-xl">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-500">Features</p>
            <h2 className="text-4xl font-black text-white sm:text-5xl lg:text-6xl">{t("featuresTitle")}</h2>
          </div>
          <p className="max-w-sm text-base leading-7 text-slate-400 lg:pb-2 lg:text-right">{t("featuresSubtitle")}</p>
        </div>

        <div className="mt-16 space-y-3">
          {features.map((feature, idx) => (
            <div
              key={feature.tag}
              className="grid gap-6 rounded-2xl border border-white/[0.07] p-7 transition-all duration-200 hover:border-white/15 lg:grid-cols-[2fr_1.2fr_auto]"
              style={{ background: "rgba(255,255,255,0.02)" }}
            >
              <div>
                <span className="mb-3 inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold" style={{ background: feature.accentColor + "18", color: feature.accentColor }}>
                  {feature.tag}
                </span>
                <h3 className="text-xl font-bold text-white">{t(feature.titleKey)}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-400">{t(feature.descriptionKey)}</p>
              </div>

              <ul className="flex flex-col justify-center space-y-2">
                {feature.benefitsKeys.map((key) => (
                  <li key={key} className="flex items-start gap-2 text-sm text-slate-300">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: feature.accentColor }} />
                    {t(key)}
                  </li>
                ))}
              </ul>

              <div className={["flex items-center", idx % 2 === 0 ? "lg:justify-end" : "lg:justify-start"].join(" ")}>
                <Link
                  href={feature.href}
                  className="inline-flex items-center gap-2 rounded-xl border px-5 py-2.5 text-sm font-semibold transition hover:opacity-90"
                  style={{ borderColor: feature.accentColor + "40", color: feature.accentColor, background: feature.accentColor + "0f" }}
                >
                  {t(feature.ctaKey)} &#8594;
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col gap-4 rounded-2xl border border-white/[0.07] px-7 py-6 sm:flex-row sm:items-center sm:justify-between" style={{ background: "rgba(255,255,255,0.02)" }}>
          <p className="text-base text-slate-300">{t("featuresBottomCopy")}</p>
          <div className="flex shrink-0 gap-3">
            <Link href="/content-factory" className="rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-slate-900 transition hover:bg-slate-100">
              {t("featuresBottomCta")}
            </Link>
            <Link href="/affiliate" className="rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-semibold text-slate-200 transition hover:bg-white/10">
              Affiliate
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

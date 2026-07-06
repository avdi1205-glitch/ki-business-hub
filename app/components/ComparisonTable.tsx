"use client";

import React from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";

const comparisonData = [
  {
    featureKey: "comparisonFeature1",
    starter: "5/Monat",
    pro: "50/Monat",
    agency: "Unbegrenzt",
  },
  {
    featureKey: "comparisonFeature2",
    starter: "Basis",
    pro: "Premium (85+ SEO)",
    agency: "Enterprise",
  },
  {
    featureKey: "comparisonFeature3",
    starter: "10 Partner",
    pro: "47 Partner",
    agency: "47 + Custom",
  },
  {
    featureKey: "comparisonFeature4",
    starter: "❌",
    pro: "✅ Vollständig",
    agency: "✅ + Segmentierung",
  },
  {
    featureKey: "comparisonFeature5",
    starter: "Basis",
    pro: "Erweitert",
    agency: "Enterprise + API",
  },
  {
    featureKey: "comparisonFeature6",
    starter: "Manuell",
    pro: "Schedule + Auto",
    agency: "✅ + Webhooks",
  },
  {
    featureKey: "comparisonFeature7",
    starter: "❌",
    pro: "✅ Basic",
    agency: "✅ Advanced",
  },
  {
    featureKey: "comparisonFeature8",
    starter: "Nur Sie",
    pro: "Nur Sie",
    agency: "5 Member",
  },
  {
    featureKey: "comparisonFeature9",
    starter: "Email",
    pro: "Email + Chat",
    agency: "24/7 Phone",
  },
  {
    featureKey: "comparisonFeature10",
    starter: "€0",
    pro: "€39/Monat",
    agency: "€149/Monat",
  },
];

export function ComparisonTable() {
  const t = useTranslations("home");
  const locale = useLocale();
  const isEn = locale === "en";

  const translateCell = (value: string) => {
    if (!isEn) return value;

    const map: Record<string, string> = {
      "5/Monat": "5/month",
      "50/Monat": "50/month",
      "Unbegrenzt": "Unlimited",
      "Basis": "Basic",
      "10 Partner": "10 partners",
      "47 Partner": "47 partners",
      "✅ Vollständig": "✅ Full",
      "✅ + Segmentierung": "✅ + Segmentation",
      Erweitert: "Advanced",
      Manuell: "Manual",
      "Nur Sie": "Only you",
      "€39/Monat": "€39/month",
      "€149/Monat": "€149/month",
    };

    return map[value] || value;
  };

  const rows = comparisonData.map((row) => ({
    ...row,
    starter: translateCell(row.starter),
    pro: translateCell(row.pro),
    agency: translateCell(row.agency),
  }));

  return (
    <section className="relative overflow-hidden py-24">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_14%_12%,rgba(14,165,233,0.08),transparent_24%),radial-gradient(circle_at_86%_18%,rgba(245,158,11,0.08),transparent_22%),linear-gradient(180deg,rgba(15,23,42,0),rgba(15,23,42,0.45))]" />

      <div className="relative mx-auto max-w-6xl px-4">
        {/* Header */}
        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
          <div>
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.28em] text-amber-300/80">Vergleich</p>
            <h2 className="display-heading max-w-xl text-4xl font-black text-white sm:text-5xl md:text-6xl">
              {t("comparisonTitle")}
            </h2>
          </div>
          <p className="max-w-2xl text-lg leading-8 text-slate-300 sm:text-xl lg:justify-self-end">
            {t("comparisonSubtitle")}
          </p>
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-3">
          <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5 backdrop-blur-xl transition-transform duration-300 hover:-translate-y-1 md:translate-y-4">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-sky-300/80">Starter</p>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              Gut zum Kennenlernen und fuer erste Workflows mit wenig Risiko.
            </p>
          </div>
          <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5 backdrop-blur-xl transition-transform duration-300 hover:-translate-y-1">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-violet-300/80">Pro</p>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              Bester Mix aus Preis, Automatisierung und Skalierung fuer die meisten Nutzer.
            </p>
          </div>
          <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5 backdrop-blur-xl transition-transform duration-300 hover:-translate-y-1 md:-translate-y-4">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-amber-300/80">Agency</p>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              Sinnvoll, wenn du mit Team, mehreren Kunden oder mehreren Workflows arbeitest.
            </p>
          </div>
        </div>

        {/* Desktop Table */}
        <div className="mt-14 hidden overflow-x-auto rounded-[2rem] border border-white/10 bg-slate-950/55 backdrop-blur-2xl md:block">
          <table className="w-full border-collapse">
            <thead>
              <tr style={{ background: "rgba(15,23,42,0.92)", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                <th className="px-6 py-5 text-left text-xs font-bold uppercase tracking-[0.22em] text-slate-300">
                  {t("comparisonHeaderFeature")}
                </th>
                <th className="px-6 py-5 text-center">
                  <div className="text-2xl mb-2">🚀</div>
                  <div className="font-black text-white">{t("comparisonStarter")}</div>
                  <div className="text-sm text-slate-400">{t("comparisonStarterPrice")}</div>
                </th>
                <th className="px-6 py-5 text-center" style={{ background: "rgba(109, 40, 217, 0.18)", borderLeft: "1px solid rgba(139, 92, 246, 0.25)", borderRight: "1px solid rgba(139, 92, 246, 0.25)" }}>
                  <div className="text-2xl mb-2">💎</div>
                  <div className="font-black text-white">{t("comparisonPro")}</div>
                  <div className="text-sm text-slate-400">{t("comparisonProPrice")}</div>
                </th>
                <th className="px-6 py-5 text-center">
                  <div className="text-2xl mb-2">👑</div>
                  <div className="font-black text-white">{t("comparisonAgency")}</div>
                  <div className="text-sm text-slate-400">{t("comparisonAgencyPrice")}</div>
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, idx) => (
                <tr
                  key={idx}
                  style={{
                    background: idx % 2 === 0 ? "rgba(15,23,42,0.84)" : "rgba(30,41,59,0.56)",
                    borderBottom: "1px solid rgba(255,255,255,0.05)",
                  }}
                >
                  <td className="px-6 py-4 font-semibold text-slate-100">
                    {t(row.featureKey)}
                  </td>
                  <td className="px-6 py-4 text-center text-slate-300">
                    {row.starter}
                  </td>
                  <td className="px-6 py-4 text-center font-bold text-white" style={{ background: "rgba(109, 40, 217, 0.18)" }}>
                    {row.pro}
                  </td>
                  <td className="px-6 py-4 text-center text-slate-300">
                    {row.agency}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="mt-14 space-y-6 md:hidden">
          {[
            {
              title: "🚀 Starter",
              price: t("comparisonStarterPrice"),
              color: "#3b82f6",
            },
            {
              title: "💎 Pro",
              price: t("comparisonProPrice"),
              color: "#8b5cf6",
            },
            {
              title: "👑 Agency",
              price: t("comparisonAgencyPrice"),
              color: "#f59e0b",
            },
          ].map((plan, idx) => (
            <div
              key={idx}
              className="rounded-[1.75rem] border border-white/10 p-6 backdrop-blur-xl"
              style={{
                background: "rgba(15,23,42,0.72)",
                border: `1px solid ${plan.color}40`,
              }}
            >
              <h3 className="mb-2 text-xl font-black text-white">
                {plan.title}
              </h3>
              <p className="mb-4 text-lg font-black" style={{ color: plan.color }}>
                {plan.price}
              </p>
              <div className="space-y-2 text-sm text-slate-300">
                {rows.map((row, jdx) => (
                  <div key={jdx} className="flex justify-between">
                    <span>{t(row.featureKey)}</span>
                    <span className="font-semibold">
                      {idx === 0 && row.starter}
                      {idx === 1 && row.pro}
                      {idx === 2 && row.agency}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 rounded-[2rem] border border-white/10 bg-white/5 p-8 text-center backdrop-blur-xl">
          <p className="mb-8 text-lg text-slate-300">
            {t("comparisonBottomCopy")}
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/content-factory" className="inline-block rounded-2xl border border-white/10 bg-white/5 px-8 py-4 font-black text-slate-100 transition-all duration-300 hover:-translate-y-1 hover:bg-white/10">
              {locale === "en" ? "Start free" : "Kostenlos starten"}
            </Link>
            <Link href="/tools" className="inline-block rounded-2xl border border-cyan-400/30 bg-cyan-500/10 px-8 py-4 font-black text-cyan-100 transition-all duration-300 hover:-translate-y-1 hover:bg-cyan-500/20">
              {locale === "en" ? "Compare tools" : "Tools vergleichen"}
            </Link>
            <Link href="/api/checkout?plan=pro&source=comparison-table" className="inline-block rounded-2xl bg-emerald-600 px-10 py-4 text-lg font-black text-white transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
              {t("comparisonBottomCta")}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

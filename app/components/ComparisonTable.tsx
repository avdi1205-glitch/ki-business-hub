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
    <div style={{ background: "linear-gradient(180deg, #0f172a 0%, #111827 100%)" }} className="py-24">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: "var(--text-dark)" }}>
            {t("comparisonTitle")}
          </h2>
          <p className="text-xl" style={{ color: "var(--text-light)" }}>
            {t("comparisonSubtitle")}
          </p>
        </div>

        <div className="mb-10 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-sm font-bold text-cyan-300">Starter</p>
            <p className="mt-2 text-sm leading-6" style={{ color: "var(--text-light)" }}>
              Gut zum Kennenlernen und fuer erste Workflows mit wenig Risiko.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-sm font-bold text-cyan-300">Pro</p>
            <p className="mt-2 text-sm leading-6" style={{ color: "var(--text-light)" }}>
              Bester Mix aus Preis, Automatisierung und Skalierung fuer die meisten Nutzer.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-sm font-bold text-cyan-300">Agency</p>
            <p className="mt-2 text-sm leading-6" style={{ color: "var(--text-light)" }}>
              Sinnvoll, wenn du mit Team, mehreren Kunden oder mehreren Workflows arbeitest.
            </p>
          </div>
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ background: "#1f2937", borderBottom: "2px solid rgba(255,255,255,0.1)" }}>
                <th className="px-6 py-4 text-left font-bold" style={{ color: "var(--text-dark)" }}>
                  {t("comparisonHeaderFeature")}
                </th>
                <th className="px-6 py-4 text-center">
                  <div className="text-2xl mb-2">🚀</div>
                  <div className="font-bold" style={{ color: "var(--text-dark)" }}>{t("comparisonStarter")}</div>
                  <div className="text-sm" style={{ color: "var(--text-light)" }}>{t("comparisonStarterPrice")}</div>
                </th>
                <th className="px-6 py-4 text-center" style={{ background: "rgba(109, 40, 217, 0.26)", borderLeft: "2px solid rgba(139, 92, 246, 0.35)", borderRight: "2px solid rgba(139, 92, 246, 0.35)" }}>
                  <div className="text-2xl mb-2">💎</div>
                  <div className="font-bold" style={{ color: "var(--text-dark)" }}>{t("comparisonPro")}</div>
                  <div className="text-sm" style={{ color: "var(--text-light)" }}>{t("comparisonProPrice")}</div>
                </th>
                <th className="px-6 py-4 text-center">
                  <div className="text-2xl mb-2">👑</div>
                  <div className="font-bold" style={{ color: "var(--text-dark)" }}>{t("comparisonAgency")}</div>
                  <div className="text-sm" style={{ color: "var(--text-light)" }}>{t("comparisonAgencyPrice")}</div>
                </th>
              </tr>
            </thead>
            <tbody style={{ borderTop: "1px solid rgba(255,255,255,0.1)" }}>
              {rows.map((row, idx) => (
                <tr
                  key={idx}
                  style={{
                    background: idx % 2 === 0 ? "#0f172a" : "#111827",
                    borderBottom: "1px solid rgba(255,255,255,0.05)",
                  }}
                >
                  <td className="px-6 py-4 font-semibold" style={{ color: "var(--text-dark)" }}>
                      {t(row.featureKey)}
                  </td>
                  <td className="px-6 py-4 text-center" style={{ color: "var(--text-light)" }}>
                    {row.starter}
                  </td>
                  <td className="px-6 py-4 text-center font-bold" style={{ background: "rgba(109, 40, 217, 0.22)", color: "var(--text-dark)" }}>
                    {row.pro}
                  </td>
                  <td className="px-6 py-4 text-center" style={{ color: "var(--text-light)" }}>
                    {row.agency}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden space-y-6">
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
              className="p-6 rounded-xl"
              style={{
                background: "var(--background-elevated)",
                border: `1px solid ${plan.color}40`,
              }}
            >
              <h3 className="text-xl font-bold mb-2" style={{ color: "var(--text-dark)" }}>
                {plan.title}
              </h3>
              <p className="text-lg font-bold mb-4" style={{ color: plan.color }}>
                {plan.price}
              </p>
              <div className="space-y-2 text-sm" style={{ color: "var(--text-light)" }}>
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
        <div className="mt-16 text-center">
          <p className="text-lg mb-8" style={{ color: "var(--text-light)" }}>
            {t("comparisonBottomCopy")}
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/content-factory" className="inline-block rounded-lg border border-white/10 bg-white/5 px-8 py-4 font-bold text-slate-100 transition-all duration-300 hover:scale-105 hover:bg-white/10">
              {locale === "en" ? "Start free" : "Kostenlos starten"}
            </Link>
            <Link href="/tools" className="inline-block rounded-lg border border-cyan-400/30 bg-cyan-500/10 px-8 py-4 font-bold text-cyan-100 transition-all duration-300 hover:scale-105 hover:bg-cyan-500/20">
              {locale === "en" ? "Compare tools" : "Tools vergleichen"}
            </Link>
            <Link href="/api/checkout?plan=pro&source=comparison-table" className="inline-block rounded-lg bg-emerald-600 px-10 py-4 text-lg font-bold text-white transition-all duration-300 hover:scale-105 hover:shadow-2xl">
              {t("comparisonBottomCta")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

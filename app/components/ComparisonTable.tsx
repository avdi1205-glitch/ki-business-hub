"use client";

import React from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";

const comparisonData = [
  { featureKey: "comparisonFeature1", starter: "5/Monat", pro: "50/Monat", agency: "Unbegrenzt" },
  { featureKey: "comparisonFeature2", starter: "Basis", pro: "Premium", agency: "Enterprise" },
  { featureKey: "comparisonFeature3", starter: "10 Partner", pro: "47 Partner", agency: "47 + Custom" },
  { featureKey: "comparisonFeature4", starter: "-", pro: "Vollstandig", agency: "+ Segmentierung" },
  { featureKey: "comparisonFeature5", starter: "Basis", pro: "Erweitert", agency: "Enterprise + API" },
  { featureKey: "comparisonFeature6", starter: "Manuell", pro: "Schedule + Auto", agency: "+ Webhooks" },
  { featureKey: "comparisonFeature7", starter: "-", pro: "Basic", agency: "Advanced" },
  { featureKey: "comparisonFeature8", starter: "Solo", pro: "Solo", agency: "5 Mitglieder" },
  { featureKey: "comparisonFeature9", starter: "E-Mail", pro: "E-Mail + Chat", agency: "24/7 Telefon" },
  { featureKey: "comparisonFeature10", starter: "0 EUR", pro: "39 EUR/Monat", agency: "149 EUR/Monat" },
];

export function ComparisonTable() {
  const t = useTranslations("home");
  const locale = useLocale();
  const isEn = locale === "en";

  const translateCell = (value: string): string => {
    if (!isEn) return value;
    const map: Record<string, string> = {
      "5/Monat": "5/mo",
      "50/Monat": "50/mo",
      "Unbegrenzt": "Unlimited",
      "Basis": "Basic",
      "10 Partner": "10 partners",
      "47 Partner": "47 partners",
      "Vollstandig": "Full",
      "+ Segmentierung": "+ Segmentation",
      "Erweitert": "Advanced",
      "Manuell": "Manual",
      "Solo": "Solo",
      "5 Mitglieder": "5 members",
      "E-Mail": "Email",
      "E-Mail + Chat": "Email + Chat",
      "24/7 Telefon": "24/7 Phone",
      "0 EUR": "EUR 0",
      "39 EUR/Monat": "EUR39/mo",
      "149 EUR/Monat": "EUR149/mo",
      "Schedule + Auto": "Schedule + Auto",
      "Basic": "Basic",
      "Advanced": "Advanced",
      "+ Webhooks": "+ Webhooks",
      "Enterprise": "Enterprise",
      "47 + Custom": "47 + Custom",
      "Enterprise + API": "Enterprise + API",
      "Premium": "Premium",
    };
    return map[value] || value;
  };

  function formatPrice(raw: string) {
    return raw.replace("EUR", "\u20AC");
  }

  const rows = comparisonData.map((row) => ({
    ...row,
    starter: translateCell(row.starter),
    pro: translateCell(row.pro),
    agency: translateCell(row.agency),
  }));

  const plans = [
    { key: "starter" as const, name: "Starter", price: isEn ? "Free" : "Kostenlos", accentColor: "#64748b" },
    { key: "pro" as const, name: "Pro", price: isEn ? "\u20AC39/mo" : "39 \u20AC/Monat", accentColor: "#06b6d4", highlight: true },
    { key: "agency" as const, name: "Agency", price: isEn ? "\u20AC149/mo" : "149 \u20AC/Monat", accentColor: "#a78bfa" },
  ];

  return (
    <section className="py-28" style={{ background: "#080e1a" }}>
      <div className="mx-auto max-w-6xl px-6 sm:px-8 lg:px-10">

        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-xl">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-500">
              {isEn ? "Comparison" : "Vergleich"}
            </p>
            <h2 className="text-4xl font-black text-white sm:text-5xl">{t("comparisonTitle")}</h2>
          </div>
          <p className="max-w-sm text-base leading-7 text-slate-400 lg:pb-2 lg:text-right">{t("comparisonSubtitle")}</p>
        </div>

        {/* Desktop table */}
        <div className="mt-14 hidden overflow-x-auto rounded-2xl border border-white/[0.08] md:block" style={{ background: "rgba(255,255,255,0.02)" }}>
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-white/[0.08]">
                <th className="px-6 py-5 text-left text-xs font-semibold uppercase tracking-widest text-slate-500">
                  {t("comparisonHeaderFeature")}
                </th>
                {plans.map((plan) => (
                  <th
                    key={plan.key}
                    className="px-6 py-5 text-center"
                    style={plan.highlight ? { borderLeft: "1px solid rgba(6,182,212,0.2)", borderRight: "1px solid rgba(6,182,212,0.2)", background: "rgba(6,182,212,0.04)" } : {}}
                  >
                    <div className="font-bold text-white">{plan.name}</div>
                    <div className="mt-1 text-xs text-slate-500">{plan.price}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, idx) => (
                <tr key={idx} className="border-b border-white/[0.05] last:border-0">
                  <td className="px-6 py-4 font-medium text-slate-300">{t(row.featureKey)}</td>
                  <td className="px-6 py-4 text-center text-slate-400">{row.starter === "-" ? <span className="text-slate-700">—</span> : row.starter}</td>
                  <td className="px-6 py-4 text-center font-semibold text-white" style={{ background: "rgba(6,182,212,0.04)" }}>
                    {row.pro === "-" ? <span className="text-slate-700">—</span> : formatPrice(row.pro)}
                  </td>
                  <td className="px-6 py-4 text-center text-slate-400">{row.agency === "-" ? <span className="text-slate-700">—</span> : row.agency}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="mt-12 space-y-4 md:hidden">
          {plans.map((plan, pIdx) => (
            <div
              key={plan.key}
              className="rounded-2xl border p-5"
              style={{ borderColor: plan.highlight ? "rgba(6,182,212,0.3)" : "rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.02)" }}
            >
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-bold text-white">{plan.name}</h3>
                <span className="text-sm font-semibold" style={{ color: plan.accentColor }}>{plan.price}</span>
              </div>
              <div className="space-y-2">
                {rows.map((row) => (
                  <div key={row.featureKey} className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">{t(row.featureKey)}</span>
                    <span className="text-right font-medium text-slate-200">
                      {(pIdx === 0 ? row.starter : pIdx === 1 ? row.pro : row.agency) === "-"
                        ? <span className="text-slate-700">—</span>
                        : formatPrice(pIdx === 0 ? row.starter : pIdx === 1 ? row.pro : row.agency)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col gap-4 rounded-2xl border border-white/[0.07] px-7 py-6 sm:flex-row sm:items-center sm:justify-between" style={{ background: "rgba(255,255,255,0.02)" }}>
          <p className="text-base text-slate-400">{t("comparisonBottomCopy")}</p>
          <div className="flex shrink-0 gap-3">
            <Link href="/content-factory" className="rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-slate-900 transition hover:bg-slate-100">
              {isEn ? "Start free" : "Kostenlos starten"}
            </Link>
            <Link href="/api/checkout?plan=pro&source=comparison-cta" className="rounded-xl border border-cyan-400/30 bg-cyan-500/10 px-5 py-2.5 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-500/20">
              Pro
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

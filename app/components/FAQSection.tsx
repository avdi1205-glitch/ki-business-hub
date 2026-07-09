"use client";

import Link from "next/link";
import React, { useState } from "react";
import { useTranslations } from "next-intl";

const faqs = [
  {
    questionKey: "faq1Question",
    answerKey: "faq1Answer",
    color: "#3b82f6",
  },
  {
    questionKey: "faq2Question",
    answerKey: "faq2Answer",
    color: "#10b981",
  },
  {
    questionKey: "faq3Question",
    answerKey: "faq3Answer",
    color: "#8b5cf6",
  },
  {
    questionKey: "faq4Question",
    answerKey: "faq4Answer",
    color: "#f59e0b",
  },
  {
    questionKey: "faq5Question",
    answerKey: "faq5Answer",
    color: "#ec4899",
  },
  {
    questionKey: "faq6Question",
    answerKey: "faq6Answer",
    color: "#06b6d4",
  },
];

export function FAQSection() {
  const t = useTranslations("home");
  const [openIdx, setOpenIdx] = useState(0);

  return (
    <section className="relative overflow-hidden py-24">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_14%_14%,rgba(14,165,233,0.08),transparent_25%),radial-gradient(circle_at_84%_12%,rgba(245,158,11,0.08),transparent_22%),linear-gradient(180deg,rgba(15,23,42,0),rgba(15,23,42,0.42))]" />

      <div className="relative mx-auto max-w-4xl px-4">
        {/* Header */}
        <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-end">
          <div>
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.28em] text-amber-300/80">FAQ</p>
            <h2 className="display-heading max-w-xl text-4xl font-black text-white sm:text-5xl md:text-6xl">
              {t("faqTitle")}
            </h2>
          </div>
          <p className="max-w-2xl text-lg leading-8 text-slate-300 sm:text-xl lg:justify-self-end">
            {t("faqSubtitle")}
          </p>
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-3">
          <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5 backdrop-blur-xl transition-transform duration-300 hover:-translate-y-1 md:translate-y-4">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-cyan-300/80">Noch unsicher?</p>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              Die FAQs beantworten die häufigsten Fragen, die vor dem Start auftauchen.
            </p>
          </div>
          <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5 backdrop-blur-xl transition-transform duration-300 hover:-translate-y-1">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-violet-300/80">Erst vergleichen</p>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              Wenn du zwei Optionen vergleichen möchtest, gehe direkt zu den Tools oder zum Vergleich.
            </p>
          </div>
          <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5 backdrop-blur-xl transition-transform duration-300 hover:-translate-y-1 md:-translate-y-4">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-300/80">Dann starten</p>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              Kostenlos anfangen, dann je nach Bedarf auf Pro oder Agency wechseln.
            </p>
          </div>
        </div>

        {/* FAQ Accordion */}
        <div className="mt-14 space-y-4">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="overflow-hidden rounded-[1.75rem] border transition-all duration-300 backdrop-blur-xl"
              style={{
                background: openIdx === idx ? "rgba(15,23,42,0.92)" : "rgba(15,23,42,0.72)",
                border: `1px solid ${faq.color}33`,
                boxShadow: openIdx === idx ? "0 24px 70px rgba(2, 6, 23, 0.28)" : "0 16px 40px rgba(2, 6, 23, 0.2)",
              }}
            >
              {/* Question */}
              <button
                onClick={() => setOpenIdx(openIdx === idx ? -1 : idx)}
                className="flex w-full items-center justify-between p-6 text-left transition-all"
                style={{
                  background: openIdx === idx ? `${faq.color}12` : "transparent",
                }}
              >
                <h3 className="max-w-[85%] text-lg font-black text-white">
                  {t(faq.questionKey)}
                </h3>
                <div
                  className="text-2xl transition-transform duration-300"
                  style={{
                    color: faq.color,
                    transform: openIdx === idx ? "rotate(180deg)" : "rotate(0deg)",
                  }}
                >
                  ▼
                </div>
              </button>

              {/* Answer */}
              {openIdx === idx && (
                <div className="border-t p-6" style={{ borderColor: `${faq.color}33`, background: `${faq.color}08` }}>
                  <p className="text-lg leading-relaxed text-slate-200">
                    {t(faq.answerKey)}
                  </p>
                  <div className="mt-5 inline-block">
                    <Link
                      href="/content-factory"
                      className="inline-block rounded-full px-4 py-2 text-sm font-black text-slate-950"
                      style={{ background: faq.color }}
                    >
                      {t("faqCta")}
                    </Link>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 rounded-[2rem] border border-white/10 bg-white/5 p-12 text-center backdrop-blur-2xl">
          <h3 className="mb-4 text-2xl font-black text-white">
            {t("faqFooterTitle")}
          </h3>
          <p className="mb-6 text-slate-300">
            {t("faqFooterSubtitle")}
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/content-factory"
              className="inline-block rounded-2xl border border-white/10 bg-white/5 px-8 py-4 font-black text-slate-100 transition-all duration-300 hover:-translate-y-1 hover:bg-white/10"
            >
              🚀 Kostenlos starten
            </Link>
            <Link
              href="/tools"
              className="inline-block rounded-2xl border border-cyan-400/30 bg-cyan-500/10 px-8 py-4 font-black text-cyan-100 transition-all duration-300 hover:-translate-y-1 hover:bg-cyan-500/20"
            >
              🏆 Tools vergleichen
            </Link>
            <Link
              href="/kontakt"
              className="inline-block rounded-2xl px-8 py-4 font-black text-white transition-all duration-300 hover:-translate-y-1"
              style={{ background: "var(--primary)" }}
            >
              📞 {t("faqFooterCta")}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

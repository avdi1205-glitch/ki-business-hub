"use client";

import Link from "next/link";
import React, { useState } from "react";
import { useTranslations } from "next-intl";

const faqs = [
  { questionKey: "faq1Question", answerKey: "faq1Answer" },
  { questionKey: "faq2Question", answerKey: "faq2Answer" },
  { questionKey: "faq3Question", answerKey: "faq3Answer" },
  { questionKey: "faq4Question", answerKey: "faq4Answer" },
  { questionKey: "faq5Question", answerKey: "faq5Answer" },
  { questionKey: "faq6Question", answerKey: "faq6Answer" },
];

export function FAQSection() {
  const t = useTranslations("home");
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <section className="py-28" style={{ background: "#080e1a" }}>
      <div className="mx-auto max-w-6xl px-6 sm:px-8 lg:px-10">

        <div className="grid gap-16 lg:grid-cols-[0.75fr_1.25fr]">

          <div className="lg:sticky lg:top-28 lg:self-start">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-500">FAQ</p>
            <h2 className="text-4xl font-black text-white sm:text-5xl">{t("faqTitle")}</h2>
            <p className="mt-4 text-base leading-7 text-slate-400">{t("faqSubtitle")}</p>

            <div className="mt-10 space-y-3">
              <Link
                href="/content-factory"
                className="block rounded-xl bg-white px-5 py-3 text-center text-sm font-bold text-slate-900 transition hover:bg-slate-100"
              >
                Kostenlos starten
              </Link>
              <Link
                href="/kontakt"
                className="block rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-center text-sm font-semibold text-slate-200 transition hover:bg-white/10"
              >
                {t("faqFooterCta")}
              </Link>
            </div>
          </div>

          <div className="space-y-2">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="overflow-hidden rounded-2xl border transition-colors"
                style={{
                  borderColor: openIdx === idx ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.06)",
                  background: openIdx === idx ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.02)",
                }}
              >
                <button
                  type="button"
                  onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
                  className="flex w-full items-center justify-between px-6 py-5 text-left"
                >
                  <span className="pr-4 text-base font-semibold text-white">{t(faq.questionKey)}</span>
                  <span className="shrink-0 text-slate-500 transition-transform" style={{ transform: openIdx === idx ? "rotate(45deg)" : "none" }}>
                    +
                  </span>
                </button>

                {openIdx === idx && (
                  <div className="border-t border-white/[0.06] px-6 pb-5 pt-4">
                    <p className="text-sm leading-7 text-slate-400">{t(faq.answerKey)}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

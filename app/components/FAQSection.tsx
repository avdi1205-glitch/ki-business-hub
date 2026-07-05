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
    <div style={{ background: "var(--background)" }} className="py-24">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: "var(--text-dark)" }}>
            {t("faqTitle")}
          </h2>
          <p className="text-xl" style={{ color: "var(--text-light)" }}>
            {t("faqSubtitle")}
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="rounded-xl overflow-hidden transition-all duration-300"
              style={{
                background: "var(--background-elevated)",
                border: `1px solid ${faq.color}40`,
              }}
            >
              {/* Question */}
              <button
                onClick={() => setOpenIdx(openIdx === idx ? -1 : idx)}
                className="w-full p-6 flex items-center justify-between transition-all"
                style={{
                  background: openIdx === idx ? `${faq.color}10` : "transparent",
                }}
              >
                <h3 className="text-lg font-bold text-left" style={{ color: "var(--text-dark)" }}>
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
                <div className="p-6 border-t-2" style={{ borderColor: `${faq.color}40`, background: `${faq.color}08` }}>
                  <p className="text-lg leading-relaxed" style={{ color: "var(--text-light)" }}>
                    {t(faq.answerKey)}
                  </p>
                  <div className="mt-4 inline-block">
                    <Link
                      href="/content-factory"
                      className="inline-block px-4 py-2 text-white text-sm font-bold rounded-full"
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
        <div className="mt-16 text-center p-12 rounded-2xl" style={{ background: "var(--background-elevated)", border: "1px solid rgba(255,255,255,0.1)" }}>
          <h3 className="text-2xl font-bold mb-4" style={{ color: "var(--text-dark)" }}>
            {t("faqFooterTitle")}
          </h3>
          <p className="mb-6" style={{ color: "var(--text-light)" }}>
            {t("faqFooterSubtitle")}
          </p>
          <Link
            href="/kontakt"
            className="inline-block px-8 py-4 text-white font-bold rounded-lg hover:shadow-lg transition-all duration-300 transform hover:scale-105"
            style={{ background: "var(--primary)" }}
          >
            📞 {t("faqFooterCta")}
          </Link>
        </div>
      </div>
    </div>
  );
}

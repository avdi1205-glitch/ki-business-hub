"use client";

import Link from "next/link";
import React, { useState, useEffect } from "react";
import { useLocale, useTranslations } from "next-intl";

const testimonials = [
  {
    name: "Sarah M.",
    role: "Digital Marketer",
    location: "Munchen",
    initial: "S",
    quote: "Ich konnte deutlich schneller Inhalte veröffentlichen und meine ersten Affiliate-Klicks sauber auswerten.",
    quoteEn: "I was able to publish content much faster and track my first affiliate clicks clearly.",
    focus: "Content Factory",
  },
  {
    name: "Tom K.",
    role: "Content Creator",
    location: "Berlin",
    initial: "T",
    quote: "Der größte Vorteil ist für mich die Zeitersparnis. Ideen, Inhalte und Struktur stehen viel schneller.",
    quoteEn: "The biggest benefit for me is saving time. Ideas, content, and structure come together much faster.",
    focus: "Automatisierung",
  },
  {
    name: "Julia L.",
    role: "Unternehmerin",
    location: "Hamburg",
    initial: "J",
    quote: "Für mich war wichtig, dass Content, Newsletter und Monetarisierung in einem klaren Ablauf zusammenpassen.",
    quoteEn: "What mattered most to me was that content, newsletter, and monetization fit together in one clear flow.",
    focus: "Newsletter",
  },
  {
    name: "Marco V.",
    role: "Freelancer",
    location: "Wien",
    initial: "M",
    quote: "Ich sehe schneller, welche Inhalte funktionieren und wo sich ein Upgrade für mich wirklich lohnt.",
    quoteEn: "I can see much faster which content performs and where an upgrade really makes sense.",
    focus: "Analytics",
  },
];

export function TestimonialsSection() {
  const t = useTranslations("home");
  const locale = useLocale();
  const isEn = locale === "en";
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setActiveIdx((prev) => (prev + 1) % testimonials.length), 6000);
    return () => clearInterval(timer);
  }, []);

  const active = testimonials[activeIdx];

  return (
    <section className="py-28" style={{ background: "#080e1a" }}>
      <div className="mx-auto max-w-6xl px-6 sm:px-8 lg:px-10">

        <div className="grid gap-16 lg:grid-cols-[1.6fr_1fr]">

          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-500">
              {isEn ? "What users say" : "Was Nutzer sagen"}
            </p>
            <h2 className="text-4xl font-black text-white sm:text-5xl">{t("testimonialsTitle")}</h2>

            <div className="mt-10 rounded-2xl border border-white/[0.08] p-8" style={{ background: "rgba(255,255,255,0.02)" }}>
              <p className="text-lg leading-8 text-slate-200">&quot;{isEn ? active.quoteEn : active.quote}&quot;</p>
              <div className="mt-6 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-sm font-bold text-white" style={{ background: "rgba(255,255,255,0.06)" }}>
                  {active.initial}
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{active.name}</p>
                  <p className="text-xs text-slate-500">{active.role} · {active.location}</p>
                </div>
                <span className="ml-auto rounded-full border border-white/10 px-2.5 py-0.5 text-xs text-slate-400">
                  {active.focus}
                </span>
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActiveIdx(i)}
                  className="h-1.5 rounded-full transition-all"
                  style={{ width: i === activeIdx ? "2rem" : "0.75rem", background: i === activeIdx ? "#06b6d4" : "rgba(255,255,255,0.15)" }}
                />
              ))}
            </div>
          </div>

          <div className="flex flex-col justify-center gap-3">
            {testimonials.map((item, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setActiveIdx(i)}
                className="rounded-2xl border p-4 text-left transition-all"
                style={{
                  borderColor: i === activeIdx ? "rgba(6,182,212,0.4)" : "rgba(255,255,255,0.07)",
                  background: i === activeIdx ? "rgba(6,182,212,0.05)" : "rgba(255,255,255,0.02)",
                }}
              >
                <p className="text-sm font-semibold text-white">{item.name}</p>
                <p className="mt-0.5 text-xs text-slate-500">{item.role}</p>
                <p className="mt-1.5 line-clamp-2 text-xs leading-5 text-slate-400">
                  {isEn ? item.quoteEn : item.quote}
                </p>
              </button>
            ))}

            <Link
              href="/content-factory"
              className="mt-2 block rounded-xl bg-white px-5 py-3 text-center text-sm font-bold text-slate-900 transition hover:bg-slate-100"
            >
              {t("testimonialsBottomCta")}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

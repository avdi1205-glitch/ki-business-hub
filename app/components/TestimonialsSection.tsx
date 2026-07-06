"use client";

import Link from "next/link";
import React, { useState, useEffect } from "react";
import { useLocale, useTranslations } from "next-intl";

const testimonials = [
  {
    name: "Sarah M.",
    role: "Digital Marketer",
    location: "München",
    image: "👩‍💼",
    quote: "Ich konnte deutlich schneller Inhalte veröffentlichen und meine ersten Affiliate-Klicks sauber auswerten.",
    earnings: "€1.250",
    time: "1. Monat",
    rating: 5,
  },
  {
    name: "Tom K.",
    role: "Content Creator",
    location: "Berlin",
    image: "👨‍💻",
    quote: "Der größte Vorteil ist für mich die Zeitersparnis. Ideen, Inhalte und Struktur stehen viel schneller.",
    earnings: "€4.500",
    time: "2. Monat",
    rating: 5,
  },
  {
    name: "Julia L.",
    role: "Entrepreneur",
    location: "Hamburg",
    image: "👩‍🔬",
    quote: "Für mich war wichtig, dass Content, Newsletter und Monetarisierung in einem klaren Ablauf zusammenpassen.",
    earnings: "€6.250",
    time: "3. Monat",
    rating: 5,
  },
  {
    name: "Marco V.",
    role: "Freelancer",
    location: "Wien",
    image: "👨‍🎓",
    quote: "Ich sehe schneller, welche Inhalte funktionieren und wo sich ein Upgrade fuer mich wirklich lohnt.",
    earnings: "€2.150",
    time: "1. Monat",
    rating: 5,
  },
];

export function TestimonialsSection() {
  const t = useTranslations("home");
  const locale = useLocale();
  const isEn = locale === "en";
  const [activeIdx, setActiveIdx] = useState(0);

  const localizedTestimonials = testimonials.map((item) => ({
    ...item,
    quote:
      item.name === "Sarah M."
        ? isEn
          ? "I was able to publish content much faster and track my first affiliate clicks clearly."
          : "Ich konnte deutlich schneller Inhalte veröffentlichen und meine ersten Affiliate-Klicks sauber auswerten."
        : item.name === "Tom K."
          ? isEn
            ? "The biggest benefit for me is saving time. Ideas, content, and structure are ready much faster."
            : "Der größte Vorteil ist für mich die Zeitersparnis. Ideen, Inhalte und Struktur stehen viel schneller."
          : item.name === "Julia L."
            ? isEn
              ? "What mattered most to me was that content, newsletter, and monetization fit together in one clear flow."
              : "Für mich war wichtig, dass Content, Newsletter und Monetarisierung in einem klaren Ablauf zusammenpassen."
            : isEn
              ? "I see much faster which content performs and where an upgrade really makes sense for me."
              : "Ich sehe schneller, welche Inhalte funktionieren und wo sich ein Upgrade fuer mich wirklich lohnt.",
    time:
      item.time === "1. Monat"
        ? isEn
          ? "Month 1"
          : "1. Monat"
        : item.time === "2. Monat"
          ? isEn
            ? "Month 2"
            : "2. Monat"
          : item.time === "3. Monat"
            ? isEn
              ? "Month 3"
              : "3. Monat"
            : item.time,
  }));

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % localizedTestimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [localizedTestimonials.length]);

  return (
    <section className="relative overflow-hidden py-24">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_12%,rgba(14,165,233,0.08),transparent_26%),radial-gradient(circle_at_84%_18%,rgba(16,185,129,0.08),transparent_22%),linear-gradient(180deg,rgba(15,23,42,0),rgba(15,23,42,0.4))]" />

      <div className="relative mx-auto max-w-6xl px-4">
        {/* Header */}
        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
          <div>
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.28em] text-cyan-300/80">Social Proof</p>
            <h2 className="display-heading max-w-xl text-4xl font-black text-white sm:text-5xl md:text-6xl">
              {t("testimonialsTitle")}
            </h2>
          </div>
          <p className="max-w-2xl text-lg leading-8 text-slate-300 sm:text-xl lg:justify-self-end">
            {t("testimonialsSubtitle")}
          </p>
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-3">
          <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5 backdrop-blur-xl transition-transform duration-300 hover:-translate-y-1 md:translate-y-4">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-cyan-300/80">Praxisnah</p>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              Die Zitate beziehen sich auf konkrete Workflows statt nur auf allgemeine Begeisterung.
            </p>
          </div>
          <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5 backdrop-blur-xl transition-transform duration-300 hover:-translate-y-1">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-violet-300/80">Klare Signale</p>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              Du siehst schneller, ob der Fokus auf Content, Affiliate oder Skalierung passt.
            </p>
          </div>
          <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5 backdrop-blur-xl transition-transform duration-300 hover:-translate-y-1 md:-translate-y-4">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-300/80">Nächster Schritt</p>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              Nach dem Vertrauenssignal folgt direkt ein sinnvoller Einstieg in Content-Factory oder Affiliate.
            </p>
          </div>
        </div>

        {/* Testimonials Grid */}
        <div className="mt-14 grid gap-8 md:grid-cols-2">
          {localizedTestimonials.map((testimonial, idx) => (
            <div
              key={idx}
              className={`cursor-pointer rounded-[2rem] p-8 transition-all duration-300 ${activeIdx === idx ? "md:scale-[1.03]" : "hover:-translate-y-1"} ${idx % 2 === 0 ? "md:translate-y-6" : "md:-translate-y-4"}`}
              style={{
                background:
                  activeIdx === idx
                    ? "linear-gradient(180deg, rgba(15,23,42,0.92) 0%, rgba(15,23,42,0.76) 100%)"
                    : "linear-gradient(180deg, rgba(15,23,42,0.82) 0%, rgba(15,23,42,0.62) 100%)",
                border: activeIdx === idx ? "1px solid rgba(59, 130, 246, 0.45)" : "1px solid rgba(255,255,255,0.1)",
                boxShadow: activeIdx === idx
                  ? "0 30px 80px rgba(2, 6, 23, 0.34), inset 0 1px 0 rgba(255,255,255,0.05)"
                  : "0 20px 50px rgba(2, 6, 23, 0.22)",
              }}
              onClick={() => setActiveIdx(idx)}
            >
              <div className="mb-6 flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-400">Case Study</p>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-cyan-300">{testimonial.location}</p>
              </div>

              {/* Testimonial Content */}
              <div className="flex items-start gap-4 mb-6">
                {/* Avatar */}
                <div className="flex-shrink-0 rounded-[1.25rem] border border-white/10 bg-white/5 p-3 text-4xl backdrop-blur-xl">{testimonial.image}</div>

                {/* Header Info */}
                <div className="flex-1">
                  <h3 className="text-xl font-black text-white">
                    {testimonial.name}
                  </h3>
                  <p className="text-sm text-slate-400">
                    {testimonial.role} · {testimonial.location}
                  </p>

                  {/* Rating */}
                  <div className="flex gap-1 mt-2">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <span key={i} className="text-lg">
                        ⭐
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Quote */}
              <p className="mb-6 text-lg italic text-slate-200">
                &ldquo;{testimonial.quote}&rdquo;
              </p>

              {/* Earnings Badge */}
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3">
                  <p className="text-xs font-semibold text-emerald-200">{isEn ? "Earned" : "Verdient"}</p>
                  <p className="text-2xl font-black text-white">
                    {testimonial.earnings}
                  </p>
                </div>
                <div className="rounded-2xl border border-sky-400/20 bg-sky-500/10 px-4 py-3">
                  <p className="text-xs font-semibold text-sky-200">{isEn ? "Timeframe" : "Zeitrahmen"}</p>
                  <p className="text-lg font-black text-white">
                    {testimonial.time}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Stats Strip */}
        <div className="mt-16 grid gap-4 rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur-xl md:grid-cols-4">
          <div className="text-center">
            <div className="text-4xl font-black text-white">1.247+</div>
            <p className="text-sm text-slate-400">{t("testimonialsStat1")}</p>
          </div>
          <div className="text-center">
            <div className="text-4xl font-black text-white">€8.2M+</div>
            <p className="text-sm text-slate-400">{t("testimonialsStat2")}</p>
          </div>
          <div className="text-center">
            <div className="text-4xl font-black text-white">€4.850</div>
            <p className="text-sm text-slate-400">{t("testimonialsStat3")}</p>
          </div>
          <div className="text-center">
            <div className="text-4xl font-black text-white">4.9★</div>
            <p className="text-sm text-slate-400">{t("testimonialsStat4")}</p>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 rounded-[2rem] border border-white/10 bg-slate-950/50 p-8 text-center backdrop-blur-2xl">
          <p className="mb-8 text-xl text-slate-300">
            🚀 {t("testimonialsBottomCopy")}
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/content-factory"
              className="inline-block rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-10 py-4 text-lg font-black text-white transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
            >
              {t("testimonialsBottomCta")}
            </Link>
            <Link
              href="/tools"
              className="inline-block rounded-2xl border border-white/10 bg-white/5 px-10 py-4 text-lg font-black text-slate-100 transition-all duration-300 hover:-translate-y-1 hover:bg-white/10"
            >
              Tools vergleichen
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

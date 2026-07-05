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
    <div style={{ background: "var(--background)" }} className="py-24">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: "var(--text-dark)" }}>
            {t("testimonialsTitle")}
          </h2>
          <p className="text-xl" style={{ color: "var(--text-light)" }}>
            {t("testimonialsSubtitle")}
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {localizedTestimonials.map((testimonial, idx) => (
            <div
              key={idx}
              className="rounded-2xl p-8 transition-all duration-300 transform cursor-pointer"
              style={{
                background: activeIdx === idx ? "var(--background-elevated)" : "var(--background-elevated)",
                border: activeIdx === idx ? "2px solid var(--primary)" : "1px solid rgba(255,255,255,0.1)",
                transform: activeIdx === idx ? "scale(1.05)" : "scale(1)",
              }}
              onClick={() => setActiveIdx(idx)}
            >
              {/* Testimonial Content */}
              <div className="flex items-start gap-4 mb-6">
                {/* Avatar */}
                <div className="text-5xl flex-shrink-0">{testimonial.image}</div>

                {/* Header Info */}
                <div className="flex-1">
                  <h3 className="text-xl font-bold" style={{ color: "var(--text-dark)" }}>
                    {testimonial.name}
                  </h3>
                  <p className="text-sm" style={{ color: "var(--text-muted)" }}>
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
              <p className="text-lg mb-6 italic" style={{ color: "var(--text-light)" }}>
                "{testimonial.quote}"
              </p>

              {/* Earnings Badge */}
              <div className="flex gap-4">
                <div className="px-4 py-2 rounded-lg" style={{ background: "rgba(16, 185, 129, 0.2)", border: "1px solid var(--success)" }}>
                  <p className="text-xs font-semibold" style={{ color: "var(--success)" }}>{isEn ? "Earned" : "Verdient"}</p>
                  <p className="text-2xl font-bold" style={{ color: "var(--success)" }}>
                    {testimonial.earnings}
                  </p>
                </div>
                <div className="px-4 py-2 rounded-lg" style={{ background: "rgba(59, 130, 246, 0.2)", border: "1px solid var(--primary)" }}>
                  <p className="text-xs font-semibold" style={{ color: "var(--primary)" }}>{isEn ? "Timeframe" : "Zeitrahmen"}</p>
                  <p className="text-lg font-bold" style={{ color: "var(--primary)" }}>
                    {testimonial.time}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Stats Strip */}
        <div className="grid md:grid-cols-4 gap-6 p-8 rounded-2xl" style={{ background: "var(--background-elevated)", color: "var(--text-dark)" }}>
          <div className="text-center">
            <div className="text-4xl font-bold">1.247+</div>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>{t("testimonialsStat1")}</p>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold">€8.2M+</div>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>{t("testimonialsStat2")}</p>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold">€4.850</div>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>{t("testimonialsStat3")}</p>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold">4.9★</div>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>{t("testimonialsStat4")}</p>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <p className="text-xl mb-8" style={{ color: "var(--text-light)" }}>
            🚀 {t("testimonialsBottomCopy")}
          </p>
          <Link
            href="/content-factory"
            className="inline-block px-10 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold text-lg rounded-lg hover:shadow-2xl hover:shadow-green-500/50 transition-all duration-300 transform hover:scale-105"
          >
            {t("testimonialsBottomCta")}
          </Link>
        </div>
      </div>
    </div>
  );
}

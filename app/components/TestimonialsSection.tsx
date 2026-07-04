"use client";

import React, { useState, useEffect } from "react";

const testimonials = [
  {
    name: "Sarah M.",
    role: "Digital Marketer",
    location: "München",
    image: "👩‍💼",
    quote: "In meinem 1. Monat habe ich €1.250 verdient - völlig passiv. Unfassbar!",
    earnings: "€1.250",
    time: "1. Monat",
    rating: 5,
  },
  {
    name: "Tom K.",
    role: "Content Creator",
    location: "Berlin",
    image: "👨‍💻",
    quote: "Die KI Content Factory spart mir 20 Stunden/Woche. Jetzt schreibe ich 40+ Artikel/Monat.",
    earnings: "€4.500",
    time: "2. Monat",
    rating: 5,
  },
  {
    name: "Julia L.",
    role: "Entrepreneur",
    location: "Hamburg",
    image: "👩‍🔬",
    quote: "Beste Entscheidung für mein Online-Business. Newsletter + Affiliate = €6.250/Monat",
    earnings: "€6.250",
    time: "3. Monat",
    rating: 5,
  },
  {
    name: "Marco V.",
    role: "Freelancer",
    location: "Wien",
    image: "👨‍🎓",
    quote: "Support ist amazing. Dashboard ist professionell. Endlich verdiene ich online!",
    earnings: "€2.150",
    time: "1. Monat",
    rating: 5,
  },
];

export function TestimonialsSection() {
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="py-24 bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            ⭐ Echte Erfolgsgeschichten von echten Menschen
          </h2>
          <p className="text-xl text-slate-600">
            1.247+ Mitglieder verdienen bereits passives Einkommen
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {testimonials.map((testimonial, idx) => (
            <div
              key={idx}
              className={`rounded-2xl p-8 transition-all duration-300 transform cursor-pointer ${
                activeIdx === idx
                  ? "ring-2 ring-purple-500 scale-105 bg-gradient-to-br from-purple-50 to-violet-50"
                  : "bg-white border border-gray-200"
              }`}
              onClick={() => setActiveIdx(idx)}
            >
              {/* Testimonial Content */}
              <div className="flex items-start gap-4 mb-6">
                {/* Avatar */}
                <div className="text-5xl flex-shrink-0">{testimonial.image}</div>

                {/* Header Info */}
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-slate-900">
                    {testimonial.name}
                  </h3>
                  <p className="text-sm text-slate-600">
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
              <p className="text-lg text-slate-700 mb-6 italic">
                "{testimonial.quote}"
              </p>

              {/* Earnings Badge */}
              <div className="flex gap-4">
                <div className="px-4 py-2 bg-gradient-to-r from-green-100 to-emerald-100 border border-green-300 rounded-lg">
                  <p className="text-xs text-green-700 font-semibold">Verdient</p>
                  <p className="text-2xl font-bold text-green-600">
                    {testimonial.earnings}
                  </p>
                </div>
                <div className="px-4 py-2 bg-gradient-to-r from-blue-100 to-cyan-100 border border-blue-300 rounded-lg">
                  <p className="text-xs text-blue-700 font-semibold">Zeitrahmen</p>
                  <p className="text-lg font-bold text-blue-600">
                    {testimonial.time}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Stats Strip */}
        <div className="grid md:grid-cols-4 gap-6 p-8 bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-2xl">
          <div className="text-center">
            <div className="text-4xl font-bold">1.247+</div>
            <p className="text-sm text-gray-300">Aktive Member</p>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold">€8.2M+</div>
            <p className="text-sm text-gray-300">Verdient insgesamt</p>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold">€4.850</div>
            <p className="text-sm text-gray-300">Ø pro Mitglied</p>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold">4.9★</div>
            <p className="text-sm text-gray-300">Bewertung (324 Reviews)</p>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <p className="text-xl text-slate-600 mb-8">
            🚀 Bist du bereit, die nächste Erfolgsgeschichte zu werden?
          </p>
          <button className="px-10 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold text-lg rounded-lg hover:shadow-2xl hover:shadow-green-500/50 transition-all duration-300 transform hover:scale-105">
            Kostenlos Starten (€0)
          </button>
        </div>
      </div>
    </div>
  );
}

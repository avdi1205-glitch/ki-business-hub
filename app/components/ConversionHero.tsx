"use client";

import Link from "next/link";
import React, { useState, useEffect } from "react";

export default function ConversionHero() {
  const [seconds, setSeconds] = useState(3599); // 59:59 countdown

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds((s) => (s > 0 ? s - 1 : 3599));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;

  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-green-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 animate-pulse delay-500" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 py-20 text-center">
        {/* Urgency Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/20 border border-red-500/50 rounded-full mb-8 animate-pulse">
          <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          <span className="text-sm font-semibold text-red-300">⏰ Limited Time Offer</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-cyan-400 to-green-400 bg-clip-text text-transparent leading-tight">
          Verdiene €2.150/Monat
          <br />
          mit KI + Affiliate Links
        </h1>

        {/* Subheading */}
        <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
          1.247 Menschen verdienen bereits passives Einkommen mit unserer
          <span className="text-green-400 font-semibold"> Content Factory</span>
        </p>

        {/* CTA Section */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          {/* Primary CTA */}
          <Link
            href="/content-factory"
            className="group relative px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold text-lg rounded-lg hover:shadow-2xl hover:shadow-green-500/50 transition-all duration-300 transform hover:scale-105 active:scale-95"
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              🚀 Jetzt Starten (Kostenlos)
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-700 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </Link>

          {/* Secondary CTA */}
          <Link
            href="/stats"
            className="px-8 py-4 bg-blue-500/20 border-2 border-blue-400 text-blue-300 font-bold text-lg rounded-lg hover:bg-blue-500/30 transition-all duration-300"
          >
            📊 Ergebnisse anschauen
          </Link>
        </div>

        {/* Countdown Timer (Urgency) */}
        <div className="inline-block mb-12 p-6 bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/30 rounded-lg">
          <p className="text-gray-400 text-sm mb-2">🔥 Angebot endet in:</p>
          <div className="flex gap-4 justify-center text-3xl font-bold font-mono">
            <div className="text-red-400">
              {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
            </div>
          </div>
        </div>

        {/* Social Proof - Numbers */}
        <div className="grid grid-cols-3 md:grid-cols-3 gap-6 mb-12">
          {[
            { value: "1.247+", label: "Aktive Member" },
            { value: "€8.2M", label: "Verdient gesamt" },
            { value: "4.9★", label: "Bewertung (324)" },
          ].map((stat, idx) => (
            <div
              key={idx}
              className="p-4 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-all"
            >
              <div className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
                {stat.value}
              </div>
              <p className="text-sm text-gray-400 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Social Proof - Testimonials */}
        <div className="space-y-3 mb-12">
          {[
            "✅ Sarah hat €1.250 in ihrem 1. Monat verdient",
            "✅ Tom nutzt die Content Factory - 40+ Artikel/Monat",
            "✅ Julia sagt: Beste passive Income-Methode!",
          ].map((text, idx) => (
            <div
              key={idx}
              className="text-sm text-green-300 animate-fade-in"
              style={{ animationDelay: `${idx * 0.5}s` }}
            >
              {text}
            </div>
          ))}
        </div>

        {/* Trust Badges */}
        <div className="flex flex-wrap justify-center gap-4 text-xs text-gray-400">
          <div className="flex items-center gap-2">
            <span>🔒</span>
            <span>100% Sicher</span>
          </div>
          <div className="flex items-center gap-2">
            <span>💳</span>
            <span>Kostenlos starten</span>
          </div>
          <div className="flex items-center gap-2">
            <span>⭐</span>
            <span>4.9/5 Bewertung</span>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex items-center justify-center">
          <div className="w-1 h-2 bg-white/30 rounded-full animate-pulse" />
        </div>
      </div>
    </div>
  );
}

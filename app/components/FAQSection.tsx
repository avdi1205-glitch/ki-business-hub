"use client";

import React, { useState } from "react";

const faqs = [
  {
    question: "❓ Wie viel kann ich wirklich verdienen?",
    answer:
      "Unsere Mitglieder verdienen durchschnittlich €1.250-€6.250 pro Monat, je nachdem wie aktiv sie sind. Mit der Content Factory können Sie 50+ SEO-optimierte Artikel/Monat generieren und mit Affiliate-Links zu €1-€5 pro Click verdienen.",
    color: "#3b82f6",
  },
  {
    question: "💡 Ist das wirklich kostenlos?",
    answer:
      "Ja! Sie können kostenlos starten mit 5 Artikeln/Monat und Basis-Affiliate Links. Upgrade zur Pro Version für €29/Monat wenn Sie mehr verdienen möchten. Keine Kreditkarte erforderlich.",
    color: "#10b981",
  },
  {
    question: "🤖 Wie gut ist die KI Content Factory?",
    answer:
      "Unsere KI generiert 2.000+ Wort professionelle deutsche Artikel in ~8 Sekunden. Mit 85+ SEO-Score und Google-Ready Format. Sie müssen NICHT mehr selbst schreiben - nur minimale Anpassungen nötig.",
    color: "#8b5cf6",
  },
  {
    question: "💰 Wie funktioniert die Affiliate-Bezahlung?",
    answer:
      "Jedes Mal wenn ein Besucher über Ihre Artikel auf ein empfohlenes Tool klickt, verdienen Sie eine Provision. Wir haben 47 Premium-Partner (€1-€5 pro Click). Zahlungen sind monatlich via PayPal oder Banküberweisung.",
    color: "#f59e0b",
  },
  {
    question: "📧 Ist Newsletter-Automation einfach?",
    answer:
      "Ja! One-Click Setup. Wähle Template → Sende an 1.000+ Subscribers → Verdiene €0.50 pro Subscriber. Automatische Kampagnen laufen im Hintergrund während Sie schlafen.",
    color: "#ec4899",
  },
  {
    question: "🔒 Ist meine Seite wirklich sicher?",
    answer:
      "100% Sicherheit. Wir nutzen Enterprise-Grade Encryption, Auto-Backups, DDoS Protection und 24/7 Monitoring. Ihre Daten und Verdienste sind vollständig geschützt.",
    color: "#06b6d4",
  },
];

export function FAQSection() {
  const [openIdx, setOpenIdx] = useState(0);

  return (
    <div style={{ background: "var(--background)" }} className="py-24">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: "var(--text-dark)" }}>
            ❓ Häufig Gestellte Fragen
          </h2>
          <p className="text-xl" style={{ color: "#cbd5e1" }}>
            Alles was Sie wissen müssen um zu starten
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
                  {faq.question}
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
                  <p className="text-lg leading-relaxed" style={{ color: "#e2e8f0" }}>
                    {faq.answer}
                  </p>
                  <div className="mt-4 inline-block">
                    <span className="px-4 py-2 text-white text-sm font-bold rounded-full" style={{ background: faq.color }}>
                      ✅ Probieren Sie jetzt kostenlos
                    </span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center p-12 rounded-2xl" style={{ background: "var(--background-elevated)", border: "1px solid rgba(255,255,255,0.1)" }}>
          <h3 className="text-2xl font-bold mb-4" style={{ color: "var(--text-dark)" }}>
            Immer noch Fragen?
          </h3>
          <p className="mb-6" style={{ color: "#cbd5e1" }}>
            Unser Team antwortet innerhalb von 24 Stunden. Kostenlos.
          </p>
          <button className="px-8 py-4 text-white font-bold rounded-lg hover:shadow-lg transition-all duration-300 transform hover:scale-105" style={{ background: "var(--primary)" }}>
            📞 Support kontaktieren
          </button>
        </div>
      </div>
    </div>
  );
}

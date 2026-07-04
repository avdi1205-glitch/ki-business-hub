"use client";

import Link from "next/link";
import React, { useState } from "react";

const faqs = [
  {
    question: "❓ Wie viel kann ich wirklich verdienen?",
    answer:
      "Das haengt stark von Nische, Reichweite, Content-Qualitaet und Umsetzungsdisziplin ab. Die Plattform hilft dir dabei, Inhalte schneller zu produzieren, Klicks zu tracken und systematischer an Monetarisierung zu arbeiten.",
    color: "#3b82f6",
  },
  {
    question: "💡 Ist das wirklich kostenlos?",
    answer:
      "Ja. Du kannst kostenlos starten, erste Inhalte testen und den Workflow kennenlernen. Erst wenn du mehr Volumen, Automatisierung und Reports brauchst, wechselst du auf Pro fuer 39 EUR pro Monat.",
    color: "#10b981",
  },
  {
    question: "🤖 Wie gut ist die KI Content Factory?",
    answer:
      "Sie beschleunigt Themenfindung, Struktur und erste Entwuerfe deutlich. Gute Ergebnisse entstehen am schnellsten, wenn du die generierten Inhalte redaktionell pruefst und an deine Zielgruppe anpasst.",
    color: "#8b5cf6",
  },
  {
    question: "💰 Wie funktioniert die Affiliate-Bezahlung?",
    answer:
      "Du platzierst passende Empfehlungen in deinen Inhalten und kannst Klicks nachvollziehen. Die konkrete Verguetung haengt vom jeweiligen Partnerprogramm ab und nicht jeder Klick fuehrt automatisch zu Umsatz.",
    color: "#f59e0b",
  },
  {
    question: "📧 Ist Newsletter-Automation einfach?",
    answer:
      "Der Einstieg ist einfach, aber gute Newsletter leben trotzdem von klaren Inhalten und sauberer Segmentierung. Die Automatisierung spart dir vor allem Routinearbeit.",
    color: "#ec4899",
  },
  {
    question: "🔒 Ist meine Seite wirklich sicher?",
    answer:
      "Es gibt technische Schutzmechanismen fuer Infrastruktur und Datenzugriff. Wie bei jedem Online-System solltest du zusaetzlich auf starke Zugangsdaten und saubere Prozesse achten.",
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
            Die wichtigsten Antworten vor deinem Start oder Upgrade
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
                    <Link
                      href="/content-factory"
                      className="inline-block px-4 py-2 text-white text-sm font-bold rounded-full"
                      style={{ background: faq.color }}
                    >
                      Kostenlos ausprobieren
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
            Immer noch Fragen?
          </h3>
          <p className="mb-6" style={{ color: "#cbd5e1" }}>
            Wenn noch etwas unklar ist, kannst du dir zuerst die kostenlose Version ansehen oder direkt Kontakt aufnehmen.
          </p>
          <Link
            href="/kontakt"
            className="inline-block px-8 py-4 text-white font-bold rounded-lg hover:shadow-lg transition-all duration-300 transform hover:scale-105"
            style={{ background: "var(--primary)" }}
          >
            📞 Support kontaktieren
          </Link>
        </div>
      </div>
    </div>
  );
}

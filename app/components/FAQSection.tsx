"use client";

import React, { useState } from "react";

const faqs = [
  {
    question: "❓ Wie viel kann ich wirklich verdienen?",
    answer:
      "Unsere Mitglieder verdienen durchschnittlich €1.250-€6.250 pro Monat, je nachdem wie aktiv sie sind. Mit der Content Factory können Sie 50+ SEO-optimierte Artikel/Monat generieren und mit Affiliate-Links zu €1-€5 pro Click verdienen.",
    color: "from-blue-500 to-cyan-500",
  },
  {
    question: "💡 Ist das wirklich kostenlos?",
    answer:
      "Ja! Sie können kostenlos starten mit 5 Artikeln/Monat und Basis-Affiliate Links. Upgrade zur Pro Version für €29/Monat wenn Sie mehr verdienen möchten. Keine Kreditkarte erforderlich.",
    color: "from-green-500 to-emerald-500",
  },
  {
    question: "🤖 Wie gut ist die KI Content Factory?",
    answer:
      "Unsere KI generiert 2.000+ Wort professionelle deutsche Artikel in ~8 Sekunden. Mit 85+ SEO-Score und Google-Ready Format. Sie müssen NICHT mehr selbst schreiben - nur minimale Anpassungen nötig.",
    color: "from-purple-500 to-violet-500",
  },
  {
    question: "💰 Wie funktioniert die Affiliate-Bezahlung?",
    answer:
      "Jedes Mal wenn ein Besucher über Ihre Artikel auf ein empfohlenes Tool klickt, verdienen Sie eine Provision. Wir haben 47 Premium-Partner (€1-€5 pro Click). Zahlungen sind monatlich via PayPal oder Banküberweisung.",
    color: "from-orange-500 to-red-500",
  },
  {
    question: "📧 Ist Newsletter-Automation einfach?",
    answer:
      "Ja! One-Click Setup. Wähle Template → Sende an 1.000+ Subscribers → Verdiene €0.50 pro Subscriber. Automatische Kampagnen laufen im Hintergrund während Sie schlafen.",
    color: "from-pink-500 to-rose-500",
  },
  {
    question: "🔒 Ist meine Seite wirklich sicher?",
    answer:
      "100% Sicherheit. Wir nutzen Enterprise-Grade Encryption, Auto-Backups, DDoS Protection und 24/7 Monitoring. Ihre Daten und Verdienste sind vollständig geschützt.",
    color: "from-teal-500 to-cyan-500",
  },
];

export function FAQSection() {
  const [openIdx, setOpenIdx] = useState(0);

  return (
    <div className="py-24 bg-white">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            ❓ Häufig Gestellte Fragen
          </h2>
          <p className="text-xl text-slate-600">
            Alles was Sie wissen müssen um zu starten
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="rounded-xl overflow-hidden border-2 border-gray-200 transition-all duration-300 hover:border-gray-300"
            >
              {/* Question */}
              <button
                onClick={() => setOpenIdx(openIdx === idx ? -1 : idx)}
                className="w-full p-6 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white hover:from-gray-100 hover:to-gray-50 transition-all"
              >
                <h3 className="text-lg font-bold text-slate-900 text-left">
                  {faq.question}
                </h3>
                <div className={`text-2xl transition-transform duration-300 ${openIdx === idx ? "rotate-180" : ""}`}>
                  ▼
                </div>
              </button>

              {/* Answer */}
              {openIdx === idx && (
                <div className={`p-6 bg-gradient-to-br ${faq.color.replace("from-", "from-").replace("to-", "to-")}/5 border-t-2 border-gray-200`}>
                  <p className="text-slate-700 text-lg leading-relaxed">
                    {faq.answer}
                  </p>
                  <div className="mt-4 inline-block">
                    <span className={`px-4 py-2 bg-gradient-to-r ${faq.color} text-white text-sm font-bold rounded-full`}>
                      ✅ Probieren Sie jetzt kostenlos
                    </span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center p-12 rounded-2xl bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200">
          <h3 className="text-2xl font-bold text-slate-900 mb-4">
            Immer noch Fragen?
          </h3>
          <p className="text-slate-600 mb-6">
            Unser Team antwortet innerhalb von 24 Stunden. Kostenlos.
          </p>
          <button className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-lg hover:shadow-lg transition-all duration-300 transform hover:scale-105">
            📞 Support kontaktieren
          </button>
        </div>
      </div>
    </div>
  );
}

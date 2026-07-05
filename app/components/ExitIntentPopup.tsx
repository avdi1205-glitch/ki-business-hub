"use client";

import React, { useState, useEffect } from "react";
import { useLocale } from "next-intl";

const EXIT_INTENT_STORAGE_KEY = "kihub-exit-intent-dismissed";

export function ExitIntentPopup() {
  const locale = useLocale();
  const [shown, setShown] = useState(false);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<"success" | "error" | null>(null);

  useEffect(() => {
    const dismissed = window.localStorage.getItem(EXIT_INTENT_STORAGE_KEY);
    if (dismissed) return;

    const handleMouseLeave = (e: MouseEvent) => {
      // Nur wenn Maus oben den Bildschirm verlässt
      if (e.clientY <= 0 && !shown) {
        setShown(true);
      }
    };

    document.addEventListener("mouseleave", handleMouseLeave);
    return () => document.removeEventListener("mouseleave", handleMouseLeave);
  }, [shown]);

  const handleSubscribe = async () => {
    if (!email) return;
    
    setLoading(true);
    setMessage(null);
    try {
      const response = await fetch("/api/subscribe-newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "exit-intent-popup" }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(locale === "en" ? "✅ Thanks! Your bonus is on the way." : "✅ Danke! Dein Bonus ist unterwegs.");
        setMessageType("success");
        window.localStorage.setItem(EXIT_INTENT_STORAGE_KEY, "subscribed");
        setEmail("");
        window.setTimeout(() => setShown(false), 1400);
      } else {
        setMessage(data.error || (locale === "en" ? "Signup failed" : "Anmeldung fehlgeschlagen"));
        setMessageType("error");
      }
    } catch {
      setMessage(locale === "en" ? "Connection error. Please try again later." : "Verbindungsfehler. Bitte später erneut versuchen.");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = () => {
    window.localStorage.setItem(EXIT_INTENT_STORAGE_KEY, "dismissed");
    setShown(false);
  };

  if (!shown) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="rounded-2xl p-8 max-w-md mx-4 shadow-2xl animate-in fade-in scale-95 duration-200" style={{ background: "var(--background-elevated)", border: "1px solid rgba(255,255,255,0.1)" }}>
        {/* Close Button */}
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 transition-colors"
          style={{ color: "var(--text-muted)" }}
        >
          ✕
        </button>

        {/* Content */}
        <div className="text-center">
          <div className="text-4xl mb-4">🎁</div>
          <h2 className="text-2xl font-bold mb-2" style={{ color: "var(--text-dark)" }}>
            {locale === "en" ? "Wait! You are missing out..." : "Warte! Du verpasst was..."}
          </h2>
          <p className="mb-4" style={{ color: "var(--text-light)" }}>
            {locale === "en"
              ? "Get daily AI business tips straight to your inbox. Best tools, top affiliate deals."
              : "Erhalte täglich KI-Business-Tipps direkt in dein Postfach. Die besten Tools, die höchsten Affiliate-Deals."}
          </p>

          {/* Bonus */}
          <div className="rounded-lg p-3 mb-6" style={{ background: "rgba(59, 130, 246, 0.1)", border: "1px solid rgba(59, 130, 246, 0.3)" }}>
            <p className="text-sm font-semibold" style={{ color: "#3b82f6" }}>
              {locale === "en"
                ? '✨ Bonus: Exclusive "Top 10 AI Tools 2026" PDF (free)'
                : '✨ Bonus: Exklusives "Top 10 AI Tools 2026" PDF (kostenlos)'}
            </p>
          </div>

          {/* Email Input */}
          <div className="flex gap-2 mb-4">
            <input
              type="email"
              placeholder={locale === "en" ? "your@email.com" : "deine@email.com"}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 transition-all"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "var(--text-dark)",
              }}
            />
            <button
              onClick={handleSubscribe}
              disabled={loading || !email}
              className="px-6 py-2 text-white rounded-lg font-medium transition-colors"
              style={{ background: "var(--primary)", opacity: loading || !email ? 0.5 : 1 }}
            >
              {loading ? "..." : locale === "en" ? "Yes!" : "Ja!"}
            </button>
          </div>

          {message && (
            <p
              className="mb-4 text-sm"
              style={{ color: messageType === "success" ? "var(--success-light)" : "var(--danger-light)" }}
            >
              {message}
            </p>
          )}

          {/* Close CTA */}
          <button
            onClick={handleDismiss}
            className="text-sm w-full py-2 transition-colors"
            style={{ color: "var(--text-muted)" }}
          >
            {locale === "en" ? "No thanks, I do not want to earn money" : "Nein danke, ich will kein Geld verdienen"}
          </button>
        </div>
      </div>
    </div>
  );
}

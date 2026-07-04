"use client";

import React, { useState, useEffect } from "react";

export function ExitIntentPopup() {
  const [shown, setShown] = useState(false);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
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
    try {
      const response = await fetch("/api/subscribe-newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        alert("✅ Danke für deine Anmeldung!");
        setShown(false);
        setEmail("");
      }
    } finally {
      setLoading(false);
    }
  };

  if (!shown) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl p-8 max-w-md mx-4 shadow-2xl animate-in fade-in scale-95 duration-200">
        {/* Close Button */}
        <button
          onClick={() => setShown(false)}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>

        {/* Content */}
        <div className="text-center">
          <div className="text-4xl mb-4">🎁</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Warte! Du verpasst was...
          </h2>
          <p className="text-gray-600 mb-4">
            Erhalte täglich KI-Business-Tipps direkt in dein Postfach. Die besten Tools, die höchsten Affiliate-Deals.
          </p>

          {/* Bonus */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6">
            <p className="text-sm font-semibold text-blue-900">
              ✨ Bonus: Exklusives "Top 10 AI Tools 2026" PDF (kostenlos)
            </p>
          </div>

          {/* Email Input */}
          <div className="flex gap-2 mb-4">
            <input
              type="email"
              placeholder="deine@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleSubscribe}
              disabled={loading || !email}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 font-medium transition-colors"
            >
              {loading ? "..." : "Ja!"}
            </button>
          </div>

          {/* Close CTA */}
          <button
            onClick={() => setShown(false)}
            className="text-sm text-gray-500 hover:text-gray-700 w-full py-2"
          >
            Nein danke, ich will kein Geld verdienen
          </button>
        </div>
      </div>
    </div>
  );
}

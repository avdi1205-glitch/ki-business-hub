"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { hasAnyConsentDecision, saveConsent } from "../../lib/cookie-consent";

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [advertising, setAdvertising] = useState(false);

  useEffect(() => {
    if (!hasAnyConsentDecision()) {
      const timer = setTimeout(() => setVisible(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  function acceptAll() {
    saveConsent(true, true);
    setVisible(false);
    // Trigger page reload so GA and AdSense initialise with consent
    window.location.reload();
  }

  function acceptEssential() {
    saveConsent(false, false);
    setVisible(false);
  }

  function acceptSelected() {
    saveConsent(analytics, advertising);
    setVisible(false);
    if (analytics || advertising) window.location.reload();
  }

  if (!visible) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-[70] border-t border-white/10"
      style={{ background: "rgba(8,14,26,0.97)", backdropFilter: "blur(20px)" }}
    >
      <div className="mx-auto max-w-6xl px-4 py-5 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold text-white">
              Diese Website verwendet Cookies
            </p>
            <p className="mt-1 text-xs leading-5 text-slate-400">
              Wir nutzen notwendige Cookies für den Betrieb. Mit deiner Zustimmung nutzen wir außerdem Analytics (Google Analytics) und Werbung (Google AdSense), um die Seite zu verbessern und zu finanzieren.
              {" "}
              <Link href="/datenschutz" className="underline hover:text-white">
                Datenschutzerklärung
              </Link>
            </p>

            {expanded && (
              <div className="mt-4 space-y-3 rounded-xl border border-white/[0.08] p-4" style={{ background: "rgba(255,255,255,0.02)" }}>
                <label className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold text-white">Notwendige Cookies</p>
                    <p className="text-xs text-slate-500">Technisch erforderlich. Immer aktiv.</p>
                  </div>
                  <div className="h-5 w-9 rounded-full bg-emerald-500 opacity-60" aria-label="immer aktiv" />
                </label>

                <label className="flex cursor-pointer items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold text-white">Analytics</p>
                    <p className="text-xs text-slate-500">Google Analytics – anonymisierte Nutzungsstatistiken.</p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={analytics}
                    onClick={() => setAnalytics((v) => !v)}
                    className="relative h-5 w-9 rounded-full transition-colors"
                    style={{ background: analytics ? "#06b6d4" : "rgba(255,255,255,0.12)" }}
                  >
                    <span
                      className="absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform"
                      style={{ left: analytics ? "calc(100% - 18px)" : "2px" }}
                    />
                  </button>
                </label>

                <label className="flex cursor-pointer items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold text-white">Werbung</p>
                    <p className="text-xs text-slate-500">Google AdSense – personalisierte Anzeigen.</p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={advertising}
                    onClick={() => setAdvertising((v) => !v)}
                    className="relative h-5 w-9 rounded-full transition-colors"
                    style={{ background: advertising ? "#06b6d4" : "rgba(255,255,255,0.12)" }}
                  >
                    <span
                      className="absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform"
                      style={{ left: advertising ? "calc(100% - 18px)" : "2px" }}
                    />
                  </button>
                </label>
              </div>
            )}
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-2">
            {expanded ? (
              <>
                <button
                  type="button"
                  onClick={acceptSelected}
                  className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-slate-200 transition hover:bg-white/10"
                >
                  Auswahl speichern
                </button>
                <button
                  type="button"
                  onClick={() => setExpanded(false)}
                  className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-slate-400 transition hover:bg-white/10"
                >
                  Weniger
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setExpanded(true)}
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-slate-400 transition hover:bg-white/10"
              >
                Einstellungen
              </button>
            )}
            <button
              type="button"
              onClick={acceptEssential}
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-slate-200 transition hover:bg-white/10"
            >
              Nur notwendige
            </button>
            <button
              type="button"
              onClick={acceptAll}
              className="rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-4 py-2 text-xs font-bold text-white shadow transition hover:opacity-90"
            >
              Alle akzeptieren
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

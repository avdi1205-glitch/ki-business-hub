"use client";

import { useState } from "react";

type AssistantMode = "menu" | "support" | "offer" | "lead";

export default function SupportAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<AssistantMode>("menu");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function submitLead(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSending(true);
    setMessage(null);

    try {
      const response = await fetch("/api/contact-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          name,
          plan: "unknown",
          source: "chat-widget",
          intent: "lead",
          reason: "chat_contact_request",
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        setMessage(typeof data?.error === "string" ? data.error : "Speichern fehlgeschlagen.");
        return;
      }

      setMessage("Danke! Wir haben deine Anfrage gespeichert und melden uns per E-Mail.");
      setEmail("");
      setName("");
    } catch {
      setMessage("Netzwerkfehler. Bitte spaeter erneut versuchen.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="fixed bottom-5 right-5 z-[60]">
      {isOpen && (
        <section className="mb-3 w-[min(92vw,380px)] overflow-hidden rounded-2xl border border-white/15 bg-slate-950/95 shadow-2xl backdrop-blur-xl">
          <header className="flex items-center justify-between border-b border-white/10 px-4 py-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">Nexmoneta Assist</p>
              <h3 className="text-sm font-bold text-white">Support, Leads, Angebote</h3>
            </div>
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                setMode("menu");
              }}
              className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-sm text-slate-200"
              aria-label="Assistant schliessen"
            >
              x
            </button>
          </header>

          <div className="space-y-3 px-4 py-4 text-sm text-slate-200">
            {mode === "menu" && (
              <>
                <p className="leading-6 text-slate-300">Waehle einen Bereich. Ich leite dich direkt zum naechsten sinnvollen Schritt.</p>
                <div className="grid gap-2">
                  <button
                    type="button"
                    onClick={() => setMode("support")}
                    className="rounded-xl border border-cyan-400/30 bg-cyan-500/10 px-3 py-2 text-left font-semibold text-cyan-100"
                  >
                    1) Support-Frage stellen
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode("offer")}
                    className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-3 py-2 text-left font-semibold text-emerald-100"
                  >
                    2) Passendes Angebot finden
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode("lead")}
                    className="rounded-xl border border-violet-400/30 bg-violet-500/10 px-3 py-2 text-left font-semibold text-violet-100"
                  >
                    3) Rueckmeldung per E-Mail anfordern
                  </button>
                </div>
              </>
            )}

            {mode === "support" && (
              <>
                <p className="leading-6 text-slate-300">Fuer Support und konkrete Fragen nutze die Kontaktseite mit vorbefuelltem Intent:</p>
                <a
                  href="/kontakt?intent=support&source=chat-support"
                  className="block rounded-xl border border-cyan-400/30 bg-cyan-500/10 px-3 py-2 text-center font-semibold text-cyan-100"
                >
                  Zu Kontakt & Support
                </a>
                <button type="button" onClick={() => setMode("menu")} className="text-xs text-slate-400">
                  Zurueck
                </button>
              </>
            )}

            {mode === "offer" && (
              <>
                <p className="leading-6 text-slate-300">Waehle den schnellsten Pfad fuer dein aktuelles Ziel:</p>
                <div className="grid gap-2">
                  <a
                    href="/content-factory?source=chat-offer-free"
                    className="rounded-xl border border-slate-400/30 bg-white/5 px-3 py-2 text-center font-semibold"
                  >
                    Kostenlos starten
                  </a>
                  <a
                    href="/api/checkout?plan=pro&source=chat-offer-pro"
                    className="rounded-xl border border-cyan-400/30 bg-cyan-500/10 px-3 py-2 text-center font-semibold text-cyan-100"
                  >
                    Pro aktivieren
                  </a>
                  <a
                    href="/api/checkout?plan=agency&source=chat-offer-agency"
                    className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-3 py-2 text-center font-semibold text-emerald-100"
                  >
                    Agency aktivieren
                  </a>
                </div>
                <button type="button" onClick={() => setMode("menu")} className="text-xs text-slate-400">
                  Zurueck
                </button>
              </>
            )}

            {mode === "lead" && (
              <>
                <p className="leading-6 text-slate-300">Trage deine E-Mail ein. Wir speichern deinen Lead mit Chat-Quelle.</p>
                <form className="space-y-2" onSubmit={submitLead}>
                  <input
                    type="text"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Name (optional)"
                    className="w-full rounded-lg border border-white/15 bg-slate-900/80 px-3 py-2 text-sm text-slate-100"
                  />
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="deine@email.de"
                    required
                    className="w-full rounded-lg border border-white/15 bg-slate-900/80 px-3 py-2 text-sm text-slate-100"
                  />
                  <button
                    type="submit"
                    disabled={sending}
                    className="w-full rounded-xl border border-violet-400/30 bg-violet-500/10 px-3 py-2 font-semibold text-violet-100 disabled:opacity-60"
                  >
                    {sending ? "Speichere..." : "Lead speichern"}
                  </button>
                </form>
                {message && <p className="text-xs text-slate-300">{message}</p>}
                <button type="button" onClick={() => setMode("menu")} className="text-xs text-slate-400">
                  Zurueck
                </button>
              </>
            )}
          </div>
        </section>
      )}

      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="rounded-full border border-cyan-300/30 bg-gradient-to-r from-cyan-500 to-emerald-500 px-5 py-3 text-sm font-black text-slate-950 shadow-lg shadow-cyan-500/25"
      >
        {isOpen ? "Assistant schliessen" : "Chat starten"}
      </button>
    </div>
  );
}

"use client";

import { useState } from "react";

type AssistantMode = "menu" | "support" | "offer" | "lead" | "done";

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mt-1 flex items-center gap-1 text-xs text-slate-500 transition hover:text-slate-300"
    >
      ← Zurück
    </button>
  );
}

export default function SupportAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<AssistantMode>("menu");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [sending, setSending] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  function closeWidget() {
    setIsOpen(false);
    setMode("menu");
    setErrorMsg(null);
  }

  async function submitLead(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSending(true);
    setErrorMsg(null);

    try {
      const response = await fetch("/api/contact-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          name: name.trim() || undefined,
          plan: "unknown",
          source: "chat-widget",
          intent: "lead",
          reason: "chat_contact_request",
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        setErrorMsg(typeof data?.error === "string" ? data.error : "Speichern fehlgeschlagen.");
        return;
      }

      setEmail("");
      setName("");
      setMode("done");
    } catch {
      setErrorMsg("Netzwerkfehler. Bitte erneut versuchen.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="fixed bottom-5 right-5 z-[60] flex flex-col items-end">
      {isOpen && (
        <div className="mb-3 w-[min(92vw,360px)] overflow-hidden rounded-2xl border border-white/10 bg-[#0b1120]/98 shadow-[0_24px_60px_rgba(0,0,0,0.6)] backdrop-blur-2xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 bg-gradient-to-r from-cyan-500/10 to-emerald-500/10 px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-emerald-500 text-xs font-black text-slate-950">N</span>
              <div>
                <p className="text-xs font-black tracking-widest text-cyan-300 uppercase">Nexmoneta</p>
                <p className="text-[11px] text-slate-400">Assistent · Immer online</p>
              </div>
            </div>
            <button
              type="button"
              onClick={closeWidget}
              aria-label="Chat schließen"
              className="flex h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-300 transition hover:bg-white/15 hover:text-white"
            >
              ✕
            </button>
          </div>

          {/* Body */}
          <div className="px-4 py-4 text-sm text-slate-200">
            {mode === "menu" && (
              <div className="space-y-3">
                <p className="text-sm leading-6 text-slate-400">
                  Wie kann ich dir weiterhelfen?
                </p>
                <div className="grid gap-2">
                  {[
                    { label: "💬  Support-Frage stellen", sub: "Direktlink zur Kontaktseite", mode: "support" as const, color: "border-cyan-400/30 bg-cyan-500/8 hover:bg-cyan-500/15 text-cyan-100" },
                    { label: "⚡  Passendes Angebot finden", sub: "Free, Pro oder Agency", mode: "offer" as const, color: "border-emerald-400/30 bg-emerald-500/8 hover:bg-emerald-500/15 text-emerald-100" },
                    { label: "📬  Rückmeldung anfordern", sub: "Wir melden uns per E-Mail", mode: "lead" as const, color: "border-violet-400/30 bg-violet-500/8 hover:bg-violet-500/15 text-violet-100" },
                  ].map((item) => (
                    <button
                      key={item.mode}
                      type="button"
                      onClick={() => setMode(item.mode)}
                      className={`rounded-xl border px-3 py-3 text-left transition ${item.color}`}
                    >
                      <span className="block font-bold">{item.label}</span>
                      <span className="block text-[11px] text-slate-400">{item.sub}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {mode === "support" && (
              <div className="space-y-3">
                <p className="leading-6 text-slate-300">
                  Ich leite dich zur Kontaktseite weiter. Deine Anfrage wird direkt als Support-Anfrage vorausgefüllt.
                </p>
                <a
                  href="/kontakt?intent=support&source=chat-support"
                  className="flex items-center justify-center gap-2 rounded-xl border border-cyan-400/30 bg-cyan-500/10 px-4 py-3 font-bold text-cyan-100 transition hover:bg-cyan-500/20"
                >
                  Zu Kontakt & Support →
                </a>
                <BackButton onClick={() => setMode("menu")} />
              </div>
            )}

            {mode === "offer" && (
              <div className="space-y-3">
                <p className="leading-6 text-slate-300">
                  Wähle den passenden Plan für dein Ziel:
                </p>
                <div className="grid gap-2">
                  <a
                    href="/content-factory?source=chat-offer-free"
                    className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3 font-semibold text-slate-200 transition hover:bg-white/10"
                  >
                    <span>🚀 Kostenlos starten</span>
                    <span className="text-xs text-slate-500">Gratis</span>
                  </a>
                  <a
                    href="/api/checkout?plan=pro&source=chat-offer-pro"
                    className="flex items-center justify-between rounded-xl border border-cyan-400/30 bg-cyan-500/10 px-4 py-3 font-bold text-cyan-100 transition hover:bg-cyan-500/20"
                  >
                    <span>⚡ Pro aktivieren</span>
                    <span className="text-xs text-cyan-300">39 €/Monat</span>
                  </a>
                  <a
                    href="/api/checkout?plan=agency&source=chat-offer-agency"
                    className="flex items-center justify-between rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 font-bold text-emerald-100 transition hover:bg-emerald-500/20"
                  >
                    <span>🏢 Agency aktivieren</span>
                    <span className="text-xs text-emerald-300">99 €/Monat</span>
                  </a>
                </div>
                <BackButton onClick={() => setMode("menu")} />
              </div>
            )}

            {mode === "lead" && (
              <div className="space-y-3">
                <p className="leading-6 text-slate-300">
                  Trag deine E-Mail ein. Wir melden uns direkt bei dir.
                </p>
                <form className="space-y-2" onSubmit={submitLead}>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Name (optional)"
                    className="w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2.5 text-sm text-slate-100 placeholder-slate-500 outline-none focus:border-violet-400/60"
                  />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="deine@email.de *"
                    required
                    className="w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2.5 text-sm text-slate-100 placeholder-slate-500 outline-none focus:border-violet-400/60"
                  />
                  {errorMsg && (
                    <p className="rounded-lg border border-rose-400/25 bg-rose-500/10 px-3 py-2 text-xs text-rose-200">
                      {errorMsg}
                    </p>
                  )}
                  <button
                    type="submit"
                    disabled={sending}
                    className="w-full rounded-xl bg-gradient-to-r from-violet-500 to-cyan-500 px-4 py-2.5 font-bold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {sending ? "Wird gespeichert…" : "Rückmeldung anfordern"}
                  </button>
                </form>
                <BackButton onClick={() => setMode("menu")} />
              </div>
            )}

            {mode === "done" && (
              <div className="space-y-4 py-2 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20 text-2xl">
                  ✅
                </div>
                <p className="font-bold text-white">Anfrage gespeichert!</p>
                <p className="text-sm leading-6 text-slate-400">
                  Wir haben deine Kontaktanfrage erhalten und melden uns so schnell wie möglich per E-Mail.
                </p>
                <button
                  type="button"
                  onClick={closeWidget}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-white/10"
                >
                  Schließen
                </button>
              </div>
            )}
          </div>

          {/* Footer */}
          {mode !== "done" && (
            <div className="border-t border-white/5 px-4 py-2 text-center text-[11px] text-slate-600">
              Nexmoneta · kontakt@nexmoneta.com
            </div>
          )}
        </div>
      )}

      {/* Toggle button */}
      <button
        type="button"
        onClick={() => {
          setIsOpen((prev) => !prev);
          if (!isOpen) setMode("menu");
        }}
        className="flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-500 to-emerald-500 px-5 py-3 text-sm font-black text-slate-950 shadow-[0_8px_30px_rgba(6,182,212,0.4)] transition hover:shadow-[0_8px_40px_rgba(6,182,212,0.55)] active:scale-95"
      >
        {isOpen ? (
          <>✕ Schließen</>
        ) : (
          <>💬 Hilfe &amp; Angebote</>
        )}
      </button>
    </div>
  );
}

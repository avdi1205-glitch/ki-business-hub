"use client";

import { useState } from "react";

type CheckoutRescueLeadFormProps = {
  plan?: string;
  source?: string;
  intent?: string;
  reason?: string;
};

export default function CheckoutRescueLeadForm({
  plan,
  source,
  intent,
  reason,
}: CheckoutRescueLeadFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");

    try {
      const response = await fetch("/api/contact-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          plan,
          source,
          intent,
          reason,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        setStatus("error");
        setMessage(data.error || "Konnte Anfrage nicht speichern.");
        return;
      }

      setStatus("success");
      setMessage("Danke. Wir melden uns mit einem passenden naechsten Schritt.");
      setEmail("");
      setName("");
    } catch {
      setStatus("error");
      setMessage("Verbindung fehlgeschlagen. Bitte kurz spaeter erneut versuchen.");
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <input
        type="text"
        value={name}
        onChange={(event) => setName(event.target.value)}
        placeholder="Dein Name"
        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-400 focus:border-cyan-400 focus:outline-none"
      />
      <input
        type="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        placeholder="deine@email.de"
        required
        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-400 focus:border-cyan-400 focus:outline-none"
      />
      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 px-4 py-3 text-sm font-black text-white transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-60"
      >
        {status === "loading" ? "Speichert..." : "Rueckmeldung anfordern"}
      </button>

      {message && (
        <p className={`text-sm ${status === "success" ? "text-emerald-300" : "text-rose-300"}`}>
          {message}
        </p>
      )}
    </form>
  );
}

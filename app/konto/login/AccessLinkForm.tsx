"use client";

import { FormEvent, useState } from "react";

export default function AccessLinkForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setSent(false);

    try {
      const response = await fetch("/api/customer/access-link", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setSent(true);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-6">
      <div>
        <label htmlFor="customer-email" className="mb-2 block text-sm font-semibold text-slate-200">
          E-Mail vom Kauf
        </label>
        <input
          id="customer-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full rounded-lg border border-white/10 bg-slate-950/60 px-4 py-3 text-slate-100 outline-none focus:border-emerald-400/50"
          placeholder="du@beispiel.de"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-500 px-4 py-3 font-bold text-slate-950 transition-all hover:opacity-95 disabled:opacity-60"
      >
        {loading ? "Senden..." : "Zugangslink senden"}
      </button>

      {sent && (
        <p className="rounded-lg border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
          Falls ein aktiver Plan auf diese E-Mail läuft, wurde ein Zugangslink gesendet.
        </p>
      )}
    </form>
  );
}

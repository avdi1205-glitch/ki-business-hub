"use client";

import { useState } from "react";

export default function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");

    try {
      const response = await fetch("/api/subscribe-newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus("success");
        setMessage("✅ Willkommen! Schau in dein Email-Postfach 📧");
        setEmail("");
        setName("");
        setTimeout(() => setStatus("idle"), 3000);
      } else {
        setStatus("error");
        setMessage(data.error || "Fehler beim Anmelden");
      }
    } catch (error) {
      setStatus("error");
      setMessage("Verbindungsfehler - Bitte versuche es später erneut");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <input
        type="text"
        placeholder="Dein Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-white placeholder-gray-400 focus:border-cyan-500 focus:outline-none"
      />
      <input
        type="email"
        placeholder="deine@email.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-white placeholder-gray-400 focus:border-cyan-500 focus:outline-none"
      />
      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full rounded-lg bg-gradient-to-r from-cyan-500 to-purple-500 px-4 py-3 font-bold text-white hover:from-cyan-600 hover:to-purple-600 disabled:opacity-50"
      >
        {status === "loading" ? "⏳ Wird angemeldet..." : "📧 Newsletter Abonnieren"}
      </button>

      {message && (
        <p
          className={`text-center text-sm ${
            status === "success" ? "text-green-400" : "text-red-400"
          }`}
        >
          {message}
        </p>
      )}
    </form>
  );
}

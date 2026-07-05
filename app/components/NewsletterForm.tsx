"use client";

import { useState } from "react";
import { useLocale } from "next-intl";

type NewsletterFormProps = {
  source?: string;
};

export default function NewsletterForm({ source = "newsletter-form" }: NewsletterFormProps) {
  const locale = useLocale();
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
        body: JSON.stringify({ email, name, source }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus("success");
        setMessage(locale === "en" ? "✅ Welcome! Check your email inbox 📧" : "✅ Willkommen! Schau in dein Email-Postfach 📧");
        setEmail("");
        setName("");
        setTimeout(() => setStatus("idle"), 3000);
      } else {
        setStatus("error");
        setMessage(data.error || (locale === "en" ? "Sign-up failed" : "Fehler beim Anmelden"));
      }
    } catch {
      setStatus("error");
      setMessage(locale === "en" ? "Connection error - Please try again later" : "Verbindungsfehler - Bitte versuche es später erneut");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <input
        type="text"
        placeholder={locale === "en" ? "Your name" : "Dein Name"}
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full rounded-lg px-4 py-3 focus:border-cyan-500 focus:outline-none"
        style={{
          border: "1px solid var(--border)",
          background: "var(--background-elevated)",
          color: "var(--text-dark)",
        }}
      />
      <input
        type="email"
        placeholder={locale === "en" ? "your@email.com" : "deine@email.com"}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className="w-full rounded-lg px-4 py-3 focus:border-cyan-500 focus:outline-none"
        style={{
          border: "1px solid var(--border)",
          background: "var(--background-elevated)",
          color: "var(--text-dark)",
        }}
      />
      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full rounded-lg bg-gradient-to-r from-cyan-500 to-purple-500 px-4 py-3 font-bold text-white hover:from-cyan-600 hover:to-purple-600 disabled:opacity-50"
      >
        {status === "loading"
          ? locale === "en"
            ? "⏳ Subscribing..."
            : "⏳ Wird angemeldet..."
          : locale === "en"
            ? "📧 Subscribe to newsletter"
            : "📧 Newsletter Abonnieren"}
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

"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";
import { useTranslations } from "next-intl";

export default function AdminLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations("adminAuth");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    const nextPath = searchParams.get("next") || "/admin/dashboard";

    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password, nextPath }),
    });

    if (!response.ok) {
      setSubmitting(false);
      setError(t("error"));
      return;
    }

    const payload = (await response.json()) as { nextPath?: string };
    router.push(payload.nextPath || "/admin/dashboard");
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-16 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-md rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-2xl shadow-black/30 backdrop-blur-xl">
        <p className="text-xs font-bold uppercase tracking-[0.28em] text-cyan-300">Admin</p>
        <h1 className="mt-4 text-3xl font-black text-white">{t("title")}</h1>
        <p className="mt-3 text-sm leading-6 text-slate-300">{t("subtitle")}</p>

        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-200">{t("username")}</span>
            <input
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-400/40"
              autoComplete="username"
              required
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-200">{t("password")}</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-400/40"
              autoComplete="current-password"
              required
            />
          </label>

          {error && <p className="text-sm text-rose-300">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-2xl bg-gradient-to-r from-cyan-400 to-emerald-400 px-4 py-3 font-black text-slate-950 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {submitting ? t("submitting") : t("submit")}
          </button>
        </form>

        <Link href="/" className="mt-6 inline-block text-sm font-semibold text-slate-300 transition hover:text-white">
          ← {t("backHome")}
        </Link>
      </div>
    </main>
  );
}

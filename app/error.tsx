"use client";

import Link from "next/link";
import { useEffect } from "react";

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error("[app/error]", error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-3xl flex-col items-center justify-center px-6 text-center">
      <p className="mb-3 rounded-full border border-red-400/30 bg-red-500/10 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-red-200">
        Temporaerer Fehler
      </p>
      <h1 className="mb-3 text-3xl font-bold text-slate-100 md:text-4xl">
        Diese Ansicht konnte gerade nicht geladen werden
      </h1>
      <p className="mb-8 max-w-xl text-sm leading-7 text-slate-300 md:text-base">
        Wir haben den Fehler protokolliert. Bitte versuche es erneut oder gehe zur Startseite.
      </p>

      <div className="flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="rounded-lg bg-cyan-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-cyan-500"
        >
          Erneut versuchen
        </button>
        <Link
          href="/"
          className="rounded-lg border border-white/20 bg-white/5 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:bg-white/10"
        >
          Zur Startseite
        </Link>
      </div>
    </div>
  );
}

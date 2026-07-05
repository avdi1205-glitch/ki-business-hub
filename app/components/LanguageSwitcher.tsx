"use client";

import {useLocale} from "next-intl";

type Locale = "de" | "en";

function setLangCookie(locale: Locale) {
  document.cookie = `kb_lang=${locale}; path=/; max-age=31536000; samesite=lax`;
}

export default function LanguageSwitcher() {
  const locale = useLocale() as Locale;

  const switchTo = (nextLocale: Locale) => {
    if (nextLocale === locale) return;
    setLangCookie(nextLocale);
    window.location.reload();
  };

  return (
    <div className="flex items-center gap-1 rounded-full border border-white/10 bg-white/5 p-1 text-xs font-bold uppercase tracking-[0.18em] text-slate-200">
      <button
        type="button"
        onClick={() => switchTo("de")}
        className={`rounded-full px-3 py-1 transition ${locale === "de" ? "bg-white text-slate-950" : "text-slate-300 hover:text-white"}`}
      >
        DE
      </button>
      <button
        type="button"
        onClick={() => switchTo("en")}
        className={`rounded-full px-3 py-1 transition ${locale === "en" ? "bg-white text-slate-950" : "text-slate-300 hover:text-white"}`}
      >
        EN
      </button>
    </div>
  );
}

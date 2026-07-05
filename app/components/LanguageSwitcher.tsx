"use client";

import {useLocale} from "next-intl";

type Locale = "de" | "en";

type LanguageSwitcherProps = {
  compact?: boolean;
};

function setLangCookie(locale: Locale) {
  document.cookie = `kb_lang=${locale}; path=/; max-age=31536000; samesite=lax`;
}

export default function LanguageSwitcher({ compact = false }: LanguageSwitcherProps) {
  const locale = useLocale() as Locale;

  const switchTo = (nextLocale: Locale) => {
    if (nextLocale === locale) return;
    setLangCookie(nextLocale);
    window.location.reload();
  };

  return (
    <div
      className={`flex items-center rounded-full border border-white/10 bg-white/5 font-bold uppercase text-slate-200 ${
        compact ? "gap-0.5 p-0.5 text-[10px] tracking-[0.12em]" : "gap-1 p-1 text-xs tracking-[0.18em]"
      }`}
    >
      <button
        type="button"
        onClick={() => switchTo("de")}
        className={`rounded-full transition ${compact ? "px-2 py-1" : "px-3 py-1"} ${locale === "de" ? "bg-white text-slate-950" : "text-slate-300 hover:text-white"}`}
      >
        DE
      </button>
      <button
        type="button"
        onClick={() => switchTo("en")}
        className={`rounded-full transition ${compact ? "px-2 py-1" : "px-3 py-1"} ${locale === "en" ? "bg-white text-slate-950" : "text-slate-300 hover:text-white"}`}
      >
        EN
      </button>
    </div>
  );
}

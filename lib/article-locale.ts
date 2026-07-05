export type SupportedLocale = "de" | "en";

const SUPPORTED_LOCALES: SupportedLocale[] = ["de", "en"];

export function normalizeLocale(value: string | null | undefined): SupportedLocale {
  return SUPPORTED_LOCALES.includes(value as SupportedLocale)
    ? (value as SupportedLocale)
    : "de";
}

export function otherLocale(locale: SupportedLocale): SupportedLocale {
  return locale === "de" ? "en" : "de";
}

export function localeFromCookie(cookieHeader: string | null): SupportedLocale {
  if (!cookieHeader) return "de";

  const match = cookieHeader.match(/(?:^|;\s*)kb_lang=([^;]+)/);
  return normalizeLocale(match?.[1]);
}
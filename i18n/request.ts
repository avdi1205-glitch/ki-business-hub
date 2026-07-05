import {cookies} from "next/headers";
import {getRequestConfig} from "next-intl/server";

const locales = ["de", "en"] as const;

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const localeCookie = cookieStore.get("kb_lang")?.value;
  const locale = locales.includes(localeCookie as (typeof locales)[number])
    ? (localeCookie as (typeof locales)[number])
    : "de";

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default
  };
});

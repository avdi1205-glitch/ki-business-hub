import type { Metadata } from "next";
import { getLocale } from "next-intl/server";
import RevenueNavigatorStudio from "./RevenueNavigatorStudio";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();

  if (locale === "en") {
    return {
      title: "Revenue Navigator | Monetization tool and subscription models",
      description: "Scan your site, spot the best revenue lever, and upgrade to Pro or Agency when you want recurring growth direction.",
    };
  }

  return {
    title: "Revenue Navigator | Monetarisierungs-Tool und Abo-Modelle",
    description: "Scanne deine Seite, finde den naechsten Umsatzhebel und upgrade auf Pro oder Agency, wenn du wiederkehrende Wachstumsrichtung willst.",
  };
}

export default async function RevenueNavigatorPage() {
  const locale = await getLocale();

  return <RevenueNavigatorStudio locale={locale} />;
}

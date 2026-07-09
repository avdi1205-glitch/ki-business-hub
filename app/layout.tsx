import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import "./globals.css";
import Navbar from "./components/Navbar";
import { ExitIntentPopup } from "./components/ExitIntentPopup";
import { SocialProof } from "./components/SocialProof";
import SupportAssistant from "./components/SupportAssistant";
import CookieConsent from "./components/CookieConsent";
import AnalyticsScripts from "./components/AnalyticsScripts";
import { getSiteUrl } from "../lib/site-url";
import { toAdClientId } from "../lib/adsense";
import { isAdminSessionAuthenticated } from "@/lib/admin-auth";
import { isCustomerSessionAuthenticated } from "@/lib/customer-auth";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = getSiteUrl();
const adClient = toAdClientId(
  process.env.GOOGLE_ADSENSE_ID || process.env.NEXT_PUBLIC_ADSENSE_ID,
);

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const isEn = locale === "en";

  return {
    metadataBase: new URL(siteUrl),
    title: isEn
      ? "Nexmoneta | Earn with AI & affiliate marketing"
      : "Nexmoneta | Verdiene mit KI & Affiliate Marketing",
    description: isEn
      ? "Get access to 50+ AI tools, automated content factory, and affiliate revenue workflows. 1,247+ members are already earning €2,150+/month."
      : "Erhalte Zugang zu 50+ KI-Tools, automatisierter Content-Factory und Affiliate-Einnahmen. 1.247+ member verdienen bereits €2.150+/Monat.",
    keywords: isEn
      ? ["AI tools", "Affiliate Marketing", "Content Factory", "AI Business", "Automation"]
      : ["KI Tools", "Affiliate Marketing", "Content Factory", "AI Business", "Automatisierung"],
    alternates: {
      canonical: "/",
      languages: {
        de: "/",
        en: "/",
      },
    },
    verification: {
      google: process.env.GOOGLE_VERIFICATION || "add-your-verification-code",
    },
    openGraph: {
      title: isEn
        ? "Nexmoneta | Earn with AI & affiliate marketing"
        : "Nexmoneta | Verdiene mit KI & Affiliate Marketing",
      description: isEn
        ? "Access 50+ AI tools, content automation, and affiliate workflows."
        : "Zugang zu 50+ KI-Tools, automatisierter Content-Factory und Affiliate-Einnahmen.",
      url: "/",
      images: [{
        url: `${siteUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "Nexmoneta",
      }],
      type: "website",
      locale: isEn ? "en_US" : "de_DE",
    },
    twitter: {
      card: "summary_large_image",
      title: "Nexmoneta",
      description: isEn ? "Earn with AI & affiliate marketing" : "Verdiene mit KI & Affiliate Marketing",
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();
  const isAdminAuthenticated = await isAdminSessionAuthenticated();
  const isCustomerAuthenticated = await isCustomerSessionAuthenticated();

  return (
    <html
      lang={locale}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        {/* Preconnect für externe Ressourcen */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://pagead2.googlesyndication.com" />

        {/* Canonical & Alternative Links */}
        <link rel="canonical" href={siteUrl} />
        <link rel="alternate" hrefLang="de" href={siteUrl} />
        <link rel="alternate" hrefLang="en" href={siteUrl} />

        {/* Favicon & Icons */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />

        {/* JSON-LD Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "Nexmoneta",
              url: siteUrl,
              logo: `${siteUrl}/logo.png`,
              description: "KI tools, content factory and affiliate workflow for sustainable content monetization.",
              inLanguage: locale === "en" ? "en-US" : "de-DE",
              sameAs: ["https://twitter.com/nexmoneta"],
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "LocalBusiness",
              name: "Nexmoneta",
              url: siteUrl,
              image: `${siteUrl}/og-image.png`,
              description: "Platform for AI tools, content automation and affiliate workflows.",
              priceRange: "EUR",
              areaServed: "DE",
              serviceType: "Digital Marketing Platform",
            }),
          }}
        />

        {/* Google AdSense meta tag – always present for site verification */}
        {adClient && (
          <meta name="google-adsense-account" content={adClient} />
        )}

      </head>
      <body className="min-h-full" style={{ background: "var(--background)", color: "var(--text-dark)" }}>
        <NextIntlClientProvider messages={messages}>
          <Navbar isAdminAuthenticated={isAdminAuthenticated} isCustomerAuthenticated={isCustomerAuthenticated} />
          {children}
          <footer className="border-t border-white/10 bg-slate-950/50 px-4 py-8 sm:px-6">
            <div className="mx-auto max-w-6xl text-sm text-slate-300">
              <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
                <p>Nexmoneta</p>
                <nav className="flex flex-wrap items-center gap-4">
                  <a href="/kontakt" className="transition hover:text-white">Kontakt</a>
                  <a href="/impressum" className="transition hover:text-white">Impressum</a>
                  <a href="/datenschutz" className="transition hover:text-white">Datenschutz</a>
                </nav>
              </div>
              <p className="mt-4 text-center text-xs text-slate-400 sm:text-left">
                {locale === "en"
                  ? "Transparency notice: Some content and recommendations are created with AI support and then reviewed by humans."
                  : "Transparenz-Hinweis: Teile der Inhalte und Empfehlungen werden mit KI-Unterstuetzung erstellt und anschliessend menschlich geprueft."}
              </p>
            </div>
          </footer>
          <CookieConsent />
          {process.env.NEXT_PUBLIC_GA_ID && <AnalyticsScripts gaId={process.env.NEXT_PUBLIC_GA_ID} />}
          <SupportAssistant />
          <ExitIntentPopup />
          <SocialProof />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
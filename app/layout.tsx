import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import "./globals.css";
import Navbar from "./components/Navbar";
import { ExitIntentPopup } from "./components/ExitIntentPopup";
import { SocialProof } from "./components/SocialProof";
import { getSiteUrl } from "../lib/site-url";
import { toAdClientId } from "../lib/adsense";

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

        {/* Google AdSense */}
        {adClient && (
          <meta name="google-adsense-account" content={adClient} />
        )}

        {/* Google Analytics */}
        {process.env.NEXT_PUBLIC_GA_ID && (
          <>
            <Script
              async
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}', {
  'anonymize_ip': true,
  'cookie_flags': 'SameSite=None;Secure'
});`}
            </Script>
          </>
        )}

      </head>
      <body className="min-h-full" style={{ background: "var(--background)", color: "var(--text-dark)" }}>
        <NextIntlClientProvider messages={messages}>
          <Navbar />
          {children}
          <ExitIntentPopup />
          <SocialProof />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
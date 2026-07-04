import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
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

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "KI Business Hub | Verdiene mit KI & Affiliate Marketing",
  description: "Erhalte Zugang zu 50+ KI-Tools, automatisierter Content-Factory und Affiliate-Einnahmen. 1.247+ member verdienen bereits €2.150+/Monat.",
  keywords: ["KI Tools", "Affiliate Marketing", "Content Factory", "AI Business", "Automatisierung"],
  alternates: {
    canonical: "/",
    languages: {
      de: "/",
    },
  },
  verification: {
    google: process.env.GOOGLE_VERIFICATION || "add-your-verification-code",
  },
  openGraph: {
    title: "KI Business Hub | Verdiene mit KI & Affiliate Marketing",
    description: "Zugang zu 50+ KI-Tools, automatisierter Content-Factory und Affiliate-Einnahmen.",
    url: "/",
    images: [{
      url: `${siteUrl}/og-image.png`,
      width: 1200,
      height: 630,
      alt: "KI Business Hub",
    }],
    type: "website",
    locale: "de_DE",
  },
  twitter: {
    card: "summary_large_image",
    title: "KI Business Hub",
    description: "Verdiene mit KI & Affiliate Marketing",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="de"
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
              name: "KI Business Hub",
              url: siteUrl,
              logo: `${siteUrl}/logo.png`,
              description: "KI-Tools, Content-Factory und Affiliate-Workflow fuer nachhaltige Content-Monetarisierung.",
              inLanguage: "de-DE",
              sameAs: ["https://twitter.com/kibusinesshub"],
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "LocalBusiness",
              name: "KI Business Hub",
              url: siteUrl,
              image: `${siteUrl}/og-image.png`,
              description: "Plattform fuer KI-Tools, Content-Automation und Affiliate-Workflows.",
              priceRange: "EUR",
              areaServed: "DE",
              serviceType: "Digital Marketing Platform",
            }),
          }}
        />

        {/* Google AdSense */}
        {adClient && (
          <Script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adClient}`}
            crossOrigin="anonymous"
            strategy="afterInteractive"
          />
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
        <Navbar />
        {children}
        <ExitIntentPopup />
        <SocialProof />
      </body>
    </html>
  );
}
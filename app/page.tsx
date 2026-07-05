import Link from "next/link";
import type { Metadata } from "next";
import Script from "next/script";
import { prisma } from "../lib/prisma";
import TopTools from "./components/TopTools";
import ConversionHero from "./components/ConversionHero";
import { FeaturesSection } from "./components/FeaturesSection";
import { PricingSection } from "./components/PricingSection";
import { ComparisonTable } from "./components/ComparisonTable";
import { FAQSection } from "./components/FAQSection";
import { TestimonialsSection } from "./components/TestimonialsSection";
import NewsletterForm from "./components/NewsletterForm";
import CheckoutCtaButton from "./components/CheckoutCtaButton";
import { getSiteUrl } from "../lib/site-url";
import { getLocale, getTranslations } from "next-intl/server";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();

  if (locale === "en") {
    return {
      title: "KI Business Hub | AI tools, content factory, and affiliate workflow",
      description:
        "Use AI content, affiliate tools, and automation in one clear workflow. Start free and upgrade to Pro or Agency when you need it.",
      alternates: {
        canonical: "/",
      },
    };
  }

  return {
    title: "KI Business Hub | KI-Tools, Content-Factory und Affiliate-Workflow",
    description:
      "Nutze KI-Content, Affiliate-Tools und Automatisierung in einem klaren Workflow. Starte kostenlos und upgrade bei Bedarf auf Pro oder Agency.",
    alternates: {
      canonical: "/",
    },
  };
}

export default async function Home() {
  const siteUrl = getSiteUrl();
  const locale = await getLocale();
  const t = await getTranslations("home");

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity:
      locale === "en"
        ? [
            {
              "@type": "Question",
              name: "How much can I really earn?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "It depends on niche, reach, and execution. The platform helps you create content faster and implement monetization in a more structured way.",
              },
            },
            {
              "@type": "Question",
              name: "Is it really free?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Yes, you can start for free. For more volume, automation, and reporting, Pro is available for EUR 39 per month.",
              },
            },
            {
              "@type": "Question",
              name: "How does affiliate payout work?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "You place relevant recommendations and can track clicks. Compensation comes from each partner program and varies.",
              },
            },
            {
              "@type": "Question",
              name: "Is my site really secure?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "There are technical protection mechanisms for infrastructure and data access. You should also use strong credentials and clean processes.",
              },
            },
          ]
        : [
            {
              "@type": "Question",
              name: "Wie viel kann ich wirklich verdienen?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Das haengt von Nische, Reichweite und Umsetzung ab. Die Plattform hilft dir, Inhalte schneller zu erstellen und Monetarisierung strukturierter umzusetzen.",
              },
            },
            {
              "@type": "Question",
              name: "Ist das wirklich kostenlos?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Ja, du kannst kostenlos starten. Fuer mehr Volumen, Automatisierung und Reports gibt es Pro fuer 39 EUR pro Monat.",
              },
            },
            {
              "@type": "Question",
              name: "Wie funktioniert die Affiliate-Bezahlung?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Du platzierst passende Empfehlungen und kannst Klicks tracken. Die Verguetung kommt vom jeweiligen Partnerprogramm und ist unterschiedlich.",
              },
            },
            {
              "@type": "Question",
              name: "Ist meine Seite wirklich sicher?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Es gibt technische Schutzmechanismen fuer Infrastruktur und Datenzugriff. Zusaetzlich solltest du starke Zugangsdaten und saubere Prozesse nutzen.",
              },
            },
          ],
  };

  let tools: Awaited<ReturnType<typeof prisma.affiliateLink.findMany>> = [];
  let articles: Awaited<ReturnType<typeof prisma.article.findMany>> = [];

  try {
    tools = await prisma.affiliateLink.findMany({
      orderBy: { rating: "desc" },
      take: 3,
    });

    const recentArticles = await prisma.article.findMany({
      orderBy: { createdAt: "desc" },
      take: 15,
    });

    articles = recentArticles
      .filter((article) => {
        const row = article as { locale?: string | null };
        return !row.locale || row.locale === locale;
      })
      .slice(0, 3);
  } catch {
    // Keep rendering the customer-facing page even if the local DB is unavailable.
  }

  return (
    <>
      <Script
        id="faq-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <Script
        id="website-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "KI Business Hub",
            url: siteUrl,
            inLanguage: locale === "en" ? "en-US" : "de-DE",
          }),
        }}
      />

      <main style={{ background: "var(--background)", minHeight: "100vh" }}>
      {/* Conversion Hero */}
      <ConversionHero />

      {/* Features Section */}
      <FeaturesSection />

      {/* Testimonials Section */}
      <TestimonialsSection />

      {/* Top Tools Section */}
      <section className="py-24" style={{ background: "linear-gradient(135deg, var(--background) 0%, var(--background-alt) 100%)" }}>
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: "var(--text-dark)" }}>
              🏆 {t("topToolsTitle")}
            </h2>
            <p className="text-xl leading-8" style={{ color: "var(--text-light)" }}>
              {t("topToolsSubtitle")}
            </p>
          </div>

          <TopTools tools={tools} />
        </div>
      </section>

      {/* Unique Value Proposition - Einzigartig */}
      <section
        className="py-24"
        style={{
          background: "linear-gradient(180deg, #0f172a 0%, #111827 100%)",
        }}
      >
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4" style={{ color: "#f8fafc" }}>
              🚀 {t("uniqueTitle")}
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 rounded-xl" style={{ background: "rgba(30, 64, 175, 0.28)", border: "1px solid rgba(96, 165, 250, 0.45)", backdropFilter: "blur(10px)" }}>
              <div className="text-4xl mb-4">🤖</div>
              <h3 className="text-2xl font-bold mb-2" style={{ color: "#f8fafc" }}>{t("uniqueAi")}</h3>
              <p className="leading-7" style={{ color: "#dbeafe" }}>
                {t("uniqueAiText")}
              </p>
            </div>

            <div className="p-8 rounded-xl" style={{ background: "rgba(5, 150, 105, 0.26)", border: "1px solid rgba(74, 222, 128, 0.45)", backdropFilter: "blur(10px)" }}>
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-2xl font-bold mb-2" style={{ color: "#f8fafc" }}>{t("uniqueRoi")}</h3>
              <p className="leading-7" style={{ color: "#dcfce7" }}>
                {t("uniqueRoiText")}
              </p>
            </div>

            <div className="p-8 rounded-xl" style={{ background: "rgba(91, 33, 182, 0.28)", border: "1px solid rgba(196, 181, 253, 0.45)", backdropFilter: "blur(10px)" }}>
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-2xl font-bold mb-2" style={{ color: "#f8fafc" }}>{t("uniqueAutomation")}</h3>
              <p className="leading-7" style={{ color: "#ede9fe" }}>
                {t("uniqueAutomationText")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Latest Articles */}
      <section className="py-24" style={{ background: "linear-gradient(135deg, var(--background) 0%, var(--background-alt) 100%)" }}>
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4" style={{ color: "var(--text-dark)" }}>
              📝 {t("latestArticlesTitle")}
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {articles.slice(0, 3).map((article) => (
              <Link
                key={article.id}
                href={article.slug ? `/blog/${article.slug}` : "#"}
                className="group rounded-xl overflow-hidden transition-all duration-300 hover:shadow-xl"
                style={{ background: "var(--background-elevated)", border: "1px solid rgba(255,255,255,0.1)" }}
              >
                <div className="h-2 bg-gradient-to-r from-blue-500 to-green-500" />
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2 group-hover:text-blue-400 transition-colors" style={{ color: "var(--text-dark)" }}>
                    {article.title}
                  </h3>
                  <p className="mb-4 leading-7" style={{ color: "var(--text-light)" }}>
                    {article.content.substring(0, 100)}...
                  </p>
                  <div className="flex items-center gap-2 text-blue-400 font-semibold group-hover:translate-x-1 transition-transform">
                    {t("articleReadMore")}
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              href="/blog"
              className="px-8 py-4 font-bold rounded-lg transition-all duration-300 transform hover:scale-105 inline-block"
              style={{ background: "var(--primary)", color: "white" }}
            >
              {t("latestArticlesLink")}
            </Link>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <PricingSection />

      {/* Comparison Table */}
      <ComparisonTable />

      {/* FAQ Section */}
      <FAQSection />

      {/* Final CTA */}
      <section className="py-24 bg-gradient-to-r from-slate-900 to-slate-800 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            {t("finalTitle")}
          </h2>
          <p className="text-xl leading-8 mb-8" style={{ color: "#e2e8f0" }}>
            {t("finalSubtitle")}
          </p>
          <div className="flex flex-col items-center gap-4">
            <div className="flex flex-col gap-4 sm:flex-row">
              <Link
                href="/content-factory"
                className="px-10 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold text-lg rounded-lg hover:shadow-2xl hover:shadow-green-500/50 transition-all duration-300 transform hover:scale-105"
              >
                🚀 {t("finalFreeCta")}
              </Link>
              <CheckoutCtaButton
                href="/api/checkout?plan=pro"
                ctaKey="final-pro"
                variantA={{
                  label: `💎 ${t("finalProCta")}`,
                  sourceSuffix: "variant-a",
                  className: "px-10 py-4 rounded-lg border border-cyan-400/30 bg-cyan-500/10 text-cyan-100 font-bold text-lg transition-all duration-300 transform hover:scale-105 hover:bg-cyan-500/20",
                }}
                variantB={{
                  label: `⚡ ${t("finalProAltCta")}`,
                  sourceSuffix: "variant-b",
                  className: "px-10 py-4 rounded-lg border border-emerald-400/30 bg-emerald-500/10 text-emerald-100 font-bold text-lg transition-all duration-300 transform hover:scale-105 hover:bg-emerald-500/20",
                }}
              />
            </div>
            <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-5 text-left">
              <p className="mb-3 text-sm font-semibold text-cyan-300">📧 {t("newsletterTitle")}</p>
              <NewsletterForm source="homepage-final-cta" />
            </div>
          </div>
        </div>
      </section>
      </main>
    </>
  );
}

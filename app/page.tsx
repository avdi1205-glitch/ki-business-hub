import Link from "next/link";
import { prisma } from "../lib/prisma";
import TopTools from "./components/TopTools";
import ConversionHero from "./components/ConversionHero";
import { FeaturesSection } from "./components/FeaturesSection";
import { PricingSection } from "./components/PricingSection";
import { FAQSection } from "./components/FAQSection";
import { TestimonialsSection } from "./components/TestimonialsSection";

export default async function Home() {
  const tools = await prisma.affiliateLink.findMany({
    orderBy: { rating: "desc" },
    take: 3,
  });

  const articles = await prisma.article.findMany({
    orderBy: { createdAt: "desc" },
    take: 3,
  });

  return (
    <main className="min-h-screen bg-white">
      {/* Conversion Hero */}
      <ConversionHero />

      {/* Features Section */}
      <FeaturesSection />

      {/* Testimonials Section */}
      <TestimonialsSection />

      {/* Top Tools Section */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              🏆 Beste Tools 2026
            </h2>
            <p className="text-xl text-slate-600">
              Die Top-Affiliate-Tools für maximale Konversion
            </p>
          </div>

          <TopTools tools={tools} />
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200">
              <div className="text-4xl mb-4">🤖</div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">AI-Powered</h3>
              <p className="text-slate-600">
                50+ Artikel/Monat automatisch generiert mit KI
              </p>
            </div>

            <div className="p-8 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200">
              <div className="text-4xl mb-4">💰</div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">High Revenue</h3>
              <p className="text-slate-600">
                €6.250+/Monat mit Affiliate-Links verdienen
              </p>
            </div>

            <div className="p-8 rounded-xl bg-gradient-to-br from-purple-50 to-violet-50 border border-purple-200">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Automation</h3>
              <p className="text-slate-600">
                Newsletter, Publishing, SEO - alles automatisch
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Latest Articles */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              📝 Neueste Artikel
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {articles.slice(0, 3).map((article) => (
              <Link
                key={article.id}
                href={article.slug ? `/blog/${article.slug}` : "#"}
                className="group rounded-xl overflow-hidden border border-gray-200 hover:border-blue-400 transition-all duration-300 hover:shadow-lg bg-white"
              >
                <div className="h-2 bg-gradient-to-r from-blue-500 to-green-500" />
                <div className="p-6">
                  <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-blue-600">
                    {article.title}
                  </h3>
                  <p className="text-slate-600 mb-4">
                    {article.content.substring(0, 100)}...
                  </p>
                  <div className="flex items-center gap-2 text-blue-600 font-semibold group-hover:translate-x-1 transition-transform">
                    Lesen →
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              href="/blog"
              className="px-8 py-4 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 inline-block"
            >
              Alle Artikel anschauen
            </Link>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <PricingSection />

      {/* FAQ Section */}
      <FAQSection />

      {/* Final CTA */}
      <section className="py-24 bg-gradient-to-r from-slate-900 to-slate-800 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Bereit zum Starten?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Schließe dich 1.247+ erfolgreichen Membern an und verdiene dein erstes Geld
          </p>
          <button className="px-10 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold text-lg rounded-lg hover:shadow-2xl hover:shadow-green-500/50 transition-all duration-300 transform hover:scale-105">
            🚀 Kostenlos Starten
          </button>
        </div>
      </section>
    </main>
  );
}

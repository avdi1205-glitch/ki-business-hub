import { notFound } from "next/navigation";
import Link from "next/link";
import Script from "next/script";
import { prisma } from "../../../lib/prisma";
import { getSiteUrl } from "../../../lib/site-url";
import NewsletterForm from "@/app/components/NewsletterForm";
import OptimizedAffiliateButton from "@/app/components/OptimizedAffiliateButton";
import { Metadata } from "next";

function getExcerpt(text: string, maxLength = 160): string {
  if (!text) return "";
  const cleaned = text.replace(/\s+/g, " ").trim();
  if (cleaned.length <= maxLength) return cleaned;
  return `${cleaned.slice(0, maxLength - 1)}…`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = await prisma.article.findUnique({ where: { slug } });

  if (!article) return {};

  const siteUrl = getSiteUrl();
  const articleUrl = `${siteUrl}/blog/${slug}`;
  const description = getExcerpt(article.idea || article.content, 170);
  const ogImage = `${siteUrl}/og-image.png`;

  return {
    title: `${article.title} | KI Business Hub`,
    description,
    alternates: {
      canonical: `/blog/${slug}`,
    },
    authors: [{ name: "KI Business Hub" }],
    openGraph: {
      title: article.title,
      description,
      type: "article",
      url: articleUrl,
      publishedTime: article.createdAt.toISOString(),
      section: article.category || "Blog",
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: article.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description,
      images: [ogImage],
    },
  };
}

export default async function BlogArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const article = await prisma.article.findUnique({
    where: { slug },
  });

  if (!article) {
    notFound();
  }

  const siteUrl = getSiteUrl();
  const articleUrl = `${siteUrl}/blog/${slug}`;
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": articleUrl,
    url: articleUrl,
    mainEntityOfPage: articleUrl,
    headline: article.title,
    description: getExcerpt(article.idea || article.content, 170),
    datePublished: article.createdAt.toISOString(),
    inLanguage: "de-DE",
    articleSection: article.category || "Blog",
    isAccessibleForFree: true,
    image: [`${siteUrl}/og-image.png`],
    wordCount: article.content ? article.content.trim().split(/\s+/).length : undefined,
    author: {
      "@type": "Organization",
      name: "KI Business Hub",
      url: siteUrl,
    },
    publisher: {
      "@type": "Organization",
      name: "KI Business Hub",
      url: siteUrl,
      logo: {
        "@type": "ImageObject",
        url: `${siteUrl}/logo.png`,
      },
    },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Startseite",
        item: siteUrl,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Blog",
        item: `${siteUrl}/blog`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: article.title,
        item: articleUrl,
      },
    ],
  };

  // Get top tools for recommendations
  const topTools = await prisma.affiliateLink.findMany({
    orderBy: { rating: "desc" },
    take: 5,
  });

  // Query related tools only when a valid category exists.
  const relatedTools = article.category
    ? await prisma.affiliateLink.findMany({
      where: { category: article.category },
      orderBy: { clicks: "desc" },
      take: 3,
    })
    : [];

  const mainTools = topTools.slice(0, 3);
  const sidebarTools = relatedTools.slice(0, 4);

  return (
    <>
      <Script
        id="article-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <Script
        id="article-breadcrumb-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <main style={{ background: "var(--background)" }}>
      {/* Hero Section */}
      <section className="relative overflow-hidden px-6 py-20" style={{ background: "linear-gradient(135deg, var(--background) 0%, var(--background-alt) 100%)" }}>
        <div className="relative mx-auto max-w-4xl">
          <p className="mb-4 inline-flex items-center rounded-full border border-cyan-400/20 bg-cyan-500/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-cyan-200">
            KI erstellt
          </p>

          <p className="mb-4 font-bold" style={{ color: "var(--primary)" }}>
            {article.category || "Blog"} • SEO Score: {article.seoScore || "0"}
          </p>

          <h1 className="mb-6 text-5xl font-bold tracking-tight md:text-6xl" style={{ color: "var(--text-dark)" }}>
            {article.title}
          </h1>

          <p className="text-xl leading-8 text-slate-100">
            {article.idea}
          </p>

          {/* Top CTA Section */}
          <div className="mt-8 rounded-xl border border-green-500/30 bg-green-500/10 p-6">
            <p className="mb-4 text-sm text-green-400">
              💡 Schnelle Empfehlung:
            </p>
            {mainTools[0] && (
              <OptimizedAffiliateButton
                toolId={mainTools[0].id}
                toolName={mainTools[0].name}
                toolUrl={mainTools[0].url}
                articleSlug={slug}
                clickSource={`blog-${slug}-hero`}
                buttonText={mainTools[0].buttonText || "Ausprobieren"}
              />
            )}
          </div>
        </div>
      </section>

      {/* Main Content with Sidebar */}
      <section className="mx-auto max-w-6xl px-6 pb-20">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Article Content */}
          <div className="lg:col-span-2">
            <article className="rounded-2xl border border-white/10 bg-white/10 p-8">
              <div className="whitespace-pre-line leading-8 text-gray-200">
                {article.content}
              </div>
            </article>

            {/* Mid-Article CTA */}
            {mainTools[1] && (
              <div className="mt-10 rounded-2xl border border-cyan-500/30 bg-cyan-500/10 p-8">
                <h3 className="mb-4 text-2xl font-bold">
                  ⚡ Weiter geht's: {mainTools[1].name}
                </h3>
                <p className="mb-6 leading-7 text-slate-100">
                  {mainTools[1].description || "Eines der besten Tools in dieser Kategorie"}
                </p>
                <OptimizedAffiliateButton
                  toolId={mainTools[1].id}
                  toolName={mainTools[1].name}
                  toolUrl={mainTools[1].url}
                  articleSlug={slug}
                  clickSource={`blog-${slug}-mid`}
                  buttonText="Jetzt vergleichen"
                />
              </div>
            )}

            {/* All Recommended Tools */}
            {mainTools.length > 0 && (
              <section className="mt-10 rounded-2xl border border-purple-500/30 bg-purple-500/10 p-8">
                <h2 className="mb-6 text-3xl font-bold">
                  🏆 Die Best Rated Tools
                </h2>

                <div className="grid gap-6 md:grid-cols-2">
                  {mainTools.map((tool) => (
                    <div
                      key={tool.id}
                      className="rounded-xl border border-white/10 bg-white/10 p-6 hover:bg-white/20"
                    >
                      <div className="mb-4 flex items-start justify-between">
                        <h3 className="text-xl font-bold">{tool.name}</h3>
                        <span className="text-2xl font-bold text-yellow-400">
                          ⭐ {tool.rating.toFixed(1)}
                        </span>
                      </div>

                      {tool.badge && (
                        <p className="mb-3 inline-block rounded-full bg-yellow-500 px-3 py-1 text-sm font-bold text-black">
                          {tool.badge}
                        </p>
                      )}

                      <p className="mb-4 leading-7 text-slate-100">
                        {tool.description || tool.category}
                      </p>

                      {tool.price && (
                        <p className="mb-4 font-bold text-green-400">
                          💰 {tool.price}
                        </p>
                      )}

                      <OptimizedAffiliateButton
                        toolId={tool.id}
                        toolName={tool.name}
                        toolUrl={tool.url}
                        articleSlug={slug}
                        clickSource={`blog-${slug}-grid`}
                        buttonText={tool.buttonText || "Besuchen"}
                      />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Bottom Newsletter CTA */}
            <section className="mt-10 rounded-2xl border border-orange-500/30 bg-orange-500/10 p-8">
              <h3 className="mb-2 text-2xl font-bold">
                📬 Mehr Tipps wie diese?
              </h3>
              <p className="mb-6 leading-7 text-slate-100">
                Melde dich zu unserem Newsletter an und erhalte wöchentlich die
                besten Tools & Tricks für dein Business!
              </p>
              <NewsletterForm source={`blog-${slug}`} />
            </section>
          </div>

          {/* Sidebar - Additional Tools & Info */}
          <div className="space-y-6 lg:col-span-1">
            {/* Related Tools Sidebar */}
            {sidebarTools.length > 0 && (
              <div className="rounded-2xl border border-white/10 bg-white/10 p-6">
                <h3 className="mb-4 font-bold text-cyan-300">
                  🎯 Weitere Empfehlungen
                </h3>
                <div className="space-y-3">
                  {sidebarTools.map((tool) => (
                    <div
                      key={tool.id}
                      className="rounded-lg border border-white/10 bg-white/5 p-4 hover:bg-white/10"
                    >
                      <p className="font-bold text-white">{tool.name}</p>
                      <p className="text-xs text-slate-300">{tool.category}</p>
                      <p className="mt-2 text-sm text-yellow-400">
                        ⭐ {tool.rating.toFixed(1)}/10 ({tool.clicks} Klicks)
                      </p>
                      <a
                        href={tool.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={async () => {
                          try {
                            await fetch("/api/track-affiliate-click", {
                              method: "POST",
                              body: JSON.stringify({
                                affiliateLinkId: tool.id,
                                articleSlug: slug,
                              }),
                            });
                          } catch (e) {
                            console.error(e);
                          }
                        }}
                        className="mt-3 inline-block rounded-full bg-cyan-500/10 px-3 py-2 text-xs font-bold text-cyan-200 hover:bg-cyan-500/20 hover:text-cyan-100"
                      >
                        Besuchen →
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Article Info Box */}
            <div className="rounded-2xl border border-white/10 bg-white/10 p-6">
              <h4 className="mb-4 font-bold">📊 Artikel Info</h4>
              <div className="space-y-2 text-sm text-slate-300">
                <p>🤖 Kennzeichnung: KI erstellt</p>
                <p>📁 Kategorie: {article.category || "Allgemein"}</p>
                <p>📅 Veröffentlicht: {new Date(article.createdAt).toLocaleDateString("de-DE")}</p>
                <p>🎯 SEO Score: {article.seoScore || 0}%</p>
                <p>📝 Status: {article.status}</p>
              </div>
            </div>

            {/* CTA Box */}
            <div className="rounded-2xl border border-green-500/30 bg-green-500/10 p-6">
              <h4 className="mb-3 font-bold text-green-300">
                ✨ Professioneller Tipp
              </h4>
              <p className="text-sm text-gray-300">
                Nutze die Tools in Kombination für maximale Effizienz. Viele
                bieten kostenlose Trials an!
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-10">
          <Link
            href="/blog"
            className="inline-block rounded-xl border border-white/20 bg-white/10 px-6 py-3 font-bold hover:bg-white/20"
          >
            ← Zurück zum Blog
          </Link>
        </div>
      </section>
      </main>
    </>
  );
}
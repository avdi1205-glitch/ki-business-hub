import Link from "next/link";
import { prisma } from "../../lib/prisma";
import { getLocale } from "next-intl/server";
import TranslateArticleButton from "./TranslateArticleButton";
import TranslateAllMissingButton from "./TranslateAllMissingButton";

function statusColor(status: string) {
  if (status === "Veröffentlicht" || status === "published") return "text-green-400";
  if (status === "Geplant" || status === "scheduled") return "text-blue-400";
  if (status === "SEO geprüft") return "text-cyan-300";
  if (status === "Affiliate geprüft") return "text-yellow-400";
  return "text-gray-300";
}

export default async function EditorPage() {
  const locale = await getLocale();
  const isEn = locale === "en";
  const rawArticles = await prisma.article.findMany({
    orderBy: { createdAt: "desc" },
  });
  const articles = rawArticles.filter((article) => {
    const row = article as { locale?: string | null };
    return !row.locale || row.locale === locale;
  });

  return (
    <main className="min-h-screen px-6 py-16" style={{ background: "var(--background)", color: "var(--text-dark)" }}>
      <section className="mx-auto max-w-6xl">
        <h1 className="mb-10 text-5xl font-bold">{isEn ? "📚 AI editorial" : "📚 KI Redaktion"}</h1>
        <TranslateAllMissingButton />

        <div className="grid gap-6">
          {articles.map((article) => (
            <div
              key={article.id}
              className="rounded-2xl border border-white/10 bg-white/10 p-6"
            >
              <p className={`mb-2 font-bold ${statusColor(article.status)}`}>
                {article.status === "Veröffentlicht"
                  ? isEn
                    ? "Published"
                    : "Veröffentlicht"
                  : article.status === "Geplant"
                    ? isEn
                      ? "Scheduled"
                      : "Geplant"
                    : article.status}
              </p>

              <h2 className="text-2xl font-bold">{article.title}</h2>

              <p className="mt-3 text-gray-300">{article.idea}</p>

              <div className="mt-5 flex flex-wrap gap-3">
                <span className="rounded-xl bg-black/30 px-4 py-2">
                  SEO: {article.seoScore}%
                </span>

                <span className="rounded-xl bg-black/30 px-4 py-2">
                  {article.category}
                </span>

                <Link
                  href={`/blog/${article.slug}`}
                  className="rounded-xl bg-cyan-500 px-4 py-2 font-bold hover:bg-cyan-600"
                >
                  {isEn ? "Open article" : "Artikel öffnen"}
                </Link>

                <TranslateArticleButton articleId={article.id} />
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
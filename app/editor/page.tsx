import Link from "next/link";
import { prisma } from "../../lib/prisma";

function statusColor(status: string) {
  if (status === "Veröffentlicht") return "text-green-400";
  if (status === "SEO geprüft") return "text-cyan-300";
  if (status === "Affiliate geprüft") return "text-yellow-400";
  return "text-gray-300";
}

export default async function EditorPage() {
  const articles = await prisma.article.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-16 text-white">
      <section className="mx-auto max-w-6xl">
        <h1 className="mb-10 text-5xl font-bold">📚 KI Redaktion</h1>

        <div className="grid gap-6">
          {articles.map((article) => (
            <div
              key={article.id}
              className="rounded-2xl border border-white/10 bg-white/10 p-6"
            >
              <p className={`mb-2 font-bold ${statusColor(article.status)}`}>
                {article.status}
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
                  Artikel öffnen
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
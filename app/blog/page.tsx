import Link from "next/link";
import { prisma } from "../../lib/prisma";

export default async function BlogPage() {
  const articles = await prisma.article.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="relative overflow-hidden px-6 py-20">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 via-purple-500/10 to-transparent" />

        <div className="relative mx-auto max-w-6xl">
          <p className="mb-4 font-bold text-cyan-300">
            📰 KI Business Hub Blog
          </p>

          <h1 className="mb-6 text-5xl font-bold tracking-tight md:text-7xl">
            Artikel, Tests und Vergleiche
          </h1>

          <p className="mb-10 max-w-3xl text-xl text-gray-300">
            Lerne mehr über KI-Tools, Hosting, VPN, Automatisierung und
            digitale Geschäftsmodelle.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-20">
        <div className="grid gap-6 md:grid-cols-3">
          {articles.map((article) => (
            <Link
              key={article.id}
              href={`/blog/${article.slug}`}
              className="rounded-2xl border border-white/10 bg-white/10 p-6 hover:bg-white/20"
            >
              <p className="mb-3 text-sm font-bold text-cyan-300">
                {article.category || "Blog"}
              </p>

              <h2 className="text-2xl font-bold">{article.title}</h2>

              <p className="mt-4 text-gray-300">{article.idea}</p>

              <p className="mt-6 font-bold text-cyan-300">
                Artikel lesen →
              </p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
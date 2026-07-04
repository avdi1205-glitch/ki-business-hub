import Link from "next/link";
import { prisma } from "../../lib/prisma";

export default async function BlogPage() {
  const articles = await prisma.article.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <main style={{ background: "var(--background)" }}>
      {/* Hero Section */}
      <section className="relative overflow-hidden px-6 py-20" style={{ background: "linear-gradient(135deg, var(--background) 0%, var(--background-alt) 100%)" }}>
        <div className="mx-auto max-w-6xl">
          <p className="mb-4 font-bold" style={{ color: "var(--primary)" }}>
            📰 KI Business Hub Blog
          </p>

          <h1 className="mb-6 text-5xl font-bold tracking-tight md:text-7xl" style={{ color: "var(--text-dark)" }}>
            Artikel, Tests und Vergleiche
          </h1>

          <p className="mb-10 max-w-3xl text-xl leading-8" style={{ color: "#e2e8f0" }}>
            Lerne mehr über KI-Tools, Hosting, VPN, Automatisierung und
            digitale Geschäftsmodelle.
          </p>
        </div>
      </section>

      {/* Articles Grid */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="grid gap-6 md:grid-cols-3">
          {articles.map((article) => (
            <Link
              key={article.id}
              href={`/blog/${article.slug}`}
              className="card hover:shadow-lg transition-all"
            >
              <p className="mb-3 inline-flex items-center rounded-full border border-cyan-400/20 bg-cyan-500/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-cyan-200">
                KI erstellt
              </p>

              <p className="mb-3 text-sm font-bold badge-primary" style={{
                background: "var(--primary)",
                color: "white",
                display: "inline-block",
                padding: "0.25rem 0.75rem",
                borderRadius: "9999px",
              }}>
                {article.category || "Blog"}
              </p>

              <h2 className="text-2xl font-bold" style={{ color: "var(--text-dark)" }}>
                {article.title}
              </h2>

              <p className="mb-4 leading-7" style={{ color: "#e2e8f0" }}>
                {article.idea}
              </p>

              <p className="mt-6 font-bold" style={{ color: "var(--primary)" }}>
                Artikel lesen →
              </p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
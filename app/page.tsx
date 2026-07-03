import Link from "next/link";
import { prisma } from "../lib/prisma";
import TopTools from "./components/TopTools";

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
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="relative overflow-hidden px-6 py-24">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 via-purple-500/10 to-transparent" />

        <div className="relative mx-auto max-w-6xl text-center">
          <p className="mb-5 font-bold text-cyan-300">
            KI Tools • Software Vergleiche • Online Business
          </p>

          <h1 className="mb-6 text-5xl font-bold tracking-tight md:text-7xl">
            Finde die besten Tools
            <br />
            für dein digitales Business
          </h1>

          <p className="mx-auto mb-10 max-w-3xl text-xl text-gray-300">
            KI Business Hub hilft dir, Software schneller zu vergleichen,
            bessere Entscheidungen zu treffen und passende Tools für dein
            Online-Business zu finden.
          </p>

          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="/beste-tools"
              className="rounded-xl bg-cyan-500 px-8 py-4 font-bold text-white hover:bg-cyan-600"
            >
              🏆 Beste Tools ansehen
            </Link>

            <Link
              href="/blog"
              className="rounded-xl border border-white/20 bg-white/10 px-8 py-4 font-bold hover:bg-white/20"
            >
              📰 Neueste Artikel
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <TopTools tools={tools} />

        <section className="mt-20">
          <h2 className="mb-8 text-3xl font-bold">
            ⭐ Warum KI Business Hub?
          </h2>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/10 p-8">
              <div className="mb-4 text-4xl">🤖</div>
              <h3 className="text-2xl font-bold">KI Tools</h3>
              <p className="mt-4 text-gray-300">
                Wir testen KI-Tools objektiv und zeigen dir die besten Lösungen.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/10 p-8">
              <div className="mb-4 text-4xl">🏆</div>
              <h3 className="text-2xl font-bold">Echte Vergleiche</h3>
              <p className="mt-4 text-gray-300">
                Keine Werbung ohne Inhalt. Wir vergleichen Vorteile, Nachteile und Preise.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/10 p-8">
              <div className="mb-4 text-4xl">🚀</div>
              <h3 className="text-2xl font-bold">Online Business</h3>
              <p className="mt-4 text-gray-300">
                Alles dreht sich darum, dein digitales Business schneller aufzubauen.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-16">
          <h2 className="mb-6 text-3xl font-bold">📂 Themenbereiche</h2>

          <div className="grid gap-6 md:grid-cols-4">
            <Link
              href="/beste-tools"
              className="rounded-2xl border border-white/10 bg-white/10 p-6 hover:bg-white/20"
            >
              <h3 className="text-2xl font-bold">🏆 Beste Tools</h3>
              <p className="mt-3 text-gray-300">Unsere wichtigsten Empfehlungen.</p>
            </Link>

            <Link
              href="/tools"
              className="rounded-2xl border border-white/10 bg-white/10 p-6 hover:bg-white/20"
            >
              <h3 className="text-2xl font-bold">🤖 KI Tools</h3>
              <p className="mt-3 text-gray-300">Tools für Content, Recherche und Business.</p>
            </Link>

            <Link
              href="/blog"
              className="rounded-2xl border border-white/10 bg-white/10 p-6 hover:bg-white/20"
            >
              <h3 className="text-2xl font-bold">📰 Blog</h3>
              <p className="mt-3 text-gray-300">Tests, Vergleiche und Strategien.</p>
            </Link>

            <Link
              href="/affiliate"
              className="rounded-2xl border border-white/10 bg-white/10 p-6 hover:bg-white/20"
            >
              <h3 className="text-2xl font-bold">💰 Empfehlungen</h3>
              <p className="mt-3 text-gray-300">Tools mit Affiliate-Potenzial.</p>
            </Link>
          </div>
        </section>

        <section className="mt-16">
          <h2 className="mb-6 text-3xl font-bold">📰 Neueste Artikel</h2>

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

                <h3 className="text-2xl font-bold">{article.title}</h3>

                <p className="mt-4 text-gray-300">{article.idea}</p>
              </Link>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}
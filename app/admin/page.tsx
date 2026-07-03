import Link from "next/link";
import { prisma } from "../../lib/prisma";
import DeleteButton from "./DeleteButton";

export default async function AdminPage() {
  const articles = await prisma.article.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <main className="min-h-screen bg-slate-900 text-white p-10">
      <h1 className="text-4xl font-bold mb-8">
        📚 Gespeicherte Artikel
      </h1>

      <div className="space-y-6">
        {articles.map((article) => (
          <div
            key={article.id}
            className="bg-white/10 p-6 rounded-xl"
          >
            <Link
              href={article.slug ? `/blog/${article.slug}` : "#"}
              className="block"
            >
              <h2 className="text-2xl font-bold">
                {article.title}
              </h2>

              <p className="mt-2 text-sm text-gray-400">
                {new Date(article.createdAt).toLocaleString("de-DE")}
              </p>

              <p className="mt-4 text-gray-300">
                {article.content.substring(0, 300)}...
              </p>
            </Link>

            <div className="mt-4">
              <div className="mt-4 flex gap-3">
  <Link
    href={`/admin/edit/${article.id}`}
    className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg"
  >
    Bearbeiten
  </Link>

  <DeleteButton id={article.id} />
</div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
import { notFound, redirect } from "next/navigation";
import { prisma } from "../../../../lib/prisma";

function createSlug(title: string) {
  return title
    .toLowerCase()
    .replaceAll("ä", "ae")
    .replaceAll("ö", "oe")
    .replaceAll("ü", "ue")
    .replaceAll("ß", "ss")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export default async function EditArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const article = await prisma.article.findUnique({
    where: {
      id: Number(id),
    },
  });

  if (!article) {
    notFound();
  }

  async function updateArticle(formData: FormData) {
    "use server";

    const title = String(formData.get("title") || "");
    const idea = String(formData.get("idea") || "");
    const category = String(formData.get("category") || "");
    const content = String(formData.get("content") || "");

    await prisma.article.update({
      where: {
        id: Number(id),
      },
      data: {
        title,
        slug: createSlug(title),
        idea,
        category,
        content,
      },
    });

    redirect("/admin");
  }

  return (
    <main style={{ background: "var(--background)", minHeight: "100vh" }} className="p-10">
      <h1 className="text-4xl font-bold mb-8" style={{ color: "var(--text-dark)" }}>✏️ Artikel bearbeiten</h1>

      <form
        action={updateArticle}
        className="p-8 rounded-xl space-y-5"
        style={{ background: "var(--background-elevated)", border: "1px solid rgba(255,255,255,0.1)" }}
      >
        <div>
          <label className="font-bold" style={{ color: "var(--text-dark)" }}>Titel</label>
          <input
            name="title"
            defaultValue={article.title}
            className="w-full mt-2 p-3 rounded-xl text-white"
            style={{ background: "rgba(59, 130, 246, 0.05)", border: "1px solid rgba(59, 130, 246, 0.2)" }}
          />
        </div>

        <div>
          <label className="font-bold" style={{ color: "var(--text-dark)" }}>Idee</label>
          <input
            name="idea"
            defaultValue={article.idea}
            className="w-full mt-2 p-3 rounded-xl text-white"
            style={{ background: "rgba(59, 130, 246, 0.05)", border: "1px solid rgba(59, 130, 246, 0.2)" }}
          />
        </div>

        <div>
          <label className="font-bold" style={{ color: "var(--text-dark)" }}>Kategorie</label>
          <input
            name="category"
            defaultValue={article.category || ""}
            className="w-full mt-2 p-3 rounded-xl text-white"
            style={{ background: "rgba(59, 130, 246, 0.05)", border: "1px solid rgba(59, 130, 246, 0.2)" }}
          />
        </div>

        <div>
          <label className="font-bold" style={{ color: "var(--text-dark)" }}>Inhalt</label>
          <textarea
            name="content"
            defaultValue={article.content}
            className="w-full h-96 mt-2 p-3 rounded-xl text-white"
            style={{ background: "rgba(59, 130, 246, 0.05)", border: "1px solid rgba(59, 130, 246, 0.2)" }}
          />
        </div>

        <button
          type="submit"
          className="px-6 py-3 rounded-xl font-bold"
          style={{ background: "var(--success)", color: "white" }}
        >
          Speichern
        </button>
      </form>
    </main>
  );
}
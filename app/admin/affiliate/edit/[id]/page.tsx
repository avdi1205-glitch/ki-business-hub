import { notFound, redirect } from "next/navigation";
import { prisma } from "../../../../../lib/prisma";

export default async function EditAffiliatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const affiliate = await prisma.affiliateLink.findUnique({
    where: {
      id: Number(id),
    },
  });

  if (!affiliate) {
    notFound();
  }

  async function updateAffiliate(formData: FormData) {
    "use server";

    const name = String(formData.get("name") || "");
    const url = String(formData.get("url") || "");
    const category = String(formData.get("category") || "");
    const rating = Number(
      String(formData.get("rating") || "5").replace(",", ".")
    );
    const description = String(formData.get("description") || "");
    const pros = String(formData.get("pros") || "");
    const cons = String(formData.get("cons") || "");

    await prisma.affiliateLink.update({
      where: {
        id: Number(id),
      },
      data: {
        name,
        url,
        category,
        rating,
        description,
        pros,
        cons,
      },
    });

    redirect("/admin/affiliate");
  }

  return (
    <main style={{ background: "var(--background)", minHeight: "100vh" }} className="p-10">
      <h1 className="text-4xl font-bold mb-8" style={{ color: "var(--text-dark)" }}>
        ✏️ Affiliate bearbeiten
      </h1>

      <form
        action={updateAffiliate}
        className="p-8 rounded-xl space-y-5"
        style={{ background: "var(--background-elevated)", border: "1px solid rgba(255,255,255,0.1)" }}
      >
        <input
          name="name"
          defaultValue={affiliate.name}
          className="w-full p-3 rounded-xl text-white"
          style={{ background: "rgba(59, 130, 246, 0.05)", border: "1px solid rgba(59, 130, 246, 0.2)" }}
        />

        <input
          name="url"
          defaultValue={affiliate.url}
          className="w-full p-3 rounded-xl text-white"
          style={{ background: "rgba(59, 130, 246, 0.05)", border: "1px solid rgba(59, 130, 246, 0.2)" }}
        />

        <input
          name="category"
          defaultValue={affiliate.category}
          className="w-full p-3 rounded-xl text-white"
          style={{ background: "rgba(59, 130, 246, 0.05)", border: "1px solid rgba(59, 130, 246, 0.2)" }}
        />

        <input
          name="rating"
          defaultValue={affiliate.rating}
          className="w-full p-3 rounded-xl text-white"
          style={{ background: "rgba(59, 130, 246, 0.05)", border: "1px solid rgba(59, 130, 246, 0.2)" }}
        />

        <textarea
          name="description"
          defaultValue={affiliate.description || ""}
          className="w-full h-24 p-3 rounded-xl text-white"
          style={{ background: "rgba(59, 130, 246, 0.05)", border: "1px solid rgba(59, 130, 246, 0.2)" }}
        />

        <textarea
          name="pros"
          defaultValue={affiliate.pros || ""}
          className="w-full h-24 p-3 rounded-xl text-white"
          style={{ background: "rgba(59, 130, 246, 0.05)", border: "1px solid rgba(59, 130, 246, 0.2)" }}
        />

        <textarea
          name="cons"
          defaultValue={affiliate.cons || ""}
          className="w-full h-24 p-3 rounded-xl text-white"
          style={{ background: "rgba(59, 130, 246, 0.05)", border: "1px solid rgba(59, 130, 246, 0.2)" }}
        />

        <button
          type="submit"
          className="px-6 py-3 rounded-xl"
          style={{ background: "var(--success)", color: "white" }}
        >
          Änderungen speichern
        </button>
      </form>
    </main>
  );
}
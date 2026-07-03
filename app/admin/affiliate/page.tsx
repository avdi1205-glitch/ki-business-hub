import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "../../../lib/prisma";
import DeleteAffiliateButton from "./DeleteAffiliateButton";

export default async function AffiliateAdminPage() {
  const links = await prisma.affiliateLink.findMany({
    orderBy: {
      clicks: "desc",
    },
  });

  async function createAffiliateLink(formData: FormData) {
    "use server";

    const name = String(formData.get("name") || "");
    const url = String(formData.get("url") || "");
    const category = String(formData.get("category") || "");
    const logo = String(formData.get("logo") || "");
    const rating = Number(String(formData.get("rating") || "5").replace(",", "."));
    const price = String(formData.get("price") || "");
    const badge = String(formData.get("badge") || "");
    const buttonText = String(formData.get("buttonText") || "🚀 Angebot ansehen");
    const description = String(formData.get("description") || "");
    const pros = String(formData.get("pros") || "");
    const cons = String(formData.get("cons") || "");

    await prisma.affiliateLink.create({
      data: {
        name,
        url,
        category,
        logo,
        rating,
        price,
        badge,
        buttonText,
        description,
        pros,
        cons,
      },
    });

    redirect("/admin/affiliate");
  }

  return (
    <main className="min-h-screen bg-slate-900 text-white p-10">
      <h1 className="text-4xl font-bold mb-8">💰 Affiliate Manager</h1>

      <form
        action={createAffiliateLink}
        className="bg-white/10 p-8 rounded-xl space-y-4 mb-8"
      >
        <input name="name" placeholder="Produktname" className="w-full p-3 rounded-xl bg-slate-800 text-white border border-slate-600" />
        <input name="url" placeholder="Affiliate Link" className="w-full p-3 rounded-xl bg-slate-800 text-white border border-slate-600" />
        <input name="category" placeholder="Kategorie z.B. Hosting" className="w-full p-3 rounded-xl bg-slate-800 text-white border border-slate-600" />
        <input name="logo" placeholder="Logo URL optional" className="w-full p-3 rounded-xl bg-slate-800 text-white border border-slate-600" />
        <input name="rating" defaultValue="9.4" placeholder="Bewertung z.B. 9.4" className="w-full p-3 rounded-xl bg-slate-800 text-white border border-slate-600" />
        <input name="price" placeholder="Preis z.B. ab 2,99 €/Monat" className="w-full p-3 rounded-xl bg-slate-800 text-white border border-slate-600" />
        <input name="badge" placeholder="Badge z.B. 🥇 Testsieger 2026" className="w-full p-3 rounded-xl bg-slate-800 text-white border border-slate-600" />
        <input name="buttonText" defaultValue="🚀 Angebot ansehen" placeholder="Button Text" className="w-full p-3 rounded-xl bg-slate-800 text-white border border-slate-600" />

        <textarea name="description" placeholder="Kurzbeschreibung" className="w-full h-24 p-3 rounded-xl bg-slate-800 text-white border border-slate-600" />
        <textarea name="pros" placeholder="Vorteile, eine Zeile pro Vorteil" className="w-full h-24 p-3 rounded-xl bg-slate-800 text-white border border-slate-600" />
        <textarea name="cons" placeholder="Nachteile, eine Zeile pro Nachteil" className="w-full h-24 p-3 rounded-xl bg-slate-800 text-white border border-slate-600" />

        <button type="submit" className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded-xl font-bold">
          Affiliate Link speichern
        </button>
      </form>

      <div className="space-y-4">
        {links.map((link) => (
          <div key={link.id} className="bg-white/10 p-6 rounded-xl">
            {link.logo && (
              <img src={link.logo} alt={link.name} className="h-12 mb-4 rounded bg-white p-1" />
            )}

            {link.badge && (
              <p className="inline-block bg-yellow-500 text-black font-bold px-3 py-1 rounded-full mb-3">
                {link.badge}
              </p>
            )}

            <h2 className="text-2xl font-bold">{link.name}</h2>
            <p className="text-gray-400">{link.category}</p>

            {link.price && (
              <p className="text-green-400 font-bold mt-2">💰 {link.price}</p>
            )}

            <p className="text-yellow-400 font-bold mt-2">
              ⭐ Bewertung: {link.rating}/10
            </p>

            <p className="text-yellow-400 font-bold">
              Klicks: {link.clicks}
            </p>

            {link.description && (
              <p className="mt-4 text-gray-300">{link.description}</p>
            )}

            <div className="mt-6 flex flex-wrap gap-3">
              <Link href={`/admin/affiliate/edit/${link.id}`} className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg">
                Bearbeiten
              </Link>

              <a href={link.url} target="_blank" rel="noopener noreferrer" className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg">
                Link öffnen
              </a>

              <DeleteAffiliateButton id={link.id} />
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
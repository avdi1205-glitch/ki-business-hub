import { getLocale } from "next-intl/server";

export default async function ImpressumPage() {
  const locale = await getLocale();
  const isEn = locale === "en";
  const supportEmail = "kontakt@nexmoneta.com";

  return (
    <main className="min-h-screen p-10" style={{ background: "var(--background)", color: "var(--text-dark)" }}>
      <section className="max-w-4xl mx-auto bg-white/10 rounded-2xl p-10">
        <h1 className="text-5xl font-bold mb-8">
          {isEn ? "Imprint" : "Impressum"}
        </h1>

        <p className="text-gray-300 mb-6">
          {isEn ? "This website is currently under construction." : "Diese Website befindet sich aktuell im Aufbau."}
        </p>

        <div className="space-y-4 text-gray-300">
          <p>
            <strong>Name:</strong><br />
            {isEn ? "Your name" : "Dein Name"}
          </p>

          <p>
            <strong>Address:</strong><br />
            {isEn ? "Your address" : "Deine Adresse"}
          </p>

          <p>
            <strong>Email:</strong><br />
            {supportEmail}
          </p>

          <p>
            <strong>Responsible under § 18 Abs. 2 MStV:</strong><br />
            {isEn ? "Your name" : "Dein Name"}
          </p>

          <p className="pt-6 text-sm text-gray-500">
            {isEn
              ? "Note: Before launch, replace all placeholders with your real information."
              : "Hinweis: Ersetze vor dem Launch alle Platzhalter durch deine echten Angaben."}
          </p>
        </div>
      </section>
    </main>
  );
}
import { getLocale } from "next-intl/server";

export default async function ImpressumPage() {
  const locale = await getLocale();
  const isEn = locale === "en";
  const supportEmail = "nexmoneta@gmail.com";
  const legalName = "Avdi Morina";
  const legalAddress = "Klepsauerstr. 60, 74677 Dörzbach, Deutschland";

  return (
    <main className="min-h-screen p-10" style={{ background: "var(--background)", color: "var(--text-dark)" }}>
      <section className="max-w-4xl mx-auto bg-white/10 rounded-2xl p-10">
        <h1 className="text-5xl font-bold mb-8">
          {isEn ? "Imprint" : "Impressum"}
        </h1>

        <div className="space-y-4 text-gray-300">
          <p>
            <strong>{isEn ? "Name:" : "Name:"}</strong><br />
            {legalName}
          </p>

          <p>
            <strong>{isEn ? "Address:" : "Adresse:"}</strong><br />
            {legalAddress}
          </p>

          <p>
            <strong>E-Mail:</strong><br />
            {supportEmail}
          </p>

          <p>
            <strong>{isEn ? "Responsible under § 18 Abs. 2 MStV:" : "Verantwortlich nach § 18 Abs. 2 MStV:"}</strong><br />
            {legalName}
          </p>
        </div>
      </section>
    </main>
  );
}
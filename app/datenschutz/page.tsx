import { getLocale } from "next-intl/server";

export default async function DatenschutzPage() {
  const locale = await getLocale();
  const isEn = locale === "en";
  const supportEmail = "nexmoneta@gmail.com";
  const legalName = "Avdi Morina";
  const legalAddress = "Klepsauerstr. 60, 74677 Dörzbach, Deutschland";

  return (
    <main className="min-h-screen p-10" style={{ background: "var(--background)", color: "var(--text-dark)" }}>
      <section className="max-w-4xl mx-auto bg-white/10 rounded-2xl p-10">
        <h1 className="text-5xl font-bold mb-8">
          {isEn ? "Privacy Policy" : "Datenschutzerklärung"}
        </h1>

        <div className="space-y-6 text-gray-300">
          <p>
            {isEn
              ? "Protecting your personal data is important to us. This privacy policy explains which personal data is processed on this website."
              : "Der Schutz deiner persönlichen Daten ist uns wichtig. Diese Datenschutzerklärung erklärt, welche personenbezogenen Daten auf dieser Website verarbeitet werden."}
          </p>

          <div>
            <h2 className="text-2xl font-bold mb-2 text-white">
              {isEn ? "Controller" : "Verantwortliche Stelle"}
            </h2>

            <p>
              {legalName}<br />
              {legalAddress}<br />
              {supportEmail}
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-2 text-white">
              {isEn ? "Server log files" : "Server-Logfiles"}
            </h2>

            <p>
              {isEn
                ? "When visiting this website, technical data such as IP address, browser type, and access time may be stored."
                : "Beim Besuch dieser Website können technische Daten wie IP-Adresse, Browsertyp und Zugriffszeit gespeichert werden."}
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-2 text-white">
              {isEn ? "Affiliate links" : "Affiliate-Links"}
            </h2>

            <p>
              {isEn
                ? "Some links on this website are affiliate links. If you purchase through these links, a commission may be earned. This does not cost you anything extra."
                : "Einige Links auf dieser Website sind Affiliate-Links. Wenn du über diese Links kaufst, kann eine Provision anfallen. Für dich entstehen dadurch keine zusätzlichen Kosten."}
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-2 text-white">
              {isEn ? "Contact" : "Kontakt"}
            </h2>

            <p>
              {isEn
                ? `If you have questions about privacy, you can contact us at ${supportEmail} at any time.`
                : `Wenn du Fragen zum Datenschutz hast, kannst du uns jederzeit unter ${supportEmail} per E-Mail kontaktieren.`}
            </p>
          </div>

          <p className="text-sm text-gray-500 pt-6">
            {isEn
              ? "Note: Before launch, this privacy policy must be adapted to your actual services (analytics, cookies, hosting, and so on)."
              : "Hinweis: Vor dem Launch muss diese Datenschutzerklärung an deine tatsächlichen Dienste angepasst werden (Analytics, Cookies, Hosting usw.)."}
          </p>
        </div>
      </section>
    </main>
  );
}
import { getLocale } from "next-intl/server";

export default async function DatenschutzPage() {
  const locale = await getLocale();
  const isEn = locale === "en";
  const supportEmail = "nexmoneta@gmail.com";
  const legalName = "Avdi Morina";
  const legalAddress = "Klepsauerstr. 60, 74677 Dörzbach, Deutschland";

  return (
    <main className="min-h-screen p-10" style={{ background: "var(--background)", color: "var(--text-dark)" }}>
      <section className="max-w-4xl mx-auto">
        <h1 className="text-5xl font-bold mb-4 text-white">
          {isEn ? "Privacy Policy" : "Datenschutzerklärung"}
        </h1>
        <p className="text-sm text-slate-400 mb-10">
          {isEn ? "Last updated: July 2026" : "Zuletzt aktualisiert: Juli 2026"}
        </p>

        <div className="space-y-8 text-slate-300">
          <section>
            <p className="leading-7">
              {isEn
                ? "Protecting your personal data is important to us. This privacy policy explains what data we collect, how we use it, and your rights under GDPR."
                : "Der Schutz deiner persönlichen Daten ist uns wichtig. Diese Datenschutzerklärung erklärt, welche Daten wir erfassen, wie wir sie nutzen und welche Rechte du hast."}
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3 text-white">
              {isEn ? "1. Responsible Party" : "1. Verantwortliche Stelle"}
            </h2>
            <div className="text-sm space-y-1">
              <p className="font-semibold">{legalName}</p>
              <p>{legalAddress}</p>
              <p>Email: {supportEmail}</p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3 text-white">
              {isEn ? "2. Cookies and Cookie Consent" : "2. Cookies und Cookie-Einwilligung"}
            </h2>
            <div className="space-y-3 text-sm leading-6">
              <p>
                {isEn
                  ? "This website uses cookies to remember your preferences and improve your experience. We use:"
                  : "Diese Website nutzt Cookies, um deine Einstellungen zu speichern und dein Erlebnis zu verbessern. Wir nutzen:"}
              </p>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li>
                  {isEn
                    ? "Essential Cookies: Required for site functionality (always active)"
                    : "Notwendige Cookies: Erforderlich für die Website-Funktion (immer aktiv)"}
                </li>
                <li>
                  {isEn
                    ? "Analytics Cookies: Google Analytics for usage statistics (requires opt-in)"
                    : "Analytics-Cookies: Google Analytics für Nutzungsstatistiken (erfordert Einwilligung)"}
                </li>
                <li>
                  {isEn
                    ? "Advertising Cookies: Google AdSense for personalized ads (requires opt-in)"
                    : "Werbe-Cookies: Google AdSense für personalisierte Anzeigen (erfordert Einwilligung)"}
                </li>
              </ul>
              <p>
                {isEn
                  ? "Your cookie preferences are stored in your browser and can be changed anytime via the banner."
                  : "Deine Cookie-Einstellungen werden in deinem Browser gespeichert und können jederzeit über das Banner geändert werden."}
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3 text-white">
              {isEn ? "3. Google Analytics" : "3. Google Analytics"}
            </h2>
            <div className="space-y-3 text-sm leading-6">
              <p>
                {isEn
                  ? "We use Google Analytics (GA4) to analyze website usage. This is only active if you consent."
                  : "Wir nutzen Google Analytics (GA4), um die Website-Nutzung zu analysieren. Dies ist nur aktiv, wenn du zustimmst."}
              </p>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li>{isEn ? "Data collected: Pages visited, time spent, referrer, device type" : "Erfasste Daten: Besuchte Seiten, Verweildauer, Referrer, Gerätetyp"}</li>
                <li>{isEn ? "IP address is anonymized" : "IP-Adresse wird anonymisiert"}</li>
                <li>{isEn ? "Retention: 14 months (Google default)" : "Speicherdauer: 14 Monate (Google Standard)"}</li>
                <li>{isEn ? "Legal basis: Consent (GDPR Art. 6 Para. 1 lit. a)" : "Rechtsgrundlage: Einwilligung (DSGVO Art. 6 Abs. 1 lit. a)"}</li>
                <li>
                  {isEn ? "More info: " : "Weitere Infos: "}
                  <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="underline text-cyan-400 hover:text-cyan-300">
                    Google Privacy Policy
                  </a>
                </li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3 text-white">
              {isEn ? "4. Google AdSense" : "4. Google AdSense"}
            </h2>
            <div className="space-y-3 text-sm leading-6">
              <p>
                {isEn
                  ? "We display personalized ads via Google AdSense to fund this website. This is only active if you consent."
                  : "Wir zeigen personalisierte Anzeigen über Google AdSense, um die Website zu finanzieren. Dies ist nur aktiv, wenn du zustimmst."}
              </p>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li>{isEn ? "Data collected: Browsing history, interests, device info" : "Erfasste Daten: Browserverlauf, Interessen, Geräteinfo"}</li>
                <li>{isEn ? "Cookies used: Google DoubleClick, GADS, NID" : "Cookies: Google DoubleClick, GADS, NID"}</li>
                <li>{isEn ? "Legal basis: Consent (GDPR Art. 6 Para. 1 lit. a)" : "Rechtsgrundlage: Einwilligung (DSGVO Art. 6 Abs. 1 lit. a)"}</li>
                <li>
                  {isEn ? "Opt-out: " : "Opt-out: "}
                  <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer" className="underline text-cyan-400 hover:text-cyan-300">
                    Google Ad Settings
                  </a>
                </li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3 text-white">
              {isEn ? "5. Server Logs" : "5. Server-Logfiles"}
            </h2>
            <div className="space-y-3 text-sm leading-6">
              <p>
                {isEn
                  ? "Our web server automatically logs technical information about every visit:"
                  : "Unser Webserver speichert automatisch technische Informationen über jeden Besuch:"}
              </p>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li>{isEn ? "IP address (partially anonymized)" : "IP-Adresse (teilweise anonymisiert)"}</li>
                <li>{isEn ? "Browser and operating system" : "Browser und Betriebssystem"}</li>
                <li>{isEn ? "Access time and duration" : "Zugriffszeitpunkt und -dauer"}</li>
                <li>{isEn ? "Requested pages and files" : "Angeforderte Seiten und Dateien"}</li>
              </ul>
              <p>
                {isEn
                  ? "Legal basis: Legitimate interest in system security and server troubleshooting (GDPR Art. 6 Para. 1 lit. f). Retention: 7 days."
                  : "Rechtsgrundlage: Berechtigtes Interesse an Systemsicherheit und Fehlerbehebung (DSGVO Art. 6 Abs. 1 lit. f). Speicherdauer: 7 Tage."}
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3 text-white">
              {isEn ? "6. Contact Forms" : "6. Kontaktformulare"}
            </h2>
            <div className="space-y-3 text-sm leading-6">
              <p>
                {isEn
                  ? "When you submit a contact form, we store your name, email, and message to respond to your inquiry."
                  : "Wenn du ein Kontaktformular einreichst, speichern wir deinen Namen, E-Mail und Nachricht, um auf deine Anfrage zu antworten."}
              </p>
              <p>
                {isEn
                  ? "Legal basis: Consent (GDPR Art. 6 Para. 1 lit. a). Retention: Until response is sent + 1 year for legal compliance."
                  : "Rechtsgrundlage: Einwilligung (DSGVO Art. 6 Abs. 1 lit. a). Speicherdauer: Bis Antwort versendet + 1 Jahr für rechtliche Sicherheit."}
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3 text-white">
              {isEn ? "7. Newsletter" : "7. Newsletter"}
            </h2>
            <div className="space-y-3 text-sm leading-6">
              <p>
                {isEn
                  ? "If you subscribe to our newsletter, we store your email address to send you updates."
                  : "Wenn du unseren Newsletter abonnierst, speichern wir deine E-Mail, um dir Updates zu senden."}
              </p>
              <p>
                {isEn
                  ? "Legal basis: Consent (GDPR Art. 6 Para. 1 lit. a). You can unsubscribe anytime via link in each email."
                  : "Rechtsgrundlage: Einwilligung (DSGVO Art. 6 Abs. 1 lit. a). Du kannst dich jederzeit via Link in jeder E-Mail abmelden."}
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3 text-white">
              {isEn ? "8. Affiliate Links" : "8. Affiliate-Links"}
            </h2>
            <div className="space-y-3 text-sm leading-6">
              <p>
                {isEn
                  ? "Some links on this website are affiliate links. If you purchase through them, we earn a commission at no extra cost to you. These links are marked when possible."
                  : "Einige Links sind Affiliate-Links. Wenn du über sie kaufst, verdienen wir eine Provision, ohne dass dich das extra kostet. Diese Links sind gekennzeichnet."}
              </p>
              <p>
                {isEn
                  ? "We only recommend products we genuinely believe in."
                  : "Wir empfehlen nur Produkte, an die wir wirklich glauben."}
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3 text-white">
              {isEn ? "9. Your Rights (GDPR)" : "9. Deine Rechte (DSGVO)"}
            </h2>
            <div className="space-y-3 text-sm leading-6">
              <p>
                {isEn
                  ? "You have the following rights regarding your personal data:"
                  : "Du hast folgende Rechte bezüglich deiner personenbezogenen Daten:"}
              </p>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li>{isEn ? "Right to access: See what data we have about you" : "Auskunftsrecht: Sieh, welche Daten wir von dir haben"}</li>
                <li>{isEn ? "Right to rectification: Correct inaccurate data" : "Recht auf Berichtigung: Korrigiere fehlerhafte Daten"}</li>
                <li>{isEn ? "Right to erasure: Request deletion of your data" : "Recht auf Löschung: Verlange Löschung deiner Daten"}</li>
                <li>{isEn ? "Right to restrict processing: Limit how we use your data" : "Recht auf Einschränkung: Begrenzte die Verarbeitung"}</li>
                <li>{isEn ? "Right to data portability: Get your data in machine-readable format" : "Recht auf Datenportabilität: Erhalte deine Daten als Datei"}</li>
                <li>{isEn ? "Right to object: Opt-out of processing" : "Recht auf Widerspruch: Lehne Verarbeitung ab"}</li>
              </ul>
              <p>
                {isEn
                  ? "To exercise these rights, contact us at "
                  : "Um diese Rechte auszuüben, kontaktiere uns unter "}
                <a href={`mailto:${supportEmail}`} className="underline text-cyan-400 hover:text-cyan-300">{supportEmail}</a>.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3 text-white">
              {isEn ? "10. Data Security" : "10. Datensicherheit"}
            </h2>
            <div className="space-y-3 text-sm leading-6">
              <p>
                {isEn
                  ? "We protect your data using SSL encryption (HTTPS), secure hosting, and regular backups."
                  : "Wir schützen deine Daten mit SSL-Verschlüsselung (HTTPS), sicherem Hosting und regelmäßigen Backups."}
              </p>
              <p>
                {isEn
                  ? "No security measure is 100% guaranteed, but we take data protection seriously."
                  : "Keine Sicherheitsmaßnahme ist 100% garantiert, aber wir nehmen Datenschutz sehr ernst."}
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3 text-white">
              {isEn ? "11. Third-Party Services" : "11. Drittanbieter-Dienste"}
            </h2>
            <div className="space-y-3 text-sm leading-6">
              <p>
                {isEn
                  ? "We use the following third-party services:"
                  : "Wir nutzen folgende Drittanbieter-Dienste:"}
              </p>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li>Google Analytics (USA) – Usage analytics</li>
                <li>Google AdSense (USA) – Advertising</li>
                <li>Stripe (USA) – Payment processing</li>
                <li>Vercel (USA) – Hosting</li>
              </ul>
              <p>
                {isEn
                  ? "These services may process data in the USA. We have appropriate safeguards in place (EU-US Data Privacy Framework)."
                  : "Diese Dienste können Daten in den USA verarbeiten. Wir haben angemessene Schutzmaßnahmen getroffen."}
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3 text-white">
              {isEn ? "12. Questions or Concerns" : "12. Fragen oder Bedenken"}
            </h2>
            <p className="text-sm leading-6">
              {isEn
                ? "If you have questions about how we handle your data, please contact us:"
                : "Wenn du Fragen zur Datenbearbeitung hast, kontaktiere uns:"}
            </p>
            <div className="mt-3 text-sm space-y-1">
              <p className="font-semibold">{legalName}</p>
              <p>{legalAddress}</p>
              <p>Email: {supportEmail}</p>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}

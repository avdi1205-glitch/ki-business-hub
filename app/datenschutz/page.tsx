export default function DatenschutzPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white p-10">
      <section className="max-w-4xl mx-auto bg-white/10 rounded-2xl p-10">
        <h1 className="text-5xl font-bold mb-8">
          Datenschutzerklärung
        </h1>

        <div className="space-y-6 text-gray-300">
          <p>
            Der Schutz deiner persönlichen Daten ist uns wichtig. Diese
            Datenschutzerklärung informiert darüber, welche personenbezogenen
            Daten auf dieser Website verarbeitet werden.
          </p>

          <div>
            <h2 className="text-2xl font-bold mb-2 text-white">
              Verantwortlicher
            </h2>

            <p>
              Dein Name<br />
              Deine Adresse<br />
              deine@email.de
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-2 text-white">
              Server-Logfiles
            </h2>

            <p>
              Beim Besuch dieser Website können technische Daten wie IP-Adresse,
              Browsertyp und Zugriffszeit gespeichert werden.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-2 text-white">
              Affiliate-Links
            </h2>

            <p>
              Einige Links auf dieser Website sind Affiliate-Links. Wenn du
              über diese Links einkaufst, kann eine Provision entstehen. Für
              dich entstehen dadurch keine zusätzlichen Kosten.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-2 text-white">
              Kontakt
            </h2>

            <p>
              Wenn du Fragen zum Datenschutz hast, kannst du dich jederzeit
              per E-Mail an uns wenden.
            </p>
          </div>

          <p className="text-sm text-gray-500 pt-6">
            Hinweis: Vor dem Livegang muss diese Datenschutzerklärung an deine
            tatsächlichen Dienste (Analytics, Cookies, Hosting usw.) angepasst
            werden.
          </p>
        </div>
      </section>
    </main>
  );
}
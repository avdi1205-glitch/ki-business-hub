export default function ImpressumPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white p-10">
      <section className="max-w-4xl mx-auto bg-white/10 rounded-2xl p-10">
        <h1 className="text-5xl font-bold mb-8">
          Impressum
        </h1>

        <p className="text-gray-300 mb-6">
          Diese Website befindet sich aktuell im Aufbau.
        </p>

        <div className="space-y-4 text-gray-300">
          <p>
            <strong>Name:</strong><br />
            Dein Name
          </p>

          <p>
            <strong>Adresse:</strong><br />
            Deine Adresse
          </p>

          <p>
            <strong>E-Mail:</strong><br />
            deine@email.de
          </p>

          <p>
            <strong>Verantwortlich nach § 18 Abs. 2 MStV:</strong><br />
            Dein Name
          </p>

          <p className="pt-6 text-sm text-gray-500">
            Hinweis: Vor dem Livegang müssen alle Platzhalter durch deine echten
            Daten ersetzt werden.
          </p>
        </div>
      </section>
    </main>
  );
}
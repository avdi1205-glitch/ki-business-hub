export default function KontaktPage() {
  return (
    <main className="min-h-screen p-10" style={{ background: "var(--background)", color: "var(--text-dark)" }}>
      <section className="max-w-4xl mx-auto bg-white/10 rounded-2xl p-10">
        <h1 className="text-5xl font-bold mb-8">
          Kontakt
        </h1>

        <p className="text-gray-300 mb-6">
          Du hast Fragen, Feedback oder möchtest mit uns Kontakt aufnehmen?
        </p>

        <div className="space-y-4 text-gray-300">
          <p>
            <strong>E-Mail:</strong><br />
            deine@email.de
          </p>

          <p>
            <strong>Website:</strong><br />
            KI Business Hub
          </p>

          <p className="text-sm text-gray-500 pt-6">
            Hinweis: Vor dem Livegang bitte deine echte Kontakt-E-Mail eintragen.
          </p>
        </div>
      </section>
    </main>
  );
}
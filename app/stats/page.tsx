export default function Stats() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-900 to-purple-900 text-white p-12">

      <h1 className="text-5xl font-bold">
        📊 Statistiken
      </h1>

      <p className="mt-4 text-gray-300">
        Übersicht über dein KI Business.
      </p>


      <div className="grid md:grid-cols-3 gap-8 mt-12">

        <div className="bg-white/10 p-8 rounded-2xl">
          <h2 className="text-xl font-bold">
            👥 Besucher
          </h2>

          <p className="text-4xl font-bold mt-4">
            18.9K
          </p>

          <p className="text-green-300">
            +24% diesen Monat
          </p>
        </div>


        <div className="bg-white/10 p-8 rounded-2xl">
          <h2 className="text-xl font-bold">
            🔗 Affiliate Klicks
          </h2>

          <p className="text-4xl font-bold mt-4">
            842
          </p>

          <p className="text-green-300">
            +12% Wachstum
          </p>
        </div>


        <div className="bg-white/10 p-8 rounded-2xl">
          <h2 className="text-xl font-bold">
            💰 Einnahmen
          </h2>

          <p className="text-4xl font-bold mt-4">
            356 €
          </p>

          <p className="text-green-300">
            Affiliate Umsatz
          </p>
        </div>

      </div>

    </main>
  );
}
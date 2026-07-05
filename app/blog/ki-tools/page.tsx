import type { Metadata } from "next";
import { getLocale } from "next-intl/server";

type Copy = {
  eyebrow: string;
  title: string;
  subtitle: string;
  cards: Array<{ title: string; body: string }>;
};

const copyByLocale: Record<string, Copy> = {
  de: {
    eyebrow: "🤖 KI Tools • Online Business",
    title: "Die besten KI-Tools für dein Online-Business",
    subtitle: "Künstliche Intelligenz verändert, wie wir arbeiten. Diese Tools helfen dir, Inhalte schneller zu erstellen und Prozesse zu automatisieren.",
    cards: [
      {
        title: "🚀 ChatGPT",
        body: "ChatGPT hilft dir beim Schreiben, Ideen sammeln, Coden und beim Aufbau deines digitalen Business.",
      },
      {
        title: "🎨 Canva AI",
        body: "Erstelle Designs, Bilder und Social-Media-Inhalte schneller mit künstlicher Intelligenz.",
      },
      {
        title: "⚡ Automatisierung",
        body: "Verbinde KI-Tools miteinander und spare viele Stunden Arbeit durch automatisierte Systeme.",
      },
    ],
  },
  en: {
    eyebrow: "🤖 AI Tools • Online Business",
    title: "The best AI tools for your online business",
    subtitle: "Artificial intelligence is changing how we work. These tools help you create content faster and automate your workflows.",
    cards: [
      {
        title: "🚀 ChatGPT",
        body: "ChatGPT helps you write, brainstorm ideas, code, and build your digital business.",
      },
      {
        title: "🎨 Canva AI",
        body: "Create designs, images, and social media content faster with artificial intelligence.",
      },
      {
        title: "⚡ Automation",
        body: "Connect AI tools together and save many hours of work through automated systems.",
      },
    ],
  },
};

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const copy = copyByLocale[locale] ?? copyByLocale.en;

  return {
    title: `${copy.title} | KI Business Hub`,
    description: copy.subtitle,
  };
}

export default async function KiToolsArtikel() {
  const locale = await getLocale();
  const copy = copyByLocale[locale] ?? copyByLocale.en;

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-950 to-purple-900 p-10 text-white">
      <div className="mx-auto max-w-4xl">
        <p className="mb-4 font-bold text-cyan-300">
          {copy.eyebrow}
        </p>

        <h1 className="mb-6 text-5xl font-bold">
          {copy.title}
        </h1>

        <p className="mb-10 text-xl text-gray-200">
          {copy.subtitle}
        </p>

        <div className="mb-8 rounded-2xl bg-white/10 p-8">
          <h2 className="mb-4 text-3xl font-bold">
            {copy.cards[0].title}
          </h2>

          <p>
            {copy.cards[0].body}
          </p>
        </div>

        <div className="mb-8 rounded-2xl bg-white/10 p-8">
          <h2 className="mb-4 text-3xl font-bold">
            {copy.cards[1].title}
          </h2>

          <p>
            {copy.cards[1].body}
          </p>
        </div>

        <div className="rounded-2xl bg-white/10 p-8">
          <h2 className="mb-4 text-3xl font-bold">
            {copy.cards[2].title}
          </h2>

          <p>
            {copy.cards[2].body}
          </p>
        </div>
      </div>
    </main>
  );
}
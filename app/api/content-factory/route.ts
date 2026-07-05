import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { prisma } from "../../../lib/prisma";
import { getOpenAI } from "@/lib/openai";
import { localeFromCookie, normalizeLocale, otherLocale, type SupportedLocale } from "@/lib/article-locale";

function createSlug(title: string) {
  return title
    .toLowerCase()
    .replaceAll("ä", "ae")
    .replaceAll("ö", "oe")
    .replaceAll("ü", "ue")
    .replaceAll("ß", "ss")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function extractJsonArray(text: string) {
  const cleaned = text
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

  const start = cleaned.indexOf("[");
  const end = cleaned.lastIndexOf("]");

  if (start === -1 || end === -1) {
    throw new Error("KI hat kein JSON Array zurückgegeben.");
  }

  return cleaned.slice(start, end + 1);
}

type GeneratedArticle = {
  title: string;
  idea: string;
  content: string;
};

async function createUniqueSlug(title: string) {
  const baseSlug = createSlug(title) || `artikel-${Date.now()}`;
  let candidate = baseSlug;
  let counter = 2;

  while (true) {
    const exists = await prisma.article.findUnique({
      where: { slug: candidate },
      select: { id: true },
    });

    if (!exists) return candidate;

    candidate = `${baseSlug}-${counter}`;
    counter += 1;
  }
}

async function translateArticle(client: Awaited<ReturnType<typeof getOpenAI>>, article: GeneratedArticle, targetLocale: SupportedLocale): Promise<GeneratedArticle> {
  const response = await client.responses.create({
    model: "gpt-4o-mini",
    input: `
Übersetze den folgenden Blogartikel vollständig ins ${targetLocale === "de" ? "Deutsche" : "Englische"}.
Antworte ausschließlich mit gültigem JSON im Format:
{
  "title": "...",
  "idea": "...",
  "content": "..."
}

Titel: ${article.title}
Idee: ${article.idea}
Inhalt: ${article.content}
`,
  });

  const translated = JSON.parse(response.output_text);

  return {
    title: String(translated.title || article.title),
    idea: String(translated.idea || article.idea),
    content: String(translated.content || article.content),
  };
}

export async function POST(req: NextRequest) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({
        success: false,
        error: "OPENAI_API_KEY fehlt in .env.local",
      });
    }

    const {
      category,
      count,
      words,
      style,
      audience,
      affiliateTool,
      seoStrength,
      articleType,
      locale: requestedLocale,
    } = await req.json();

    const locale = requestedLocale
      ? normalizeLocale(requestedLocale)
      : localeFromCookie(req.headers.get("cookie"));
    const secondaryLocale = otherLocale(locale);

    const client = await getOpenAI();

    const safeCount = Math.min(Number(count) || 1, 5);

    const response = await client.responses.create({
      model: "gpt-4o-mini",
      input: `
    Erstelle ${safeCount} SEO-Blogartikel auf ${locale === "de" ? "Deutsch" : "Englisch"}.

WICHTIG:
Antworte ausschließlich mit gültigem JSON.
Keine Erklärung.
Kein Markdown.
Keine Kommentare.
Keine trailing commas.

JSON-Format:
[
  {
    "title": "Titel",
    "idea": "Kurzidee",
    "content": "Artikeltext"
  }
]

Einstellungen:
Kategorie: ${category}
Wörter pro Artikel: ca. ${words}
Schreibstil: ${style}
Zielgruppe: ${audience}
Affiliate Tool: ${affiliateTool}
SEO Stärke: ${seoStrength}
Artikeltyp: ${articleType}

Artikel-Regeln:
- Einleitung
- mehrere H2-Überschriften
- FAQ mit 3 Fragen
- Fazit
- Affiliate-Empfehlung wenn passend
`,
    });

    const jsonText = extractJsonArray(response.output_text);
    const articles = JSON.parse(jsonText);

    let created = 0;
    const createdArticles: {
      id: number;
      title: string;
      slug: string | null;
      category: string | null;
      locale: string;
    }[] = [];

    for (const article of articles) {
      const title = String(article.title || "");
      const idea = String(article.idea || "");
      const content = String(article.content || "");

      if (!title || !content) continue;

      const translationGroup = randomUUID();
      const slug = await createUniqueSlug(title);

      const savedArticle = await prisma.article.create({
        data: {
          title,
          slug,
          category,
          idea,
          content,
          locale,
          translationGroup,
        },
      });

      const translated = await translateArticle(client, { title, idea, content }, secondaryLocale);
      const translatedSlug = await createUniqueSlug(translated.title);

      await prisma.article.create({
        data: {
          title: translated.title,
          slug: translatedSlug,
          category,
          idea: translated.idea,
          content: translated.content,
          locale: secondaryLocale,
          translationGroup,
        },
      });

      created++;

      createdArticles.push({
        id: savedArticle.id,
        title: savedArticle.title,
        slug: savedArticle.slug ?? slug,
        category: savedArticle.category ?? category,
        locale,
      });
    }

    return NextResponse.json({
      success: true,
      created,
      articles: createdArticles,
    });
  } catch (error: unknown) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unbekannter Fehler",
    });
  }
}
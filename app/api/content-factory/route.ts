import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { getOpenAI } from "@/lib/openai";

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

export async function POST(req: Request) {
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
    } = await req.json();

    const client = getOpenAI();

    const safeCount = Math.min(Number(count) || 1, 5);

    const response = await client.responses.create({
      model: "gpt-4o-mini",
      input: `
Erstelle ${safeCount} deutsche SEO-Blogartikel.

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
    }[] = [];

    for (const article of articles) {
      const title = String(article.title || "");
      const idea = String(article.idea || "");
      const content = String(article.content || "");

      if (!title || !content) continue;

      const slug = createSlug(title);

      const exists = await prisma.article.findUnique({
        where: { slug },
      });

      if (exists) continue;

      const savedArticle = await prisma.article.create({
        data: {
          title,
          slug,
          category,
          idea,
          content,
        },
      });

      created++;

      createdArticles.push({
        id: savedArticle.id,
        title: savedArticle.title,
        slug: savedArticle.slug ?? slug,
        category: savedArticle.category ?? category,
      });
    }

    return NextResponse.json({
      success: true,
      created,
      articles: createdArticles,
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
    });
  }
}
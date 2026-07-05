import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOpenAI } from "@/lib/openai";
import { normalizeLocale, otherLocale, type SupportedLocale } from "@/lib/article-locale";

type ArticleLike = {
  id: number;
  title: string;
  idea: string;
  content: string;
  category: string | null;
};

function detectLocaleFromText(text: string): SupportedLocale {
  const sample = text.toLowerCase();
  if (/[äöüß]/.test(sample)) return "de";

  const germanSignals = [" und ", " ist ", " mit ", " fuer ", "für ", " auf ", " nicht ", " die "];
  const englishSignals = [" and ", " is ", " with ", " for ", " on ", " not ", " the "];

  const germanScore = germanSignals.reduce((sum, token) => sum + (sample.includes(token) ? 1 : 0), 0);
  const englishScore = englishSignals.reduce((sum, token) => sum + (sample.includes(token) ? 1 : 0), 0);

  return germanScore >= englishScore ? "de" : "en";
}

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

async function createUniqueSlug(title: string) {
  const baseSlug = createSlug(title) || `article-${Date.now()}`;
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

function extractJsonObject(text: string) {
  const cleaned = text
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");

  if (start === -1 || end === -1) {
    throw new Error("Model did not return JSON object");
  }

  return cleaned.slice(start, end + 1);
}

async function translateArticle(openai: Awaited<ReturnType<typeof getOpenAI>>, source: ArticleLike, targetLocale: SupportedLocale) {
  const response = await openai.responses.create({
    model: "gpt-4o-mini",
    input: `
Translate this blog article into ${targetLocale === "de" ? "German" : "English"}.
Return only valid JSON in this format:
{
  "title": "...",
  "idea": "...",
  "content": "..."
}

Title: ${source.title}
Idea: ${source.idea}
Content: ${source.content}
`,
  });

  const translated = JSON.parse(extractJsonObject(response.output_text));

  return {
    title: String(translated.title || source.title),
    idea: String(translated.idea || source.idea),
    content: String(translated.content || source.content),
  };
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const requestedLimit = Number(body?.limit ?? 10);
    const limit = Math.min(Math.max(Number.isFinite(requestedLimit) ? requestedLimit : 10, 1), 50);

    const articles = await prisma.article.findMany({
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        title: true,
        idea: true,
        content: true,
        category: true,
      },
    });

    const openai = await getOpenAI();
    let created = 0;
    let skipped = 0;

    for (const source of articles) {
      if (created >= limit) {
        skipped += 1;
        continue;
      }

      const sourceLocale = normalizeLocale(detectLocaleFromText(`${source.title}\n${source.idea}\n${source.content}`));
      const targetLocale = otherLocale(sourceLocale);

      const translated = await translateArticle(openai, source, targetLocale);
      const translatedSlug = await createUniqueSlug(translated.title);

      await prisma.article.create({
        data: {
          title: translated.title,
          slug: translatedSlug,
          category: source.category,
          idea: translated.idea,
          content: translated.content,
        },
      });

      created += 1;
    }

    return NextResponse.json({
      success: true,
      limit,
      created,
      skipped,
      remainingMissing: Math.max(articles.length - created, 0),
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
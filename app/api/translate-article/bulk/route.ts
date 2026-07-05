import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { getOpenAI } from "@/lib/openai";
import { normalizeLocale, otherLocale, type SupportedLocale } from "@/lib/article-locale";

type ArticleLike = {
  id: number;
  title: string;
  idea: string;
  content: string;
  category: string | null;
  locale: string;
  translationGroup: string | null;
};

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
        locale: true,
        translationGroup: true,
      },
    });

    const grouped = new Map<string, ArticleLike[]>();

    for (const article of articles) {
      const key = article.translationGroup || `single-${article.id}`;
      const current = grouped.get(key) || [];
      current.push(article);
      grouped.set(key, current);
    }

    const openai = await getOpenAI();
    let created = 0;
    let skipped = 0;
    let missingGroups = 0;

    for (const [key, group] of grouped.entries()) {
      const de = group.find((item) => normalizeLocale(item.locale) === "de");
      const en = group.find((item) => normalizeLocale(item.locale) === "en");

      if (de && en) {
        skipped += 1;
        continue;
      }

      missingGroups += 1;

      if (created >= limit) {
        continue;
      }

      const source = de || en;
      if (!source) {
        skipped += 1;
        continue;
      }

      const targetLocale = otherLocale(normalizeLocale(source.locale));
      const translationGroup = key.startsWith("single-") ? randomUUID() : key;

      if (!source.translationGroup) {
        await prisma.article.update({
          where: { id: source.id },
          data: { translationGroup },
        });
      }

      const translated = await translateArticle(openai, source, targetLocale);
      const translatedSlug = await createUniqueSlug(translated.title);

      await prisma.article.create({
        data: {
          title: translated.title,
          slug: translatedSlug,
          category: source.category,
          idea: translated.idea,
          content: translated.content,
          locale: targetLocale,
          translationGroup,
        },
      });

      created += 1;
    }

    return NextResponse.json({
      success: true,
      limit,
      created,
      skipped,
      remainingMissing: Math.max(missingGroups - created, 0),
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
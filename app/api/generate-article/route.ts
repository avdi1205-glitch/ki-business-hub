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

async function createUniqueSlug(title: string) {
  const baseSlug = createSlug(title) || `artikel-${Date.now()}`;
  let candidate = baseSlug;
  let counter = 2;

  while (true) {
    const exists = await prisma.article.findUnique({
      where: { slug: candidate },
      select: { id: true },
    });

    if (!exists) {
      return candidate;
    }

    candidate = `${baseSlug}-${counter}`;
    counter += 1;
  }
}

type GeneratedArticle = {
  title: string;
  idea: string;
  content: string;
};

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

    const client = await getOpenAI();

    const { title, idea, category, locale: requestedLocale } = await req.json();
    const locale = requestedLocale
      ? normalizeLocale(requestedLocale)
      : localeFromCookie(req.headers.get("cookie"));
    const secondaryLocale = otherLocale(locale);

    const response = await client.responses.create({
      model: "gpt-4o-mini",
      input: `
Schreibe einen professionellen Blogartikel auf ${locale === "de" ? "Deutsch" : "Englisch"}.

Titel: ${title}
Kategorie: ${category}
Idee: ${idea}
`,
    });

    const primaryArticle: GeneratedArticle = {
      title,
      idea,
      content: response.output_text,
    };

    const translationGroup = randomUUID();
    const primarySlug = await createUniqueSlug(primaryArticle.title);
    const savedArticle = await prisma.article.create({
      data: {
        title: primaryArticle.title,
        slug: primarySlug,
        category,
        idea: primaryArticle.idea,
        content: primaryArticle.content,
        locale,
        translationGroup,
      },
    });

    const translatedArticle = await translateArticle(client, primaryArticle, secondaryLocale);
    const translatedSlug = await createUniqueSlug(translatedArticle.title);

    await prisma.article.create({
      data: {
        title: translatedArticle.title,
        slug: translatedSlug,
        category,
        idea: translatedArticle.idea,
        content: translatedArticle.content,
        locale: secondaryLocale,
        translationGroup,
      },
    });

    return NextResponse.json({
      article: savedArticle.content,
      locale,
      translatedLocale: secondaryLocale,
    });
  } catch (error: any) {
    return NextResponse.json({
      error: String(error?.message || error),
    });
  }
}
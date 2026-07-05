import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOpenAI } from "@/lib/openai";
import { normalizeLocale, otherLocale, type SupportedLocale } from "@/lib/article-locale";

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

export async function POST(req: NextRequest) {
  try {
    const { articleId, targetLocale } = await req.json();

    if (!articleId) {
      return NextResponse.json({ success: false, error: "articleId is required" }, { status: 400 });
    }

    const source = await prisma.article.findUnique({
      where: { id: Number(articleId) },
    });

    if (!source) {
      return NextResponse.json({ success: false, error: "Article not found" }, { status: 404 });
    }

    const sourceLocale = normalizeLocale(detectLocaleFromText(`${source.title}\n${source.idea}\n${source.content}`));
    const destinationLocale: SupportedLocale = targetLocale
      ? normalizeLocale(targetLocale)
      : otherLocale(sourceLocale);

    if (destinationLocale === sourceLocale) {
      return NextResponse.json({ success: false, error: "Target locale must differ from source locale" }, { status: 400 });
    }

    const openai = await getOpenAI();
    const response = await openai.responses.create({
      model: "gpt-4o-mini",
      input: `
Translate this blog article into ${destinationLocale === "de" ? "German" : "English"}.
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
    const translatedTitle = String(translated.title || source.title);
    const translatedIdea = String(translated.idea || source.idea);
    const translatedContent = String(translated.content || source.content);
    const translatedSlug = await createUniqueSlug(translatedTitle);

    const created = await prisma.article.create({
      data: {
        title: translatedTitle,
        slug: translatedSlug,
        category: source.category,
        idea: translatedIdea,
        content: translatedContent,
      },
      select: { id: true, slug: true },
    });

    return NextResponse.json({
      success: true,
      skipped: false,
      article: {
        ...created,
        locale: destinationLocale,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
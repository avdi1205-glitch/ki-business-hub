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

export async function POST(req: Request) {
  try {
    const client = await getOpenAI();
    const { title, idea, category } = await req.json();

    const response = await client.responses.create({
      model: "gpt-4o-mini",
      input:
        "Schreibe einen professionellen Blogartikel.\n\nTitel: " +
        title +
        "\n\nKategorie: " +
        category +
        "\n\nIdee: " +
        idea,
    });

    const uniqueSlug = await createUniqueSlug(title);

    const savedArticle = await prisma.article.create({
      data: {
        title: title,
        slug: uniqueSlug,
        category: category,
        idea: idea,
        content: response.output_text,
      },
    });

    return NextResponse.json({
      article: savedArticle.content,
    });
  } catch (error: any) {
    return NextResponse.json({
      error: "Fehler: " + error.message,
    });
  }
}
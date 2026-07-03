import OpenAI from "openai";
import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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

export async function POST(req: Request) {
  try {
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

    const savedArticle = await prisma.article.create({
      data: {
        title: title,
        slug: createSlug(title),
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
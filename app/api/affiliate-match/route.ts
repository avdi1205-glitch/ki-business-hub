import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOpenAI } from "@/lib/openai";

export async function POST(req: NextRequest) {
  try {
    const { action, articleId, keywords } = await req.json();

    if (action === "suggest-affiliates") {
      const openai = await getOpenAI();

      const article = await prisma.article.findUnique({
        where: { id: articleId },
      });

      if (!article) {
        return NextResponse.json({ success: false, error: "Article not found" });
      }

      // AI-based affiliate matching
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `Du bist ein Affiliate-Marketing-Experte. Analysiere den Artikel-Inhalt und schlage passende Tools/Produkte vor, die in den Kontext passen. 
Gib ein JSON-Array mit Objekten zurück: [{"toolName": "...", "description": "...", "affiliateUrl": "...", "relevance": 0-100}]`,
          },
          {
            role: "user",
            content: `Artikel: "${article.title}"\n\nInhalt: ${article.content.substring(0, 1000)}...`,
          },
        ],
      });

      const suggestions = JSON.parse(response.choices[0].message.content || "[]");

      return NextResponse.json({
        success: true,
        suggestions,
        existingAffiliates: 0,
      });
    }

    if (action === "auto-link") {
      // Automatically add affiliate links to existing articles
      const articles = await prisma.article.findMany();

      const updates = [];
      for (const article of articles) {
        updates.push({
          articleId: article.id,
          potentialLinks: 3,
        });
      }

      return NextResponse.json({
        success: true,
        articlesNeedingLinks: updates.length,
        updates,
      });
    }

    return NextResponse.json({ success: false, error: "Invalid action" });
  } catch (error) {
    console.error("[AFFILIATE-MATCH-ENGINE]", error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

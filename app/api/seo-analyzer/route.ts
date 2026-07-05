import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { action, articleId } = await req.json();

    if (action === "analyze") {
      // SEO Analysis
      const article = await prisma.article.findUnique({
        where: { id: articleId },
      });

      if (!article) {
        return NextResponse.json({ success: false, error: "Article not found" });
      }

      const score = calculateSEOScore(article.title, article.content, article.slug ?? "");
      const recommendations = generateSEORecommendations(article);

      // Save analysis
      await prisma.article.update({
        where: { id: articleId },
        data: { seoScore: score },
      });

      return NextResponse.json({
        success: true,
        score,
        recommendations,
        analysis: {
          keywordDensity: calculateKeywordDensity(article.content, article.title),
          wordCount: article.content.split(" ").length,
          readingTime: Math.ceil(article.content.split(" ").length / 200),
          headingStructure: countHeadings(article.content),
        },
      });
    }

    if (action === "bulk-analyze") {
      const articles = await prisma.article.findMany();
      const results = articles.map(article => ({
        id: article.id,
        title: article.title,
        score: calculateSEOScore(article.title, article.content, article.slug ?? ""),
      }));

      return NextResponse.json({
        success: true,
        results,
        average: Math.round(results.reduce((sum, r) => sum + r.score, 0) / results.length),
      });
    }

    return NextResponse.json({ success: false, error: "Invalid action" });
  } catch (error) {
    console.error("[SEO-ANALYZER]", error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

type SEOAnalyzedArticle = {
  title: string;
  content: string;
  slug: string | null;
};

function calculateSEOScore(title: string, content: string, slug: string): number {
  let score = 50;

  if (title.length >= 30 && title.length <= 60) score += 10;
  if (slug && slug.length > 0) score += 10;
  if (content.length >= 2000) score += 15;
  if (content.includes("<h2>")) score += 8;
  if (content.includes("<h3>")) score += 7;

  const keywordMatches = (title.toLowerCase().match(/\b\w+\b/g) || [])
    .filter(word => content.toLowerCase().includes(word)).length;
  if (keywordMatches >= 3) score += 15;

  return Math.min(100, score);
}

function generateSEORecommendations(article: SEOAnalyzedArticle): string[] {
  const recommendations = [];

  if (article.title.length < 30) recommendations.push("Title zu kurz (min. 30 Zeichen)");
  if (article.title.length > 60) recommendations.push("Title zu lang (max. 60 Zeichen)");
  if (!article.content.includes("<h2>")) recommendations.push("Mindestens eine H2-Überschrift verwenden");
  if (article.content.split(" ").length < 2000) recommendations.push("Text sollte mindestens 2000 Wörter lang sein");
  if (!article.slug || article.slug.length === 0) recommendations.push("URL-Slug optimieren");

  return recommendations;
}

function calculateKeywordDensity(content: string, keyword: string): number {
  const wordCount = content.split(" ").length;
  const keywordCount = (content.toLowerCase().match(new RegExp(keyword.toLowerCase(), "g")) || []).length;
  return Number(((keywordCount / wordCount) * 100).toFixed(2));
}

function countHeadings(content: string): { h2: number; h3: number } {
  return {
    h2: (content.match(/<h2>/g) || []).length,
    h3: (content.match(/<h3>/g) || []).length,
  };
}

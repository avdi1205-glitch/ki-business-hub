import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

export async function GET() {
  try {
    const totalArticles = await prisma.article.count();

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const todayArticles = await prisma.article.count({
      where: {
        createdAt: {
          gte: startOfToday,
        },
      },
    });

    const articles = await prisma.article.findMany({
      select: {
        title: true,
        idea: true,
        content: true,
      },
    });

    let scoreSum = 0;

    for (const article of articles) {
      let score = 50;

      if (article.title && article.title.length >= 35) score += 10;
      if (article.idea && article.idea.length >= 80) score += 10;
      if (article.content && article.content.includes("FAQ")) score += 10;
      if (article.content && article.content.includes("Fazit")) score += 10;
      if (article.content && article.content.length >= 3000) score += 10;

      scoreSum += Math.min(score, 100);
    }

    const seoScore =
      totalArticles === 0 ? 0 : Math.round(scoreSum / totalArticles);

    const averageSeconds =
      todayArticles === 0 ? 0 : Math.max(8, Math.round(60 / todayArticles));

    return NextResponse.json({
      success: true,
      todayArticles,
      totalArticles,
      seoScore,
      averageSeconds,
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
    });
  }
}
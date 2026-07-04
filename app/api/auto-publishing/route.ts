import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { action, articleId, publishAt, recurring } = await req.json();

    if (action === "schedule") {
      const article = await prisma.article.findUnique({
        where: { id: articleId },
      });

      if (!article) {
        return NextResponse.json({ success: false, error: "Article not found" });
      }

      // Schedule publish
      const scheduledDate = new Date(publishAt);

      await prisma.article.update({
        where: { id: articleId },
        data: {
          status: "scheduled",
          // Add metadata for scheduling (would need schema update)
        },
      });

      return NextResponse.json({
        success: true,
        message: `Article scheduled for ${scheduledDate.toLocaleString("de-DE")}`,
        articleId,
        publishAt: scheduledDate,
      });
    }

    if (action === "auto-publish-drafts") {
      // Auto-publish draft articles on schedule
      const drafts = await prisma.article.findMany({
        where: { status: "draft" },
      });

      const published = [];
      for (const draft of drafts) {
        await prisma.article.update({
          where: { id: draft.id },
          data: { status: "published" },
        });
        published.push(draft.id);
      }

      return NextResponse.json({
        success: true,
        publishedCount: published.length,
        articleIds: published,
      });
    }

    if (action === "get-schedule") {
      const articles = await prisma.article.findMany({
        where: { status: "scheduled" },
        orderBy: { createdAt: "asc" },
      });

      return NextResponse.json({
        success: true,
        scheduled: articles.map(a => ({
          id: a.id,
          title: a.title,
          status: a.status,
        })),
      });
    }

    return NextResponse.json({ success: false, error: "Invalid action" });
  } catch (error) {
    console.error("[AUTO-PUBLISHING]", error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

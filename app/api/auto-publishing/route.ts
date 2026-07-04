import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const DRAFT_STATUSES = ["Entwurf", "draft"];
const SCHEDULED_STATUSES = ["Geplant", "scheduled"];
const PUBLISHED_STATUSES = ["Veröffentlicht", "published"];

export async function POST(req: NextRequest) {
  try {
    const { action, articleId, publishAt, recurring } = await req.json();

    if (action === "schedule") {
      if (!articleId || !publishAt) {
        return NextResponse.json({ success: false, error: "articleId und publishAt sind erforderlich" }, { status: 400 });
      }

      const article = await prisma.article.findUnique({
        where: { id: articleId },
      });

      if (!article) {
        return NextResponse.json({ success: false, error: "Article not found" });
      }

      const scheduledDate = new Date(publishAt);

      if (Number.isNaN(scheduledDate.getTime())) {
        return NextResponse.json({ success: false, error: "Ungültiges Datum" }, { status: 400 });
      }

      await prisma.article.update({
        where: { id: articleId },
        data: {
          status: "Geplant",
          publishAt: scheduledDate,
          recurring: Boolean(recurring),
        },
      });

      return NextResponse.json({
        success: true,
        message: `Artikel geplant für ${scheduledDate.toLocaleString("de-DE")}`,
        articleId,
        publishAt: scheduledDate,
      });
    }

    if (action === "cancel-schedule") {
      if (!articleId) {
        return NextResponse.json({ success: false, error: "articleId ist erforderlich" }, { status: 400 });
      }

      await prisma.article.update({
        where: { id: articleId },
        data: {
          status: "Entwurf",
          publishAt: null,
          recurring: false,
        },
      });

      return NextResponse.json({
        success: true,
        message: "Planung entfernt.",
      });
    }

    if (action === "auto-publish-drafts") {
      const dueArticles = await prisma.article.findMany({
        where: {
          status: { in: SCHEDULED_STATUSES },
          publishAt: { lte: new Date() },
        },
      });

      const published = [];
      for (const article of dueArticles) {
        await prisma.article.update({
          where: { id: article.id },
          data: {
            status: "Veröffentlicht",
            publishAt: null,
            recurring: false,
          },
        });
        published.push(article.id);
      }

      return NextResponse.json({
        success: true,
        publishedCount: published.length,
        articleIds: published,
      });
    }

    if (action === "get-schedule") {
      const [scheduledArticles, draftArticles, publishedArticles] = await Promise.all([
        prisma.article.findMany({
          where: { status: { in: SCHEDULED_STATUSES } },
          orderBy: { publishAt: "asc" },
        }),
        prisma.article.findMany({
          where: { status: { in: DRAFT_STATUSES } },
          orderBy: { createdAt: "desc" },
          take: 50,
        }),
        prisma.article.findMany({
          where: { status: { in: PUBLISHED_STATUSES } },
          orderBy: { createdAt: "desc" },
          take: 10,
        }),
      ]);

      return NextResponse.json({
        success: true,
        scheduled: scheduledArticles.map((article) => ({
          id: article.id,
          title: article.title,
          category: article.category,
          publishAt: article.publishAt,
          recurring: article.recurring,
          status: article.status,
        })),
        drafts: draftArticles.map((article) => ({
          id: article.id,
          title: article.title,
          category: article.category,
        })),
        history: publishedArticles.map((article) => ({
          id: article.id,
          title: article.title,
          createdAt: article.createdAt,
        })),
      });
    }

    return NextResponse.json({ success: false, error: "Invalid action" });
  } catch (error) {
    console.error("[AUTO-PUBLISHING]", error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

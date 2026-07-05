import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function parseBoolean(value: string | null): boolean {
  return value === "1" || value === "true";
}

function parseLimit(value: string | null): number {
  const n = Number(value);
  if (!Number.isFinite(n)) return 30;
  return Math.min(Math.max(Math.floor(n), 1), 100);
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const favoriteOnly = parseBoolean(url.searchParams.get("favoriteOnly"));
    const recurringOnly = parseBoolean(url.searchParams.get("recurringOnly"));
    const limit = parseLimit(url.searchParams.get("limit"));

    const items = await prisma.internalBotRun.findMany({
      where: {
        ...(favoriteOnly ? { favorite: true } : {}),
        ...(recurringOnly ? { recurringTaskKey: { not: null } } : {}),
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return NextResponse.json({ success: true, persistenceAvailable: true, items });
  } catch {
    return NextResponse.json({ success: true, persistenceAvailable: false, items: [] });
  }
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function normalizeTags(value: unknown): string[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => String(item || "").trim().toLowerCase())
    .filter(Boolean)
    .slice(0, 10);
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const runId = Number(id);

    if (!Number.isFinite(runId)) {
      return NextResponse.json({ success: false, error: "Ungueltige ID." }, { status: 400 });
    }

    const body = await req.json().catch(() => ({}));
    const data: { favorite?: boolean; tags?: unknown; recurringTaskKey?: string | null } = {};

    if (typeof body?.favorite === "boolean") {
      data.favorite = body.favorite;
    }

    if (body?.tags !== undefined) {
      data.tags = normalizeTags(body.tags);
    }

    if (body?.recurringTaskKey !== undefined) {
      const key = String(body.recurringTaskKey || "").trim();
      data.recurringTaskKey = key || null;
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ success: false, error: "Keine gueltigen Felder zum Aktualisieren." }, { status: 400 });
    }

    const updated = await prisma.internalBotRun.update({
      where: { id: runId },
      data,
    });

    return NextResponse.json({ success: true, item: updated });
  } catch {
    return NextResponse.json({ success: false, error: "Verlauf konnte nicht aktualisiert werden." }, { status: 500 });
  }
}

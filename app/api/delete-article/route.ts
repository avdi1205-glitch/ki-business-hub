import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

export async function POST(req: Request) {
  try {
    const { id } = await req.json();

    await prisma.article.delete({
      where: {
        id: Number(id),
      },
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error: any) {
    return NextResponse.json({
      error: "Fehler: " + error.message,
    });
  }
}
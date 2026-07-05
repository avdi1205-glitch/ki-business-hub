import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

export async function GET() {
  try {
    const ideas = await prisma.contentIdea.findMany({
      orderBy: [
        {
          priority: "desc",
        },
        {
          searchVolume: "desc",
        },
      ],
      take: 10,
    });

    return NextResponse.json({
      success: true,
      ideas,
    });
  } catch (error: unknown) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const idea = await prisma.contentIdea.create({
      data: {
        title: body.title,
        category: body.category,
        priority: body.priority ?? 50,
        searchVolume: body.searchVolume,
        difficulty: body.difficulty,
        affiliateTool: body.affiliateTool,
      },
    });

    return NextResponse.json({
      success: true,
      idea,
    });
  } catch (error: unknown) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
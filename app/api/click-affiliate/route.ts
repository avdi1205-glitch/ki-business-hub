import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

export async function POST(req: Request) {
  try {
    const { id } = await req.json();

    await prisma.affiliateLink.update({
      where: {
        id: Number(id),
      },
      data: {
        clicks: {
          increment: 1,
        },
      },
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error: any) {
    return NextResponse.json({
      error: error.message,
    });
  }
}
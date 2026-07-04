import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function calculateRate(clicks: number, impressions: number) {
  if (!impressions) return 0;
  return (clicks / impressions) * 100;
}

function calculateConfidence(impressionsA: number, impressionsB: number, rateA: number, rateB: number) {
  const totalImpressions = impressionsA + impressionsB;
  const rateGap = Math.abs(rateA - rateB);
  return Math.min(99, Number((Math.min(55, totalImpressions / 8) + rateGap * 4).toFixed(1)));
}

function serializeTest(test: {
  id: number;
  variantA: string;
  variantB: string;
  impressionsA: number;
  impressionsB: number;
  clicksA: number;
  clicksB: number;
  confidence: number;
  winner: string | null;
  status: string;
  affiliateLink: { id: number; name: string; buttonText: string | null };
  createdAt: Date;
  appliedAt: Date | null;
}) {
  const rateA = calculateRate(test.clicksA, test.impressionsA);
  const rateB = calculateRate(test.clicksB, test.impressionsB);
  const suggestedWinner = rateA === rateB ? null : rateA > rateB ? "A" : "B";

  return {
    id: test.id,
    affiliateLinkId: test.affiliateLink.id,
    affiliateName: test.affiliateLink.name,
    currentButtonText: test.affiliateLink.buttonText,
    variantA: test.variantA,
    variantB: test.variantB,
    impressionsA: test.impressionsA,
    impressionsB: test.impressionsB,
    clicksA: test.clicksA,
    clicksB: test.clicksB,
    rateA: Number(rateA.toFixed(2)),
    rateB: Number(rateB.toFixed(2)),
    confidence: calculateConfidence(test.impressionsA, test.impressionsB, rateA, rateB),
    winner: test.winner || suggestedWinner,
    status: test.status,
    createdAt: test.createdAt,
    appliedAt: test.appliedAt,
  };
}

export async function GET(req: NextRequest) {
  try {
    const affiliateLinkId = req.nextUrl.searchParams.get("affiliateLinkId");

    if (affiliateLinkId) {
      const test = await prisma.aBTest.findFirst({
        where: {
          affiliateLinkId: Number(affiliateLinkId),
          status: "active",
        },
        include: {
          affiliateLink: {
            select: { id: true, name: true, buttonText: true },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      return NextResponse.json({
        success: true,
        test: test ? serializeTest(test) : null,
      });
    }

    const [tests, affiliates] = await Promise.all([
      prisma.aBTest.findMany({
        include: {
          affiliateLink: {
            select: { id: true, name: true, buttonText: true },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.affiliateLink.findMany({
        select: { id: true, name: true, buttonText: true },
        orderBy: { clicks: "desc" },
      }),
    ]);

    return NextResponse.json({
      success: true,
      tests: tests.map(serializeTest),
      affiliates,
    });
  } catch (error) {
    console.error("[A/B-TESTING:GET]", error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, affiliateLinkId, variantA, variantB } = body;

    if (action === "create-test") {
      if (!affiliateLinkId || !variantA || !variantB) {
        return NextResponse.json({ success: false, error: "affiliateLinkId, variantA und variantB sind erforderlich" }, { status: 400 });
      }

      const existing = await prisma.aBTest.findFirst({
        where: {
          affiliateLinkId: Number(affiliateLinkId),
          status: "active",
        },
      });

      if (existing) {
        return NextResponse.json({ success: false, error: "Für diesen Affiliate-Link läuft bereits ein aktiver Test" }, { status: 400 });
      }

      const test = await prisma.aBTest.create({
        data: {
          affiliateLinkId: Number(affiliateLinkId),
          variantA: String(variantA),
          variantB: String(variantB),
          status: "active",
        },
        include: {
          affiliateLink: {
            select: { id: true, name: true, buttonText: true },
          },
        },
      });

      return NextResponse.json({
        success: true,
        test: serializeTest(test),
        message: "A/B-Test wurde erstellt",
      });
    }

    if (action === "track-interaction") {
      const { testId, variant, type } = body;

      if (!testId || !variant || !type) {
        return NextResponse.json({ success: false, error: "testId, variant und type sind erforderlich" }, { status: 400 });
      }

      const updateData =
        type === "impression"
          ? variant === "A"
            ? { impressionsA: { increment: 1 } }
            : { impressionsB: { increment: 1 } }
          : variant === "A"
            ? { clicksA: { increment: 1 } }
            : { clicksB: { increment: 1 } };

      const updated = await prisma.aBTest.update({
        where: { id: Number(testId) },
        data: updateData,
        include: {
          affiliateLink: {
            select: { id: true, name: true, buttonText: true },
          },
        },
      });

      return NextResponse.json({
        success: true,
        test: serializeTest(updated),
      });
    }

    if (action === "get-results") {
      const { testId } = body;

      const test = await prisma.aBTest.findUnique({
        where: { id: Number(testId) },
        include: {
          affiliateLink: {
            select: { id: true, name: true, buttonText: true },
          },
        },
      });

      if (!test) {
        return NextResponse.json({ success: false, error: "Test nicht gefunden" }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        results: serializeTest(test),
      });
    }

    if (action === "apply-winner") {
      const { testId, winner } = body;

      const test = await prisma.aBTest.findUnique({
        where: { id: Number(testId) },
      });

      if (!test) {
        return NextResponse.json({ success: false, error: "Test nicht gefunden" }, { status: 404 });
      }

      const rateA = calculateRate(test.clicksA, test.impressionsA);
      const rateB = calculateRate(test.clicksB, test.impressionsB);
      const resolvedWinner = winner || (rateA >= rateB ? "A" : "B");
      const resolvedText = resolvedWinner === "A" ? test.variantA : test.variantB;

      await prisma.$transaction([
        prisma.affiliateLink.update({
          where: { id: test.affiliateLinkId },
          data: { buttonText: resolvedText },
        }),
        prisma.aBTest.update({
          where: { id: test.id },
          data: {
            status: "complete",
            winner: resolvedWinner,
            confidence: calculateConfidence(test.impressionsA, test.impressionsB, rateA, rateB),
            appliedAt: new Date(),
          },
        }),
      ]);

      return NextResponse.json({
        success: true,
        message: `Gewinner-Variante ${resolvedWinner} wurde live übernommen`,
        testId,
      });
    }

    return NextResponse.json({ success: false, error: "Invalid action" });
  } catch (error) {
    console.error("[A/B-TESTING]", error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { sendRevenueNavigatorWeeklySummary } from "@/lib/revenue-navigator-weekly-summary";

export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "CRON_SECRET is not configured" }, { status: 503 });
  }

  const authorization = request.headers.get("authorization");
  if (authorization !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    return NextResponse.json(await sendRevenueNavigatorWeeklySummary());
  } catch (error) {
    console.error("[REVENUE-NAVIGATOR-CRON-WEEKLY-SUMMARY]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
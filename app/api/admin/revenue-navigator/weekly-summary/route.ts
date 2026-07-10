import { NextResponse } from "next/server";
import { sendRevenueNavigatorWeeklySummary } from "@/lib/revenue-navigator-weekly-summary";

export async function POST() {
  try {
    return NextResponse.json(await sendRevenueNavigatorWeeklySummary());
  } catch (error) {
    console.error("[REVENUE-NAVIGATOR-WEEKLY-SUMMARY]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
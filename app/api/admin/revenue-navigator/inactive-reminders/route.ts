import { NextResponse } from "next/server";
import { sendRevenueNavigatorInactivityReminders } from "@/lib/revenue-navigator-reminders";

export async function POST() {
  try {
    return NextResponse.json(await sendRevenueNavigatorInactivityReminders());
  } catch (error) {
    console.error("[REVENUE-NAVIGATOR-INACTIVE-REMINDERS]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
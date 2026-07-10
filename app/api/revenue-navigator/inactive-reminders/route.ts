import { NextRequest, NextResponse } from "next/server";
import { sendRevenueNavigatorInactivityReminders } from "@/lib/revenue-navigator-reminders";

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
    return NextResponse.json(await sendRevenueNavigatorInactivityReminders());
  } catch (error) {
    console.error("[REVENUE-NAVIGATOR-CRON-INACTIVE-REMINDERS]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
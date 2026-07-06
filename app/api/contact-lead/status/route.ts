import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const ALLOWED_STATUSES = new Set(["lead_new", "lead_contacted", "lead_won", "lead_lost"]);

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const leadIdRaw = String(formData.get("leadId") || "").trim();
    const status = String(formData.get("status") || "").trim();
    const redirectTo = String(formData.get("redirectTo") || "/admin/checkout-rescue").trim();

    const leadId = Number(leadIdRaw);
    if (!Number.isInteger(leadId) || leadId <= 0) {
      return NextResponse.redirect(new URL("/admin/checkout-rescue?error=invalid_lead", request.url));
    }

    if (!ALLOWED_STATUSES.has(status)) {
      return NextResponse.redirect(new URL("/admin/checkout-rescue?error=invalid_status", request.url));
    }

    await prisma.newsletterSubscriber.update({
      where: { id: leadId },
      data: { status },
    });

    const target = redirectTo.startsWith("/") ? redirectTo : "/admin/checkout-rescue";
    return NextResponse.redirect(new URL(target, request.url));
  } catch (error) {
    console.error("[CONTACT-LEAD-STATUS]", error);
    return NextResponse.redirect(new URL("/admin/checkout-rescue?error=update_failed", request.url));
  }
}

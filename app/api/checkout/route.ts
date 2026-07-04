import { NextRequest, NextResponse } from "next/server";

const planCheckoutLinks: Record<string, string | undefined> = {
  pro: process.env.PRO_CHECKOUT_URL,
  agency: process.env.AGENCY_CHECKOUT_URL,
};

export async function GET(req: NextRequest) {
  const plan = req.nextUrl.searchParams.get("plan")?.toLowerCase();
  const source = req.nextUrl.searchParams.get("source") || "website";

  if (!plan || !(plan in planCheckoutLinks)) {
    return NextResponse.redirect(new URL(`/kontakt?source=${encodeURIComponent(source)}`, req.url));
  }

  const checkoutUrl = planCheckoutLinks[plan];

  if (!checkoutUrl) {
    const fallback = new URL("/kontakt", req.url);
    fallback.searchParams.set("plan", plan);
    fallback.searchParams.set("source", source);
    fallback.searchParams.set("intent", "upgrade");
    return NextResponse.redirect(fallback);
  }

  return NextResponse.redirect(checkoutUrl);
}
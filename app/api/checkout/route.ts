import { NextRequest, NextResponse } from "next/server";

const planCheckoutLinks: Record<string, string | undefined> = {
  pro: process.env.PRO_CHECKOUT_URL,
  agency: process.env.AGENCY_CHECKOUT_URL,
};

export async function GET(req: NextRequest) {
  const plan = req.nextUrl.searchParams.get("plan")?.toLowerCase();
  const source = req.nextUrl.searchParams.get("source") || "website";

  // Validate plan parameter
  if (!plan || !(plan in planCheckoutLinks)) {
    console.warn(`[Checkout] Invalid plan requested: ${plan}`);
    return NextResponse.redirect(new URL(`/kontakt?source=${encodeURIComponent(source)}&error=invalid_plan`, req.url));
  }

  const checkoutUrl = planCheckoutLinks[plan];

  // Check if checkout URL is configured
  if (!checkoutUrl || checkoutUrl.includes("YOUR_") || checkoutUrl.trim() === "") {
    console.error(`[Checkout] Missing or invalid checkout URL for plan: ${plan}`, {
      proConfigured: !!process.env.PRO_CHECKOUT_URL && !process.env.PRO_CHECKOUT_URL.includes("YOUR_"),
      agencyConfigured: !!process.env.AGENCY_CHECKOUT_URL && !process.env.AGENCY_CHECKOUT_URL.includes("YOUR_"),
      requestedPlan: plan,
    });
    
    const fallback = new URL("/kontakt", req.url);
    fallback.searchParams.set("plan", plan);
    fallback.searchParams.set("source", source);
    fallback.searchParams.set("intent", "upgrade");
    fallback.searchParams.set("reason", "checkout_url_missing");
    return NextResponse.redirect(fallback);
  }

  // Redirect to Stripe payment link
  console.log(`[Checkout] Redirecting to ${plan} checkout`);
  return NextResponse.redirect(checkoutUrl);
}
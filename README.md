This is a Next.js project for Nexmoneta.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## AdSense Setup

Use these variables in Vercel (Production):

- `GOOGLE_ADSENSE_ID=pub-...`
- `NEXT_PUBLIC_ADSENSE_ID=pub-...`
- `NEXT_PUBLIC_ADSENSE_ENABLED=true`
- `NEXT_PUBLIC_ADSENSE_SLOT_BLOG_TOP=...`
- `NEXT_PUBLIC_ADSENSE_SLOT_BLOG_GRID=...`
- `NEXT_PUBLIC_ADSENSE_SLOT_ARTICLE_TOP=...`
- `NEXT_PUBLIC_ADSENSE_SLOT_ARTICLE_INLINE=...`
- `NEXT_PUBLIC_ADSENSE_SLOT_ARTICLE_SIDEBAR=...`

Important:

- Use `pub-...` in env values (without `ca-`).
- After changing variables, redeploy in Vercel.
- Verify that `/ads.txt` is reachable on production.

### Live Verification Checklist

1. `https://nexmoneta.com/ads.txt` returns:
	`google.com, pub-<your-id>, DIRECT, f08c47fec0942fa0`
2. Production HTML contains the AdSense script URL with `client=ca-pub-...`.
3. Blog and article pages contain ad blocks (`adsbygoogle`) with slot IDs.

## AI Labeling Toggle

Use this variable in Vercel (Production) to control the create-article compliance notice:

- `AI_LABELING_ACTIVE=false` shows the "starting in August" wording.
- `AI_LABELING_ACTIVE=true` shows the active mandatory labeling wording.

After changing the variable, redeploy in Vercel.

## Payout Readiness Checklist (30-60 min)

Use this checklist to make all revenue channels payout-ready.

### 1) Affiliate payouts (15-25 min)

1. Create and verify your payout profile in each partner program you use.
2. Add payout details (bank account or PayPal) and tax details.
3. Replace placeholder affiliate links in your admin data with your real tracking links.
4. Open your own site and click one test affiliate link.
5. Confirm the click appears in:
	- Your app stats (internal click tracking)
	- The partner network dashboard (real payout source)

Important:

- Internal "estimated revenue" is directional only.
- Real affiliate money is settled by the partner program, not by your app.

### 2) AdSense payouts (10-20 min)

1. In AdSense, complete account verification and tax profile.
2. Connect your bank account in AdSense payouts.
3. In Vercel Production, set:
	- `GOOGLE_ADSENSE_ID=pub-...`
	- `NEXT_PUBLIC_ADSENSE_ID=pub-...`
	- `NEXT_PUBLIC_ADSENSE_ENABLED=true`
	- Slot variables used by this project (see AdSense Setup section above)
4. Redeploy production.
5. Verify:
	- `/ads.txt` is reachable on your domain
	- Ad blocks render on blog/article pages

Important:

- AdSense pays you directly when your payout threshold is reached.

### 3) Pro/Agency direct sales payouts (10-15 min)

1. In Stripe (or Lemon Squeezy), complete business and bank payout setup.
2. Create live payment links for Pro and Agency.
3. In Vercel Production, set:
	- `PRO_CHECKOUT_URL=https://...`
	- `AGENCY_CHECKOUT_URL=https://...`
4. Redeploy production.
5. Test both links on production:
	- `/api/checkout?plan=pro&source=test-pro`
	- `/api/checkout?plan=agency&source=test-agency`

Expected result:

- You are redirected to your payment provider checkout page.
- After successful test payment, payout appears in your payment provider balance and then in your bank payouts.

### 4) Weekly control loop (5 min)

1. Open Admin Dashboard and Stats.
2. Check top revenue sources and checkout-rescue queue.
3. Move rescue leads through status flow (`lead_new`, `lead_contacted`, `lead_won`, `lead_lost`).
4. Keep only winning CTA/source combinations and remove weak ones.

### Fast "Money Ready" definition

You are money-ready when all 3 are true:

1. Affiliate network shows tracked clicks/conversions under your account.
2. AdSense account is approved and ad impressions are visible.
3. Pro/Agency checkout links redirect to live checkout and can complete payment.

## Today: 5 Quick Steps

If you only do five things today, do these in order:

1. Set live checkout links in Vercel:
	- `PRO_CHECKOUT_URL=...`
	- `AGENCY_CHECKOUT_URL=...`
2. Set AdSense production variables:
	- `GOOGLE_ADSENSE_ID`, `NEXT_PUBLIC_ADSENSE_ID`, `NEXT_PUBLIC_ADSENSE_ENABLED=true`, plus slots
3. Redeploy production once after saving all variables.
4. Run two checkout tests on production:
	- `/api/checkout?plan=pro&source=today-check`
	- `/api/checkout?plan=agency&source=today-check`
5. Click one affiliate link yourself and verify it appears in both:
	- app stats (internal tracking)
	- partner dashboard (real payout source)

Done means:

- Checkout redirects to live payment pages
- Ads render on blog/article pages
- Affiliate clicks are visible in partner program

## Vercel Env: Copy/Paste Order

Add these keys in this order in Vercel (Production):

```env
# 1) Direct sales (required for plan payouts)
PRO_CHECKOUT_URL=
AGENCY_CHECKOUT_URL=

# 2) AdSense core toggle
GOOGLE_ADSENSE_ID=pub-
NEXT_PUBLIC_ADSENSE_ID=pub-
NEXT_PUBLIC_ADSENSE_ENABLED=true

# 3) AdSense slots
NEXT_PUBLIC_ADSENSE_SLOT_BLOG_TOP=
NEXT_PUBLIC_ADSENSE_SLOT_BLOG_GRID=
NEXT_PUBLIC_ADSENSE_SLOT_ARTICLE_TOP=
NEXT_PUBLIC_ADSENSE_SLOT_ARTICLE_INLINE=
NEXT_PUBLIC_ADSENSE_SLOT_ARTICLE_SIDEBAR=

# 4) Compliance toggle (AI labeling notice)
AI_LABELING_ACTIVE=true
```

Notes:

- Keep `pub-...` format in IDs (no `ca-` in env values).
- After saving all variables, redeploy once.

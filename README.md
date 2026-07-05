This is a Next.js project for KI Business Hub.

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

1. `https://ki-business-hub.vercel.app/ads.txt` returns:
	`google.com, pub-<your-id>, DIRECT, f08c47fec0942fa0`
2. Production HTML contains the AdSense script URL with `client=ca-pub-...`.
3. Blog and article pages contain ad blocks (`adsbygoogle`) with slot IDs.

import { prisma } from "@/lib/prisma";

/**
 * DEVELOPMENT ONLY: Seed endpoint to populate test data
 * Access: http://localhost:3000/api/seed-test-data
 */

export async function GET(request: Request) {
  // Security: Only allow in development
  if (process.env.NODE_ENV === "production") {
    return Response.json({ error: "Not available in production" }, { status: 403 });
  }

  try {
    console.log("🌱 Seeding test data...");

    // 1. Create or reuse affiliate links
    const affiliateSeeds = [
      {
        name: "ChatGPT Pro",
        url: "https://openai.com/chatgpt",
        category: "AI Tools",
        rating: 9.5,
        price: "$20/month",
        badge: "Most Popular",
        buttonText: "Jetzt starten",
        description: "Die beste KI für Texterstellung",
        pros: "Schnell, präzise, GPT-4",
        cons: "Kostenpflichtig",
      },
      {
        name: "Midjourney",
        url: "https://midjourney.com",
        category: "AI Tools",
        rating: 9.0,
        price: "$10/month",
        badge: "Best for Images",
        buttonText: "Kostenlos testen",
        description: "KI-Bildgenerator",
        pros: "Großartige Qualität",
        cons: "Discord-Konto nötig",
      },
      {
        name: "Runway ML",
        url: "https://runwayml.com",
        category: "AI Tools",
        rating: 8.5,
        price: "$12.50/month",
        buttonText: "Kostenlos starten",
        description: "Video-Generierung",
        pros: "Intuitive UI",
        cons: "Rendering kann langsam sein",
      },
    ];

    const affiliates = [];
    for (const seed of affiliateSeeds) {
      const existing = await prisma.affiliateLink.findFirst({
        where: { url: seed.url },
      });

      if (existing) {
        const updated = await prisma.affiliateLink.update({
          where: { id: existing.id },
          data: seed,
        });
        affiliates.push(updated);
      } else {
        const created = await prisma.affiliateLink.create({ data: seed });
        affiliates.push(created);
      }
    }

    // 2. Create or update newsletter subscribers with realistic sources
    const subscriberSeeds = [
      { email: "test1@example.com", name: "Max Mustermann", source: "homepage-final-cta" },
      { email: "test2@example.com", name: "Anna Schmidt", source: "exit-intent-popup" },
      { email: "test3@example.com", name: "Peter Koch", source: "blog-best-ai-tools-hero" },
      { email: "test4@example.com", name: "Julia Weber", source: "blog-best-ai-tools-grid" },
    ];

    const subscribers = [];
    for (const seed of subscriberSeeds) {
      const subscriber = await prisma.newsletterSubscriber.upsert({
        where: { email: seed.email },
        update: {
          name: seed.name,
          source: seed.source,
          status: "subscribed",
        },
        create: {
          email: seed.email,
          name: seed.name,
          source: seed.source,
          status: "subscribed",
        },
      });
      subscribers.push(subscriber);
    }

    // 3. Create affiliate clicks for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const clicks = await Promise.all([
      prisma.affiliateClick.create({
        data: {
          affiliateLinkId: affiliates[0].id,
          articleSlug: "best-ai-tools",
          source: "blog-best-ai-tools-hero",
          userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
          referrer: "https://google.com",
          revenue: 1.5,
          status: "confirmed",
          createdAt: new Date(today.getTime() + 2 * 60 * 60 * 1000),
        },
      }),
      prisma.affiliateClick.create({
        data: {
          affiliateLinkId: affiliates[1].id,
          articleSlug: "best-ai-tools",
          source: "blog-best-ai-tools-grid",
          userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
          referrer: "https://google.com",
          revenue: 1.8,
          status: "confirmed",
          createdAt: new Date(today.getTime() + 4 * 60 * 60 * 1000),
        },
      }),
      prisma.affiliateClick.create({
        data: {
          affiliateLinkId: affiliates[0].id,
          articleSlug: "content-creation-tools",
          source: "homepage-top-tools",
          userAgent: "Mozilla/5.0 (iPhone)",
          referrer: "https://twitter.com",
          revenue: 1.2,
          status: "confirmed",
          createdAt: new Date(today.getTime() + 8 * 60 * 60 * 1000),
        },
      }),
      prisma.affiliateClick.create({
        data: {
          affiliateLinkId: affiliates[2].id,
          articleSlug: "video-editing-tools",
          source: "tool-detail-video-editing-tools",
          userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
          referrer: "https://reddit.com",
          revenue: 0.9,
          status: "confirmed",
          createdAt: new Date(today.getTime() + 12 * 60 * 60 * 1000),
        },
      }),
      prisma.affiliateClick.create({
        data: {
          affiliateLinkId: affiliates[1].id,
          articleSlug: "best-ai-tools",
          source: "best-tools-table",
          userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
          referrer: "https://linkedin.com",
          revenue: 1.6,
          status: "confirmed",
          createdAt: new Date(today.getTime() + 15 * 60 * 60 * 1000),
        },
      }),
      prisma.affiliateClick.create({
        data: {
          affiliateLinkId: affiliates[0].id,
          articleSlug: "best-ai-tools",
          source: "blog-best-ai-tools-mid",
          userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
          referrer: "https://bing.com",
          revenue: 2.1,
          status: "confirmed",
          createdAt: new Date(today.getTime() + 18 * 60 * 60 * 1000),
        },
      }),
    ]);

    // 3b. Create month-over-month comparison data
    await prisma.affiliateClick.createMany({
      data: [
        {
          affiliateLinkId: affiliates[0].id,
          articleSlug: "best-ai-tools",
          source: "homepage-top-tools",
          userAgent: "Mozilla/5.0",
          referrer: "https://google.com",
          revenue: 1.1,
          status: "confirmed",
          createdAt: new Date(today.getFullYear(), today.getMonth() - 1, 12, 10),
        },
        {
          affiliateLinkId: affiliates[1].id,
          articleSlug: "best-ai-tools",
          source: "best-tools-table",
          userAgent: "Mozilla/5.0",
          referrer: "https://google.com",
          revenue: 1.4,
          status: "confirmed",
          createdAt: new Date(today.getFullYear(), today.getMonth() - 1, 14, 15),
        },
      ],
    });

    // 3c. Create A/B test fixtures if none exist
    const existingTests = await prisma.aBTest.count();
    if (existingTests === 0) {
      await prisma.aBTest.createMany({
        data: [
          {
            affiliateLinkId: affiliates[0].id,
            variantA: "Kostenlos testen",
            variantB: "Jetzt starten",
            impressionsA: 180,
            impressionsB: 172,
            clicksA: 15,
            clicksB: 24,
            winner: "B",
            confidence: 93.2,
            status: "active",
          },
          {
            affiliateLinkId: affiliates[1].id,
            variantA: "Tool ansehen",
            variantB: "Deal sichern",
            impressionsA: 140,
            impressionsB: 145,
            clicksA: 12,
            clicksB: 19,
            winner: "B",
            confidence: 95.4,
            status: "complete",
            appliedAt: new Date(),
          },
        ],
      });
    }

    // 4. Create earnings log
    const totalRevenue = clicks.reduce(
      (sum, click) => sum + (click.revenue || 0),
      0
    );

    await prisma.earningsLog.create({
      data: {
        date: today,
        affiliateRevenue: totalRevenue,
        adRevenue: 1.8,
        sponsorRevenue: 0,
        totalRevenue: totalRevenue + 1.8,
      },
    });

    return Response.json({
      success: true,
      message: "✅ Test data created successfully!",
      data: {
        affiliatesCreated: affiliates.length,
        subscribersCreated: subscribers.length,
        clicksCreated: clicks.length,
        abTestsSeeded: existingTests === 0 ? 2 : existingTests,
        totalTodayRevenue: (totalRevenue + 1.8).toFixed(2),
      },
    });
  } catch (error) {
    console.error("❌ Seeding error:", error);
    return Response.json(
      {
        error: "Failed to seed data",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

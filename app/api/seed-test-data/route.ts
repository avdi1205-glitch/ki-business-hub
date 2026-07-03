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

    // 1. Create affiliate links
    const affiliates = await Promise.all([
      prisma.affiliateLink.create({
        data: {
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
      }),
      prisma.affiliateLink.create({
        data: {
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
      }),
      prisma.affiliateLink.create({
        data: {
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
      }),
    ]);

    // 2. Create newsletter subscribers
    const subscribers = await Promise.all([
      prisma.newsletterSubscriber.create({
        data: {
          email: "test1@example.com",
          name: "Max Mustermann",
          status: "subscribed",
        },
      }),
      prisma.newsletterSubscriber.create({
        data: {
          email: "test2@example.com",
          name: "Anna Schmidt",
          status: "subscribed",
        },
      }),
      prisma.newsletterSubscriber.create({
        data: {
          email: "test3@example.com",
          name: "Peter Koch",
          status: "subscribed",
        },
      }),
    ]);

    // 3. Create affiliate clicks for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const clicks = await Promise.all([
      prisma.affiliateClick.create({
        data: {
          affiliateLinkId: affiliates[0].id,
          articleSlug: "best-ai-tools",
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
          userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
          referrer: "https://linkedin.com",
          revenue: 1.6,
          status: "confirmed",
          createdAt: new Date(today.getTime() + 15 * 60 * 60 * 1000),
        },
      }),
    ]);

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

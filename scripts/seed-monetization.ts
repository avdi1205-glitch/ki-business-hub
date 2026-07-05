import { prisma } from "@/lib/prisma";

/**
 * Script to populate test data for monetization testing
 * Run with: npx ts-node scripts/seed-monetization.ts
 */

async function seedMonetizationData() {
  console.log("🌱 Seeding monetization test data...");

  // 1. Create sample affiliate links
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
        description: "Die beste KI für Texterstellung und Brainstorming",
        pros: "Schnell, präzise, GPT-4 Zugang",
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
        description: "KI-Bildgenerator für kreative Projekte",
        pros: "Großartige Bildqualität, schnelle Generation",
        cons: "Discord-basiert, Discord-Konto erforderlich",
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
        description: "Video-Generierung und AI-Editing",
        pros: "Intuitive UI, professionelle Ergebnisse",
        cons: "Rendering kann langsam sein",
      },
    }),
  ]);

  console.log("✅ Created", affiliates.length, "affiliate links");

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

  console.log("✅ Created", subscribers.length, "newsletter subscribers");

  // 3. Create sample affiliate clicks
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const clicks = await Promise.all([
    // Morning clicks
    prisma.affiliateClick.create({
      data: {
        affiliateLinkId: affiliates[0].id,
        articleSlug: "best-ai-tools",
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        referrer: "https://google.com",
        revenue: 1.5,
        status: "confirmed",
        createdAt: new Date(today.getTime() + 2 * 60 * 60 * 1000), // 2 AM
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
        createdAt: new Date(today.getTime() + 4 * 60 * 60 * 1000), // 4 AM
      },
    }),
    prisma.affiliateClick.create({
      data: {
        affiliateLinkId: affiliates[0].id,
        articleSlug: "content-creation-tools",
        userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 14_6)",
        referrer: "https://twitter.com",
        revenue: 1.2,
        status: "confirmed",
        createdAt: new Date(today.getTime() + 8 * 60 * 60 * 1000), // 8 AM
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
        createdAt: new Date(today.getTime() + 12 * 60 * 60 * 1000), // 12 PM
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
        createdAt: new Date(today.getTime() + 15 * 60 * 60 * 1000), // 3 PM
      },
    }),
  ]);

  console.log("✅ Created", clicks.length, "affiliate clicks for today");

  // 4. Create ad impressions
  const adImpressions = await Promise.all([
    prisma.adImpression.create({
      data: {
        articleSlug: "best-ai-tools",
        adType: "display",
        clicks: 12,
        impressions: 450,
        revenue: 1.2,
      },
    }),
    prisma.adImpression.create({
      data: {
        articleSlug: "content-creation-tools",
        adType: "sidebar",
        clicks: 5,
        impressions: 320,
        revenue: 0.6,
      },
    }),
  ]);

  console.log("✅ Created", adImpressions.length, "ad impressions");

  // 5. Create earnings log
  const totalRevenue = clicks.reduce((sum, click) => sum + (click.revenue || 0), 0);

  await prisma.earningsLog.create({
    data: {
      date: today,
      affiliateRevenue: totalRevenue,
      adRevenue: 1.8,
      sponsorRevenue: 0,
      totalRevenue: totalRevenue + 1.8,
    },
  });

  console.log("✅ Created earnings log: €" + (totalRevenue + 1.8).toFixed(2));

  // Summary
  const summaryData = {
    affiliatesCreated: affiliates.length,
    subscribersCreated: subscribers.length,
    clicksCreated: clicks.length,
    adsCreated: adImpressions.length,
    totalTodayRevenue: totalRevenue + 1.8,
  };

  console.log("\n📊 Summary:");
  console.log(JSON.stringify(summaryData, null, 2));
}

seedMonetizationData()
  .catch((e) => {
    console.error("❌ Error seeding data:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    console.log("✅ Done!");
  });

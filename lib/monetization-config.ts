/**
 * Monetarisierungs-Konfiguration für KI Business Hub
 * Hier können alle Einstellungen für die Geldverdienung konfiguriert werden
 */

export const monetizationConfig = {
  // Affiliate Link Revenue Settings
  affiliate: {
    // Durchschnittliche Revenue pro Klick (in €)
    averageRevenuePerClick: {
      min: 0.5,
      max: 2.0,
      default: 1.25,
    },
    // Conversion Rate (wird für Analytics verwendet)
    expectedConversionRate: 0.05, // 5%
    // Top affiliates to display
    topAffiliatesCount: 5,
  },

  // Google AdSense Settings
  googleAdSense: {
    // Durchschnittliche Revenue pro 1000 Impressions (in €)
    averageRPM: {
      display: 2.5,
      sidebar: 1.5,
      mobile: 1.2,
    },
    // Ad Placements
    placements: {
      topBanner: {
        size: "728x90",
        enabled: true,
      },
      midArticle: {
        size: "300x250",
        enabled: true,
      },
      sidebar: {
        size: "300x600",
        enabled: true,
      },
      bottomArticle: {
        size: "728x90",
        enabled: true,
      },
    },
  },

  // Newsletter Settings
  newsletter: {
    // Durchschnittliche Conversion von Newsletter zu Klick
    conversionRate: 0.15, // 15%
    // Revenue pro Newsletter Subscriber (geschätzt)
    revenuePerSubscriber: 0.1, // €0.10 per subscriber per month
  },

  // Affiliate Link Strategy
  affiliateLinkStrategy: {
    // Maximale Anzahl von Affiliate Links pro Artikel
    maxLinksPerArticle: 5,
    // Strategische Platzierungen:
    // "top" - Nach dem ersten Absatz
    // "middle" - Mitten im Artikel
    // "bottom" - Am Ende des Artikels
    // "sidebar" - In der Seitenleiste
    placements: ["top", "middle", "bottom", "sidebar"],
  },

  // Content Strategy for Revenue
  contentStrategy: {
    // Priorität bei der Article-Generierung basierend auf Revenue-Potential
    highValueCategories: [
      "AI Tools",
      "Hosting",
      "VPN",
      "Project Management",
      "Email Marketing",
    ],
    // SEO-fokussierte Keywords mit hohem Affiliate Potential
    highValueKeywords: [
      "best ai tools",
      "top hosting providers",
      "vpn for productivity",
      "email automation tools",
    ],
  },

  // Tracking & Analytics
  tracking: {
    // Speichere Affiliate Clicks
    trackAffiliateClicks: true,
    // Speichere Impressions
    trackImpressions: true,
    // Speichere Conversions
    trackConversions: true,
    // Update daily earnings summary
    generateDailySummary: true,
  },

  // Projections & Goals
  goals: {
    monthlyRevenueTarget: 1000, // €1000 per month
    articlesNeeded: 50, // Artikel für Target
    newsletterSubscribersNeeded: 5000,
  },
};

// Helper function to calculate estimated revenue
export function calculateEstimatedRevenue(
  affiliateClicks: number,
  adImpressions: number = 0,
  newsletterRevenue: number = 0
): {
  affiliateRevenue: number;
  adRevenue: number;
  totalRevenue: number;
} {
  const affiliateRevenue =
    affiliateClicks *
    ((monetizationConfig.affiliate.averageRevenuePerClick.min +
      monetizationConfig.affiliate.averageRevenuePerClick.max) /
      2);

  const adRevenue =
    (adImpressions / 1000) * monetizationConfig.googleAdSense.averageRPM.display;

  const totalRevenue = affiliateRevenue + adRevenue + newsletterRevenue;

  return {
    affiliateRevenue: Math.round(affiliateRevenue * 100) / 100,
    adRevenue: Math.round(adRevenue * 100) / 100,
    totalRevenue: Math.round(totalRevenue * 100) / 100,
  };
}

// Helper to get high-value content ideas
export function getHighValueContentIdeas() {
  return monetizationConfig.contentStrategy.highValueCategories.map(
    (category) => ({
      title: `Ultimate Guide to ${category}`,
      category,
      priority: 10,
      affiliatePotential: "high",
    })
  );
}

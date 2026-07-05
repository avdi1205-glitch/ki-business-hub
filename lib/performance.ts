// Performance & SEO utilities

export const generateMetadata = (title: string, description: string, image?: string) => {
  return {
    title: `${title} | KI Business Hub`,
    description,
    openGraph: {
      title,
      description,
      image: image || "https://ki-business-hub.vercel.app/og-image.png",
      type: "website",
      url: "https://ki-business-hub.vercel.app",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      image: image || "https://ki-business-hub.vercel.app/og-image.png",
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    canonical: "https://ki-business-hub.vercel.app",
  };
};

type SchemaType = "Article" | "Organization" | "FAQPage";

type ArticleSchemaData = {
  title?: string;
  description?: string;
  image?: string;
  date?: string;
  content?: string;
};

// Schema.org structured data
export const generateSchema = (type: SchemaType, data: ArticleSchemaData) => {
  const baseSchema = {
    "@context": "https://schema.org",
    "@type": type,
  };

  if (type === "Article") {
    return {
      ...baseSchema,
      headline: data.title,
      description: data.description,
      image: data.image,
      author: {
        "@type": "Person",
        name: "KI Business Hub",
      },
      datePublished: data.date,
      articleBody: data.content,
    };
  }

  if (type === "Organization") {
    return {
      ...baseSchema,
      name: "KI Business Hub",
      url: "https://ki-business-hub.vercel.app",
      logo: "https://ki-business-hub.vercel.app/logo.png",
      sameAs: ["https://twitter.com/kibusinesshub"],
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "Support",
        email: "support@ki-business-hub.de",
      },
    };
  }

  return baseSchema;
};

// Core Web Vitals tracking
export const trackWebVitals = () => {
  if (typeof window !== "undefined") {
    // LCP - Largest Contentful Paint
    try {
      new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const lastEntry = entries[entries.length - 1] as PerformanceEntry | undefined;
        if (lastEntry) {
            const timedEntry = lastEntry as PerformanceEntry & {
              renderTime?: number;
              loadTime?: number;
            };
            console.log("LCP:", timedEntry.renderTime || timedEntry.loadTime || 0);
        }
      }).observe({ entryTypes: ["largest-contentful-paint"] });
      } catch {
      // LCP not supported
    }

    // FID - First Input Delay
    try {
      new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        entries.forEach((entry) => {
          const timedEntry = entry as PerformanceEntry & {
            processingDuration?: number;
          };
          console.log("FID:", timedEntry.processingDuration || 0);
        });
      }).observe({ entryTypes: ["first-input"] });
    } catch {
      // FID not supported
    }

    // CLS - Cumulative Layout Shift
    try {
      new PerformanceObserver((entryList) => {
        let clsValue = 0;
        entryList.getEntries().forEach((entry) => {
          const layoutEntry = entry as PerformanceEntry & {
            hadRecentInput?: boolean;
            value?: number;
          };
          if (!layoutEntry.hadRecentInput) {
            clsValue += layoutEntry.value || 0;
            console.log("CLS:", clsValue);
          }
        });
      }).observe({ entryTypes: ["layout-shift"] });
    } catch {
      // CLS not supported
    }
  }
};

// Preload critical resources
export const preloadResources = () => {
  if (typeof document !== "undefined") {
    const link = document.createElement("link");
    link.rel = "preconnect";
    link.href = "https://fonts.googleapis.com";
    document.head.appendChild(link);

    const link2 = document.createElement("link");
    link2.rel = "dns-prefetch";
    link2.href = "https://www.googletagmanager.com";
    document.head.appendChild(link2);
  }
};

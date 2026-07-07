import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

const buildWorkers = Number.parseInt(process.env.NEXT_BUILD_CPUS ?? "2", 10);
const normalizedBuildWorkers = Number.isFinite(buildWorkers) && buildWorkers > 0 ? buildWorkers : 2;

const nextConfig: NextConfig = {
  // Image Optimization
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },

  // Performance
  compress: true,

  experimental: {
    // Keep build concurrency conservative to prevent worker OOM on smaller machines/CI.
    cpus: normalizedBuildWorkers,
    memoryBasedWorkersCount: true,
    webpackMemoryOptimizations: true,
  },

  // Security Headers
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);

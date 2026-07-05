import type { MetadataRoute } from "next";
import { prisma } from "../lib/prisma";
import { getSiteUrl } from "../lib/site-url";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();
  let articles: Awaited<ReturnType<typeof prisma.article.findMany>> = [];

  try {
    articles = await prisma.article.findMany();
  } catch {
    // Keep sitemap generation working in environments without a live DB connection.
    articles = [];
  }

  const articleUrls = articles
    .filter((article) => Boolean(article.slug))
    .map((article) => ({
      url: `${siteUrl}/blog/${article.slug}`,
      lastModified: article.createdAt,
    }));

  const staticUrls: MetadataRoute.Sitemap = [
    { url: siteUrl, lastModified: new Date() },
    { url: `${siteUrl}/affiliate`, lastModified: new Date() },
    { url: `${siteUrl}/beste-tools`, lastModified: new Date() },
    { url: `${siteUrl}/blog`, lastModified: new Date() },
    { url: `${siteUrl}/blog/ki-tools`, lastModified: new Date() },
    { url: `${siteUrl}/content-factory`, lastModified: new Date() },
    { url: `${siteUrl}/create-article`, lastModified: new Date() },
    { url: `${siteUrl}/datenschutz`, lastModified: new Date() },
    { url: `${siteUrl}/editor`, lastModified: new Date() },
    { url: `${siteUrl}/kontakt`, lastModified: new Date() },
    { url: `${siteUrl}/stats`, lastModified: new Date() },
    { url: `${siteUrl}/tools`, lastModified: new Date() },
  ];

  return [...staticUrls, ...articleUrls];
}
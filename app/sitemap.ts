import { prisma } from "../lib/prisma";

export default async function sitemap() {
  const articles = await prisma.article.findMany();

  const articleUrls = articles.map((article) => ({
    url: `http://localhost:3000/blog/${article.slug}`,
    lastModified: article.createdAt,
  }));

  return [
    {
      url: "http://localhost:3000",
      lastModified: new Date(),
    },
    {
      url: "http://localhost:3000/blog",
      lastModified: new Date(),
    },
    ...articleUrls,
  ];
}
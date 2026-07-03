import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.contentIdea.createMany({
    data: [
      {
        title: "Hostinger Erfahrungen 2026",
        category: "Hosting",
        priority: 95,
        searchVolume: 12000,
        difficulty: 45,
        affiliateTool: "Hostinger",
      },
      {
        title: "ChatGPT vs Claude 2026",
        category: "KI Tools",
        priority: 92,
        searchVolume: 18000,
        difficulty: 55,
        affiliateTool: "ChatGPT Plus",
      },
      {
        title: "Beste VPN Anbieter 2026",
        category: "VPN",
        priority: 88,
        searchVolume: 9000,
        difficulty: 50,
        affiliateTool: "NordVPN",
      },
    ],
  });

  console.log("✅ Content Ideas erstellt");
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
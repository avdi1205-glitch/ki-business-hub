import OpenAI from "openai";
import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function cleanJson(text: string) {
  const cleaned = text.replace(/```json/g, "").replace(/```/g, "").trim();
  const start = cleaned.indexOf("[");
  const end = cleaned.lastIndexOf("]");

  if (start === -1 || end === -1) {
    throw new Error("KI hat kein JSON Array zurückgegeben.");
  }

  return cleaned.slice(start, end + 1);
}

export async function POST() {
  try {
    const response = await client.responses.create({
      model: "gpt-4o-mini",
      input: `
Erstelle 50 deutsche Content-Ideen für KI Business Hub.

Antworte NUR als gültiges JSON Array:
[
  {
    "title": "Artikelidee",
    "category": "KI Tools",
    "priority": 90,
    "searchVolume": 12000,
    "difficulty": 45,
    "affiliateTool": "ChatGPT Plus"
  }
]

Kategorien:
- KI Tools
- Hosting
- VPN
- Automation
- Affiliate

Regeln:
- keine Markdown-Blöcke
- keine Kommentare
- keine trailing commas
- Priorität 1 bis 100
- difficulty 1 bis 100
- Suchvolumen realistisch schätzen
- Affiliate Tool passend wählen
`,
    });

    const ideas = JSON.parse(cleanJson(response.output_text));

    let created = 0;

    for (const idea of ideas) {
      const title = String(idea.title || "");
      const category = String(idea.category || "KI Tools");

      if (!title) continue;

      const exists = await prisma.contentIdea.findFirst({
        where: { title },
      });

      if (exists) continue;

      await prisma.contentIdea.create({
        data: {
          title,
          category,
          priority: Number(idea.priority) || 50,
          searchVolume: Number(idea.searchVolume) || null,
          difficulty: Number(idea.difficulty) || null,
          affiliateTool: idea.affiliateTool || null,
        },
      });

      created++;
    }

    return NextResponse.json({
      success: true,
      created,
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
    });
  }
}
import { expect, test } from "@playwright/test";

test("internal bots route rejects invalid bot type", async ({ request }) => {
  const response = await request.post("/api/internal-bots", {
    data: {
      bot: "unknown",
      goal: "Mehr Leads",
      context: "test",
    },
  });

  const body = (await response.json()) as { success: boolean; error?: string };

  expect(response.status()).toBe(400);
  expect(body.success).toBe(false);
  expect(body.error || "").toContain("Ungueltiger Bot-Typ");
});

test("internal bots route requires a goal", async ({ request }) => {
  const response = await request.post("/api/internal-bots", {
    data: {
      bot: "sales",
      goal: "",
      context: "test",
    },
  });

  const body = (await response.json()) as { success: boolean; error?: string };

  expect(response.status()).toBe(400);
  expect(body.success).toBe(false);
  expect(body.error || "").toContain("Bitte ein Ziel angeben");
});

test("role permission blocks unauthorized bot usage", async ({ request }) => {
  const response = await request.post("/api/internal-bots", {
    data: {
      role: "support",
      bot: "sales",
      goal: "Mehr Upgrades",
      context: "test",
    },
  });

  const body = (await response.json()) as { success: boolean; error?: string };

  expect(response.status()).toBe(403);
  expect(body.success).toBe(false);
  expect(body.error || "").toContain("Rolle darf diesen Bot nicht");
});

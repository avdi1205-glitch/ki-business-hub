import { expect, test } from "@playwright/test";

test("internal bots history route responds with success payload", async ({ request }) => {
  const response = await request.get("/api/internal-bots/history?limit=10");
  const body = (await response.json()) as {
    success: boolean;
    persistenceAvailable?: boolean;
    items?: unknown[];
  };

  expect(response.ok()).toBeTruthy();
  expect(body.success).toBe(true);
  expect(typeof body.persistenceAvailable).toBe("boolean");
  expect(Array.isArray(body.items)).toBeTruthy();
});

test("internal bots history patch rejects invalid id", async ({ request }) => {
  const response = await request.patch("/api/internal-bots/history/not-a-number", {
    data: { favorite: true },
  });
  const body = (await response.json()) as { success: boolean; error?: string };

  expect(response.status()).toBe(400);
  expect(body.success).toBe(false);
  expect(body.error || "").toContain("Ungueltige ID");
});

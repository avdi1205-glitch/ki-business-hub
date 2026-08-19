import { expect, test } from "@playwright/test";

// proxy.ts guards /api/internal-bots behind an admin session cookie; the CI
// workflow sets ADMIN_BASIC_USER/PASSWORD so this token matches what the
// guard expects (same encoding as lib/admin-auth.ts::createAdminSessionToken).
const adminSessionCookie = `nm_admin_session=${Buffer.from(
  `${process.env.ADMIN_BASIC_USER ?? ""}:${process.env.ADMIN_BASIC_PASSWORD ?? ""}`,
  "utf8",
).toString("base64")}`;
const adminHeaders = { Cookie: adminSessionCookie };

test("internal bots history route responds with success payload", async ({ request }) => {
  const response = await request.get("/api/internal-bots/history?limit=10", {
    headers: adminHeaders,
  });
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
    headers: adminHeaders,
    data: { favorite: true },
  });
  const body = (await response.json()) as { success: boolean; error?: string };

  expect(response.status()).toBe(400);
  expect(body.success).toBe(false);
  expect(body.error || "").toContain("Ungueltige ID");
});

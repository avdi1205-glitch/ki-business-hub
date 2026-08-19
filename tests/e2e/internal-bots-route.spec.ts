import { expect, test } from "@playwright/test";

// proxy.ts guards /api/internal-bots behind an admin session cookie; the CI
// workflow sets ADMIN_BASIC_USER/PASSWORD so this token matches what the
// guard expects (same encoding as lib/admin-auth.ts::createAdminSessionToken).
const adminSessionCookie = `nm_admin_session=${Buffer.from(
  `${process.env.ADMIN_BASIC_USER ?? ""}:${process.env.ADMIN_BASIC_PASSWORD ?? ""}`,
  "utf8",
).toString("base64")}`;
const adminHeaders = { Cookie: adminSessionCookie };

test("internal bots route rejects invalid bot type", async ({ request }) => {
  const response = await request.post("/api/internal-bots", {
    headers: adminHeaders,
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
    headers: adminHeaders,
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
    headers: adminHeaders,
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

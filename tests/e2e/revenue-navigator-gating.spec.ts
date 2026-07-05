import { expect, test } from "@playwright/test";

test("starter plan is locked via API", async ({ request }) => {
  const response = await request.get("/api/revenue-playbook?plan=starter");
  const body = (await response.json()) as { success: boolean; locked?: boolean; message?: string };

  expect(response.status()).toBe(403);
  expect(body.success).toBe(false);
  expect(body.locked).toBe(true);
  expect(body.message || "").toContain("ab Pro");
});

test("pro and agency plans are available via API", async ({ request }) => {
  for (const plan of ["pro", "agency"] as const) {
    const response = await request.get(`/api/revenue-playbook?plan=${plan}`);
    const body = (await response.json()) as { success: boolean; locked?: boolean; recommendations?: unknown[] };

    expect(response.ok()).toBeTruthy();
    expect(body.success).toBe(true);
    expect(body.locked).toBeFalsy();
    expect(Array.isArray(body.recommendations)).toBeTruthy();
    expect((body.recommendations || []).length).toBeGreaterThan(0);
  }
});

test("invalid plan falls back to starter lock", async ({ request }) => {
  const response = await request.get("/api/revenue-playbook?plan=invalid-plan");
  const body = (await response.json()) as { success: boolean; locked?: boolean };

  expect(response.status()).toBe(403);
  expect(body.success).toBe(false);
  expect(body.locked).toBe(true);
});

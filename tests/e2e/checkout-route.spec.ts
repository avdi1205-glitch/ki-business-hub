import { expect, test } from "@playwright/test";

function parseLocationHeader(location: string | null, base = "http://localhost:3000") {
  if (!location) return null;

  if (location.startsWith("http://") || location.startsWith("https://")) {
    return new URL(location);
  }

  return new URL(location, base);
}

test("invalid plan redirects to kontakt with source", async ({ request }) => {
  const response = await request.get("/api/checkout?plan=invalid&source=hero-test", { maxRedirects: 0 });

  expect(response.status()).toBeGreaterThanOrEqual(300);
  expect(response.status()).toBeLessThan(400);

  const location = parseLocationHeader(response.headers()["location"] ?? null);
  expect(location).not.toBeNull();
  expect(location?.pathname).toBe("/kontakt");
  expect(location?.searchParams.get("source")).toBe("hero-test");
});

test("missing plan redirects to kontakt and preserves source", async ({ request }) => {
  const response = await request.get("/api/checkout?source=pricing-card", { maxRedirects: 0 });

  expect(response.status()).toBeGreaterThanOrEqual(300);
  expect(response.status()).toBeLessThan(400);

  const location = parseLocationHeader(response.headers()["location"] ?? null);
  expect(location).not.toBeNull();
  expect(location?.pathname).toBe("/kontakt");
  expect(location?.searchParams.get("source")).toBe("pricing-card");
});

test("pro plan redirects to configured checkout or kontakt fallback", async ({ request }) => {
  const response = await request.get("/api/checkout?plan=pro&source=revenue-navigator", { maxRedirects: 0 });

  expect(response.status()).toBeGreaterThanOrEqual(300);
  expect(response.status()).toBeLessThan(400);

  const locationHeader = response.headers()["location"] ?? null;
  const location = parseLocationHeader(locationHeader);
  expect(location).not.toBeNull();

  const configured = process.env.PRO_CHECKOUT_URL;

  if (configured) {
    expect(locationHeader).toBe(configured);
    return;
  }

  expect(location?.pathname).toBe("/kontakt");
  expect(location?.searchParams.get("plan")).toBe("pro");
  expect(location?.searchParams.get("source")).toBe("revenue-navigator");
  expect(location?.searchParams.get("intent")).toBe("upgrade");
});

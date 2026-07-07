import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const CUSTOMER_SESSION_COOKIE = "nm_customer_session";

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function getSecret() {
  return process.env.CUSTOMER_SESSION_SECRET || process.env.ADMIN_BASIC_PASSWORD || "change-me-customer-session-secret";
}

function signEmail(email: string) {
  return createHmac("sha256", getSecret()).update(email).digest("base64url");
}

export function createCustomerSessionToken(email: string) {
  const normalized = normalizeEmail(email);
  return `${normalized}.${signEmail(normalized)}`;
}

export function parseCustomerSessionToken(token: string) {
  const split = token.lastIndexOf(".");
  if (split <= 0) return null;

  const email = token.slice(0, split);
  const signature = token.slice(split + 1);
  const expected = signEmail(email);

  const a = Buffer.from(signature);
  const b = Buffer.from(expected);

  if (a.length !== b.length) return null;
  if (!timingSafeEqual(a, b)) return null;

  return normalizeEmail(email);
}

export async function getCustomerSessionEmail() {
  const store = await cookies();
  const token = store.get(CUSTOMER_SESSION_COOKIE)?.value;
  if (!token) return null;
  return parseCustomerSessionToken(token);
}

export async function isCustomerSessionAuthenticated() {
  const email = await getCustomerSessionEmail();
  return Boolean(email);
}

export async function requireCustomerSession(nextPath: string) {
  const email = await getCustomerSessionEmail();
  if (!email) {
    redirect(`/konto/login?next=${encodeURIComponent(nextPath)}`);
  }
  return email;
}

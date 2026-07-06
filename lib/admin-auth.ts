import type { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const ADMIN_SESSION_COOKIE = "nm_admin_session";

export function getExpectedAdminCredentials() {
  const user = process.env.ADMIN_BASIC_USER;
  const password = process.env.ADMIN_BASIC_PASSWORD;

  if (!user || !password) {
    return null;
  }

  return { user, password };
}

export function createAdminSessionToken(user: string, password: string) {
  return Buffer.from(`${user}:${password}`, "utf8").toString("base64");
}

export function matchesAdminCredentials(user: string, password: string) {
  const credentials = getExpectedAdminCredentials();
  if (!credentials) return false;

  return credentials.user === user && credentials.password === password;
}

export function hasValidAdminSession(request: NextRequest) {
  const credentials = getExpectedAdminCredentials();
  if (!credentials) return false;

  const sessionCookie = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  if (!sessionCookie) return false;

  return sessionCookie === createAdminSessionToken(credentials.user, credentials.password);
}

export async function requireAdminSession(nextPath: string) {
  const credentials = getExpectedAdminCredentials();

  if (!credentials) {
    throw new Error("Admin guard is not configured.");
  }

  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;

  if (sessionCookie !== createAdminSessionToken(credentials.user, credentials.password)) {
    redirect(`/admin-login?next=${encodeURIComponent(nextPath)}`);
  }
}

export function hasValidBasicAuth(request: NextRequest) {
  const credentials = getExpectedAdminCredentials();
  if (!credentials) return false;

  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Basic ")) return false;

  const encoded = authHeader.slice(6);
  let decoded = "";

  try {
    decoded = Buffer.from(encoded, "base64").toString("utf8");
  } catch {
    return false;
  }

  const separatorIndex = decoded.indexOf(":");
  if (separatorIndex < 0) return false;

  const user = decoded.slice(0, separatorIndex);
  const password = decoded.slice(separatorIndex + 1);

  return user === credentials.user && password === credentials.password;
}

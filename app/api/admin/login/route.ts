import { NextResponse } from "next/server";
import {
  ADMIN_SESSION_COOKIE,
  createAdminSessionToken,
  getExpectedAdminCredentials,
  matchesAdminCredentials,
} from "@/lib/admin-auth";

function resolveCookieDomain() {
  const explicitDomain = (process.env.COOKIE_DOMAIN || "").trim().toLowerCase();
  if (explicitDomain) return explicitDomain;

  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || "").trim();
  if (!siteUrl) return undefined;

  try {
    const hostname = new URL(siteUrl).hostname.toLowerCase();
    if (!hostname || hostname === "localhost") return undefined;
    return hostname.startsWith("www.") ? hostname.slice(4) : hostname;
  } catch {
    return undefined;
  }
}

export async function POST(request: Request) {
  const credentials = getExpectedAdminCredentials();

  if (!credentials) {
    return NextResponse.json({ error: "Admin guard is not configured." }, { status: 503 });
  }

  const body = await request.json().catch(() => null);
  const username = String(body?.username || "").trim();
  const password = String(body?.password || "");
  const nextPath = String(body?.nextPath || "/admin/dashboard");

  if (!matchesAdminCredentials(username, password)) {
    return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true, nextPath: nextPath.startsWith("/") ? nextPath : "/admin/dashboard" });
  const cookieDomain = resolveCookieDomain();
  response.cookies.set(ADMIN_SESSION_COOKIE, createAdminSessionToken(username, password), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12,
    ...(cookieDomain ? { domain: cookieDomain } : {}),
  });

  return response;
}

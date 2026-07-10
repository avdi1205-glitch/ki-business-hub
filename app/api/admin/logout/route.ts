import { NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE } from "@/lib/admin-auth";

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

function buildCookieDomains() {
  const baseDomain = resolveCookieDomain();
  const domains: string[] = [];

  if (baseDomain) {
    domains.push(baseDomain);
    domains.push(`www.${baseDomain}`);
  }

  return Array.from(new Set(domains));
}

function clearAdminSessionCookie(response: NextResponse) {
  // Clear host-only cookie variant.
  response.cookies.set(ADMIN_SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });

  // Also clear domain-scoped variants to cover old/new deployments and www/apex hosts.
  for (const domain of buildCookieDomains()) {
    response.cookies.set(ADMIN_SESSION_COOKIE, "", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 0,
      domain,
    });
  }

  return response;
}

export async function POST() {
  const response = NextResponse.json({ ok: true });

  return clearAdminSessionCookie(response);
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const redirectUrl = new URL("/admin-login", url.origin);
  redirectUrl.searchParams.set("logout", "1");
  const response = NextResponse.redirect(redirectUrl);
  return clearAdminSessionCookie(response);
}

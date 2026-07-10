import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getExpectedAdminCredentials, hasValidAdminSession } from "./lib/admin-auth";

const PROTECTED_PREFIXES = ["/admin", "/api/internal-bots", "/api/admin/revenue-navigator", "/api/contact-lead/status", "/api/newsletter-subscribers", "/api/agency-leads", "/create-article", "/editor"];
const ADMIN_LOGIN_PATH = "/admin-login";

function isProtectedPath(pathname: string) {
  return PROTECTED_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!isProtectedPath(pathname)) {
    return NextResponse.next();
  }

  const credentials = getExpectedAdminCredentials();

  if (!credentials) {
    return new NextResponse("Admin guard is not configured.", { status: 503 });
  }

  if (hasValidAdminSession(request)) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/")) {
    return new NextResponse("Authentication required.", {
      status: 401,
      headers: {
        "Cache-Control": "no-store",
      },
    });
  }

  const loginUrl = new URL(ADMIN_LOGIN_PATH, request.url);
  loginUrl.searchParams.set("next", `${pathname}${request.nextUrl.search}`);

  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/admin/:path*", "/api/internal-bots/:path*", "/api/admin/revenue-navigator/:path*", "/api/contact-lead/status/:path*", "/api/newsletter-subscribers/:path*", "/api/agency-leads/:path*", "/create-article/:path*", "/editor/:path*"],
};

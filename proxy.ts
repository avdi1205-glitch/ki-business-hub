import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED_PREFIXES = ["/admin", "/api/internal-bots"];

function isProtectedPath(pathname: string) {
  return PROTECTED_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

function hasValidBasicAuth(request: NextRequest, expectedUser: string, expectedPassword: string) {
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

  return user === expectedUser && password === expectedPassword;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!isProtectedPath(pathname)) {
    return NextResponse.next();
  }

  const adminUser = process.env.ADMIN_BASIC_USER;
  const adminPassword = process.env.ADMIN_BASIC_PASSWORD;

  if (!adminUser || !adminPassword) {
    return new NextResponse("Admin guard is not configured.", { status: 503 });
  }

  if (hasValidBasicAuth(request, adminUser, adminPassword)) {
    return NextResponse.next();
  }

  return new NextResponse("Authentication required.", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="Admin Area"',
      "Cache-Control": "no-store",
    },
  });
}

export const config = {
  matcher: ["/admin/:path*", "/api/internal-bots/:path*"],
};

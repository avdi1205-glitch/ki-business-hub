import { NextResponse } from "next/server";
import {
  ADMIN_SESSION_COOKIE,
  createAdminSessionToken,
  getExpectedAdminCredentials,
  matchesAdminCredentials,
} from "@/lib/admin-auth";

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
  response.cookies.set(ADMIN_SESSION_COOKIE, createAdminSessionToken(username, password), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12,
  });

  return response;
}

import { createHash } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createCustomerSessionToken, CUSTOMER_SESSION_COOKIE } from "@/lib/customer-auth";
import { hasCustomerAccess } from "@/lib/customer-entitlement";

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  const email = req.nextUrl.searchParams.get("email");

  if (!token || !email) {
    return NextResponse.redirect(new URL("/konto/login?error=invalid_link", req.url));
  }

  const normalizedEmail = normalizeEmail(email);
  const tokenHash = hashToken(token);

  const loginToken = await prisma.customerLoginToken.findFirst({
    where: {
      tokenHash,
      email: normalizedEmail,
      usedAt: null,
      expiresAt: {
        gt: new Date(),
      },
    },
  });

  if (!loginToken) {
    return NextResponse.redirect(new URL("/konto/login?error=expired_or_invalid", req.url));
  }

  const entitlement = await prisma.customerEntitlement.findFirst({
    where: {
      email: normalizedEmail,
      status: { in: ["active", "trialing", "past_due"] },
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  if (!hasCustomerAccess(entitlement)) {
    return NextResponse.redirect(new URL("/konto/login?error=no_active_plan", req.url));
  }

  await prisma.customerLoginToken.update({
    where: { id: loginToken.id },
    data: { usedAt: new Date() },
  });

  const response = NextResponse.redirect(new URL("/konto", req.url));
  response.cookies.set(CUSTOMER_SESSION_COOKIE, createCustomerSessionToken(normalizedEmail), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  return response;
}

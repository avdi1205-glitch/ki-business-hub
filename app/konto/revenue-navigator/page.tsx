import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireCustomerSession } from "@/lib/customer-auth";
import { hasCustomerAccess } from "@/lib/customer-entitlement";
import RevenueNavigatorStudio from "@/app/revenue-navigator/RevenueNavigatorStudio";
import { getLocale } from "next-intl/server";
import { isAdminSessionAuthenticated } from "@/lib/admin-auth";

export const metadata: Metadata = {
  title: "Kundenbereich | Revenue Navigator",
  description: "Gespeicherte Revenue-Navigator-Scans und dein bezahlter Workspace.",
};

export default async function CustomerRevenueNavigatorPage() {
  const locale = await getLocale();
  const isAdmin = await isAdminSessionAuthenticated();
  const adminOverrideEmail = process.env.ADMIN_OVERRIDE_EMAIL || "admin@nexmoneta.local";
  const email = isAdmin ? adminOverrideEmail : await requireCustomerSession("/konto/revenue-navigator");

  if (isAdmin) {
    const scans = await prisma.revenueNavigatorScan.findMany({
      where: { email },
      orderBy: { createdAt: "desc" },
      take: 8,
      select: {
        id: true,
        plan: true,
        focus: true,
        opportunityScore: true,
        projectedMonthlyLift: true,
        summary: true,
        createdAt: true,
      },
    }).catch(() => []);

    return (
      <RevenueNavigatorStudio
        locale={locale}
        mode="customer"
        customerPlan="agency"
        customerEmail={email}
        initialSavedScans={scans.map((scan) => ({
          ...scan,
          createdAt: scan.createdAt.toISOString(),
        }))}
      />
    );
  }

  const entitlement = await prisma.customerEntitlement.findFirst({
    where: {
      email,
      status: { in: ["active", "trialing", "past_due"] },
      plan: { in: ["pro", "agency"] },
    },
    orderBy: { updatedAt: "desc" },
  });

  if (!hasCustomerAccess(entitlement)) {
    redirect("/konto/login?error=no_active_plan");
  }

  const scans = await prisma.revenueNavigatorScan.findMany({
    where: { email },
    orderBy: { createdAt: "desc" },
    take: 8,
    select: {
      id: true,
      plan: true,
      focus: true,
      opportunityScore: true,
      projectedMonthlyLift: true,
      summary: true,
      createdAt: true,
    },
  }).catch(() => []);

  return (
    <RevenueNavigatorStudio
      locale={locale}
      mode="customer"
      customerPlan={entitlement!.plan === "agency" ? "agency" : "pro"}
      customerEmail={email}
      initialSavedScans={scans.map((scan) => ({
        ...scan,
        createdAt: scan.createdAt.toISOString(),
      }))}
    />
  );
}
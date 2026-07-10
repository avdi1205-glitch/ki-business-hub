type AccessLike = {
  status: string;
  graceUntil?: Date | string | null;
};

export function hasCustomerAccess(entitlement: AccessLike | null | undefined) {
  if (!entitlement) return false;

  if (entitlement.status === "active" || entitlement.status === "trialing") {
    return true;
  }

  if (entitlement.status === "past_due" && entitlement.graceUntil) {
    const graceUntil = new Date(entitlement.graceUntil);
    return Number.isFinite(graceUntil.getTime()) && graceUntil.getTime() > Date.now();
  }

  return false;
}
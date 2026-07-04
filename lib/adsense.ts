export function toAdClientId(rawId?: string | null): string | null {
  const value = (rawId || "").trim();
  if (!value) return null;

  const normalized = value.replace(/^ca-/i, "");
  if (!normalized.startsWith("pub-")) return null;

  return `ca-${normalized}`;
}

export function isAdSenseEnabled(rawValue?: string | null): boolean {
  const value = (rawValue || "").trim().toLowerCase();
  return value === "1" || value === "true" || value === "yes" || value === "on";
}

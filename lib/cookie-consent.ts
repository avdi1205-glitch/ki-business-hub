export type ConsentCategory = "analytics" | "advertising";

export type ConsentState = {
  essential: true;
  analytics: boolean;
  advertising: boolean;
  timestamp: string;
};

const STORAGE_KEY = "nm_cookie_consent";

export function getConsent(): ConsentState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ConsentState;
  } catch {
    return null;
  }
}

export function hasConsent(category: ConsentCategory): boolean {
  const state = getConsent();
  if (!state) return false;
  return state[category] === true;
}

export function hasAnyConsentDecision(): boolean {
  return getConsent() !== null;
}

export function saveConsent(analytics: boolean, advertising: boolean): ConsentState {
  const state: ConsentState = {
    essential: true,
    analytics,
    advertising,
    timestamp: new Date().toISOString(),
  };
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }
  return state;
}

export function revokeConsent(): void {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(STORAGE_KEY);
  }
}

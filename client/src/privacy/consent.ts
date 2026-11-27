// Persistent analytics consent, stored on the visitor's device only (localStorage, key "jolu-consent-v1").
// Every storage access is guarded: if storage is unavailable or corrupt, the visitor is treated as NOT consented.

export const CONSENT_KEY = "jolu-consent-v1"
export type AnalyticsChoice = "granted" | "denied"
export interface StoredConsent { v: 1; analytics: AnalyticsChoice; ts: number }

type MinimalStorage = Pick<Storage, "getItem" | "setItem">

export function defaultStorage(): MinimalStorage | null {
  try {
    return typeof window !== "undefined" && window.localStorage ? window.localStorage : null
  } catch {
    return null
  }
}

export function readConsent(storage: MinimalStorage | null = defaultStorage()): StoredConsent | null {
  if (!storage) return null
  try {
    const raw = storage.getItem(CONSENT_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (parsed && parsed.v === 1 && (parsed.analytics === "granted" || parsed.analytics === "denied") && typeof parsed.ts === "number") {
      return { v: 1, analytics: parsed.analytics, ts: parsed.ts }
    }
    return null
  } catch {
    return null
  }
}

export function writeConsent(choice: AnalyticsChoice, storage: MinimalStorage | null = defaultStorage(), now: number = Date.now()): boolean {
  if (!storage) return false
  try {
    storage.setItem(CONSENT_KEY, JSON.stringify({ v: 1, analytics: choice, ts: now } satisfies StoredConsent))
    return true
  } catch {
    return false
  }
}

/** Analytics may run only on an explicit, stored "granted" choice. */
export const isGranted = (c: StoredConsent | null): boolean => c?.analytics === "granted"

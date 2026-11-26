// M2-QUOTE-01: typed client for the M2 backend contract (server/app.js on release/m2-rc1).
//
// Every call resolves to a SubmitOutcome; nothing throws and no raw server payload is ever surfaced to customers.
// The API origin comes only from VITE_API_BASE and is validated: if it is missing or invalid, no request is sent
// (there is deliberately no fallback URL).

export type FieldName =
  | "name" | "email" | "phone" | "county" | "area" | "productInterest" | "message"
  | "preferredDate" | "preferredTime" | "product" | "notes"

export type SubmitOutcome =
  | { kind: "received" }                               // 201: stored and staff notified
  | { kind: "duplicate" }                              // 200 duplicate:true / already_subscribed: stored earlier
  | { kind: "saved_not_notified" }                     // 502 notification_failed: STORED, staff email failed
  | { kind: "invalid"; fields: FieldName[] }           // 400 validation (field names only, never messages)
  | { kind: "rate_limited" }                           // 429
  | { kind: "in_progress" }                            // 409: identical request is being processed
  | { kind: "unavailable" }                            // 503 service_unavailable / storage_failed: NOT stored
  | { kind: "rejected" }                               // 403 origin_not_allowed, 413, 400 invalid_json
  | { kind: "network" }                                // request never reached the server
  | { kind: "timeout" }                                // no answer in time: may or may not have been stored
  | { kind: "misconfigured" }                          // VITE_API_BASE missing/invalid: nothing was sent
  | { kind: "unexpected"; status?: number }            // anything else (e.g. 500)

export const KNOWN_FIELDS: readonly FieldName[] = [
  "name", "email", "phone", "county", "area", "productInterest", "message", "preferredDate", "preferredTime", "product", "notes",
]

export const REQUEST_TIMEOUT_MS = 20_000

/** Returns the normalised origin (no trailing slash) or null when the value must not be used. */
export function resolveApiBase(raw: unknown): string | null {
  if (typeof raw !== "string") return null
  const value = raw.trim()
  if (!value || value === "undefined" || value === "null") return null
  let url: URL
  try { url = new URL(value) } catch { return null }
  const local = url.hostname === "localhost" || url.hostname === "127.0.0.1" || url.hostname === "[::1]"
  if (url.protocol !== "https:" && !(url.protocol === "http:" && local)) return null
  if (url.username || url.password || url.search || url.hash) return null
  return `${url.origin}${url.pathname.replace(/\/+$/, "")}`
}

function readEnvBase(): unknown {
  try { return import.meta.env.VITE_API_BASE } catch { return undefined }
}

export const API_BASE: string | null = resolveApiBase(readEnvBase())

/** Maps an HTTP status + parsed JSON body to an outcome. Exported for tests. */
export function classifyResponse(status: number, body: unknown): SubmitOutcome {
  const json = (body && typeof body === "object" ? body : {}) as Record<string, unknown>
  const code = typeof json.code === "string" ? json.code : ""
  if (status === 201) return { kind: "received" }
  if (status === 200) {
    if (json.ok === true && (json.duplicate === true || json.status === "already_subscribed")) return { kind: "duplicate" }
    if (json.ok === true) return { kind: "received" }
    return { kind: "unexpected", status }
  }
  if (status === 400 && code !== "invalid_json") {
    const errors = (json.errors && typeof json.errors === "object" ? json.errors : {}) as Record<string, unknown>
    const fe = (errors.fieldErrors && typeof errors.fieldErrors === "object" ? errors.fieldErrors : {}) as Record<string, unknown>
    const fields = KNOWN_FIELDS.filter((f) => Array.isArray(fe[f]) && (fe[f] as unknown[]).length > 0)
    return { kind: "invalid", fields }
  }
  if (status === 400 || status === 403 || status === 413) return { kind: "rejected" }
  if (status === 409) return { kind: "in_progress" }
  if (status === 429) return { kind: "rate_limited" }
  if (status === 502 && code === "notification_failed") return { kind: "saved_not_notified" }
  if (status === 503) return { kind: "unavailable" }
  return { kind: "unexpected", status }
}

type FetchLike = (input: string, init?: RequestInit) => Promise<Response>

export interface SendOptions { base?: string | null; fetchImpl?: FetchLike; timeoutMs?: number }

export async function send(path: string, data: unknown, opts: SendOptions = {}): Promise<SubmitOutcome> {
  const base = opts.base === undefined ? API_BASE : opts.base
  if (!base) {
    try { console.error("[api] VITE_API_BASE is missing or invalid; request not sent.") } catch { /* ignore */ }
    return { kind: "misconfigured" }
  }
  const fetchImpl: FetchLike | undefined = opts.fetchImpl ?? (typeof fetch === "function" ? fetch : undefined)
  if (!fetchImpl) return { kind: "network" }
  const controller = typeof AbortController === "function" ? new AbortController() : undefined
  let timedOut = false
  const timer = setTimeout(() => { timedOut = true; controller?.abort() }, opts.timeoutMs ?? REQUEST_TIMEOUT_MS)
  try {
    const res = await fetchImpl(`${base}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      signal: controller?.signal,
    })
    const body = await res.json().catch(() => null)
    return classifyResponse(res.status, body)
  } catch {
    return timedOut ? { kind: "timeout" } : { kind: "network" }
  } finally {
    clearTimeout(timer)
  }
}

type EnquiryPayload = {
  name: string; email: string; phone: string; county: string; area: string;
  productInterest?: string | null; message: string;
}

export const api = {
  contact: (data: EnquiryPayload, opts?: SendOptions) => send("/api/contact", data, opts),
  quote: (data: EnquiryPayload, opts?: SendOptions) => send("/api/quotes", data, opts),
  schedule: (data: {
    name: string; email: string; phone: string; preferredDate: string; preferredTime: string;
    product: string; notes?: string | null;
  }, opts?: SendOptions) => send("/api/schedule", data, opts),
  subscribe: (data: { email: string }, opts?: SendOptions) => send("/api/subscribe", data, opts),
}

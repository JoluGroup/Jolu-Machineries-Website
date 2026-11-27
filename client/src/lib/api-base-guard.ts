// M2-QUOTE-01: build-time check of VITE_API_BASE (used by vite.config.ts; unit-tested directly).
import { resolveApiBase } from "./api"

function isLoopback(origin: string): boolean {
  try {
    const h = new URL(origin).hostname.replace(/^\[|\]$/g, "")
    return h === "localhost" || h.endsWith(".localhost") || h === "::1" || /^127\./.test(h) || h === "0.0.0.0"
  } catch { return false }
}

export interface ApiBaseCheck { ok: boolean; fatal: boolean; message?: string }

/**
 * A Vercel *production* build must never ship without a valid API origin (every enquiry form would be dead), so it is
 * fatal there. Preview, CI and local builds only warn; the forms then show a "contact us directly" message.
 */
export function checkApiBaseForBuild(value: unknown, vercelEnv: string | undefined): ApiBaseCheck {
  const base = resolveApiBase(value)
  if (base && vercelEnv === "production" && isLoopback(base)) {
    return { ok: false, fatal: true, message: "[build] VITE_API_BASE points at a loopback address. Refusing to build production." }
  }
  if (base) return { ok: true, fatal: false }
  const message = "VITE_API_BASE is missing or invalid (expected an absolute https:// origin)."
  if (vercelEnv === "production") return { ok: false, fatal: true, message: `[build] ${message} Refusing to build production.` }
  return { ok: false, fatal: false, message: `[build] warning: ${message} Enquiry forms will show a 'contact us directly' message.` }
}

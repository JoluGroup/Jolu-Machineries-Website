// M2-QUOTE-01: build-time check of VITE_API_BASE (used by vite.config.ts; unit-tested directly).
import { resolveApiBase } from "./api"

export interface ApiBaseCheck { ok: boolean; fatal: boolean; message?: string }

/**
 * A Vercel *production* build must never ship without a valid API origin (every enquiry form would be dead), so it is
 * fatal there. Preview, CI and local builds only warn; the forms then show a "contact us directly" message.
 */
export function checkApiBaseForBuild(value: unknown, vercelEnv: string | undefined): ApiBaseCheck {
  if (resolveApiBase(value)) return { ok: true, fatal: false }
  const message = "VITE_API_BASE is missing or invalid (expected an absolute https:// origin)."
  if (vercelEnv === "production") return { ok: false, fatal: true, message: `[build] ${message} Refusing to build production.` }
  return { ok: false, fatal: false, message: `[build] warning: ${message} Enquiry forms will show a 'contact us directly' message.` }
}

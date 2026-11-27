// M2-PRIVACY-01: analytics is a configuration-gated capability.
// The measurement ID comes ONLY from VITE_GA_MEASUREMENT_ID. When it is unset or invalid there is no banner,
// no cookie-settings control, no analytics code and no request to Google.
// No measurement ID is hard-coded here on purpose: the property previously embedded in index.html has not been
// confirmed as JOLU-owned or approved for the revised website (owner decision O-4).

export const GA_ID_PATTERN = /^G-[A-Z0-9]{4,}$/

export function resolveMeasurementId(raw: unknown): string | null {
  if (typeof raw !== "string") return null
  const id = raw.trim()
  return GA_ID_PATTERN.test(id) ? id : null
}

export function configuredMeasurementId(): string | null {
  try {
    return resolveMeasurementId(import.meta.env.VITE_GA_MEASUREMENT_ID)
  } catch {
    return null
  }
}

/** Event used by the footer "Cookie settings" control to reopen the consent bar. */
export const OPEN_SETTINGS_EVENT = "jolu:open-cookie-settings"

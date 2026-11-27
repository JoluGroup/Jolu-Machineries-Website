import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { createAnalytics, deleteGaCookies, type Analytics } from "./analytics"
import { configuredMeasurementId, OPEN_SETTINGS_EVENT } from "./config"
import { isGranted, readConsent, writeConsent, type AnalyticsChoice } from "./consent"

/** Presentational bar. Accept and Reject are identical in size, weight and styling (equal prominence). */
export function ConsentBar({ onChoose, current, focusOnOpen = false }: { onChoose: (c: AnalyticsChoice) => void; current?: AnalyticsChoice | null; focusOnOpen?: boolean }) {
  const first = useRef<HTMLButtonElement>(null)
  // When reopened from the footer "Cookie settings" control, move keyboard focus into the bar.
  useEffect(() => { if (focusOnOpen) first.current?.focus() }, [focusOnOpen])
  const button = "h-10 min-w-[8.5rem] rounded-full border border-white/30 bg-white/10 px-5 text-sm font-semibold text-white hover:bg-white/20 focus-visible:ring-2 focus-visible:ring-primary-glow"
  return (
    <div
      role="region"
      aria-label="Cookie preferences"
      className="fixed inset-x-3 bottom-3 z-[60] mx-auto max-w-3xl rounded-2xl border border-white/10 bg-primary p-4 text-white shadow-2xl sm:inset-x-6 sm:p-5"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm leading-snug text-white/90">
          May we use Google Analytics cookies to understand how this website is used? Analytics stays off unless you
          allow it, and you can change your choice at any time under “Cookie settings” in the footer.
          {current ? <span className="block text-white/70">Current choice: {current === "granted" ? "allowed" : "not allowed"}.</span> : null}
        </p>
        <div className="flex shrink-0 gap-2">
          <Button ref={first} type="button" variant="ghost" className={button} onClick={() => onChoose("denied")}>
            Reject
          </Button>
          <Button type="button" variant="ghost" className={button} onClick={() => onChoose("granted")}>
            Accept analytics
          </Button>
        </div>
      </div>
    </div>
  )
}

/**
 * Mounted once in App. Renders nothing (and loads nothing) unless VITE_GA_MEASUREMENT_ID is configured.
 * The bar appears only after mount, so prerendered HTML never contains it.
 */
const ConsentBanner = () => {
  const id = useMemo(() => configuredMeasurementId(), [])
  const analytics = useMemo<Analytics | null>(
    () => (id && typeof window !== "undefined" ? createAnalytics(id, { window, document }) : null),
    [id],
  )
  const [open, setOpen] = useState(false)
  const [reopened, setReopened] = useState(false)
  const [current, setCurrent] = useState<AnalyticsChoice | null>(null)

  // Remove analytics cookies left by earlier versions of the site (production loaded GA unconditionally) whenever
  // analytics is not currently allowed, including builds with no measurement ID configured. No network request.
  useEffect(() => {
    if (typeof window === "undefined") return
    if (!isGranted(readConsent()) || !id) deleteGaCookies({ window, document })
  }, [id])

  useEffect(() => {
    if (!analytics) return
    const stored = readConsent()
    setCurrent(stored?.analytics ?? null)
    if (isGranted(stored)) analytics.grant()
    else setOpen(!stored)
    const reopen = () => { setReopened(true); setOpen(true) }
    window.addEventListener(OPEN_SETTINGS_EVENT, reopen)
    return () => window.removeEventListener(OPEN_SETTINGS_EVENT, reopen)
  }, [analytics])

  const choose = useCallback((choice: AnalyticsChoice) => {
    if (!analytics) return
    writeConsent(choice)
    setCurrent(choice)
    setOpen(false)
    if (choice === "granted") analytics.grant()
    else analytics.withdraw()
  }, [analytics])

  if (!analytics || !open) return null
  return <ConsentBar onChoose={choose} current={current} focusOnOpen={reopened} />
}

/** Footer control; rendered only when analytics is configured. */
export const CookieSettingsButton = ({ className }: { className?: string }) => {
  if (!configuredMeasurementId()) return null
  return (
    <button
      type="button"
      className={className ?? "text-white/60 text-sm underline-offset-4 hover:text-white hover:underline"}
      onClick={() => window.dispatchEvent(new Event(OPEN_SETTINGS_EVENT))}
    >
      Cookie settings
    </button>
  )
}

export default ConsentBanner

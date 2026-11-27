// Consent-gated Google Analytics 4 loader. Nothing in this module touches the page until grant() is called.
// Privacy rules:
//  - only https://www.googletagmanager.com/gtag/js?id=<configured id> is ever injected;
//  - advertising storage/signals are always denied; Google signals and ad personalisation are off;
//  - page locations are reduced to origin + pathname (query strings and fragments, which can carry e-mail
//    addresses, phone numbers or campaign data, are never sent); referrers are reduced the same way;
//  - no form field values or other user input are ever sent;
//  - withdraw() stops all further hits, sets the official ga-disable flag and deletes _ga / _ga_* cookies.

/* eslint-disable @typescript-eslint/no-explicit-any */
export interface AnalyticsEnv {
  window: any
  document: any
}

export const GTAG_ORIGIN = "https://www.googletagmanager.com"
export const gtagScriptUrl = (id: string) => `${GTAG_ORIGIN}/gtag/js?id=${encodeURIComponent(id)}`

export function sanitizeUrl(href: string | undefined | null): string | undefined {
  if (!href) return undefined
  try {
    const u = new URL(href)
    if (u.protocol !== "https:" && u.protocol !== "http:") return undefined
    return `${u.origin}${u.pathname}`
  } catch {
    return undefined
  }
}

/** Domains a first-party _ga cookie may have been written for: host-only, host, and each parent domain. */
export function cookieDomains(hostname: string): string[] {
  const out = new Set<string>([""])
  const labels = hostname.split(".").filter(Boolean)
  if (labels.length > 1 && !/^\d+$/.test(labels[labels.length - 1])) {
    for (let i = 0; i < labels.length - 1; i++) out.add(`.${labels.slice(i).join(".")}`)
  }
  return [...out]
}

export function deleteGaCookies(env: AnalyticsEnv): string[] {
  const doc = env.document
  const raw: string = typeof doc?.cookie === "string" ? doc.cookie : ""
  const names = raw.split(";").map((c) => c.split("=")[0].trim()).filter((n) => /^_ga(_[A-Za-z0-9]+)?$/.test(n))
  const hostname: string = env.window?.location?.hostname || ""
  for (const name of names) {
    for (const domain of cookieDomains(hostname)) {
      doc.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; max-age=0; path=/${domain ? `; domain=${domain}` : ""}`
    }
  }
  return names
}

export interface Analytics {
  grant(): void
  withdraw(): void
  pageView(): void
  readonly active: boolean
}

export function createAnalytics(id: string, env: AnalyticsEnv): Analytics {
  const w = env.window
  const d = env.document
  let active = false
  let initialised = false
  let historyHooked = false

  const gtag = (...args: unknown[]) => {
    if (typeof w.gtag === "function") w.gtag(...args)
  }

  const location = () => sanitizeUrl(w.location?.href)

  const pageView = () => {
    if (!active) return
    const page_location = location()
    if (!page_location) return
    gtag("set", { page_location, page_referrer: sanitizeUrl(d.referrer) ?? "" })
    gtag("event", "page_view", { page_location, page_title: typeof d.title === "string" ? d.title : "" })
  }

  const hookHistory = () => {
    if (historyHooked || !w.history) return
    historyHooked = true
    for (const method of ["pushState", "replaceState"] as const) {
      const original = w.history[method]
      if (typeof original !== "function") continue
      w.history[method] = function (this: unknown, ...args: unknown[]) {
        const result = original.apply(this, args)
        // Defer so the router has updated document.title.
        setTimeout(pageView, 0)
        return result
      }
    }
    if (typeof w.addEventListener === "function") w.addEventListener("popstate", () => setTimeout(pageView, 0))
  }

  return {
    get active() { return active },
    pageView,
    grant() {
      if (active) return
      w[`ga-disable-${id}`] = false
      if (!initialised) {
        w.dataLayer = w.dataLayer || []
        // gtag must push the `arguments` object, as Google's snippet does.
        w.gtag = function gtagShim() { w.dataLayer.push(arguments) } // eslint-disable-line prefer-rest-params
        gtag("consent", "default", { analytics_storage: "granted", ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied" })
        gtag("js", new Date())
        gtag("config", id, {
          send_page_view: false,
          allow_google_signals: false,
          allow_ad_personalization_signals: false,
          page_location: location(),
        })
        const s = d.createElement("script")
        s.async = true
        s.src = gtagScriptUrl(id)
        d.head.appendChild(s)
        initialised = true
      } else {
        gtag("consent", "update", { analytics_storage: "granted" })
      }
      active = true
      hookHistory()
      pageView()
    },
    withdraw() {
      const wasInitialised = initialised
      active = false
      w[`ga-disable-${id}`] = true
      if (wasInitialised) gtag("consent", "update", { analytics_storage: "denied" })
      deleteGaCookies(env)
    },
  }
}

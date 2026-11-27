// M2-SEO-01: canonical origin and URL helpers.
// Canonical host is https://www.jolumachineries.com (production evidence: the apex domain redirects to www).
export const SITE_ORIGIN = "https://www.jolumachineries.com"
export const DEFAULT_OG_IMAGE = "/og-image.png"

/** Normalise a path: leading slash, no query/hash, no trailing slash (except "/"). */
export function normalizePath(path: string): string {
  let p = (path || "/").split(/[?#]/)[0]
  if (!p.startsWith("/")) p = `/${p}`
  if (p.length > 1) p = p.replace(/\/+$/, "")
  return p || "/"
}

export function absoluteUrl(path: string): string {
  if (/^https?:\/\//.test(path)) return path
  return `${SITE_ORIGIN}${path.startsWith("/") ? path : `/${path}`}`
}

export function canonicalUrl(path: string): string {
  const p = normalizePath(path)
  return p === "/" ? `${SITE_ORIGIN}/` : `${SITE_ORIGIN}${p}`
}

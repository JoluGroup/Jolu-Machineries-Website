// M2-SEO-01: per-route <head> model shared by the prerender (HTML string) and <RouteSeo/> (DOM updates).
import { forStructuredData, identity } from "@/config/business"
import { allRoutes, fullTitle, type RouteMeta } from "./routes"
import { canonicalUrl } from "./site"
import { imageUrl, structuredDataFor } from "./structured-data"

export interface HeadModel {
  title: string
  metas: { key: "name" | "property"; id: string; content: string }[]
  canonical: string
  jsonLd: Record<string, unknown>[]
}

export function buildHead(r: RouteMeta, opts: { indexable: boolean }): HeadModel {
  const title = fullTitle(r)
  const url = canonicalUrl(r.kind === "notfound" ? "/" : r.path)
  const image = imageUrl(r.image)
  const metas: HeadModel["metas"] = [
    { key: "name", id: "description", content: r.description },
    { key: "property", id: "og:type", content: r.kind === "product" ? "product" : r.kind === "article" ? "article" : "website" },
    ...(r.kind === "notfound" ? [] : [{ key: "property" as const, id: "og:url", content: url }]),
    { key: "property", id: "og:title", content: title },
    { key: "property", id: "og:description", content: r.description },
    { key: "property", id: "og:image", content: image },
    { key: "property", id: "og:image:alt", content: r.imageAlt ?? r.title },
    { key: "name", id: "twitter:card", content: "summary_large_image" },
    { key: "name", id: "twitter:title", content: title },
    { key: "name", id: "twitter:description", content: r.description },
    { key: "name", id: "twitter:image", content: image },
  ]
  const siteName = forStructuredData(identity.displayName)
  if (siteName) metas.push({ key: "property", id: "og:site_name", content: siteName })
  if (!opts.indexable) metas.push({ key: "name", id: "robots", content: "noindex, nofollow" })
  else if (!r.indexable) metas.push({ key: "name", id: "robots", content: "noindex, follow" })
  const listing = r.kind === "listing" ? allRoutes().filter((x) => x.kind === "product") : []
  return { title, metas, canonical: url, jsonLd: r.kind === "notfound" ? [] : structuredDataFor(r, listing) }
}

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")
// JSON-LD inside <script>: escape "<" so no "</script>" or "<!--" can terminate the block.
const jsonForScript = (o: unknown) => JSON.stringify(o).replace(/</g, "\\u003c")

export function renderHeadHtml(h: HeadModel, opts: { canonical: boolean } = { canonical: true }): string {
  const lines = [`<title>${esc(h.title)}</title>`]
  for (const m of h.metas) lines.push(`<meta ${m.key}="${esc(m.id)}" content="${esc(m.content)}" />`)
  if (opts.canonical) lines.push(`<link rel="canonical" href="${esc(h.canonical)}" />`)
  for (const j of h.jsonLd) lines.push(`<script type="application/ld+json" data-seo="jsonld">${jsonForScript(j)}</script>`)
  return lines.map((l) => `    ${l}`).join("\n")
}

// M2-SEO-01 / M2-AEO-GEO-01: JSON-LD builders. Rules:
//  - Only facts visible on the page or verified in the claims registry (forStructuredData) are emitted.
//  - Product: name, description, image, url ONLY. Never brand, offers, price, availability, rating, review or specs
//    (prices are unpublished, stock is unverified and specifications await manufacturer confirmation - C16-C18).
//  - Organization / WebSite are emitted only once the owner verifies the identity (C1); today they are omitted.
//  - FAQPage only from questions that are visibly rendered on the page (none today).
//  - Valid schema.org markup does not guarantee any rich result.
import manifest from "@/generated/image-manifest.json"
import { forStructuredData, identity } from "@/config/business"
import { resolveImage, type ImageManifest } from "@/lib/image-utils"
import { absoluteUrl, canonicalUrl, DEFAULT_OG_IMAGE, SITE_ORIGIN } from "./site"
import type { RouteMeta } from "./routes"

export const ALLOWED_TYPES = ["Organization", "WebSite", "BreadcrumbList", "ListItem", "Product", "ItemList", "Article", "FAQPage", "Question", "Answer", "ImageObject"] as const

type Json = Record<string, unknown>

/** Absolute URL for an image key ("@/assets/x.png", "/lovable-uploads/x.jpg") using the generated WebP variant if any. */
export function imageUrl(src?: string): string {
  if (!src) return absoluteUrl(DEFAULT_OG_IMAGE)
  const resolved = resolveImage(manifest as ImageManifest, src, "/")
  if (resolved) return absoluteUrl(resolved.src)
  if (src.startsWith("@/")) return absoluteUrl(DEFAULT_OG_IMAGE) // never leak build-time keys
  return absoluteUrl(src)
}

export function breadcrumbList(r: RouteMeta): Json | null {
  if (r.breadcrumbs.length < 2) return null
  return {
    "@context": "https://schema.org", "@type": "BreadcrumbList",
    itemListElement: r.breadcrumbs.map((b, i) => ({ "@type": "ListItem", position: i + 1, name: b.name, item: canonicalUrl(b.path) })),
  }
}

export function itemList(items: readonly RouteMeta[]): Json {
  return {
    "@context": "https://schema.org", "@type": "ItemList",
    itemListElement: items.map((r, i) => ({ "@type": "ListItem", position: i + 1, name: r.title, url: canonicalUrl(r.path) })),
  }
}

export function product(r: RouteMeta): Json | null {
  const p = r.product
  if (!p) return null
  return {
    "@context": "https://schema.org", "@type": "Product",
    name: p.name,
    description: (p.longDescription || p.description).replace(/\s+/g, " ").trim(),
    image: imageUrl(p.image),
    url: canonicalUrl(r.path),
  }
}

export function article(r: RouteMeta): Json | null {
  if (!r.article) return null
  const a: Json = {
    "@context": "https://schema.org", "@type": "Article",
    headline: r.article.headline, description: r.description, image: imageUrl(r.image), mainEntityOfPage: canonicalUrl(r.path),
  }
  if (r.article.datePublished) a.datePublished = r.article.datePublished
  return a
}

export function faqPage(r: RouteMeta): Json | null {
  if (!r.questions || r.questions.length === 0) return null
  return {
    "@context": "https://schema.org", "@type": "FAQPage",
    mainEntity: r.questions.map((q) => ({ "@type": "Question", name: q.question, acceptedAnswer: { "@type": "Answer", text: q.answer } })),
  }
}

/** Organization + WebSite, only when the display name is owner-verified (C1). */
export function siteEntities(): Json[] {
  const name = forStructuredData(identity.displayName)
  if (!name) return []
  const legalName = forStructuredData(identity.legalName)
  const org: Json = { "@context": "https://schema.org", "@type": "Organization", name, url: `${SITE_ORIGIN}/`, logo: absoluteUrl("/lovable-uploads/jolu-machinery-logo.jpg") }
  if (legalName) org.legalName = legalName
  return [org, { "@context": "https://schema.org", "@type": "WebSite", name, url: `${SITE_ORIGIN}/` }]
}

export function structuredDataFor(r: RouteMeta, listing: readonly RouteMeta[] = []): Json[] {
  const out: (Json | null)[] = []
  if (r.kind === "home") out.push(...siteEntities())
  out.push(breadcrumbList(r))
  if (r.kind === "listing") out.push(itemList(listing))
  if (r.kind === "product") out.push(product(r))
  if (r.kind === "article") out.push(article(r))
  out.push(faqPage(r))
  return out.filter((x): x is Json => x !== null)
}

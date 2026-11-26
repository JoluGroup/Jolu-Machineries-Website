// M2-SEO-01: single registry of route metadata used by the build-time prerender, sitemap, robots and the client
// <RouteSeo/> component. Titles/descriptions describe visible page content only; no unsupported claims
// (manufacturer superlatives, stock, prices, testimonials) may appear here. Business identity comes from the claims
// registry: visible() for the title suffix (customer-facing, same rule as on-page text), forStructuredData() for
// og:site_name and JSON-LD.
import { identity, manufacturer, visible } from "@/config/business"
import { products, type Product } from "@/data/products"
import { productPath } from "@/data/catalogue"

export type RouteKind = "home" | "page" | "listing" | "product" | "article" | "form" | "notfound"

export interface Breadcrumb { readonly name: string; readonly path: string }

export interface RouteMeta {
  readonly path: string
  readonly kind: RouteKind
  /** Title without the brand suffix. */
  readonly title: string
  readonly description: string
  /** Site-relative or absolute image path for og:image (defaults to /og-image.png). */
  readonly image?: string
  readonly imageAlt?: string
  /** false => <meta name="robots" content="noindex, follow"> and excluded from the sitemap. */
  readonly indexable: boolean
  readonly breadcrumbs: readonly Breadcrumb[]
  /** Article data, only where the page visibly shows a headline (and, if given, a date). */
  readonly article?: { readonly headline: string; readonly datePublished?: string }
  /** Visible on-page questions and answers (none today; FAQPage is emitted only from this). */
  readonly questions?: readonly { readonly question: string; readonly answer: string }[]
  /** Content provenance for future guides (AEO/GEO): who reviewed it and when. */
  readonly provenance?: { readonly reviewedBy: string; readonly updated: string }
  readonly product?: Product
}

const HOME: Breadcrumb = { name: "Home", path: "/" }
const PRODUCTS: Breadcrumb = { name: "Products", path: "/products" }

export const brandSuffix = (): string => {
  const name = visible(identity.displayName)
  return name ? ` | ${name}` : ""
}

export const fullTitle = (r: RouteMeta): string => (r.kind === "home" ? r.title : `${r.title}${brandSuffix()}`)

const clamp = (s: string, n = 158) => {
  const t = s.replace(/\s+/g, " ").trim()
  if (t.length <= n) return t
  const cut = t.slice(0, n - 1)
  return `${cut.slice(0, Math.max(cut.lastIndexOf(" "), n - 20))}…`
}

const firstSentence = (s?: string) => (s ? (s.match(/^[^.!?]+[.!?]/)?.[0] ?? s) : "")

export const STATIC_ROUTES: readonly RouteMeta[] = [
  {
    path: "/", kind: "home",
    title: `Zoomlion Tractors, Harvesters & Farm Implements in Kenya${brandSuffix()}`,
    description: `${manufacturer.neutralDescription} Browse the range, request a quote or schedule a visit.`,
    indexable: true, breadcrumbs: [],
  },
  {
    path: "/products", kind: "listing",
    title: "Zoomlion Tractors, Harvesters & Farm Implements",
    description: "Browse Zoomlion wheeled tractors, combine harvesters and farm implements, with details for each model and a quick way to request a quote.",
    indexable: true, breadcrumbs: [HOME, PRODUCTS],
  },
  {
    path: "/spare-parts", kind: "page",
    title: "Spare Parts for Zoomlion Machinery",
    description: "Search spare parts for Zoomlion tractors and harvesters by part number or model, and ask our team about availability.",
    indexable: true, breadcrumbs: [HOME, { name: "Spare Parts", path: "/spare-parts" }],
  },
  {
    path: "/used-tractors", kind: "page",
    title: "RK754-A Slightly Used Tractor with Plough for Sale",
    description: "A slightly used RK754-A tractor with plough for sale: photos, details and how to request a quote.",
    indexable: true, breadcrumbs: [HOME, { name: "Used Tractors", path: "/used-tractors" }],
  },
  {
    path: "/team", kind: "page",
    title: "Meet Our Team",
    description: "Meet our executive leadership, management and operations team.",
    indexable: true, breadcrumbs: [HOME, { name: "Team", path: "/team" }],
  },
  {
    path: "/careers", kind: "page",
    title: "Careers at Jolu Group of Companies — Join Our Team",
    description: "Discover career opportunities at Jolu Group of Companies and how to apply for current openings.",
    indexable: true, breadcrumbs: [HOME, { name: "Careers", path: "/careers" }],
  },
  {
    path: "/gallery", kind: "page",
    title: "Gallery",
    description: "Photos of our team, offices, events and Zoomlion machinery.",
    indexable: true, breadcrumbs: [HOME, { name: "Gallery", path: "/gallery" }],
  },
  {
    path: "/news", kind: "article",
    title: "Jolu Group of Companies Launch — Aug. 23, 2025",
    description: "The Jolu Group of Companies officially launched on Aug. 23, 2025 at Lowland Estate, Thome, Nairobi — unveiling Jolu Machineries, Jolu Group Security, and partnerships with Equity Bank, Kingdom Bank, and Britam Insurance.",
    indexable: true, breadcrumbs: [HOME, { name: "News", path: "/news" }],
    // The page visibly prints "Aug. 23, 2025".
    article: { headline: "Jolu Group of Companies Official Launch", datePublished: "2025-08-23" },
  },
  {
    path: "/ktn-interview", kind: "article",
    title: "KTN Interview",
    description: "Watch our KTN feature on modern agricultural solutions for farmers in Kenya.",
    indexable: true, breadcrumbs: [HOME, { name: "KTN Interview", path: "/ktn-interview" }],
    article: { headline: "KTN Interview" },
  },
  {
    path: "/mud4fun", kind: "article",
    title: "Mud4Fun 4x4 Challenge Highlights — Dec 2025",
    description: "Jolu Group proudly partnered in the Mud4Fun 4x4 Challenge in Naivasha, providing security and equipment support.",
    indexable: true, breadcrumbs: [HOME, { name: "Mud4Fun 4x4 Challenge", path: "/mud4fun" }],
    article: { headline: "Mud4Fun 4x4 Challenge" },
  },
  {
    path: "/showroom-launch", kind: "article",
    title: "Jolu Group Nakuru Regional Offices & Showroom Grand Launch",
    description: "Jolu Group officially launches its Nakuru Regional Offices and Showroom in Nakuru, marking a major milestone in regional expansion.",
    indexable: true, breadcrumbs: [HOME, { name: "Nakuru Showroom Launch", path: "/showroom-launch" }],
    article: { headline: "Jolu Group Nakuru Regional Offices & Showroom Grand Launch" },
  },
  {
    path: "/quote", kind: "form",
    title: "Request a Quote",
    description: "Tell us what you need and where you are, and we will send a tailored quote.",
    indexable: false, breadcrumbs: [HOME, { name: "Request a Quote", path: "/quote" }],
  },
  {
    path: "/schedule", kind: "form",
    title: "Schedule a Visit",
    description: "Book a hands-on demo or site visit with our specialists.",
    indexable: false, breadcrumbs: [HOME, { name: "Schedule a Visit", path: "/schedule" }],
  },
]

export function productRoute(p: Product): RouteMeta {
  const lead = firstSentence(p.longDescription)
  return {
    path: productPath(p.slug), kind: "product", product: p,
    title: p.name,
    description: clamp(lead && lead !== p.description ? `${p.description} ${lead}` : `${p.description} ${p.name}.`),
    image: p.image, imageAlt: p.name,
    indexable: true, breadcrumbs: [HOME, PRODUCTS, { name: p.name, path: productPath(p.slug) }],
  }
}

export const NOT_FOUND_ROUTE: RouteMeta = {
  path: "/404", kind: "notfound", title: "Page not found", description: "The page you were looking for could not be found.",
  indexable: false, breadcrumbs: [],
}

/** Every prerendered route (static + one per product). Products missing a name, description or image are refused. */
export function allRoutes(): RouteMeta[] {
  for (const p of products) {
    if (!p.name || !p.description || !p.image || !p.slug) throw new Error(`Incomplete product, refusing to publish: ${p.slug || p.id}`)
  }
  return [...STATIC_ROUTES, ...products.map(productRoute)]
}

export function routeForPath(path: string): RouteMeta {
  const p = path.split(/[?#]/)[0].replace(/\/+$/, "") || "/"
  return allRoutes().find((r) => r.path === p) ?? NOT_FOUND_ROUTE
}

// M2-CLAIMS-01: single source of truth for business identity and commercial claims.
//
// Status rules (enforced by tests/claims-registry.test.mjs):
//   verified    - confirmed by the owner. May appear in visible content, metadata and structured data.
//   pending     - an existing value awaiting owner confirmation. Shown in preview/development builds so the content
//                 can be reviewed, but NEVER in a production build (M2-CLAIMS-02: strict mode is forced when
//                 VITE_DEPLOY_ENV=production, derived from Vercel's VERCEL_ENV) and never in metadata or structured data.
//                 VITE_CLAIMS_STRICT=true forces the same behaviour anywhere (e.g. to preview production output).
//   unsupported - not substantiated (or demonstrably wrong). Never rendered anywhere; components use neutral fallbacks.
//
// Nothing here was invented: every value is copied from the site as it stood at b4dc32d. Conflicting values are kept
// as separate claims (e.g. migoriFooter / migoriFloating, emails.*) so no surface silently changes until the owner
// chooses. Unsupported claims carry an empty value: the withheld wording is not shipped in the client bundle. `ownerItem` refers to the
// consolidated owner-verification table (C1-C19).

export type ClaimStatus = "verified" | "pending" | "unsupported"

export interface Claim<T> {
  readonly id: string
  readonly ownerItem: string
  readonly status: ClaimStatus
  readonly value: T
  /** Where the value was found (file and line at b4dc32d). */
  readonly source: string
  readonly note?: string
}

export interface Phone { readonly e164: string; readonly display: string; readonly whatsapp?: string }
export interface Location { readonly name: string; readonly label: string; readonly address: string }
export interface Testimonial { readonly name: string; readonly role: string; readonly location: string; readonly comment: string; readonly rating: number }
export interface Stat { readonly target: number; readonly label: string; readonly suffix?: string }

const claim = <T,>(c: Claim<T>): Claim<T> => Object.freeze(c)

/** Deployment environment baked in at build time ("production" | "preview" | "" for local/CI). */
export const DEPLOY_ENV: string = (() => {
  try { return String(import.meta.env.VITE_DEPLOY_ENV ?? "") } catch { return "" }
})()

/** Pending claims are hidden in production builds, always; and anywhere VITE_CLAIMS_STRICT=true. */
export const STRICT: boolean = (() => {
  let forced = false
  try { forced = String(import.meta.env.VITE_CLAIMS_STRICT) === "true" } catch { forced = false }
  return forced || DEPLOY_ENV === "production"
})()

/** Value for visible customer-facing content: verified always; pending unless strict; unsupported never. */
export function visible<T>(c: Claim<T>): T | undefined {
  if (c.status === "verified") return c.value
  if (c.status === "pending" && !STRICT) return c.value
  return undefined
}

/** Value for <meta>, Open Graph, JSON-LD and AEO/GEO entity output: verified only. */
export function forStructuredData<T>(c: Claim<T>): T | undefined {
  return c.status === "verified" ? c.value : undefined
}

// ---------------------------------------------------------------- identity (C1)
export const identity = {
  legalName: claim({ id: "identity.legalName", ownerItem: "C1", status: "pending", value: "Jolu Agricultural & Construction Machineries", source: "client/index.html meta author", note: "Four name variants in use; owner to confirm legal and display names." }),
  // Public-facing brand directed by the owner in M2-INTEG-02 §7 ("The proposed public-facing brand is JOLU MACHINERIES").
  // Used for <title> suffix, og:site_name and Organization/WebSite JSON-LD. The registered legal name stays pending.
  displayName: claim({ id: "identity.displayName", ownerItem: "C1", status: "verified", value: "JOLU MACHINERIES", source: "Owner directive M2-INTEG-02 §7", note: "Owner to confirm this as final; legalName remains pending." }),
  groupName: claim({ id: "identity.groupName", ownerItem: "C1", status: "pending", value: "Jolu Group", source: "NakuruLaunch.tsx, Mud4Fun.tsx" }),
} as const

// ---------------------------------------------------------------- contact (C2-C6)
export const phones = {
  primary: claim<Phone>({ id: "phone.primary", ownerItem: "C2", status: "pending", value: { e164: "+254705038679", display: "+254 705 038 679", whatsapp: "254705038679" }, source: "Header:69, ContactSection:65/104, FloatingContact:5-6, Footer:118/292, Hero:270, ProductDetail:102, UsedTractors:65/228", note: "Footer shows the local format 0705 038 679." }),
  primaryLocalDisplay: claim<string>({ id: "phone.primary.localDisplay", ownerItem: "C2", status: "pending", value: "0705 038 679", source: "Footer:118" }),
  secondary: claim<Phone>({ id: "phone.secondary", ownerItem: "C3", status: "pending", value: { e164: "+254743682700", display: "+254 743 682 700", whatsapp: "254743682700" }, source: "Header:69 (0743 682 700), ContactSection:65/123, Footer:143 (labelled Nakuru)", note: "Role differs by page: general line in Header/Contact, Nakuru office in Footer. ContactSection WhatsApp uses this number; every other WhatsApp link uses the primary number." }),
  secondaryLocalDisplay: claim<string>({ id: "phone.secondary.localDisplay", ownerItem: "C3", status: "pending", value: "0743 682 700", source: "Header:69, Footer:143" }),
  afterSales: claim<string>({ id: "phone.afterSales", ownerItem: "C4", status: "pending", value: "0721 700 393", source: "Footer:126 only" }),
} as const

export const emails = {
  general: claim({ id: "email.general", ownerItem: "C5", status: "pending", value: "info@jolumachineries.com", source: "Header, Footer, ContactSection, Careers, NakuruLaunch, News (10 places)", note: "Confirm the mailbox is monitored." }),
  gmail: claim({ id: "email.gmail", ownerItem: "C6", status: "pending", value: "jolumachineries@gmail.com", source: "News.tsx:320 (mailto together with the general address)" }),
  group: claim({ id: "email.group", ownerItem: "C6", status: "pending", value: "info@jolugroup.com", source: "Mud4Fun.tsx:188" }),
} as const

// ---------------------------------------------------------------- locations and hours (C7)
export const locations = {
  nairobi: claim<Location>({ id: "location.nairobi", ownerItem: "C7", status: "pending", value: { name: "Nairobi", label: "Head Office", address: "Thome, Nairobi, Kenya" }, source: "Footer:131-134; FloatingContact labels it 'Main Office'" }),
  nakuru: claim<Location>({ id: "location.nakuru", ownerItem: "C7", status: "pending", value: { name: "Nakuru", label: "Regional Office & Showroom", address: "Along West Road, Opposite Nakuru Athletics, Next to Evans Hospital, Nakuru, Kenya" }, source: "Footer:138-144, FloatingContact, NakuruLaunch" }),
  migoriFooter: claim<Location>({ id: "location.migori.footer", ownerItem: "C7", status: "pending", value: { name: "Migori", label: "Branch Office", address: "Near KENGAS Rongo, Migori, Kenya" }, source: "Footer:148-151", note: "CONFLICT with FloatingContact: 'Quickfill Rongo Station, Migori, Kenya'." }),
  migoriFloating: claim<Location>({ id: "location.migori.floating", ownerItem: "C7", status: "pending", value: { name: "Rongo", label: "Branch Office", address: "Quickfill Rongo Station, Migori, Kenya" }, source: "FloatingContact.tsx branches[2]", note: "CONFLICT with Footer address." }),
  nakuruKfa: claim<Location>({ id: "location.nakuru.kfa", ownerItem: "C7", status: "pending", value: { name: "Nakuru", label: "Jolu Office (Machineries & Security)", address: "KFA Building, Nakuru" }, source: "ContactSection map 3 heading", note: "A second Nakuru location shared with Jolu Security; not listed in the footer or floating contact. Gates the ContactSection map card (M2-INTEG-02)." }),
  contactSummary: claim<readonly string[]>({ id: "location.contactSummary", ownerItem: "C7", status: "pending", value: ["Nairobi, Kenya", "Nakuru, Kenya", "Rongo, Migori"], source: "ContactSection:66" }),
  hours: claim<readonly string[]>({ id: "location.hours", ownerItem: "C7", status: "pending", value: ["Mon–Fri: 9:00–18:00", "Sat: 9:00-13:00", "Sun: Closed"], source: "ContactSection:67", note: "Conflicts with the '24/7 Support' service claim." }),
} as const

// ---------------------------------------------------------------- social profiles (C8)
export const social = {
  instagram: claim({ id: "social.instagram", ownerItem: "C8", status: "pending", value: "https://www.instagram.com/jolu_machineries/", source: "Footer" }),
  tiktok: claim({ id: "social.tiktok", ownerItem: "C8", status: "pending", value: "https://www.tiktok.com/@jolumachineries", source: "Footer" }),
  facebook: claim({ id: "social.facebook", ownerItem: "C8", status: "unsupported", value: "", source: "Footer:265 (search-results URL, not a profile)", note: "Withheld until the official page URL is supplied." }),
} as const

// ---------------------------------------------------------------- commercial claims (C9-C19)
export const manufacturer = {
  relationship: claim({ id: "manufacturer.relationship", ownerItem: "C9", status: "unsupported", value: "", source: "AboutSection:76/102/121, Footer:110, Hero slide 2 title, index.html meta descriptions", note: "Superlative distributor/dealer/partner wording withheld; neutral wording used until the agreed relationship wording is approved." }),
  partnership: claim({ id: "manufacturer.partnership", ownerItem: "C9", status: "unsupported", value: "", source: "AboutSection story paragraph 2 (partnership wording)" }),
  /** Neutral, factual description used while the relationship wording is unapproved (the catalogue lists Zoomlion machinery). */
  neutralDescription: "Zoomlion tractors, harvesters and farm implements for Kenyan farmers.",
} as const

export const stats = {
  homepage: claim<readonly Stat[]>({ id: "stats.homepage", ownerItem: "C10", status: "pending", value: [{ target: 500, label: "Tractors Sold" }, { target: 5, label: "Years Experience" }, { target: 480, label: "Happy Customers" }], source: "Hero.tsx:31-33 (owner-supplied in PR #15, never factually confirmed)" }),
  experience: claim({ id: "stats.experience", ownerItem: "C11", status: "pending", value: "5+ Years", source: "AboutSection:20/102, Footer:111" }),
} as const

export const testimonials = claim<readonly Testimonial[]>({
  id: "testimonials", ownerItem: "C12", status: "unsupported",
  value: [], // The three named testimonials (with 5-star ratings) at AboutSection:58-90 are withheld; authenticity and consent unconfirmed.
  source: "AboutSection:58-90", note: "Withheld. Re-add only real testimonials with recorded consent, status 'verified'.",
})

/** Named customer testimonials on the News page (with video links). Shown as today; owner to confirm consent. */
export const newsTestimonials = claim<readonly string[]>({ id: "testimonials.news", ownerItem: "C12", status: "pending", value: ["Richard Nyango", "Faith Cherotich"], source: "News.tsx customer testimonial videos (Richard Nyango, Faith Cherotich) and attributed partner/client quotes (Equity Bank, Britam, key client)", note: "Gated with visible(): shown in previews, hidden in production until recorded consent is confirmed." })

/** Product star ratings and review counts on the homepage catalogue: removed (no source). */
export const productRatings = claim({ id: "products.ratings", ownerItem: "C12", status: "unsupported", value: "", source: "ProductsSection.tsx (hard-coded ratings and review counts on 19 products, removed)" })
/** Sales/stock badges on the homepage catalogue: removed. Descriptive badges (e.g. 'Durable') remain as product copy. */
export const productSalesBadges = claim({ id: "products.salesBadges", ownerItem: "C10/C14", status: "unsupported", value: "", source: "ProductsSection.tsx (best-seller and new-arrival badges, removed)" })

export const service = {
  certifiedTechnicians: claim({ id: "service.certified", ownerItem: "C13", status: "pending", value: "Certified technicians and agricultural specialists at your service", source: "AboutSection:28" }),
  afterSales: claim({ id: "service.afterSales", ownerItem: "C13", status: "pending", value: "Complete after-sales support including maintenance and repairs", source: "AboutSection:34" }),
  nationwideDelivery: claim({ id: "service.delivery", ownerItem: "C13", status: "pending", value: "Reliable delivery and installation services across Kenya", source: "AboutSection:44" }),
  support247: claim({ id: "service.247", ownerItem: "C13", status: "pending", value: "Round-the-clock customer support for all your agricultural needs", source: "AboutSection:50", note: "Conflicts with published business hours (Sun: Closed)." }),
  genuineParts: claim({ id: "service.genuineParts", ownerItem: "C13/C14", status: "unsupported", value: "", source: "AboutSection:38-40, SparePartsSection:224-230, Hero slide 2 description", note: "Genuine/OEM/authentic-parts wording withheld; neutral wording until confirmed." }),
} as const

export const spareParts = {
  stockBadges: claim({ id: "spareParts.stock", ownerItem: "C14", status: "unsupported", value: "", source: "SparePartsSection:27-176 (static per-part stock levels, removed)", note: "Static data cannot reflect live inventory. Replaced by 'Ask for availability'." }),
  availabilityFallback: "Ask for availability",
} as const

export const responseTime = claim({ id: "sla.response", ownerItem: "C15", status: "pending", value: "We'll get back to you within 24 hours.", source: "GetQuote:35, QuoteDrawer:89, ContactSection:50" })

export const productSpecs = claim({ id: "products.specs", ownerItem: "C16", status: "pending", value: "keySpecs/specTable for 18 products in data/products.ts", source: "client/src/data/products.ts", note: "Shown as today; excluded from structured data until checked against manufacturer sheets." })

export const warranty = claim({ id: "warranty", ownerItem: "C17", status: "unsupported", value: "", source: "none found", note: "No warranty claims exist; none may be added without verified terms." })

export const prices = claim({ id: "prices", ownerItem: "C18", status: "unsupported", value: "", source: "none published (SparePartsSection has an unused price field)", note: "Keep unpublished; never emit Offer/price in structured data." })

export const media = {
  // Owner directive: neutral feature wording ("exclusive" dropped), shown only once the feature itself is verified.
  ktnFeature: claim({ id: "media.ktnFeature", ownerItem: "C19", status: "pending", value: "Watch our feature on KTN, where we shared insights about modern agricultural solutions for farmers in Kenya.", source: "KTNInterview:43 (previously 'exclusive feature')" }),
} as const

// ---------------------------------------------------------------- marketing positioning (M2-CLAIMS-FINAL-01)
// Owner guidance M2-FINAL-03 §5: "Premium" and "Quality Equipment Since Day One" are permissible brand positioning and are
// not registry claims. "Expert Team" is a factual claim: its card shows only with service.certifiedTechnicians (C13).
// "Exclusive offers" may be promised only while genuine offers exist.
export const marketing = {
  newsletterOffers: claim({ id: "marketing.newsletterOffers", ownerItem: "C20", status: "unsupported", value: "", source: "Footer newsletter copy (previously promised exclusive offers)", note: "Withheld until a genuine subscriber offer programme exists; then re-add the wording with status verified." }),
} as const

/** Every claim, for tests and the owner-verification report. */
export const ALL_CLAIMS: readonly Claim<unknown>[] = [
  ...Object.values(identity), ...Object.values(phones), ...Object.values(emails), ...Object.values(locations),
  ...Object.values(social), manufacturer.relationship, manufacturer.partnership, ...Object.values(stats), testimonials,
  newsTestimonials, productRatings, productSalesBadges,
  ...Object.values(service), spareParts.stockBadges, responseTime, productSpecs, warranty, prices, ...Object.values(media),
  ...Object.values(marketing),
]

/** helpers for links built from phone claims */
export const telHref = (p?: Phone) => (p ? `tel:${p.e164}` : undefined)
export const waHref = (p?: Phone, text?: string) =>
  p && p.whatsapp ? `https://wa.me/${p.whatsapp}${text ? `?text=${encodeURIComponent(text)}` : ""}` : undefined
/** mailto: for the visible addresses (undefined when none), with an optional subject. */
export const mailHref = (addresses: string | undefined | (string | undefined)[], subject?: string) => {
  const list = (Array.isArray(addresses) ? addresses : [addresses]).filter(Boolean)
  if (!list.length) return undefined
  return `mailto:${list.join(",")}${subject ? `?subject=${encodeURIComponent(subject)}` : ""}`
}

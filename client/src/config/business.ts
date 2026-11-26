// M2-CLAIMS-01: single source of truth for business identity and commercial claims.
//
// Status rules (enforced by tests/claims-registry.test.mjs):
//   verified    - confirmed by the owner. May appear in visible content, metadata and structured data.
//   pending     - an existing, already-published value awaiting owner confirmation. Visible content keeps showing it
//                 (removing every phone number would break the contact journey) UNLESS the build sets
//                 VITE_CLAIMS_STRICT=true. It NEVER appears in metadata or structured data (`forStructuredData`).
//   unsupported - not substantiated (or demonstrably wrong). Never rendered anywhere; components use neutral fallbacks.
//
// Nothing here was invented: every value is copied from the site as it stood at b4dc32d, and conflicting values are
// kept side by side (`variants`) so no surface silently changes until the owner chooses. `ownerItem` refers to the
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

export const STRICT: boolean = (() => {
  try { return String(import.meta.env.VITE_CLAIMS_STRICT) === "true" } catch { return false }
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
  displayName: claim({ id: "identity.displayName", ownerItem: "C1", status: "pending", value: "Jolu Machineries", source: "index.html og:site_name; AboutSection; Footer copyright" }),
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
  contactSummary: claim<readonly string[]>({ id: "location.contactSummary", ownerItem: "C7", status: "pending", value: ["Nairobi, Kenya", "Nakuru, Kenya", "Rongo, Migori"], source: "ContactSection:66" }),
  hours: claim<readonly string[]>({ id: "location.hours", ownerItem: "C7", status: "pending", value: ["Mon–Fri: 9:00–18:00", "Sat: 9:00-13:00", "Sun: Closed"], source: "ContactSection:67", note: "Conflicts with the '24/7 Support' service claim." }),
} as const

// ---------------------------------------------------------------- social profiles (C8)
export const social = {
  instagram: claim({ id: "social.instagram", ownerItem: "C8", status: "pending", value: "https://www.instagram.com/jolu_machineries/", source: "Footer" }),
  tiktok: claim({ id: "social.tiktok", ownerItem: "C8", status: "pending", value: "https://www.tiktok.com/@jolumachineries", source: "Footer" }),
  facebook: claim({ id: "social.facebook", ownerItem: "C8", status: "unsupported", value: "https://www.facebook.com/search/top?q=jolu%20group", source: "Footer:265", note: "A Facebook search-results URL, not a profile. Withheld until the official page URL is supplied." }),
} as const

// ---------------------------------------------------------------- commercial claims (C9-C19)
export const manufacturer = {
  relationship: claim({ id: "manufacturer.relationship", ownerItem: "C9", status: "unsupported", value: "one of Kenya's leading distributors / premier dealer / trusted partner of Zoomlion", source: "AboutSection:102-121, Footer:110, index.html meta description", note: "Unverified relationship and superlative wording. Replaced by neutral wording until the agreed wording is approved." }),
  partnership: claim({ id: "manufacturer.partnership", ownerItem: "C9", status: "unsupported", value: "Partnering with Zoomlion, a global leader in agricultural technology", source: "AboutSection story paragraph 2" }),
  /** Neutral, factual description used while the relationship wording is unapproved (the catalogue lists Zoomlion machinery). */
  neutralDescription: "Zoomlion tractors, harvesters and farm implements for Kenyan farmers.",
} as const

export const stats = {
  homepage: claim<readonly Stat[]>({ id: "stats.homepage", ownerItem: "C10", status: "pending", value: [{ target: 500, label: "Tractors Sold" }, { target: 5, label: "Years Experience" }, { target: 480, label: "Happy Customers" }], source: "Hero.tsx:31-33 (owner-supplied in PR #15, never factually confirmed)" }),
  experience: claim({ id: "stats.experience", ownerItem: "C11", status: "pending", value: "5+ years", source: "AboutSection:20/102, Footer:111" }),
} as const

export const testimonials = claim<readonly Testimonial[]>({
  id: "testimonials", ownerItem: "C12", status: "unsupported",
  value: [], // The three named testimonials (with 5-star ratings) at AboutSection:58-90 are withheld; authenticity and consent unconfirmed.
  source: "AboutSection:58-90", note: "Withheld. Re-add only real testimonials with recorded consent, status 'verified'.",
})

export const service = {
  certifiedTechnicians: claim({ id: "service.certified", ownerItem: "C13", status: "pending", value: "Certified technicians and agricultural specialists at your service", source: "AboutSection:28" }),
  afterSales: claim({ id: "service.afterSales", ownerItem: "C13", status: "pending", value: "Complete after-sales support including maintenance and repairs", source: "AboutSection:34" }),
  nationwideDelivery: claim({ id: "service.delivery", ownerItem: "C13", status: "pending", value: "Reliable delivery and installation services across Kenya", source: "AboutSection:44" }),
  support247: claim({ id: "service.247", ownerItem: "C13", status: "pending", value: "Round-the-clock customer support for all your agricultural needs", source: "AboutSection:50", note: "Conflicts with published business hours (Sun: Closed)." }),
  genuineParts: claim({ id: "service.genuineParts", ownerItem: "C13/C14", status: "unsupported", value: "Only authentic Zoomlion parts and accessories / Genuine OEM parts", source: "AboutSection:38-40, SparePartsSection:224-230", note: "Manufacturer/OEM claim; neutral wording until confirmed." }),
} as const

export const spareParts = {
  stockBadges: claim({ id: "spareParts.stock", ownerItem: "C14", status: "unsupported", value: "Hard-coded In Stock / Low Stock per part", source: "SparePartsSection:27-176", note: "Static data cannot reflect live inventory. Replaced by 'Ask for availability'." }),
  availabilityFallback: "Ask for availability",
} as const

export const responseTime = claim({ id: "sla.response", ownerItem: "C15", status: "pending", value: "We'll get back to you within 24 hours.", source: "GetQuote:35, QuoteDrawer:89, ContactSection:50" })

export const productSpecs = claim({ id: "products.specs", ownerItem: "C16", status: "pending", value: "keySpecs/specTable for 18 products in data/products.ts", source: "client/src/data/products.ts", note: "Shown as today; excluded from structured data until checked against manufacturer sheets." })

export const warranty = claim({ id: "warranty", ownerItem: "C17", status: "unsupported", value: "", source: "none found", note: "No warranty claims exist; none may be added without verified terms." })

export const prices = claim({ id: "prices", ownerItem: "C18", status: "unsupported", value: "", source: "none published (SparePartsSection has an unused price field)", note: "Keep unpublished; never emit Offer/price in structured data." })

export const media = {
  ktnExclusive: claim({ id: "media.ktnExclusive", ownerItem: "C19", status: "pending", value: "exclusive feature", source: "KTNInterview:43" }),
} as const

/** Every claim, for tests and the owner-verification report. */
export const ALL_CLAIMS: readonly Claim<unknown>[] = [
  ...Object.values(identity), ...Object.values(phones), ...Object.values(emails), ...Object.values(locations),
  ...Object.values(social), manufacturer.relationship, manufacturer.partnership, ...Object.values(stats), testimonials,
  ...Object.values(service), spareParts.stockBadges, responseTime, productSpecs, warranty, prices, ...Object.values(media),
]

/** helpers for links built from phone claims */
export const telHref = (p?: Phone) => (p ? `tel:${p.e164}` : undefined)
export const waHref = (p?: Phone) => (p && p.whatsapp ? `https://wa.me/${p.whatsapp}` : undefined)
export const mailHref = (...addresses: (string | undefined)[]) => {
  const list = addresses.filter(Boolean)
  return list.length ? `mailto:${list.join(",")}` : undefined
}

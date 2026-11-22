import type { ContactInfo, ExcludedItem, PublishableStatus, SourceRef, SpecEntry } from "./types"

/** Pieces shared by the tractor specification sheets (M3-A4). */

export const CONFIRM_NOTE =
  "Published specifications are supplied for guidance and may change. Please confirm all figures, configuration and availability with JOLU Machineries before purchase."

export const SITE_CONTACT: ContactInfo = {
  phones: ["+254 705 038 679", "0743 682 700"],
  email: "info@jolumachineries.com",
  offices: ["Head Office: Thome, Nairobi, Kenya", "Regional Office and Showroom: West Road, Nakuru, Kenya"],
  sources: ["web-site-contact"],
}

export const OPTIONAL_NOTE =
  "No optional configurations have been verified for this machine. Ask JOLU Machineries for available options."

export const SRC_CONTACT: SourceRef = {
  id: "web-site-contact",
  label: "JOLU website header and footer contact details",
  kind: "website",
  note: "client/src/components/Header.tsx, Footer.tsx",
}

export const SRC_PROFILE_P5: SourceRef = {
  id: "company-profile-p5",
  label: "JOLU Company Profile PDF, PDF page 5 (printed page 4)",
  kind: "jolu-document",
  note: "A JOLU document, not a manufacturer datasheet. Tables for RK504/704-A and RC904/1104.",
}

export const SRC_CATALOGUE: SourceRef = {
  id: "catalogue-features",
  label: "JOLU Product Catalogue (new-product-catalogue.pdf), page 2, Product Features block",
  kind: "jolu-document",
  note: "A JOLU document, not a manufacturer datasheet. Also lists prices, which are never reproduced.",
}

export const webSource = (productId: string, name: string): SourceRef => ({
  id: "web-products",
  label: `JOLU website product data (product ${productId}, ${name} specification table)`,
  kind: "website",
  note: "client/src/data/products.ts",
})

/** One entry. */
export const E = (
  variant: string,
  value: string,
  status: PublishableStatus,
  sources: string[],
  unit?: string,
  note?: string,
): SpecEntry => ({ variant, value, unit, status, sources, note })

/** The same value for every column. */
export const same = (cols: string[], value: string, status: PublishableStatus, sources: string[], unit?: string, note?: string) =>
  cols.map((c) => E(c, value, status, sources, unit, note))

/** A different value per column, in column order. */
export const per = (cols: string[], values: string[], status: PublishableStatus, sources: string[], unit?: string, note?: string) =>
  values.map((v, i) => E(cols[i], v, status, sources, unit, note))

export const PRICE_EXCLUSION: ExcludedItem = {
  id: "price",
  label: "Prices",
  reason: "not-supplied",
  detail: "JOLU catalogues carry prices that change between versions. Prices are never published on specification sheets.",
}

export const WARRANTY_CERT_EXCLUSION: ExcludedItem = {
  id: "warranty-certifications",
  label: "Warranty terms and ISO / CE certifications",
  reason: "not-supplied",
  detail: "No verified terms or certificates are present in any JOLU source reviewed.",
}

export const ENGINE_DETAIL_EXCLUSION: ExcludedItem = {
  id: "engine-details",
  label: "Engine make, displacement, torque, tank capacities",
  reason: "not-supplied",
  detail: "Not present as table values in any JOLU source reviewed.",
}

/** Harvester sheets (M3-A6): a key-spec card weight that is not in the specification table. */
export const keySpecWeightExclusion = (value: string, product: string): ExcludedItem => ({
  id: "weight",
  label: `Weight '${value}' (website key-spec card, ${product})`,
  reason: "unverified-claim",
  detail: "Appears only in the product's key-spec card, not in its specification table, and the basis (dry, shipping or operating mass) is not stated. Withheld; no weight is inferred from any other model.",
})

export const NO_DIMENSIONS_EXCLUSION: ExcludedItem = {
  id: "overall-dimensions",
  label: "Overall dimensions (L×W×H)",
  reason: "not-supplied",
  detail: "The website specification table publishes no overall dimensions for this machine. None are invented and no dimension schematic is drawn; a capacity panel of supported values is shown instead.",
}

/**
 * Typed model for digital product specification sheets (M3-A2 pilot).
 *
 * Governance: only values with a documented source and one of the PUBLISHABLE statuses are
 * rendered. Disputed, per-model-unattributable or unverified items are kept in `excluded`
 * (with the reason) so they are visible to reviewers but never reach the customer-facing sheet.
 */

/** A machine variant exactly as the source tables name it (a column in the published table). */
export type VariantId = "standard" | "new2025"

export interface VariantInfo {
  id: VariantId
  /** Exact column name used by the sources. */
  label: string
  short: string
}

/**
 * website-published:      appears in the JOLU website product data only.
 * corroborated:           website AND another JOLU document agree (NOT a manufacturer datasheet).
 * manufacturer-verified:  confirmed against a manufacturer datasheet (none yet for the pilot).
 */
export type PublishableStatus = "website-published" | "corroborated" | "manufacturer-verified"

export const PUBLISHABLE_STATUSES: readonly PublishableStatus[] = [
  "website-published",
  "corroborated",
  "manufacturer-verified",
]

export interface SourceRef {
  id: string
  label: string
  kind: "website" | "jolu-document" | "manufacturer"
  note?: string
}

/** One technical value for one machine variant. */
export interface SpecEntry {
  variant: VariantId
  value: string
  unit?: string
  status: PublishableStatus
  /** ids of SourceRef */
  sources: string[]
}

export interface SpecRow {
  id: string
  label: string
  entries: SpecEntry[]
}

export interface SpecGroup {
  id: string
  title: string
  rows: SpecRow[]
}

export interface KpiItem {
  id: string
  label: string
  value: string
  unit: string
  foot: string
  status: PublishableStatus
  sources: string[]
}

export interface CapabilityItem {
  id: string
  tag: string
  title: string
  text: string
  /** ids of SpecRow the statement is derived from (keeps copy tied to documented values) */
  derivedFrom: string[]
}

export type ExclusionReason =
  | "disputed"
  | "variant-unattributable"
  | "unverified-claim"
  | "not-supplied"

export interface ExcludedItem {
  id: string
  label: string
  reason: ExclusionReason
  detail: string
}

export interface DimensionData {
  lengthMm: number
  widthMm: number
  heightMm: number
  wheelbaseMm: number
  groundClearanceMm: Record<VariantId, number>
  sources: string[]
}

export interface ContactInfo {
  phones: string[]
  email: string
  offices: string[]
  sources: string[]
}

export interface SpecSheet {
  slug: string
  /** Only sheets with a reviewState of "approved" render without the pilot banner; unknown sheets 404. */
  reviewState: "pilot-preview" | "approved"
  productName: string
  modelDesignation: string
  category: string
  /** Existing optimized site image (resolved by ResponsiveImage). */
  image: string
  imageAlt: string
  doc: { code: string; revision: string; issued: string }
  variants: VariantInfo[]
  lede: string
  kpis: KpiItem[]
  capabilities: CapabilityItem[]
  groups: SpecGroup[]
  standardEquipment: { label: string; rowId: string }[]
  optionalConfigurationNote: string
  dimensions: DimensionData
  contact: ContactInfo
  confirmNote: string
  sources: SourceRef[]
  excluded: ExcludedItem[]
}

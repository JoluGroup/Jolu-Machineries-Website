/**
 * Typed model for digital product specification sheets (M3-A2 pilot).
 *
 * Governance: only values with a documented source and one of the PUBLISHABLE statuses are
 * rendered. Disputed, per-model-unattributable or unverified items are kept in `excluded`
 * (with the reason) so they are visible to reviewers but never reach the customer-facing sheet.
 */

/**
 * What a column of the published table identifies. Never inferred from product names:
 *  - "single-machine":           the table describes one machine (one column).
 *  - "distinct-model":           columns are separate models with their own model-specific values.
 *  - "published-configuration":  columns are published configurations of a series; the sources do not
 *                                establish that they are separate verified models.
 */
export type ColumnKind = "single-machine" | "distinct-model" | "published-configuration"

/** Column id, unique within one sheet. */
export type VariantId = string

export interface VariantInfo {
  id: VariantId
  /** Exact column name used by the sources. */
  label: string
  short: string
  /** Display name (for configurations: a published configuration, not a verified model variant). */
  title: string
  kind: ColumnKind
}

/** Per-sheet product photo fitting. scale 1 = fit the panel; >1 enlarges by clipping only empty margin. */
export interface ImageFit {
  scale: number
  /** Subject bounding box as fractions of the source image (left, top, right, bottom), measured from the file. */
  subject: { left: number; top: number; right: number; bottom: number }
  /** Intrinsic width of the original source image in px. */
  sourceWidthPx: number
  rationale: string
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
  /** Internal reviewer note (never rendered), e.g. why an attribution status was chosen. */
  note?: string
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

/** One overall envelope. Two envelopes are only used when the sources attribute different dimensions to distinct models. */
export interface DimensionEnvelope {
  label: string
  lengthMm: number
  widthMm: number
  heightMm: number
  /** Omitted when the source publishes no wheelbase; the diagram then draws none. */
  wheelbaseMm?: number
}

export interface DimensionData {
  envelopes: DimensionEnvelope[]
  /** Ground clearance per column id. Omit a column (or leave empty) when the clearance is withheld; the diagram then draws none. */
  groundClearanceMm: Record<VariantId, number | undefined>
  sources: string[]
}

/** One supported capacity figure (harvesters). The value must also appear in a published row (`rowId`). */
export interface CapacityItem {
  label: string
  value: string
  unit?: string
  rowId: string
}

/**
 * Capacity-oriented engineering panel, used INSTEAD of the dimension schematic when no reliable overall
 * dimensions are published. It shows only supported values and draws no dimension arrows.
 */
export interface CapacityPanel {
  title: string
  items: CapacityItem[]
  note: string
}

export interface QuickItem {
  label: string
  value: string
}

export interface ContactInfo {
  phones: string[]
  email: string
  offices: string[]
  sources: string[]
}

export interface SpecSheet {
  slug: string
  /** Machine family; drives the presentation only (defaults to a tractor). */
  machine?: "tractor" | "harvester"
  /** Only sheets with a reviewState of "approved" render without the preview banner; unknown sheets 404. */
  reviewState: "pilot-preview" | "preview" | "approved"
  productName: string
  modelDesignation: string
  category: string
  /** Existing optimized site image (resolved by ResponsiveImage). */
  image: string
  imageAlt: string
  imageFit: ImageFit
  doc: { code: string; revision: string; issued: string }
  variants: VariantInfo[]
  lede: string
  /** Four cells shown under the page-2 title; every figure must be present in the published rows. */
  quick: QuickItem[]
  /** hp text passed to the existing quote drawer; omitted when no headline hp is published. */
  quoteHp?: string
  kpis: KpiItem[]
  capabilities: CapabilityItem[]
  groups: SpecGroup[]
  standardEquipment: { label: string; rowId: string }[]
  optionalConfigurationNote: string
  /** Overall-dimension schematic. Present only when reliable overall dimensions are published. */
  dimensions?: DimensionData
  /** Capacity panel. Present only when `dimensions` is absent (harvesters without published overall dimensions). */
  capacity?: CapacityPanel
  contact: ContactInfo
  confirmNote: string
  sources: SourceRef[]
  excluded: ExcludedItem[]
}

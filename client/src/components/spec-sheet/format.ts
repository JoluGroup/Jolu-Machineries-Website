import type { PublishableStatus, SpecEntry, SpecSheet, VariantId } from "@/data/spec-sheets/types"

export const fmtInt = (n: number) => n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")

export const STATUS_MARK: Record<PublishableStatus, { mark: string; label: string; legend: string }> = {
  corroborated: { mark: "●", label: "Corroborated by a second JOLU document", legend: "corroborated by a second JOLU document" },
  "website-published": { mark: "○", label: "Published on the JOLU website", legend: "published on the JOLU website only" },
  "manufacturer-verified": { mark: "◆", label: "Verified against the manufacturer datasheet", legend: "verified against the manufacturer datasheet" },
}

export const entryText = (e: SpecEntry) => (e.unit ? `${e.value} ${e.unit}` : e.value)

export function entryFor(entries: SpecEntry[], variant: VariantId) {
  return entries.find((e) => e.variant === variant)
}

export function rowById(sheet: SpecSheet, id: string) {
  for (const g of sheet.groups) for (const r of g.rows) if (r.id === id) return r
  return undefined
}

/** Small caption under a column header, by what the column identifies. */
export function columnNote(v: import("@/data/spec-sheets/types").VariantInfo) {
  if (v.kind === "published-configuration") return `Published as “${v.label}”`
  if (v.kind === "distinct-model") return "Distinct model"
  return "Single published model"
}

/** One-line statement of what the columns are, for the model tag and page-2 subtitle. */
export function columnsStatement(sheet: SpecSheet) {
  const kind = sheet.variants[0].kind
  if (kind === "published-configuration") return { tag: `Series designation as published · ${sheet.variants.length} published configurations`, sub: "values shown per published configuration" }
  if (kind === "distinct-model") return { tag: `${sheet.variants.length} distinct models as published · values shown per model`, sub: `values shown per model · pairs read ${sheet.variants.map((v) => v.short).join(" / ")}` }
  return { tag: "Single published model", sub: "values for the single published model" }
}

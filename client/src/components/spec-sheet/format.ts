import type { PublishableStatus, SpecEntry, SpecSheet, VariantId } from "@/data/spec-sheets/types"

export const fmtInt = (n: number) => n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")

export const STATUS_MARK: Record<PublishableStatus, { mark: string; label: string }> = {
  corroborated: { mark: "●", label: "Corroborated by a second JOLU document" },
  "website-published": { mark: "○", label: "Published on the JOLU website" },
  "manufacturer-verified": { mark: "◆", label: "Verified against the manufacturer datasheet" },
}

export const entryText = (e: SpecEntry) => (e.unit ? `${e.value} ${e.unit}` : e.value)

export function entryFor(entries: SpecEntry[], variant: VariantId) {
  return entries.find((e) => e.variant === variant)
}

export function rowById(sheet: SpecSheet, id: string) {
  for (const g of sheet.groups) for (const r of g.rows) if (r.id === id) return r
  return undefined
}

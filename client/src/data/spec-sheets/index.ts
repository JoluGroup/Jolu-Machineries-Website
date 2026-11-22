import type { SpecSheet } from "./types"
import rs1304 from "./zoomlion-rs1304-1604"

/** Registry of specification sheets, keyed by product slug. Pilot: one machine. */
export const specSheets: Record<string, SpecSheet> = {
  [rs1304.slug]: rs1304,
}

export function getSpecSheet(slug: string | undefined): SpecSheet | undefined {
  return slug ? specSheets[slug] : undefined
}

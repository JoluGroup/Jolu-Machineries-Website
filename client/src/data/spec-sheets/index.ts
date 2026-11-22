import type { SpecSheet } from "./types"
import rs1304 from "./zoomlion-rs1304-1604"
import rc904 from "./zoomlion-rc904-1104"
import rk504 from "./zoomlion-rk504-704"
import pg2004 from "./zoomlion-pg2004"
import pl2304 from "./zoomlion-pl2304"

/** Registry of specification sheets, keyed by product slug. Unknown slugs resolve to undefined (NotFound). */
const all: SpecSheet[] = [rs1304, rc904, rk504, pg2004, pl2304]

export const specSheets: Record<string, SpecSheet> = Object.fromEntries(all.map((s) => [s.slug, s]))

export function getSpecSheet(slug: string | undefined): SpecSheet | undefined {
  return slug && Object.prototype.hasOwnProperty.call(specSheets, slug) ? specSheets[slug] : undefined
}

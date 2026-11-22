import type { SpecSheet } from "./types"
import rs1304 from "./zoomlion-rs1304-1604"
import rc904 from "./zoomlion-rc904-1104"
import rk504 from "./zoomlion-rk504-704"
import pg2004 from "./zoomlion-pg2004"
import pl2304 from "./zoomlion-pl2304"
import rg1804 from "./zoomlion-rg1804-2004"
import rd504 from "./zoomlion-rd504"
import rn904 from "./zoomlion-rn904"
import dv3504 from "./zoomlion-dv3504-wheeled-tractor"
import te100 from "./zoomlion-te100-combine-harvester"
import tf150 from "./tf150-combine-harvester"
import zl105 from "./zl105-combine-harvester"
import zc123s from "./zc123s-combine-harvester"
import plough3 from "./three-disk-plough"

/** Registry of specification sheets, keyed by product slug. Unknown slugs resolve to undefined (NotFound). */
const all: SpecSheet[] = [rs1304, rc904, rk504, pg2004, pl2304, rg1804, rd504, rn904, dv3504, te100, tf150, zl105, zc123s, plough3]

export const specSheets: Record<string, SpecSheet> = Object.fromEntries(all.map((s) => [s.slug, s]))

export function getSpecSheet(slug: string | undefined): SpecSheet | undefined {
  return slug && Object.prototype.hasOwnProperty.call(specSheets, slug) ? specSheets[slug] : undefined
}

// M2-PRODUCT-VERIFY-01: per-specification verification status against manufacturer sources.
// Generated from docs/m2-products/tractors.json and docs/m2-products/harvesters-implements.json (the evidence, with
// source URLs) by matching each published keySpecs label and specTable row label in data/products.ts.
// Statuses: VERIFIED | CONFIGURATION-DEPENDENT | CONFLICTING | UNSUPPORTED | SOURCE UNAVAILABLE.
// Production (strict claims mode) shows only VERIFIED and CONFIGURATION-DEPENDENT values; previews show everything so the
// owner can review. To publish a value, correct it to the manufacturer source and set its status here.
import { STRICT } from "@/config/business"
import type { Product } from "@/data/products"

export type SpecStatus = "VERIFIED" | "CONFIGURATION-DEPENDENT" | "CONFLICTING" | "UNSUPPORTED" | "SOURCE UNAVAILABLE"

export const SPEC_STATUS: Record<string, { keySpecs: Record<string, SpecStatus>; table: Record<string, SpecStatus> }> = {
  "zoomlion-rn904": {
    "keySpecs": {
      "Horse Power": "SOURCE UNAVAILABLE",
      "Number of gears": "SOURCE UNAVAILABLE",
      "Weight": "SOURCE UNAVAILABLE"
    },
    "table": {
      "Overall dimensions (L×W×H)": "SOURCE UNAVAILABLE",
      "Wheelbase": "SOURCE UNAVAILABLE",
      "Min. operating mass": "SOURCE UNAVAILABLE",
      "Calibration power": "SOURCE UNAVAILABLE",
      "Tire specification": "SOURCE UNAVAILABLE",
      "Number of gears": "SOURCE UNAVAILABLE",
      "Hydraulic output": "SOURCE UNAVAILABLE",
      "Max. pull force": "SOURCE UNAVAILABLE",
      "Tillage depth control method": "SOURCE UNAVAILABLE"
    }
  },
  "zoomlion-zl120": {
    "keySpecs": {
      "Horse Power": "VERIFIED",
      "Cutting Width": "CONFLICTING",
      "Weight": "UNSUPPORTED"
    },
    "table": {
      "Rated HP": "VERIFIED",
      "Rated Speed": "UNSUPPORTED",
      "Gauge": "UNSUPPORTED",
      "Min. Ground Clearance": "VERIFIED",
      "Threshing Drum (Dia × Length)": "CONFLICTING",
      "Operation Productivity": "UNSUPPORTED"
    }
  },
  "3-disk-plough": {
    "keySpecs": {
      "Compatible Horse Power": "SOURCE UNAVAILABLE",
      "Working Width": "SOURCE UNAVAILABLE",
      "Number of Discs": "SOURCE UNAVAILABLE",
      "Disc Diameter": "SOURCE UNAVAILABLE",
      "Approx. Weight": "SOURCE UNAVAILABLE"
    },
    "table": {
      "Tractor Compatibility": "SOURCE UNAVAILABLE",
      "No. of Discs": "SOURCE UNAVAILABLE",
      "Disc Diameter": "SOURCE UNAVAILABLE",
      "Working Width": "SOURCE UNAVAILABLE",
      "Working Depth": "SOURCE UNAVAILABLE",
      "Approx. Weight": "SOURCE UNAVAILABLE"
    }
  },
  "zoomlion-pl2304": {
    "keySpecs": {
      "Horse Power": "VERIFIED",
      "Number of gears": "VERIFIED",
      "Weight": "UNSUPPORTED"
    },
    "table": {
      "Overall dimension (L×W × H)": "CONFLICTING",
      "Wheelbase": "VERIFIED",
      "Min. operating mass": "UNSUPPORTED",
      "Ground clearance": "VERIFIED",
      "Engine emission": "UNSUPPORTED",
      "Rated power": "UNSUPPORTED",
      "Fuel consumption": "UNSUPPORTED",
      "Clutch type": "UNSUPPORTED",
      "Gearbox": "VERIFIED",
      "Tyre size (front/rear)": "UNSUPPORTED",
      "Lifting system": "UNSUPPORTED",
      "Max lifting capacity": "UNSUPPORTED",
      "Tillage control": "UNSUPPORTED",
      "Hydraulic output valve": "UNSUPPORTED",
      "Hydraulic hitch": "VERIFIED",
      "Output flow rate": "UNSUPPORTED",
      "Traction force": "UNSUPPORTED",
      "PTO output": "UNSUPPORTED",
      "Cab": "UNSUPPORTED"
    }
  },
  "disk-harrow": {
    "keySpecs": {
      "Number of Disks": "SOURCE UNAVAILABLE",
      "Disk Diameter": "SOURCE UNAVAILABLE",
      "Compatible Tractor Power": "SOURCE UNAVAILABLE"
    },
    "table": {
      "No. of Disks": "SOURCE UNAVAILABLE",
      "Disk Diameter": "SOURCE UNAVAILABLE",
      "Overall Width": "SOURCE UNAVAILABLE",
      "Working Depth": "SOURCE UNAVAILABLE",
      "Tractor Power Required": "SOURCE UNAVAILABLE",
      "Frame Type": "SOURCE UNAVAILABLE",
      "Disk Type": "SOURCE UNAVAILABLE",
      "Bearing Type": "SOURCE UNAVAILABLE",
      "Weight": "SOURCE UNAVAILABLE",
      "Application": "SOURCE UNAVAILABLE"
    }
  },
  "zoomlion-pg2004": {
    "keySpecs": {
      "Horse Power": "VERIFIED",
      "Number of gears": "VERIFIED",
      "Weight": "CONFIGURATION-DEPENDENT"
    },
    "table": {
      "Overall dimension (L×W × H)": "VERIFIED",
      "Wheelbase": "VERIFIED",
      "Min. operating mass": "VERIFIED",
      "Ground clearance": "VERIFIED",
      "Engine emission": "VERIFIED",
      "Rated power": "VERIFIED",
      "Clutch type": "VERIFIED",
      "Gearbox": "VERIFIED",
      "Tyre size (front/rear)": "VERIFIED",
      "Lifting system": "VERIFIED",
      "Max lifting capacity": "VERIFIED",
      "Tillage control": "VERIFIED",
      "Hydraulic output valve": "VERIFIED",
      "Hydraulic hitch": "VERIFIED",
      "Output flow rate": "VERIFIED",
      "Traction force": "VERIFIED",
      "PTO output": "VERIFIED",
      "Cab": "VERIFIED"
    }
  },
  "zoomlion-rd504": {
    "keySpecs": {
      "Horse Power": "SOURCE UNAVAILABLE",
      "Number of gears": "SOURCE UNAVAILABLE",
      "Weight": "SOURCE UNAVAILABLE"
    },
    "table": {
      "Overall dimension (L×W×H)": "SOURCE UNAVAILABLE",
      "Wheelbase": "SOURCE UNAVAILABLE",
      "Weight": "SOURCE UNAVAILABLE",
      "Ground clearance": "SOURCE UNAVAILABLE",
      "Engine emission": "SOURCE UNAVAILABLE",
      "Rated power": "SOURCE UNAVAILABLE",
      "Gearbox": "SOURCE UNAVAILABLE",
      "Tyre size (front/rear)": "SOURCE UNAVAILABLE",
      "Max lifting capacity": "SOURCE UNAVAILABLE",
      "PTO output power": "SOURCE UNAVAILABLE",
      "PTO speed": "SOURCE UNAVAILABLE",
      "Cab": "SOURCE UNAVAILABLE"
    }
  },
  "zl105-combine-harvester": {
    "keySpecs": {
      "Horse Power": "SOURCE UNAVAILABLE",
      "Cutting Width": "SOURCE UNAVAILABLE",
      "Weight": "SOURCE UNAVAILABLE"
    },
    "table": {
      "Rated HP": "SOURCE UNAVAILABLE",
      "Feeding Capacity": "VERIFIED",
      "Cutting Width": "SOURCE UNAVAILABLE",
      "Rated Speed": "SOURCE UNAVAILABLE",
      "Gauge": "SOURCE UNAVAILABLE",
      "Minimum Ground Clearance": "SOURCE UNAVAILABLE",
      "Threshing Drum (Dia × Length)": "SOURCE UNAVAILABLE",
      "Operation Productivity": "SOURCE UNAVAILABLE"
    }
  },
  "zoomlion-rk504-704": {
    "keySpecs": {
      "Horse Power": "SOURCE UNAVAILABLE",
      "Number of gears": "SOURCE UNAVAILABLE",
      "Weight": "SOURCE UNAVAILABLE"
    },
    "table": {
      "Overall dimension (L×W×H)": "SOURCE UNAVAILABLE",
      "Wheelbase": "SOURCE UNAVAILABLE",
      "Minimum operating mass": "SOURCE UNAVAILABLE",
      "Ground clearance": "SOURCE UNAVAILABLE",
      "Engine emission": "SOURCE UNAVAILABLE",
      "Rated power": "SOURCE UNAVAILABLE",
      "Fuel consumption rate": "SOURCE UNAVAILABLE",
      "Clutch type": "SOURCE UNAVAILABLE",
      "Gearbox": "SOURCE UNAVAILABLE",
      "Tyre size (front/rear)": "SOURCE UNAVAILABLE",
      "Hydraulic system": "SOURCE UNAVAILABLE",
      "Max lifting capacity": "SOURCE UNAVAILABLE",
      "Tillage control": "SOURCE UNAVAILABLE",
      "Hydraulic valves": "SOURCE UNAVAILABLE",
      "Hitch": "SOURCE UNAVAILABLE",
      "Traction force": "SOURCE UNAVAILABLE",
      "PTO speed": "SOURCE UNAVAILABLE",
      "Cab": "SOURCE UNAVAILABLE"
    }
  },
  "zoomlion-rc904-1104": {
    "keySpecs": {
      "Horse Power": "SOURCE UNAVAILABLE",
      "Number of gears": "SOURCE UNAVAILABLE",
      "Weight": "SOURCE UNAVAILABLE"
    },
    "table": {
      "Overall dimension (L×W×H)": "SOURCE UNAVAILABLE",
      "Wheelbase": "SOURCE UNAVAILABLE",
      "Minimum operating mass": "SOURCE UNAVAILABLE",
      "Ground clearance": "SOURCE UNAVAILABLE",
      "Engine emission": "SOURCE UNAVAILABLE",
      "Rated power": "SOURCE UNAVAILABLE",
      "Fuel consumption rate": "SOURCE UNAVAILABLE",
      "Clutch type": "SOURCE UNAVAILABLE",
      "Gearbox": "SOURCE UNAVAILABLE",
      "Tyre size (front/rear)": "SOURCE UNAVAILABLE",
      "Hydraulic system": "SOURCE UNAVAILABLE",
      "Max lifting capacity": "SOURCE UNAVAILABLE",
      "Tillage control": "SOURCE UNAVAILABLE",
      "Hydraulic valves": "SOURCE UNAVAILABLE",
      "Hitch": "SOURCE UNAVAILABLE",
      "Traction force": "SOURCE UNAVAILABLE",
      "PTO speed": "SOURCE UNAVAILABLE",
      "Cab": "SOURCE UNAVAILABLE"
    }
  },
  "zc123s-combine-harvester": {
    "keySpecs": {
      "Horse Power": "VERIFIED",
      "Cutting Width": "VERIFIED",
      "Weight": "UNSUPPORTED"
    },
    "table": {
      "Rated HP": "VERIFIED",
      "Feeding Capacity": "VERIFIED",
      "Cutting Width": "VERIFIED",
      "Rated Speed": "UNSUPPORTED",
      "Gauge": "UNSUPPORTED",
      "Minimum Ground Clearance": "VERIFIED",
      "Threshing Drum (Dia × Length)": "VERIFIED",
      "Operation Productivity": "UNSUPPORTED"
    }
  },
  "zoomlion-rs1304-1604": {
    "keySpecs": {
      "Horse Power": "VERIFIED",
      "Number of gears": "CONFIGURATION-DEPENDENT",
      "Weight": "UNSUPPORTED"
    },
    "table": {
      "Dimensions (L×W×H)": "VERIFIED",
      "Wheelbase": "VERIFIED",
      "Minimum usable mass": "UNSUPPORTED",
      "Ground clearance": "CONFLICTING",
      "Engine emission": "UNSUPPORTED",
      "Calibrated power": "CONFLICTING",
      "Fuel consumption rate": "UNSUPPORTED",
      "Clutch type": "UNSUPPORTED",
      "Gearbox": "VERIFIED",
      "Tyre size (front/rear)": "UNSUPPORTED",
      "Hydraulic system": "UNSUPPORTED",
      "Max lifting force": "CONFLICTING",
      "Tillage control": "UNSUPPORTED",
      "Hydraulic valves": "VERIFIED",
      "Hitch": "VERIFIED",
      "Calibrated traction": "VERIFIED",
      "PTO power output": "VERIFIED",
      "PTO speed": "VERIFIED",
      "Cab": "UNSUPPORTED"
    }
  },
  "zoomlion-rg1804-2004": {
    "keySpecs": {
      "Horse Power": "SOURCE UNAVAILABLE",
      "Number of gears": "SOURCE UNAVAILABLE",
      "Weight": "SOURCE UNAVAILABLE"
    },
    "table": {
      "Dimensions (L×W×H)": "SOURCE UNAVAILABLE",
      "Wheelbase": "SOURCE UNAVAILABLE",
      "Minimum usable mass": "SOURCE UNAVAILABLE",
      "Ground clearance": "SOURCE UNAVAILABLE",
      "Engine emission": "SOURCE UNAVAILABLE",
      "Calibrated power": "SOURCE UNAVAILABLE",
      "Fuel consumption rate": "SOURCE UNAVAILABLE",
      "Clutch type": "SOURCE UNAVAILABLE",
      "Gearbox": "SOURCE UNAVAILABLE",
      "Tyre size (front/rear)": "SOURCE UNAVAILABLE",
      "Hydraulic system": "SOURCE UNAVAILABLE",
      "Max lifting force": "SOURCE UNAVAILABLE",
      "Tillage control": "SOURCE UNAVAILABLE",
      "Hydraulic valves": "SOURCE UNAVAILABLE",
      "Hitch": "SOURCE UNAVAILABLE",
      "Calibrated traction": "SOURCE UNAVAILABLE",
      "PTO power output": "SOURCE UNAVAILABLE",
      "PTO speed": "SOURCE UNAVAILABLE",
      "Cab": "SOURCE UNAVAILABLE"
    }
  },
  "zoomlion-te100-combine-harvester": {
    "keySpecs": {
      "Horse Power": "VERIFIED",
      "Cutting Width": "CONFIGURATION-DEPENDENT",
      "Weight": "CONFLICTING"
    },
    "table": {
      "Engine Type": "VERIFIED",
      "Maximum Output": "VERIFIED",
      "Emission": "UNSUPPORTED",
      "Fuel Tank Capacity": "VERIFIED",
      "Feeding Capacity": "VERIFIED",
      "Conveyor Width": "UNSUPPORTED",
      "Threshing Type": "VERIFIED",
      "Rotor Dimensions": "VERIFIED",
      "Concave Area": "VERIFIED",
      "Cleaning Area": "UNSUPPORTED",
      "Fan Speed": "UNSUPPORTED",
      "Grain Tank Capacity": "CONFLICTING",
      "Unloading Rate": "CONFLICTING",
      "Cutting Width (Wheat)": "CONFIGURATION-DEPENDENT",
      "Cutting Width (Corn/Soybean)": "CONFIGURATION-DEPENDENT",
      "Transmission Type": "CONFLICTING",
      "Max Speed": "UNSUPPORTED",
      "Front Tyre Size": "CONFLICTING",
      "Rear Tyre Size": "CONFLICTING",
      "Dimensions (L×W×H)": "CONFLICTING",
      "Weight": "CONFLICTING"
    }
  },
  "zoomlion-dv3504-wheeled-tractor": {
    "keySpecs": {
      "Horse Power": "SOURCE UNAVAILABLE",
      "Number of gears": "SOURCE UNAVAILABLE",
      "Weight": "SOURCE UNAVAILABLE"
    },
    "table": {
      "Dimensions (L×W×H)": "SOURCE UNAVAILABLE",
      "Wheelbase": "SOURCE UNAVAILABLE",
      "Minimum mass during operation": "SOURCE UNAVAILABLE",
      "Ground clearance": "SOURCE UNAVAILABLE",
      "Engine emission": "SOURCE UNAVAILABLE",
      "Rated power": "SOURCE UNAVAILABLE",
      "Clutch type": "SOURCE UNAVAILABLE",
      "Gearbox": "SOURCE UNAVAILABLE",
      "Tyre size (front/rear)": "SOURCE UNAVAILABLE",
      "Hydraulic system": "SOURCE UNAVAILABLE",
      "Max lifting force": "SOURCE UNAVAILABLE",
      "Tillage control": "SOURCE UNAVAILABLE",
      "Hydraulic valves": "SOURCE UNAVAILABLE",
      "Hitch": "SOURCE UNAVAILABLE",
      "Hydraulic output flow rate": "SOURCE UNAVAILABLE",
      "Traction force": "CONFLICTING",
      "PTO speed": "SOURCE UNAVAILABLE",
      "Cab": "SOURCE UNAVAILABLE"
    }
  },
  "tf150-combine-harvester": {
    "keySpecs": {
      "Horse Power": "SOURCE UNAVAILABLE",
      "Grain Tank Capacity": "SOURCE UNAVAILABLE",
      "Weight": "SOURCE UNAVAILABLE"
    },
    "table": {
      "Rated HP": "SOURCE UNAVAILABLE",
      "Rated Speed": "SOURCE UNAVAILABLE",
      "Fuel Tank Capacity": "SOURCE UNAVAILABLE",
      "Grain Tank Capacity": "SOURCE UNAVAILABLE",
      "Grain Unloading Speed": "SOURCE UNAVAILABLE",
      "Threshing Rollers": "SOURCE UNAVAILABLE",
      "Roller Size": "SOURCE UNAVAILABLE",
      "Cleaning Area": "SOURCE UNAVAILABLE",
      "Wheelbase": "SOURCE UNAVAILABLE",
      "Minimum Ground Clearance": "SOURCE UNAVAILABLE"
    }
  },
  "implements-set": {
    "keySpecs": {
      "Compatibility": "SOURCE UNAVAILABLE",
      "Discs": "SOURCE UNAVAILABLE",
      "Working Width": "SOURCE UNAVAILABLE",
      "Depth of Cut": "SOURCE UNAVAILABLE"
    },
    "table": {
      "No. of Discs": "SOURCE UNAVAILABLE",
      "Disc Diameter": "SOURCE UNAVAILABLE",
      "Tractor Power": "SOURCE UNAVAILABLE",
      "Weight": "SOURCE UNAVAILABLE"
    }
  },
  "water-bowser": {
    "keySpecs": {
      "Capacity Range": "SOURCE UNAVAILABLE",
      "Pump Type": "SOURCE UNAVAILABLE",
      "Chassis": "SOURCE UNAVAILABLE",
      "Material": "SOURCE UNAVAILABLE",
      "Usage": "SOURCE UNAVAILABLE"
    },
    "table": {
      "Capacity": "SOURCE UNAVAILABLE",
      "Pump Type": "SOURCE UNAVAILABLE",
      "Chassis": "SOURCE UNAVAILABLE",
      "Material": "SOURCE UNAVAILABLE",
      "Applications": "SOURCE UNAVAILABLE"
    }
  }
}

const PUBLISHABLE: readonly SpecStatus[] = ["VERIFIED", "CONFIGURATION-DEPENDENT"]
export const isPublishable = (s: SpecStatus | undefined) => !!s && PUBLISHABLE.includes(s)

export interface ShownSpecs {
  keySpecs: { label: string; value: string; configDependent: boolean }[]
  specTable: { headers: string[]; rows: string[][]; configDependent: boolean[] } | null
  /** true when at least one published value is withheld in this build */
  withheld: boolean
}

/** The product's specifications as this build may show them (strict: publishable only; preview: all). */
export function shownSpecs(p: Pick<Product, "slug" | "keySpecs" | "specTable">, strict: boolean = STRICT): ShownSpecs {
  const st = SPEC_STATUS[p.slug] ?? { keySpecs: {}, table: {} }
  const keep = (s: SpecStatus | undefined) => !strict || isPublishable(s)
  const keySpecs = (p.keySpecs ?? []).filter((k) => keep(st.keySpecs[k.label])).map((k) => ({ ...k, configDependent: st.keySpecs[k.label] === "CONFIGURATION-DEPENDENT" }))
  const rows = (p.specTable?.rows ?? []).filter((r) => keep(st.table[r[0]]))
  const withheld = keySpecs.length < (p.keySpecs?.length ?? 0) || rows.length < (p.specTable?.rows.length ?? 0)
  return {
    keySpecs,
    specTable: p.specTable && rows.length ? { headers: p.specTable.headers, rows, configDependent: rows.map((r) => st.table[r[0]] === "CONFIGURATION-DEPENDENT") } : null,
    withheld,
  }
}

/** Wording that is a manufacturer/compliance claim without a verified source (M2-PRODUCT-VERIFY-01 review). */
const UNSUPPORTED_COPY = /European standards|World'?s top|imported friction clutch|Xinchai|partially synchroni[sz]ed/i

/** Product copy (descriptions, advantages): in strict mode a sentence is kept only if every number in it is a whole token of
 *  a shown (verified) specification of the same product and it makes no unsupported manufacturer claim. */
export function gateCopy(text: string | undefined, p: Pick<Product, "slug" | "keySpecs" | "specTable">, strict: boolean = STRICT): string {
  if (!text || !strict) return text ?? ""
  const ok = copyCheck(p)
  return text.split(/(?<=[.!?])\s+/).filter(ok).join(" ").trim()
}
export function gateList(items: string[] | undefined, p: Pick<Product, "slug" | "keySpecs" | "specTable">, strict: boolean = STRICT): string[] {
  if (!items) return []
  return strict ? items.filter(copyCheck(p)) : items
}
const NORM = (s: string) => s.toLowerCase().replace(/[^0-9a-z+]/g, "")
const TOKEN = /\d+\s*[fF]\s*\+\s*\d+\s*[rR]|\d+(?:[.,]\d+)?/g
const tokensOf = (t: string) => (t.match(TOKEN) ?? []).map(NORM)
function copyCheck(p: Pick<Product, "slug" | "keySpecs" | "specTable">) {
  const s = shownSpecs(p, true)
  const known = new Set(tokensOf([...s.keySpecs.map((k) => k.value), ...(s.specTable?.rows.flat() ?? [])].join(" ")))
  return (t: string) => !UNSUPPORTED_COPY.test(t) && tokensOf(t).every((n) => known.has(n))
}

/** Homepage card/comparison gating: a numeric value is shown only if it appears in a publishable spec of the product. */
export function gateCardSpecs<T extends { slug: string; horsepower?: string; capacity?: string; features: string[] }>(cards: T[], products: Product[], strict: boolean = STRICT): T[] {
  if (!strict) return cards
  return cards.map((c) => {
    const p = products.find((x) => x.slug === c.slug)
    const s = p ? shownSpecs(p, true) : { keySpecs: [], specTable: null }
    const known = new Set(tokensOf([...s.keySpecs.map((k) => k.value), ...(s.specTable?.rows.flat() ?? [])].join(" ")))
    // Every number (and gear ratio such as 16F+8R) in the card text must appear as a whole token in a shown spec, and the
    // text makes no unsupported manufacturer claim.
    const supported = (text?: string) => !!text && !UNSUPPORTED_COPY.test(text) && tokensOf(text).every((n) => known.has(n))
    return {
      ...c,
      horsepower: supported(c.horsepower) ? c.horsepower : undefined,
      capacity: supported(c.capacity) ? c.capacity : undefined,
      features: c.features.filter((f) => !/\d/.test(f) || supported(f)),
    }
  })
}

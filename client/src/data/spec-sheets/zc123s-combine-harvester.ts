import type { SpecSheet } from "./types"
import {
  CONFIRM_NOTE, NO_DIMENSIONS_EXCLUSION, OPTIONAL_NOTE, PRICE_EXCLUSION, SITE_CONTACT, SRC_CONTACT, WARRANTY_CERT_EXCLUSION,
  keySpecWeightExclusion, same, webSource,
} from "./shared"

/**
 * Zoomlion ZC123S Combine Harvester (M3-A6).
 *
 * ZC123S appears in no JOLU document other than the website product data, so every value is WEBSITE-PUBLISHED.
 * The website table's "Rated Speed" entry is "-": it is treated as MISSING, never rendered as a value, and no rated speed
 * is invented. No overall dimensions or mass are published, and none are inferred.
 */
const WEB = ["web-products"]
const C = ["zc123s"]
const w = (v: string, unit?: string, note?: string) => same(C, v, "website-published", WEB, unit, note)

const sheet: SpecSheet = {
  slug: "zc123s-combine-harvester",
  machine: "harvester",
  reviewState: "preview",
  productName: "Zoomlion ZC123S Combine Harvester",
  modelDesignation: "ZC123S",
  category: "Combine harvester",
  image: "@/assets/harvester-4.png",
  imageAlt: "Zoomlion ZC123S combine harvester",
  imageFit: {
    scale: 1,
    subject: { left: 0.027, top: 0.194, right: 0.91, bottom: 0.913 },
    sourceWidthPx: 700,
    rationale: "Lower-resolution 700 × 700 px source and the machine already spans ~88% of its width, so it is shown at 100%: no enlargement and no crop.",
  },
  doc: { code: "JM-ZC123S-DS", revision: "PREVIEW 00", issued: "2026-11" },
  variants: [{ id: "zc123s", label: "ZC123S", short: "ZC123S", title: "ZC123S", kind: "single-machine" }],
  lede:
    "Published specifications for the Zoomlion ZC123S combine harvester, supplied by JOLU Machineries. " +
    "All values are published on the JOLU website only and have not been verified against a manufacturer datasheet. Rated speed, overall dimensions and weight are not published. Confirm all figures with JOLU before purchase.",
  quoteHp: undefined,
  quick: [
    { label: "RATED POWER", value: "120 hp" },
    { label: "PRODUCTIVITY", value: "0.3–0.6 hm²/h" },
    { label: "GAUGE", value: "1,300 mm" },
    { label: "MIN. CLEARANCE", value: "300 mm" },
  ],
  kpis: [
    { id: "power", label: "Rated power", value: "120", unit: "hp", foot: "WEBSITE-PUBLISHED", status: "website-published", sources: WEB },
    { id: "feeding", label: "Feeding capacity", value: "7.0", unit: "kg/s", foot: "WEBSITE-PUBLISHED", status: "website-published", sources: WEB },
    { id: "productivity", label: "Operation productivity", value: "0.3–0.6", unit: "hm²/h", foot: "WEBSITE-PUBLISHED", status: "website-published", sources: WEB },
  ],
  capabilities: [
    {
      id: "engine",
      tag: "01 / POWER",
      title: "Rated power",
      text: "120 hp rated power. A rated engine speed is not published.",
      derivedFrom: ["power"],
    },
    {
      id: "harvesting",
      tag: "02 / HARVESTING",
      title: "Feeding and threshing",
      text: "7.0 kg/s feeding capacity and a φ605×2220 mm threshing drum.",
      derivedFrom: ["feeding", "drum"],
    },
    {
      id: "productivity",
      tag: "03 / PRODUCTIVITY AND CHASSIS",
      title: "Productivity and clearance",
      text: "0.3–0.6 hm²/h operation productivity, with a 1,300 mm gauge and 300 mm minimum ground clearance.",
      derivedFrom: ["productivity", "gauge", "ground-clearance"],
    },
  ],
  groups: [
    {
      id: "engine",
      title: "01 / ENGINE",
      rows: [{ id: "power", label: "Rated power", entries: w("120", "hp") }],
    },
    {
      id: "harvesting",
      title: "02 / HARVESTING SYSTEM",
      rows: [
        { id: "feeding", label: "Feeding capacity", entries: w("7.0", "kg/s") },
        { id: "cutting", label: "Cutting width", entries: w("2200/2600", "mm (two widths published; basis not stated)") },
        { id: "drum", label: "Threshing drum (dia × length)", entries: w("φ605×2220", "mm") },
        { id: "productivity", label: "Operation productivity", entries: w("0.3–0.6", "hm²/h") },
      ],
    },
    {
      id: "chassis",
      title: "03 / CHASSIS",
      rows: [
        { id: "gauge", label: "Gauge", entries: w("1300", "mm") },
        { id: "ground-clearance", label: "Minimum ground clearance", entries: w("300", "mm") },
      ],
    },
  ],
  standardEquipment: [
    { label: "7.0 kg/s feeding capacity", rowId: "feeding" },
    { label: "φ605×2220 mm threshing drum", rowId: "drum" },
  ],
  optionalConfigurationNote: OPTIONAL_NOTE,
  capacity: {
    title: "Engineering capacity",
    items: [
      { label: "Feeding capacity", value: "7.0", unit: "kg/s", rowId: "feeding" },
      { label: "Productivity", value: "0.3–0.6", unit: "hm²/h", rowId: "productivity" },
      { label: "Threshing drum", value: "φ605×2220", unit: "mm", rowId: "drum" },
    ],
    note: "Capacity panel drawn from the published specification table only. Rated speed, overall dimensions and weight are not published for this machine, so none are shown and no dimension schematic is drawn.",
  },
  contact: SITE_CONTACT,
  confirmNote: CONFIRM_NOTE,
  sources: [webSource("11", "ZC123S"), SRC_CONTACT],
  excluded: [
    {
      id: "rated-speed",
      label: "Rated speed (website table value: '-')",
      reason: "not-supplied",
      detail: "The table entry is a dash, which is a missing value, not an engineering specification. It is not rendered, no row is shown and no rated speed is invented or borrowed from another model.",
    },
    NO_DIMENSIONS_EXCLUSION,
    keySpecWeightExclusion("4250 kg", "ZC123S"),
    {
      id: "tank-capacities",
      label: "1800 L grain tank and 220 L fuel tank",
      reason: "unverified-claim",
      detail: "Stated only in narrative copy, not in the specification table, and not corroborated by another source. Withheld, consistent with the other sheets that exclude narrative-only values.",
    },
    {
      id: "crop-and-attachments",
      label: "Crop suitability (corn, wheat, rapeseed) and optional attachments (straw chopping and others)",
      reason: "unverified-claim",
      detail: "Present only in narrative copy. No crop capability and no optional equipment is published.",
    },
    {
      id: "narrative-claims",
      label: "Narrative claims (turbocharged Xinchai engine, hydraulic dual-drive motor and 360° turning, 270° unloading auger, steering-wheel control, lubrication system, variable-speed reel)",
      reason: "unverified-claim",
      detail: "Present only in the advantages copy, not as table values, and not corroborated by another source; not reproduced as technical fact.",
    },
    PRICE_EXCLUSION,
    WARRANTY_CERT_EXCLUSION,
  ],
}

export default sheet

import type { SourceRef, SpecSheet } from "./types"
import {
  CONFIRM_NOTE, NO_DIMENSIONS_EXCLUSION, OPTIONAL_NOTE, PRICE_EXCLUSION, SITE_CONTACT, SRC_CONTACT, WARRANTY_CERT_EXCLUSION,
  keySpecWeightExclusion, same, webSource,
} from "./shared"

/**
 * Zoomlion ZL105 Combine Harvester (M3-A6).
 *
 * The website calls the product a "Combine Harvester". The JOLU Product Catalogue (page 2) lists "RICE HARVESTER ZL 105"
 * with no technical values, so it corroborates no specification: every value here is WEBSITE-PUBLISHED. The sheet keeps
 * the website designation and makes no crop claim, neither "rice only" nor any other crop.
 */
const WEB = ["web-products"]
const C = ["zl105"]
const w = (v: string, unit?: string) => same(C, v, "website-published", WEB, unit)

const SRC_CATALOGUE_LIST: SourceRef = {
  id: "catalogue-p2-listing",
  label: "JOLU Product Catalogue (new-product-catalogue.pdf), page 2, product listing",
  kind: "jolu-document",
  note: "A JOLU document, not a manufacturer datasheet. Lists 'RICE HARVESTER ZL 105' with no technical values; prices on the page are never reproduced.",
}

const sheet: SpecSheet = {
  slug: "zl105-combine-harvester",
  machine: "harvester",
  reviewState: "preview",
  productName: "Zoomlion ZL105 Combine Harvester",
  modelDesignation: "ZL105",
  category: "Combine harvester",
  image: "@/assets/harvester-3.png",
  imageAlt: "Zoomlion ZL105 combine harvester",
  imageFit: {
    scale: 1,
    subject: { left: 0.077, top: 0.257, right: 0.933, bottom: 0.807 },
    sourceWidthPx: 700,
    rationale: "Lower-resolution 700 × 700 px source and the machine already spans ~86% of its width, so it is shown at 100%: no enlargement and no crop.",
  },
  doc: { code: "JM-ZL105-DS", revision: "PREVIEW 00", issued: "2026-11" },
  variants: [{ id: "zl105", label: "ZL105", short: "ZL105", title: "ZL105", kind: "single-machine" }],
  lede:
    "Published specifications for the Zoomlion ZL105 combine harvester, supplied by JOLU Machineries. " +
    "All values are published on the JOLU website only and have not been verified against a manufacturer datasheet. Overall dimensions and weight are not published. Confirm all figures with JOLU before purchase.",
  quoteHp: undefined,
  quick: [
    { label: "RATED SPEED", value: "2,600 r/min" },
    { label: "PRODUCTIVITY", value: "0.7–1 hm²/h" },
    { label: "GAUGE", value: "1,250 mm" },
    { label: "MIN. CLEARANCE", value: "350 mm" },
  ],
  kpis: [
    { id: "power", label: "Rated power", value: "105", unit: "hp", foot: "WEBSITE-PUBLISHED", status: "website-published", sources: WEB },
    { id: "feeding", label: "Feeding capacity", value: "6.0", unit: "kg/s", foot: "WEBSITE-PUBLISHED", status: "website-published", sources: WEB },
    { id: "cutting", label: "Cutting width", value: "2,360", unit: "mm", foot: "WEBSITE-PUBLISHED", status: "website-published", sources: WEB },
  ],
  capabilities: [
    {
      id: "engine",
      tag: "01 / POWER",
      title: "Rated power and speed",
      text: "105 hp rated power at a 2,600 r/min rated speed.",
      derivedFrom: ["power", "rated-speed"],
    },
    {
      id: "harvesting",
      tag: "02 / HARVESTING",
      title: "Feeding, cutting and threshing",
      text: "6.0 kg/s feeding capacity, a 2,360 mm cutting width and a φ620×2000 mm threshing drum.",
      derivedFrom: ["feeding", "cutting", "drum"],
    },
    {
      id: "productivity",
      tag: "03 / PRODUCTIVITY AND CHASSIS",
      title: "Productivity and clearance",
      text: "0.7–1 hm²/h operation productivity, with a 1,250 mm gauge and 350 mm minimum ground clearance.",
      derivedFrom: ["productivity", "gauge", "ground-clearance"],
    },
  ],
  groups: [
    {
      id: "engine",
      title: "01 / ENGINE",
      rows: [
        { id: "power", label: "Rated power", entries: w("105", "hp") },
        { id: "rated-speed", label: "Rated speed", entries: w("2600", "r/min") },
      ],
    },
    {
      id: "harvesting",
      title: "02 / HARVESTING SYSTEM",
      rows: [
        { id: "feeding", label: "Feeding capacity", entries: w("6.0", "kg/s") },
        { id: "cutting", label: "Cutting width", entries: w("2360", "mm") },
        { id: "drum", label: "Threshing drum (dia × length)", entries: w("φ620×2000", "mm") },
        { id: "productivity", label: "Operation productivity", entries: w("0.7–1", "hm²/h") },
      ],
    },
    {
      id: "chassis",
      title: "03 / CHASSIS",
      rows: [
        { id: "gauge", label: "Gauge", entries: w("1250", "mm") },
        { id: "ground-clearance", label: "Minimum ground clearance", entries: w("350", "mm") },
      ],
    },
  ],
  standardEquipment: [
    { label: "6.0 kg/s feeding capacity", rowId: "feeding" },
    { label: "2,360 mm cutting width", rowId: "cutting" },
    { label: "φ620×2000 mm threshing drum", rowId: "drum" },
  ],
  optionalConfigurationNote: OPTIONAL_NOTE,
  capacity: {
    title: "Engineering capacity",
    items: [
      { label: "Feeding capacity", value: "6.0", unit: "kg/s", rowId: "feeding" },
      { label: "Cutting width", value: "2360", unit: "mm", rowId: "cutting" },
      { label: "Productivity", value: "0.7–1", unit: "hm²/h", rowId: "productivity" },
      { label: "Threshing drum", value: "φ620×2000", unit: "mm", rowId: "drum" },
    ],
    note: "Capacity panel drawn from the published specification table only. No overall dimensions or weight are published for this machine, so no dimension schematic is drawn.",
  },
  contact: SITE_CONTACT,
  confirmNote: CONFIRM_NOTE,
  sources: [webSource("8", "ZL105"), SRC_CATALOGUE_LIST, SRC_CONTACT],
  excluded: [
    NO_DIMENSIONS_EXCLUSION,
    keySpecWeightExclusion("3950 kg", "ZL105"),
    {
      id: "grain-tank-options",
      label: "Grain tank options '660–1800 L'",
      reason: "unverified-claim",
      detail: "A range of tank options that appears only in narrative copy. It is not a table value, does not say which tank is fitted, and no tank is documented, so no grain-tank capacity or option is published.",
    },
    {
      id: "smart-edition",
      label: "'Smart Edition' with automatic power output control",
      reason: "unverified-claim",
      detail: "An optional configuration described only in marketing copy, with no specification or supporting document. No optional configuration is published.",
    },
    {
      id: "rice-designation",
      label: "Catalogue designation 'RICE HARVESTER ZL 105' versus website 'Combine Harvester'",
      reason: "unverified-claim",
      detail: "The sources describe the machine differently and neither lists crop capabilities in a specification. The sheet keeps the website designation (Combine Harvester) and publishes no crop claim, neither rice-only nor any other crop.",
    },
    {
      id: "narrative-claims",
      label: "Narrative claims (8-blade fan with 30% higher wind-speed uniformity, 20–50% vibration reduction, electric handle control, transparent oil-water separator, U-shaped chassis, reinforced axles)",
      reason: "unverified-claim",
      detail: "Present only in the advantages copy, not as table values, and not corroborated by another source; not reproduced as technical fact.",
    },
    PRICE_EXCLUSION,
    WARRANTY_CERT_EXCLUSION,
  ],
}

export default sheet

import type { SpecSheet } from "./types"
import {
  CONFIRM_NOTE, NO_DIMENSIONS_EXCLUSION, OPTIONAL_NOTE, PRICE_EXCLUSION, SITE_CONTACT, SRC_CONTACT, WARRANTY_CERT_EXCLUSION,
  keySpecWeightExclusion, same, webSource,
} from "./shared"

/**
 * Zoomlion TF150 Combine Harvester (M3-A6).
 *
 * TF150 appears in no JOLU document other than the website product data, so every value is WEBSITE-PUBLISHED.
 * The website table is short and publishes no overall dimensions and no weight; neither is invented or inferred.
 * The wheelbase and minimum ground clearance are explicit table rows and are shown.
 */
const WEB = ["web-products"]
const C = ["tf150"]
const w = (v: string, unit?: string) => same(C, v, "website-published", WEB, unit)

const sheet: SpecSheet = {
  slug: "tf150-combine-harvester",
  machine: "harvester",
  reviewState: "preview",
  productName: "Zoomlion TF150 Combine Harvester",
  modelDesignation: "TF150",
  category: "Combine harvester",
  image: "@/assets/harvester-2.png",
  imageAlt: "Zoomlion TF150 combine harvester",
  imageFit: {
    scale: 1.15,
    subject: { left: 0.201, top: 0.166, right: 0.926, bottom: 0.885 },
    sourceWidthPx: 990,
    rationale: "Harvester spans ~73% of the 990 px source and sits right of centre; 115% clips only empty margin and keeps the whole machine inside the panel.",
  },
  doc: { code: "JM-TF150-DS", revision: "PREVIEW 00", issued: "2026-11" },
  variants: [{ id: "tf150", label: "TF150", short: "TF150", title: "TF150", kind: "single-machine" }],
  lede:
    "Published specifications for the Zoomlion TF150 combine harvester, supplied by JOLU Machineries. " +
    "All values are published on the JOLU website only and have not been verified against a manufacturer datasheet. Overall dimensions and weight are not published. Confirm all figures with JOLU before purchase.",
  quoteHp: undefined,
  quick: [
    { label: "RATED POWER", value: "300 hp" },
    { label: "RATED SPEED", value: "2,200 r/min" },
    { label: "WHEELBASE", value: "3,586 mm" },
    { label: "MIN. CLEARANCE", value: "380 mm" },
  ],
  kpis: [
    { id: "power", label: "Rated power", value: "300", unit: "hp", foot: "WEBSITE-PUBLISHED", status: "website-published", sources: WEB },
    { id: "grain-tank", label: "Grain tank capacity", value: "9,000", unit: "L", foot: "WEBSITE-PUBLISHED", status: "website-published", sources: WEB },
    { id: "unloading", label: "Grain unloading speed", value: "55", unit: "L/s", foot: "WEBSITE-PUBLISHED", status: "website-published", sources: WEB },
  ],
  capabilities: [
    {
      id: "power",
      tag: "01 / POWER AND FUEL",
      title: "Rated power and fuel tank",
      text: "300 hp rated power at a 2,200 r/min rated speed, with a 600 L fuel tank.",
      derivedFrom: ["power", "rated-speed", "fuel-tank"],
    },
    {
      id: "threshing",
      tag: "02 / THRESHING AND CLEANING",
      title: "Dual axial-flow threshing",
      text: "Two longitudinal axial-flow threshing rollers, Ф480×3180 mm, with a 4.3 m² cleaning area.",
      derivedFrom: ["rollers", "roller-size", "cleaning"],
    },
    {
      id: "grain",
      tag: "03 / GRAIN HANDLING",
      title: "Grain tank and unloading",
      text: "9,000 L grain tank with a 55 L/s grain unloading speed.",
      derivedFrom: ["grain-tank", "unloading"],
    },
  ],
  groups: [
    {
      id: "engine",
      title: "01 / ENGINE AND FUEL",
      rows: [
        { id: "power", label: "Rated power", entries: w("300", "hp") },
        { id: "rated-speed", label: "Rated speed", entries: w("2200", "r/min") },
        { id: "fuel-tank", label: "Fuel tank capacity", entries: w("600", "L") },
      ],
    },
    {
      id: "harvesting",
      title: "02 / THRESHING AND CLEANING",
      rows: [
        { id: "rollers", label: "Threshing rollers", entries: w("2 (Dual longitudinal axial flow)") },
        { id: "roller-size", label: "Roller size", entries: w("Ф480×3180", "mm") },
        { id: "cleaning", label: "Cleaning area", entries: w("4.3", "m²") },
      ],
    },
    {
      id: "grain",
      title: "03 / GRAIN HANDLING",
      rows: [
        { id: "grain-tank", label: "Grain tank capacity", entries: w("9000", "L") },
        { id: "unloading", label: "Grain unloading speed", entries: w("55", "L/s") },
      ],
    },
    {
      id: "chassis",
      title: "04 / CHASSIS",
      rows: [
        { id: "wheelbase", label: "Wheelbase", entries: w("3586", "mm") },
        { id: "ground-clearance", label: "Minimum ground clearance", entries: w("380", "mm") },
      ],
    },
  ],
  standardEquipment: [
    { label: "9,000 L grain tank", rowId: "grain-tank" },
    { label: "Dual axial-flow threshing", rowId: "rollers" },
    { label: "600 L fuel tank", rowId: "fuel-tank" },
    { label: "4.3 m² cleaning area", rowId: "cleaning" },
  ],
  optionalConfigurationNote: OPTIONAL_NOTE,
  capacity: {
    title: "Engineering capacity",
    items: [
      { label: "Grain tank", value: "9000", unit: "L", rowId: "grain-tank" },
      { label: "Unloading speed", value: "55", unit: "L/s", rowId: "unloading" },
      { label: "Fuel tank", value: "600", unit: "L", rowId: "fuel-tank" },
      { label: "Threshing rollers", value: "2", rowId: "rollers" },
      { label: "Roller size", value: "Ф480×3180", unit: "mm", rowId: "roller-size" },
      { label: "Cleaning area", value: "4.3", unit: "m²", rowId: "cleaning" },
    ],
    note: "Capacity panel drawn from the published specification table only. No overall dimensions or weight are published for this machine, so no dimension schematic is drawn.",
  },
  contact: SITE_CONTACT,
  confirmNote: CONFIRM_NOTE,
  sources: [webSource("16", "TF150"), SRC_CONTACT],
  excluded: [
    NO_DIMENSIONS_EXCLUSION,
    keySpecWeightExclusion("12650 kg", "TF150"),
    {
      id: "emission",
      label: "Engine emission standard (website narrative: National III)",
      reason: "unverified-claim",
      detail: "A compliance claim that appears only in narrative copy, not in the specification table. Withheld, consistent with the other website-only sheets.",
    },
    {
      id: "performance-claims",
      label: "Loss and breakage rates ('<0.4% wheat loss', '<1% corn grain breakage') and the 10° slope claim",
      reason: "unverified-claim",
      detail: "Performance claims in marketing copy with no test conditions or supporting document; not reproduced.",
    },
    {
      id: "optional-headers",
      label: "'Flexible header options' and multi-crop (wheat, corn, soybeans) suitability",
      reason: "unverified-claim",
      detail: "No header or crop capability is published in the specification table, so no optional equipment or crop claim is made.",
    },
    {
      id: "narrative-claims",
      label: "Narrative claims (Bosch high-pressure fuel system, 'intelligent' floating-bridge and electronic tank controls, time-sharing four-wheel drive, planetary gearbox, H-drive chassis, 900 MPa screen steel)",
      reason: "unverified-claim",
      detail: "Present only in the advantages copy, not as table values, and not corroborated by another source; not reproduced as technical fact.",
    },
    PRICE_EXCLUSION,
    WARRANTY_CERT_EXCLUSION,
  ],
}

export default sheet

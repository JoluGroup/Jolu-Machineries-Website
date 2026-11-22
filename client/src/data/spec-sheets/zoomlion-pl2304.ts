import type { SpecSheet } from "./types"
import {
  CONFIRM_NOTE, ENGINE_DETAIL_EXCLUSION, OPTIONAL_NOTE, PRICE_EXCLUSION, SITE_CONTACT, SRC_CONTACT,
  WARRANTY_CERT_EXCLUSION, same, webSource,
} from "./shared"

/**
 * Zoomlion PL2304 Wheeled Tractor (M3-A4 Batch 1).
 *
 * PL2304 appears in no JOLU document other than the website product data, so every published value is
 * WEBSITE-PUBLISHED. Nothing is corroborated and nothing is manufacturer-verified.
 */
const WEB = ["web-products"]
const C = ["pl2304"]

const sheet: SpecSheet = {
  slug: "zoomlion-pl2304",
  reviewState: "preview",
  productName: "Zoomlion PL2304 Wheeled Tractor",
  modelDesignation: "PL2304",
  category: "Wheeled tractor",
  image: "@/assets/tractor-2.png",
  imageAlt: "Zoomlion PL2304 wheeled tractor",
  imageFit: {
    scale: 1,
    subject: { left: 0.079, top: 0.143, right: 0.954, bottom: 0.831 },
    sourceWidthPx: 700,
    rationale: "Square 700 px source; the tractor already spans ~88% of its width, so no enlargement is applied (it would crop the machine).",
  },
  doc: { code: "JM-PL2304-DS", revision: "PREVIEW 00", issued: "2026-11" },
  variants: [{ id: "pl2304", label: "PL2304", short: "PL2304", title: "PL2304", kind: "single-machine" }],
  lede:
    "Published specifications for the Zoomlion PL2304 wheeled tractor, supplied by JOLU Machineries. " +
    "All values are published on the JOLU website only and have not been verified against a manufacturer datasheet. Confirm all figures with JOLU before purchase.",
  quoteHp: undefined,
  quick: [
    { label: "OVERALL L × W × H", value: "6231×2575×3400 mm" },
    { label: "MASS", value: "8,995 kg" },
    { label: "RATED POWER", value: "169.5 kW" },
    { label: "TRACTION FORCE", value: "≥74 kN" },
  ],
  kpis: [
    {
      id: "rated-power",
      label: "Rated power",
      value: "169.5",
      unit: "kW",
      foot: "WEBSITE-PUBLISHED",
      status: "website-published",
      sources: WEB,
    },
    {
      id: "traction",
      label: "Traction force",
      value: "≥74",
      unit: "kN",
      foot: "WEBSITE-PUBLISHED",
      status: "website-published",
      sources: WEB,
    },
    {
      id: "mass",
      label: "Minimum operating mass",
      value: "8,995",
      unit: "kg",
      foot: "WEBSITE-PUBLISHED",
      status: "website-published",
      sources: WEB,
    },
  ],
  capabilities: [
    {
      id: "drivetrain",
      tag: "01 / DRIVETRAIN",
      title: "Gearbox and clutch",
      text: "40F+40R gearbox with a multi-disc wet clutch and a fuel consumption rate of ≤228 g/kW·h.",
      derivedFrom: ["gearbox", "clutch", "fuel"],
    },
    {
      id: "implements",
      tag: "02 / IMPLEMENT SUPPORT",
      title: "Hitch, hydraulics and PTO",
      text: "Class III three-point rear hitch, 90 kN maximum lifting capacity and 110/160 L/min output flow, with 540E/1000N/1000E PTO outputs.",
      derivedFrom: ["hitch", "lifting", "flow", "pto-speed"],
    },
    {
      id: "chassis",
      tag: "03 / CHASSIS AND CAB",
      title: "Cab and clearance",
      text: "Air-conditioned cab with 420 mm ground clearance and a 3,085 mm wheelbase.",
      derivedFrom: ["cab", "ground-clearance", "wheelbase"],
    },
  ],
  groups: [
    {
      id: "dimensions",
      title: "01 / DIMENSIONS AND MASS",
      rows: [
        { id: "dimensions", label: "Overall dimensions (L×W×H)", entries: same(C, "6231×2575×3400", "website-published", WEB, "mm") },
        { id: "wheelbase", label: "Wheelbase", entries: same(C, "3085", "website-published", WEB, "mm") },
        { id: "mass", label: "Minimum operating mass", entries: same(C, "8995", "website-published", WEB, "kg") },
        { id: "ground-clearance", label: "Ground clearance", entries: same(C, "420", "website-published", WEB, "mm") },
      ],
    },
    {
      id: "drivetrain",
      title: "02 / ENGINE-RELATED AND DRIVETRAIN",
      rows: [
        { id: "rated-power", label: "Rated power", entries: same(C, "169.5", "website-published", WEB, "kW") },
        { id: "fuel", label: "Fuel consumption rate", entries: same(C, "≤228", "website-published", WEB, "g/kW·h") },
        { id: "clutch", label: "Clutch type", entries: same(C, "Multi-disc wet", "website-published", WEB) },
        { id: "gearbox", label: "Gearbox", entries: same(C, "40F+40R", "website-published", WEB) },
        { id: "tyres", label: "Tyre size (front / rear)", entries: same(C, "540/65R30 & 650/65R42 or 420/90R30 & 520/85R42", "website-published", WEB) },
      ],
    },
    {
      id: "hydraulics",
      title: "03 / HYDRAULICS, HITCH AND PTO",
      rows: [
        { id: "hydraulic-system", label: "Lifting system", entries: same(C, "Split type", "website-published", WEB) },
        { id: "lifting", label: "Maximum lifting capacity", entries: same(C, "90", "website-published", WEB, "kN") },
        { id: "tillage", label: "Tillage control", entries: same(C, "Hydraulic control", "website-published", WEB) },
        { id: "valves", label: "Hydraulic output valve", entries: same(C, "Three position electro-hydraulic proportional multi-way valve", "website-published", WEB) },
        { id: "hitch", label: "Hitch", entries: same(C, "Three-point rear suspension, Class III", "website-published", WEB) },
        { id: "flow", label: "Output flow rate", entries: same(C, "110/160", "website-published", WEB, "L/min") },
        { id: "traction", label: "Traction force", entries: same(C, "≥74", "website-published", WEB, "kN") },
        { id: "pto-speed", label: "PTO output", entries: same(C, "540E/1000N/1000E", "website-published", WEB) },
      ],
    },
    {
      id: "operator",
      title: "04 / OPERATOR",
      rows: [{ id: "cab", label: "Cab", entries: same(C, "Air-conditioned", "website-published", WEB) }],
    },
  ],
  standardEquipment: [
    { label: "Air-conditioned cab", rowId: "cab" },
    { label: "Three-point hitch, Class III", rowId: "hitch" },
    { label: "Proportional multi-way valve", rowId: "valves" },
    { label: "540E/1000N/1000E PTO", rowId: "pto-speed" },
  ],
  optionalConfigurationNote: OPTIONAL_NOTE,
  dimensions: {
    envelopes: [{ label: "PL2304", lengthMm: 6231, widthMm: 2575, heightMm: 3400, wheelbaseMm: 3085 }],
    groundClearanceMm: { pl2304: 420 },
    sources: WEB,
  },
  contact: SITE_CONTACT,
  confirmNote: CONFIRM_NOTE,
  sources: [webSource("4", "PL2304"), SRC_CONTACT],
  excluded: [
    {
      id: "emission",
      label: "Engine emission standard (table: National III)",
      reason: "disputed",
      detail: "The website table says National III while the same website's copy says the tractor 'meets European technical and emission standards'. The two statements are inconsistent and neither is documented elsewhere; no emission class is published.",
    },
    {
      id: "european-standards",
      label: "'Compliant with European standards' / 'Meets European technical and emission standards'",
      reason: "unverified-claim",
      detail: "A compliance claim with no supporting document. Excluded.",
    },
    {
      id: "front-pto",
      label: "Front PTO ('1000 (front PTO)') and 'Optional GPS navigation, driverless control, front PTO/suspension'",
      reason: "unverified-claim",
      detail: "The website lists the front PTO inside the PTO output cell but its copy describes it as optional equipment. Only the rear PTO outputs are published; no optional upgrades are published.",
    },
    {
      id: "marketing-claims",
      label: "Website narrative claims ('world's top concept', smart operation, 33% torque reserve, APS automatic shift, touch screen, fault diagnosis, load sensing)",
      reason: "unverified-claim",
      detail: "Marketing copy not present as table values and not corroborated by another source; not reproduced as technical fact.",
    },
    PRICE_EXCLUSION,
    WARRANTY_CERT_EXCLUSION,
    ENGINE_DETAIL_EXCLUSION,
  ],
}

export default sheet

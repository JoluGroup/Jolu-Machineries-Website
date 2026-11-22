import type { SpecSheet } from "./types"
import {
  CONFIRM_NOTE, ENGINE_DETAIL_EXCLUSION, OPTIONAL_NOTE, PRICE_EXCLUSION, SITE_CONTACT, SRC_CATALOGUE, SRC_CONTACT,
  SRC_PROFILE_P5, WARRANTY_CERT_EXCLUSION, same, per, webSource,
} from "./shared"

/**
 * Zoomlion RC904/1104 Wheeled Tractor (M3-A4 Batch 1).
 *
 * Columns are two DISTINCT MODELS as the website and the Company Profile name them: RC904-A and RC1104.
 *  - WEB  : JOLU website product data (products.ts, product 10).
 *  - PROF : JOLU Company Profile PDF, PDF page 5 (printed page 4). A JOLU document, NOT a manufacturer datasheet.
 *           Single-valued rows are merged cells (apply to both models). Rated power, lifting capacity and
 *           traction appear there as merged slash pairs ("66.2/81", "16/17.7", "25.4/29.4"), so per-model
 *           attribution of those three rows rests on the website columns alone (website-published).
 *  - CAT  : JOLU Product Catalogue page 2 "Product Features" (series-level, lists "RC904/1104-A").
 * No value is manufacturer-verified.
 */
const WEB = ["web-products"]
const WP = ["web-products", "company-profile-p5"]
const WPC = ["web-products", "company-profile-p5", "catalogue-features"]
const C = ["rc904", "rc1104"]
const SLASH_NOTE = "Company Profile prints a merged slash pair; per-model attribution is from the website columns only."

const sheet: SpecSheet = {
  slug: "zoomlion-rc904-1104",
  reviewState: "preview",
  productName: "Zoomlion RC904/1104 Wheeled Tractor",
  modelDesignation: "RC904/1104",
  category: "Wheeled tractor",
  image: "@/assets/tractor-6.png",
  imageAlt: "Zoomlion RC904/1104 wheeled tractor",
  imageFit: {
    scale: 1.1,
    subject: { left: 0.186, top: 0.012, right: 0.865, bottom: 0.993 },
    sourceWidthPx: 990,
    rationale: "Tractor spans ~68% of the source width and ~98% of its height; 110% keeps the whole machine inside the panel.",
  },
  doc: { code: "JM-RC904-1104-DS", revision: "PREVIEW 00", issued: "2026-11" },
  variants: [
    { id: "rc904", label: "RC904-A", short: "RC904-A", title: "RC904-A", kind: "distinct-model" },
    { id: "rc1104", label: "RC1104", short: "RC1104", title: "RC1104", kind: "distinct-model" },
  ],
  lede:
    "Published specifications for the Zoomlion RC904/1104 wheeled tractor, supplied by JOLU Machineries. " +
    "RC904-A and RC1104 are shown as separate models with their own published values. Confirm all figures with JOLU before purchase.",
  quoteHp: undefined,
  quick: [
    { label: "LENGTH", value: "4,390 / 4,500 mm" },
    { label: "MASS · BOTH", value: "3,790 kg" },
    { label: "WHEELBASE", value: "2,195 mm" },
    { label: "RATED POWER", value: "66.2 / 81 kW" },
  ],
  kpis: [
    {
      id: "rated-power",
      label: "Rated power",
      value: "66.2 / 81",
      unit: "kW",
      foot: "WEBSITE-PUBLISHED · RC904-A / RC1104",
      status: "website-published",
      sources: WEB,
    },
    {
      id: "traction",
      label: "Traction force",
      value: "25.4 / 29.4",
      unit: "kN",
      foot: "WEBSITE-PUBLISHED · RC904-A / RC1104",
      status: "website-published",
      sources: WEB,
    },
    {
      id: "mass",
      label: "Minimum operating mass",
      value: "3,790",
      unit: "kg",
      foot: "CORROBORATED · BOTH MODELS",
      status: "corroborated",
      sources: WP,
    },
  ],
  capabilities: [
    {
      id: "drivetrain",
      tag: "01 / DRIVETRAIN",
      title: "Gearbox and clutch",
      text: "16F+8R gearbox with a dry-type, independent-control double-action clutch on both models.",
      derivedFrom: ["gearbox", "clutch"],
    },
    {
      id: "implements",
      tag: "02 / IMPLEMENT SUPPORT",
      title: "Hitch, hydraulics and PTO",
      text: "Class II three-point rear hitch, 2 hydraulic valve groups and a 540/1000 rpm PTO; 16 kN (RC904-A) or 17.7 kN (RC1104) maximum lifting capacity.",
      derivedFrom: ["hitch", "valves", "pto-speed", "lifting"],
    },
    {
      id: "chassis",
      tag: "03 / CHASSIS AND OPERATOR",
      title: "Operator station and clearance",
      text: "Safety shelf with sunshade, 435 mm ground clearance and rear tyres of 16.9-34 (RC904-A) or 18.4-30 (RC1104).",
      derivedFrom: ["cab", "ground-clearance", "tyres"],
    },
  ],
  groups: [
    {
      id: "dimensions",
      title: "01 / DIMENSIONS AND MASS",
      rows: [
        { id: "dimensions", label: "Overall dimensions (L×W×H)", entries: per(C, ["4390×2095×2950", "4500×2095×2950"], "corroborated", WP, "mm") },
        { id: "wheelbase", label: "Wheelbase", entries: same(C, "2195", "corroborated", WP, "mm") },
        { id: "mass", label: "Minimum operating mass", entries: same(C, "3790", "corroborated", WP, "kg") },
        { id: "ground-clearance", label: "Ground clearance", entries: same(C, "435", "corroborated", WP, "mm") },
      ],
    },
    {
      id: "drivetrain",
      title: "02 / ENGINE-RELATED AND DRIVETRAIN",
      rows: [
        { id: "emission", label: "Engine emission standard", entries: same(C, "National II", "corroborated", WPC) },
        { id: "rated-power", label: "Rated power", entries: per(C, ["66.2", "81"], "website-published", WEB, "kW", SLASH_NOTE) },
        { id: "fuel", label: "Fuel consumption rate", entries: same(C, "≤242", "corroborated", WP, "g/kW·h") },
        { id: "clutch", label: "Clutch type", entries: same(C, "Dry type, independent control double action", "website-published", WEB) },
        { id: "gearbox", label: "Gearbox", entries: same(C, "16F+8R", "corroborated", WPC) },
        { id: "tyres", label: "Tyre size (front / rear)", entries: per(C, ["12.4-24 / 16.9-34", "12.4-24(R2) / 18.4-30(R2)"], "website-published", WEB) },
      ],
    },
    {
      id: "hydraulics",
      title: "03 / HYDRAULICS, HITCH AND PTO",
      rows: [
        { id: "hydraulic-system", label: "Hydraulic system", entries: same(C, "High pressure", "website-published", WEB) },
        { id: "lifting", label: "Maximum lifting capacity", entries: per(C, ["16", "17.7"], "website-published", WEB, "kN", SLASH_NOTE) },
        { id: "tillage", label: "Tillage control", entries: same(C, "Force, position and floating control", "website-published", WEB) },
        { id: "valves", label: "Hydraulic valves", entries: same(C, "2 groups", "website-published", WEB) },
        { id: "hitch", label: "Hitch", entries: same(C, "Three-point rear suspension, Class II", "website-published", WEB) },
        { id: "traction", label: "Traction force", entries: per(C, ["25.4", "29.4"], "website-published", WEB, "kN", SLASH_NOTE) },
        { id: "pto-speed", label: "PTO speed", entries: same(C, "540/1000", "corroborated", WPC, "rpm") },
      ],
    },
    {
      id: "operator",
      title: "04 / OPERATOR",
      rows: [{ id: "cab", label: "Operator station", entries: same(C, "Safety shelf + sunshade", "website-published", WEB) }],
    },
  ],
  standardEquipment: [
    { label: "Safety shelf with sunshade", rowId: "cab" },
    { label: "Three-point hitch, Class II", rowId: "hitch" },
    { label: "Two hydraulic valve groups", rowId: "valves" },
    { label: "540/1000 rpm PTO", rowId: "pto-speed" },
  ],
  optionalConfigurationNote: OPTIONAL_NOTE,
  dimensions: {
    envelopes: [
      { label: "RC904-A", lengthMm: 4390, widthMm: 2095, heightMm: 2950, wheelbaseMm: 2195 },
      { label: "RC1104", lengthMm: 4500, widthMm: 2095, heightMm: 2950, wheelbaseMm: 2195 },
    ],
    groundClearanceMm: { rc904: 435, rc1104: 435 },
    sources: WP,
  },
  contact: SITE_CONTACT,
  confirmNote: CONFIRM_NOTE,
  sources: [webSource("10", "RC904/1104"), SRC_PROFILE_P5, SRC_CATALOGUE, SRC_CONTACT],
  excluded: [
    {
      id: "cab-optional",
      label: "Cab described as optional ('Safety shelf + sunshade / Cab (optional)', 'Optional cab or sunshade')",
      reason: "unverified-claim",
      detail: "Only the website says a cab is optional; no JOLU document or image supports it. The operator station is published as the safety shelf with sunshade; no cab option is stated.",
    },
    {
      id: "rc1104-old-new",
      label: "Catalogue 'RC1104-A (old model)' and 'RC1104-A (new model)'",
      reason: "variant-unattributable",
      detail: "The catalogue lists two RC1104-A items; the website and Company Profile show a single RC1104 column. Not conflated with the website RC1104 without evidence, and no old/new split is shown.",
    },
    {
      id: "hp-headline",
      label: "Horse-power headline (90–110 hp / 90/110HP)",
      reason: "variant-unattributable",
      detail: "Headline hp values are series-level and their per-model order is not stated. Per-model rated power in kW is published instead (website columns).",
    },
    {
      id: "per-model-corroboration",
      label: "Corroborated status for rated power, lifting capacity and traction",
      reason: "variant-unattributable",
      detail: "The Company Profile prints merged slash pairs (66.2/81, 16/17.7, 25.4/29.4) and the catalogue one traction figure; the per-model split is shown as website-published only.",
    },
    {
      id: "marketing-claims",
      label: "Website narrative claims (turbocharged inter-cooling four-cylinder engine, fuel-efficient design, steering, terrain adaptability)",
      reason: "unverified-claim",
      detail: "Marketing copy not corroborated by a table value or another source; not reproduced as technical fact.",
    },
    PRICE_EXCLUSION,
    WARRANTY_CERT_EXCLUSION,
    ENGINE_DETAIL_EXCLUSION,
  ],
}

export default sheet

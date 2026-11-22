import type { SpecSheet } from "./types"
import {
  CONFIRM_NOTE, ENGINE_DETAIL_EXCLUSION, OPTIONAL_NOTE, PRICE_EXCLUSION, SITE_CONTACT, SRC_CATALOGUE, SRC_CONTACT,
  SRC_PROFILE_P5, WARRANTY_CERT_EXCLUSION, same, per, webSource,
} from "./shared"

/**
 * Zoomlion RK504/704 Wheeled Tractor (M3-A4 Batch 1).
 *
 * Columns are two DISTINCT MODELS: RK504-A and RK704-A. The Company Profile (PDF page 5, printed page 4)
 * prints a separate cell per model for these rows, so per-model attribution is corroborated.
 * A JOLU document is NOT a manufacturer datasheet; no value here is manufacturer-verified.
 */
const WEB = ["web-products"]
const WP = ["web-products", "company-profile-p5"]
const WPC = ["web-products", "company-profile-p5", "catalogue-features"]
const C = ["rk504", "rk704"]

const sheet: SpecSheet = {
  slug: "zoomlion-rk504-704",
  reviewState: "preview",
  productName: "Zoomlion RK504/704 Wheeled Tractor",
  modelDesignation: "RK504/704",
  category: "Wheeled tractor",
  image: "@/assets/tractor-5.png",
  imageAlt: "Zoomlion RK504/704 wheeled tractor",
  imageFit: {
    scale: 1.2,
    subject: { left: 0.258, top: 0.041, right: 0.832, bottom: 0.986 },
    sourceWidthPx: 990,
    rationale: "Tractor spans ~57% of the source width; 120% clips only empty margin and keeps the machine (centre 55%) fully inside.",
  },
  doc: { code: "JM-RK504-704-DS", revision: "PREVIEW 00", issued: "2026-11" },
  variants: [
    { id: "rk504", label: "RK504-A", short: "RK504-A", title: "RK504-A", kind: "distinct-model" },
    { id: "rk704", label: "RK704-A", short: "RK704-A", title: "RK704-A", kind: "distinct-model" },
  ],
  lede:
    "Published specifications for the Zoomlion RK504/704 wheeled tractor, supplied by JOLU Machineries. " +
    "RK504-A and RK704-A are shown as separate models with their own published values. Confirm all figures with JOLU before purchase.",
  quoteHp: undefined,
  quick: [
    { label: "LENGTH", value: "3,980 / 4,030 mm" },
    { label: "MASS", value: "2,335 / 2,385 kg" },
    { label: "GROUND CLEARANCE", value: "320 / 355 mm" },
    { label: "RATED POWER", value: "36.8 / 51.5 kW" },
  ],
  kpis: [
    {
      id: "rated-power",
      label: "Rated power",
      value: "36.8 / 51.5",
      unit: "kW",
      foot: "CORROBORATED · RK504-A / RK704-A",
      status: "corroborated",
      sources: WP,
    },
    {
      id: "traction",
      label: "Traction force",
      value: "12.5 / 14",
      unit: "kN",
      foot: "CORROBORATED · RK504-A / RK704-A",
      status: "corroborated",
      sources: WP,
    },
    {
      id: "mass",
      label: "Minimum operating mass",
      value: "2,335 / 2,385",
      unit: "kg",
      foot: "CORROBORATED · RK504-A / RK704-A",
      status: "corroborated",
      sources: WP,
    },
  ],
  capabilities: [
    {
      id: "drivetrain",
      tag: "01 / DRIVETRAIN",
      title: "Gearbox and clutch",
      text: "12F+12R gearbox with a dry-type, independent-control double-action clutch on both models.",
      derivedFrom: ["gearbox", "clutch"],
    },
    {
      id: "implements",
      tag: "02 / IMPLEMENT SUPPORT",
      title: "Hitch, hydraulics and PTO",
      text: "Class I three-point rear hitch, 2 hydraulic valve groups, and a 540/1000 rpm (RK504-A) or 540/760 rpm (RK704-A) PTO.",
      derivedFrom: ["hitch", "valves", "pto-speed"],
    },
    {
      id: "chassis",
      tag: "03 / CHASSIS AND OPERATOR",
      title: "Operator station and clearance",
      text: "Safety shelf with sunshade, with 320 mm (RK504-A) or 355 mm (RK704-A) ground clearance.",
      derivedFrom: ["cab", "ground-clearance"],
    },
  ],
  groups: [
    {
      id: "dimensions",
      title: "01 / DIMENSIONS AND MASS",
      rows: [
        { id: "dimensions", label: "Overall dimensions (L×W×H)", entries: per(C, ["3980×1750×2620", "4030×1728×2840"], "corroborated", WP, "mm") },
        { id: "wheelbase", label: "Wheelbase", entries: per(C, ["2020", "2040"], "corroborated", WP, "mm") },
        { id: "mass", label: "Minimum operating mass", entries: per(C, ["2335", "2385"], "corroborated", WP, "kg") },
        { id: "ground-clearance", label: "Ground clearance", entries: per(C, ["320", "355"], "corroborated", WP, "mm") },
      ],
    },
    {
      id: "drivetrain",
      title: "02 / ENGINE-RELATED AND DRIVETRAIN",
      rows: [
        { id: "emission", label: "Engine emission standard", entries: same(C, "National II", "corroborated", WPC) },
        { id: "rated-power", label: "Rated power", entries: per(C, ["36.8", "51.5"], "corroborated", WP, "kW") },
        { id: "fuel", label: "Fuel consumption rate", entries: per(C, ["≤242", "≤238"], "corroborated", WP, "g/kW·h") },
        { id: "clutch", label: "Clutch type", entries: same(C, "Dry type, independent control double-action", "website-published", WEB) },
        { id: "gearbox", label: "Gearbox", entries: same(C, "12F+12R", "corroborated", WPC) },
        { id: "tyres", label: "Tyre size (front / rear)", entries: per(C, ["8.3-20 / 12.4-28", "8.3-24 / 14.9-30"], "website-published", WEB) },
      ],
    },
    {
      id: "hydraulics",
      title: "03 / HYDRAULICS, HITCH AND PTO",
      rows: [
        { id: "hydraulic-system", label: "Hydraulic system", entries: same(C, "Lifting device with partial separated units", "website-published", WEB) },
        { id: "lifting", label: "Maximum lifting capacity", entries: per(C, ["≥8.8", "≥15"], "corroborated", WP, "kN") },
        { id: "tillage", label: "Tillage control", entries: same(C, "Independent force position and floating control", "website-published", WEB) },
        { id: "valves", label: "Hydraulic valves", entries: same(C, "2 groups", "website-published", WEB) },
        { id: "hitch", label: "Hitch", entries: same(C, "Three-point rear suspension, Class I", "website-published", WEB) },
        { id: "traction", label: "Traction force", entries: per(C, ["12.5", "14"], "corroborated", WP, "kN") },
        { id: "pto-speed", label: "PTO speed", entries: per(C, ["540/1000", "540/760"], "corroborated", WP, "rpm") },
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
    { label: "Three-point hitch, Class I", rowId: "hitch" },
    { label: "Two hydraulic valve groups", rowId: "valves" },
    { label: "Double-action dry clutch", rowId: "clutch" },
  ],
  optionalConfigurationNote: OPTIONAL_NOTE,
  dimensions: {
    envelopes: [
      { label: "RK504-A", lengthMm: 3980, widthMm: 1750, heightMm: 2620, wheelbaseMm: 2020 },
      { label: "RK704-A", lengthMm: 4030, widthMm: 1728, heightMm: 2840, wheelbaseMm: 2040 },
    ],
    groundClearanceMm: { rk504: 320, rk704: 355 },
    sources: WP,
  },
  contact: SITE_CONTACT,
  confirmNote: CONFIRM_NOTE,
  sources: [webSource("9", "RK504/704"), SRC_PROFILE_P5, SRC_CATALOGUE, SRC_CONTACT],
  excluded: [
    {
      id: "hp-headline",
      label: "Horse-power headline (website 50–70 hp vs catalogue 50/75HP)",
      reason: "disputed",
      detail: "The two JOLU sources disagree on the upper figure (70 vs 75) and neither attributes it to a model. No hp headline is published; only per-model rated power in kW (separate cells in the Company Profile) is shown.",
    },
    {
      id: "catalogue-traction",
      label: "Catalogue traction force 14 kN given once for 'RK504/RK704-A'",
      reason: "variant-unattributable",
      detail: "A single series-level figure; the per-model values come from the Company Profile cells (12.5 kN and 14 kN) and the website columns.",
    },
    {
      id: "marketing-claims",
      label: "Website narrative claims (brand-name engine, waterproof harness, sealed 'three leaks' build, extra-large fuel tank, adjustable rear track, paddy suitability)",
      reason: "unverified-claim",
      detail: "Marketing copy not corroborated by a table value or another source; not reproduced as technical fact.",
    },
    PRICE_EXCLUSION,
    WARRANTY_CERT_EXCLUSION,
    ENGINE_DETAIL_EXCLUSION,
  ],
}

export default sheet

import type { SpecSheet } from "./types"
import {
  CONFIRM_NOTE, ENGINE_DETAIL_EXCLUSION, OPTIONAL_NOTE, PRICE_EXCLUSION, SITE_CONTACT, SRC_CONTACT,
  WARRANTY_CERT_EXCLUSION, E, per, same, webSource,
} from "./shared"

/**
 * Zoomlion RG1804/2004 Wheeled Tractor (M3-A5 Batch 2).
 *
 * RG1804/2004 appears in no JOLU document other than the website product data, so every published value is
 * WEBSITE-PUBLISHED. Nothing is corroborated and nothing is manufacturer-verified.
 *
 * Columns are the two PUBLISHED CONFIGURATIONS the website table prints: "RG1804/2004" and "RG1804 (2025 New)".
 * They are not shown as verified separate models. Power figures published as a pair ("132 / 147 kW", "113 / 126 kW")
 * are shown exactly as published and are NOT attributed to RG1804 or RG2004: the source does not say which is which.
 */
const WEB = ["web-products"]
const C = ["series", "new2025"]

const sheet: SpecSheet = {
  slug: "zoomlion-rg1804-2004",
  reviewState: "preview",
  productName: "Zoomlion RG1804/2004 Wheeled Tractor",
  modelDesignation: "RG1804/2004",
  category: "Wheeled tractor",
  image: "@/assets/tractor-8.png",
  imageAlt: "Zoomlion RG1804/2004 wheeled tractor",
  imageFit: {
    scale: 1.15,
    subject: { left: 0.162, top: 0.029, right: 0.831, bottom: 1.0 },
    sourceWidthPx: 990,
    rationale: "Tractor spans ~67% of the 990 px source and its tyres meet the lower edge; 115% clips only empty side margin and keeps the whole machine inside the panel.",
  },
  doc: { code: "JM-RG1804-2004-DS", revision: "PREVIEW 00", issued: "2026-11" },
  variants: [
    { id: "series", label: "RG1804/2004", short: "RG1804/2004", title: "RG1804/2004", kind: "published-configuration" },
    { id: "new2025", label: "RG1804 (2025 New)", short: "2025 NEW", title: "RG1804 (2025 New)", kind: "published-configuration" },
  ],
  lede:
    "Published specifications for the Zoomlion RG1804/2004 wheeled tractor, supplied by JOLU Machineries. " +
    "Values are shown for each published configuration. Power figures published as a pair are shown as published and are not attributed to RG1804 or RG2004. " +
    "All values are published on the JOLU website only; confirm all figures with JOLU before purchase.",
  quoteHp: undefined,
  quick: [
    { label: "OVERALL L × W × H", value: "5490×2430×3200 mm" },
    { label: "MASS", value: "7,050 / 7,800 kg" },
    { label: "WHEELBASE", value: "2,775 mm" },
    { label: "GROUND CLEARANCE", value: "490 mm" },
  ],
  kpis: [
    {
      id: "traction",
      label: "Calibrated traction",
      value: "61",
      unit: "kN",
      foot: "WEBSITE-PUBLISHED",
      status: "website-published",
      sources: WEB,
    },
    {
      id: "lifting",
      label: "Maximum lifting force",
      value: "90",
      unit: "kN",
      foot: "WEBSITE-PUBLISHED",
      status: "website-published",
      sources: WEB,
    },
    {
      id: "length",
      label: "Overall length",
      value: "5,490",
      unit: "mm",
      foot: "WEBSITE-PUBLISHED",
      status: "website-published",
      sources: WEB,
    },
  ],
  capabilities: [
    {
      id: "drivetrain",
      tag: "01 / DRIVETRAIN",
      title: "Clutch and fuel consumption",
      text: "Dry, independently operated double-action clutch, with a fuel consumption rate of ≤250 g/kW·h.",
      derivedFrom: ["clutch", "fuel"],
    },
    {
      id: "implements",
      tag: "02 / IMPLEMENT SUPPORT",
      title: "Hitch, hydraulics and PTO",
      text: "Class III three-point rear hitch, 90 kN maximum lifting force, three hydraulic valve groups and a 540/1000 rpm PTO.",
      derivedFrom: ["hitch", "lifting", "valves", "pto-speed"],
    },
    {
      id: "chassis",
      tag: "03 / CHASSIS AND CAB",
      title: "Cab and clearance",
      text: "Air-conditioned cab with 490 mm ground clearance and a 2,775 mm wheelbase.",
      derivedFrom: ["cab", "ground-clearance", "wheelbase"],
    },
  ],
  groups: [
    {
      id: "dimensions",
      title: "01 / DIMENSIONS AND MASS",
      rows: [
        { id: "dimensions", label: "Overall dimensions (L×W×H)", entries: same(C, "5490×2430×3200", "website-published", WEB, "mm") },
        { id: "wheelbase", label: "Wheelbase", entries: same(C, "2775", "website-published", WEB, "mm") },
        { id: "mass", label: "Minimum usable mass", entries: per(C, ["7050", "7800"], "website-published", WEB, "kg") },
        { id: "ground-clearance", label: "Ground clearance", entries: same(C, "490", "website-published", WEB, "mm") },
      ],
    },
    {
      id: "drivetrain",
      title: "02 / ENGINE-RELATED AND DRIVETRAIN",
      rows: [
        {
          id: "power",
          label: "Calibrated power",
          entries: [
            E("series", "132 / 147", "website-published", WEB, "kW (series-level pair; not per model)", "Published as a pair; the source does not attribute either figure to RG1804 or RG2004."),
            E("new2025", "132", "website-published", WEB, "kW", "Published under the column heading RG1804 (2025 New)."),
          ],
        },
        { id: "fuel", label: "Fuel consumption rate", entries: same(C, "≤250", "website-published", WEB, "g/kW·h") },
        { id: "clutch", label: "Clutch type", entries: same(C, "Dry, independently operated double action", "website-published", WEB) },
        { id: "tyres", label: "Tyre size (front / rear)", entries: same(C, "16.9-28 / 20.8-38", "website-published", WEB) },
      ],
    },
    {
      id: "hydraulics",
      title: "03 / HYDRAULICS, HITCH AND PTO",
      rows: [
        { id: "hydraulic-system", label: "Hydraulic system", entries: same(C, "Split-type lifting system", "website-published", WEB) },
        { id: "lifting", label: "Maximum lifting force", entries: same(C, "90", "website-published", WEB, "kN") },
        { id: "tillage", label: "Tillage control", entries: same(C, "Force-position integrated control", "website-published", WEB) },
        { id: "valves", label: "Hydraulic valves", entries: same(C, "3 groups", "website-published", WEB) },
        { id: "hitch", label: "Hitch", entries: same(C, "Three-point rear suspension, Class III", "website-published", WEB) },
        { id: "traction", label: "Calibrated traction", entries: same(C, "61", "website-published", WEB, "kN") },
        {
          id: "pto-power",
          label: "PTO power output",
          entries: [
            E("series", "113 / 126", "website-published", WEB, "kW (series-level pair; not per model)", "Published as a pair; the source does not attribute either figure to RG1804 or RG2004."),
            E("new2025", "126", "website-published", WEB, "kW", "Published under the column heading RG1804 (2025 New)."),
          ],
        },
        { id: "pto-speed", label: "PTO speed", entries: same(C, "540/1000", "website-published", WEB, "rpm") },
      ],
    },
    {
      id: "operator",
      title: "04 / OPERATOR",
      rows: [{ id: "cab", label: "Cab", entries: same(C, "Air-conditioned cab", "website-published", WEB) }],
    },
  ],
  standardEquipment: [
    { label: "Air-conditioned cab", rowId: "cab" },
    { label: "Three-point hitch, Class III", rowId: "hitch" },
    { label: "Three hydraulic valve groups", rowId: "valves" },
    { label: "540/1000 rpm PTO", rowId: "pto-speed" },
  ],
  optionalConfigurationNote: OPTIONAL_NOTE,
  dimensions: {
    envelopes: [{ label: "RG1804/2004", lengthMm: 5490, widthMm: 2430, heightMm: 3200, wheelbaseMm: 2775 }],
    groundClearanceMm: { series: 490, new2025: 490 },
    sources: WEB,
  },
  contact: SITE_CONTACT,
  confirmNote: CONFIRM_NOTE,
  sources: [webSource("13", "RG1804/2004"), SRC_CONTACT],
  excluded: [
    {
      id: "gearbox",
      label: "Gearbox (website table: '16F+16R / 24F+8R' and '24F+8R'; key specs: '16F+16R (24F+8R Optional)')",
      reason: "disputed",
      detail: "The website describes the gearbox inconsistently: a slash pair in the series column, a single 24F+8R in the 2025 New column, and 24F+8R as 'optional' in the summary. No gearbox row or number-of-gears figure is published until the manufacturer datasheet resolves it.",
    },
    {
      id: "power-attribution",
      label: "Per-model calibrated power and PTO power (RG1804 vs RG2004), and the 180–200 hp / 'up to 200 HP' headline",
      reason: "variant-unattributable",
      detail: "The series column publishes 132 / 147 kW and 113 / 126 kW as pairs without saying which belongs to RG1804 or RG2004. The pairs are shown as published; no per-model figure and no hp headline is derived or published.",
    },
    {
      id: "optional-fourth-valve",
      label: "'3 groups (optional 4)' hydraulic valves",
      reason: "unverified-claim",
      detail: "An optional-equipment claim published in one column only, with no supporting document. Only the three standard groups are published.",
    },
    {
      id: "emission",
      label: "Engine emission standard (website: National III)",
      reason: "unverified-claim",
      detail: "A compliance claim supported only by the website. Withheld until the manufacturer datasheet confirms it, consistent with the other website-only sheets.",
    },
    {
      id: "marketing-claims",
      label: "Website narrative claims (six-cylinder turbo engine, Bosch injection, 375 L tank, dual-joystick controls, forced lubrication, full hydraulic steering, synchronized braking, split-lift dual cylinders, onboard diagnostics)",
      reason: "unverified-claim",
      detail: "Narrative copy that is not present as table values and is not corroborated by another source; not reproduced as technical fact.",
    },
    PRICE_EXCLUSION,
    WARRANTY_CERT_EXCLUSION,
    ENGINE_DETAIL_EXCLUSION,
  ],
}

export default sheet

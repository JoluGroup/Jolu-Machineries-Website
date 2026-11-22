import type { SpecSheet } from "./types"
import {
  CONFIRM_NOTE, ENGINE_DETAIL_EXCLUSION, OPTIONAL_NOTE, PRICE_EXCLUSION, SITE_CONTACT, SRC_CONTACT,
  WARRANTY_CERT_EXCLUSION, same, webSource,
} from "./shared"

/**
 * Zoomlion RD504 Wheeled Tractor (M3-A5 Batch 2).
 *
 * RD504 appears in no JOLU document other than the website product data, so every published value is
 * WEBSITE-PUBLISHED. Nothing is corroborated and nothing is manufacturer-verified.
 *
 * Lifting capacity is published in KILOGRAMS ("1236 kg"), not kilonewtons. It is shown in the unit the source uses,
 * is not converted to kN, and is labelled so it cannot be read as a force rating.
 */
const WEB = ["web-products"]
const C = ["rd504"]

const sheet: SpecSheet = {
  slug: "zoomlion-rd504",
  reviewState: "preview",
  productName: "Zoomlion RD504 Wheeled Tractor",
  modelDesignation: "RD504",
  category: "Wheeled tractor",
  image: "@/assets/tractor-4.png",
  imageAlt: "Zoomlion RD504 wheeled tractor",
  imageFit: {
    scale: 1.1,
    subject: { left: 0.133, top: 0.164, right: 0.861, bottom: 0.82 },
    sourceWidthPx: 700,
    rationale: "Lower-resolution 700 × 700 px source; the tractor spans ~73% of its width. The enlargement is held to 110% so the image is not stretched further, and the whole machine stays inside the panel.",
  },
  doc: { code: "JM-RD504-DS", revision: "PREVIEW 00", issued: "2026-11" },
  variants: [{ id: "rd504", label: "RD504", short: "RD504", title: "RD504", kind: "single-machine" }],
  lede:
    "Published specifications for the Zoomlion RD504 wheeled tractor, supplied by JOLU Machineries. " +
    "All values are published on the JOLU website only and have not been verified against a manufacturer datasheet. Lifting capacity is shown in kilograms, as published. Confirm all figures with JOLU before purchase.",
  quoteHp: undefined,
  quick: [
    { label: "OVERALL L × W × H", value: "3654×1362×2620 mm" },
    { label: "WEIGHT", value: "1,900 kg" },
    { label: "WHEELBASE", value: "1,790 mm" },
    { label: "RATED POWER", value: "36.8 kW" },
  ],
  kpis: [
    {
      id: "rated-power",
      label: "Rated power",
      value: "36.8",
      unit: "kW",
      foot: "WEBSITE-PUBLISHED",
      status: "website-published",
      sources: WEB,
    },
    {
      id: "pto-power",
      label: "PTO output power",
      value: "30",
      unit: "kW",
      foot: "WEBSITE-PUBLISHED",
      status: "website-published",
      sources: WEB,
    },
    {
      id: "weight",
      label: "Weight",
      value: "1,900",
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
      title: "Gearbox and power",
      text: "8F+8R gearbox with a published rated power of 36.8 kW.",
      derivedFrom: ["gearbox", "rated-power"],
    },
    {
      id: "implements",
      tag: "02 / IMPLEMENT SUPPORT",
      title: "PTO and lifting",
      text: "30 kW PTO output at 540/720 rpm. Lifting capacity is published as 1,236 kg, a mass rating with no force equivalent stated.",
      derivedFrom: ["pto-power", "pto-speed", "lifting"],
    },
    {
      id: "chassis",
      tag: "03 / CHASSIS AND OPERATOR",
      title: "Operator station and clearance",
      text: "Safety shelf with 420 mm ground clearance and a 1,790 mm wheelbase.",
      derivedFrom: ["cab", "ground-clearance", "wheelbase"],
    },
  ],
  groups: [
    {
      id: "dimensions",
      title: "01 / DIMENSIONS AND MASS",
      rows: [
        { id: "dimensions", label: "Overall dimensions (L×W×H)", entries: same(C, "3654×1362×2620", "website-published", WEB, "mm") },
        { id: "wheelbase", label: "Wheelbase", entries: same(C, "1790", "website-published", WEB, "mm") },
        { id: "weight", label: "Weight", entries: same(C, "1900", "website-published", WEB, "kg") },
        { id: "ground-clearance", label: "Ground clearance", entries: same(C, "420", "website-published", WEB, "mm") },
      ],
    },
    {
      id: "drivetrain",
      title: "02 / ENGINE-RELATED AND DRIVETRAIN",
      rows: [
        { id: "rated-power", label: "Rated power", entries: same(C, "36.8", "website-published", WEB, "kW") },
        { id: "gearbox", label: "Gearbox", entries: same(C, "8F+8R", "website-published", WEB) },
        { id: "tyres", label: "Tyre size (front / rear)", entries: same(C, "8.3-20 / 12.4-28 or 8-18 / 13.6-26", "website-published", WEB) },
      ],
    },
    {
      id: "hydraulics",
      title: "03 / LIFTING AND PTO",
      rows: [
        {
          id: "lifting",
          label: "Max lifting capacity (published in kg)",
          entries: same(C, "1236", "website-published", WEB, "kg", "Published as a mass in kg. Not converted to kN: the source does not state the lift-point basis."),
        },
        { id: "pto-power", label: "PTO output power", entries: same(C, "30", "website-published", WEB, "kW") },
        { id: "pto-speed", label: "PTO speed", entries: same(C, "540/720", "website-published", WEB, "rpm") },
      ],
    },
    {
      id: "operator",
      title: "04 / OPERATOR",
      rows: [{ id: "cab", label: "Operator station", entries: same(C, "Safety shelf", "website-published", WEB) }],
    },
  ],
  standardEquipment: [
    { label: "Safety shelf", rowId: "cab" },
    { label: "8F+8R gearbox", rowId: "gearbox" },
    { label: "540/720 rpm PTO", rowId: "pto-speed" },
    { label: "30 kW PTO output", rowId: "pto-power" },
  ],
  optionalConfigurationNote: OPTIONAL_NOTE,
  dimensions: {
    envelopes: [{ label: "RD504", lengthMm: 3654, widthMm: 1362, heightMm: 2620, wheelbaseMm: 1790 }],
    groundClearanceMm: { rd504: 420 },
    sources: WEB,
  },
  contact: SITE_CONTACT,
  confirmNote: CONFIRM_NOTE,
  sources: [webSource("7", "RD504"), SRC_CONTACT],
  excluded: [
    {
      id: "lifting-kn",
      label: "Lifting capacity expressed in kilonewtons",
      reason: "not-supplied",
      detail: "The website publishes 'Max lifting capacity 1236 kg' only. A mass is not a force, and the lift-point distance needed for a valid conversion is not published, so no kN figure is derived. The kg value is shown exactly as published and labelled as such.",
    },
    {
      id: "emission",
      label: "Engine emission standard (website: National II)",
      reason: "unverified-claim",
      detail: "A compliance claim supported only by the website. Withheld until the manufacturer datasheet confirms it, consistent with the other website-only sheets.",
    },
    {
      id: "narrative-equipment",
      label: "Narrative equipment claims (9.5-inch dual-action dry clutch, dual output valves, 53 L fuel tank, imported gearbox seals, SMC body, adjustable rear track, shuttle shift)",
      reason: "unverified-claim",
      detail: "Present only in the advantages copy, not as table values, and not corroborated by another source. No clutch, valve or hitch row is published for RD504.",
    },
    {
      id: "engine-make",
      label: "Engine make named in the website narrative",
      reason: "unverified-claim",
      detail: "A brand statement in marketing copy, not a table value; no engine make is published.",
    },
    {
      id: "marketing-claims",
      label: "'Versatile and cost-effective', 'high torque reserve', 'compact and agile' and similar claims",
      reason: "unverified-claim",
      detail: "Marketing copy, not reproduced as technical fact.",
    },
    PRICE_EXCLUSION,
    WARRANTY_CERT_EXCLUSION,
    ENGINE_DETAIL_EXCLUSION,
  ],
}

export default sheet

import type { SpecSheet } from "./types"
import {
  CONFIRM_NOTE, ENGINE_DETAIL_EXCLUSION, OPTIONAL_NOTE, PRICE_EXCLUSION, SITE_CONTACT, SRC_CONTACT,
  WARRANTY_CERT_EXCLUSION, same, webSource,
} from "./shared"

/**
 * Zoomlion PG2004 Wheeled Tractor (M3-A4 Batch 1).
 *
 * PG2004 appears in no JOLU document other than the website product data, so every published value is
 * WEBSITE-PUBLISHED. Nothing is corroborated and nothing is manufacturer-verified.
 */
const WEB = ["web-products"]
const C = ["pg2004"]

const sheet: SpecSheet = {
  slug: "zoomlion-pg2004",
  reviewState: "preview",
  productName: "Zoomlion PG2004 Wheeled Tractor",
  modelDesignation: "PG2004",
  category: "Wheeled tractor",
  image: "@/assets/tractor-3.png",
  imageAlt: "Zoomlion PG2004 wheeled tractor",
  imageFit: {
    scale: 1.15,
    subject: { left: 0.216, top: 0.212, right: 0.779, bottom: 0.931 },
    sourceWidthPx: 700,
    rationale: "Tractor spans ~56% of a 700 px source; the enlargement is held to 115% so the lower-resolution image is not stretched further.",
  },
  doc: { code: "JM-PG2004-DS", revision: "PREVIEW 00", issued: "2026-11" },
  variants: [{ id: "pg2004", label: "PG2004", short: "PG2004", title: "PG2004", kind: "single-machine" }],
  lede:
    "Published specifications for the Zoomlion PG2004 wheeled tractor, supplied by JOLU Machineries. " +
    "All values are published on the JOLU website only and have not been verified against a manufacturer datasheet. Confirm all figures with JOLU before purchase.",
  quoteHp: undefined,
  quick: [
    { label: "OVERALL L × W × H", value: "5482×2317×3077 mm" },
    { label: "MASS", value: "7,272 kg" },
    { label: "RATED POWER", value: "147.5 kW" },
    { label: "TRACTION FORCE", value: "≥70 kN" },
  ],
  kpis: [
    {
      id: "rated-power",
      label: "Rated power",
      value: "147.5",
      unit: "kW",
      foot: "WEBSITE-PUBLISHED",
      status: "website-published",
      sources: WEB,
    },
    {
      id: "traction",
      label: "Traction force",
      value: "≥70",
      unit: "kN",
      foot: "WEBSITE-PUBLISHED",
      status: "website-published",
      sources: WEB,
    },
    {
      id: "mass",
      label: "Minimum operating mass",
      value: "7,272",
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
      text: "48F+24R gearbox with a multi plate wet clutch.",
      derivedFrom: ["gearbox", "clutch"],
    },
    {
      id: "implements",
      tag: "02 / IMPLEMENT SUPPORT",
      title: "Hitch, hydraulics and PTO",
      text: "Class III three-point rear hitch, ≥90 kN maximum lifting capacity, 160 L/min output flow and a 540/1000 rpm PTO.",
      derivedFrom: ["hitch", "lifting", "flow", "pto-speed"],
    },
    {
      id: "chassis",
      tag: "03 / CHASSIS AND CAB",
      title: "Cab and clearance",
      text: "Air-conditioned cab with 410 mm ground clearance and a 2,858 mm wheelbase.",
      derivedFrom: ["cab", "ground-clearance", "wheelbase"],
    },
  ],
  groups: [
    {
      id: "dimensions",
      title: "01 / DIMENSIONS AND MASS",
      rows: [
        { id: "dimensions", label: "Overall dimensions (L×W×H)", entries: same(C, "5482×2317×3077", "website-published", WEB, "mm") },
        { id: "wheelbase", label: "Wheelbase", entries: same(C, "2858", "website-published", WEB, "mm") },
        { id: "mass", label: "Minimum operating mass", entries: same(C, "7272", "website-published", WEB, "kg") },
        { id: "ground-clearance", label: "Ground clearance", entries: same(C, "410", "website-published", WEB, "mm") },
      ],
    },
    {
      id: "drivetrain",
      title: "02 / ENGINE-RELATED AND DRIVETRAIN",
      rows: [
        { id: "rated-power", label: "Rated power", entries: same(C, "147.5", "website-published", WEB, "kW") },
        { id: "clutch", label: "Clutch type", entries: same(C, "Multi plate wet", "website-published", WEB) },
        { id: "gearbox", label: "Gearbox", entries: same(C, "48F+24R", "website-published", WEB) },
        { id: "tyres", label: "Tyre size (front / rear)", entries: same(C, "420/85R30 & 520/85R42 or 540/65R28 & 650/65R38", "website-published", WEB) },
      ],
    },
    {
      id: "hydraulics",
      title: "03 / HYDRAULICS, HITCH AND PTO",
      rows: [
        { id: "hydraulic-system", label: "Lifting system", entries: same(C, "Split type", "website-published", WEB) },
        { id: "lifting", label: "Maximum lifting capacity", entries: same(C, "≥90", "website-published", WEB, "kN") },
        { id: "tillage", label: "Tillage control", entries: same(C, "Electrohydraulic control", "website-published", WEB) },
        { id: "valves", label: "Hydraulic output valve", entries: same(C, "Three position electro-hydraulic proportional multi-way valve", "website-published", WEB) },
        { id: "hitch", label: "Hitch", entries: same(C, "Three-point rear suspension, Class III", "website-published", WEB) },
        { id: "flow", label: "Output flow rate", entries: same(C, "160", "website-published", WEB, "L/min") },
        { id: "traction", label: "Traction force", entries: same(C, "≥70", "website-published", WEB, "kN") },
        { id: "pto-speed", label: "PTO speed", entries: same(C, "540/1000", "website-published", WEB, "rpm") },
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
    { label: "540/1000 rpm PTO", rowId: "pto-speed" },
  ],
  optionalConfigurationNote: OPTIONAL_NOTE,
  dimensions: {
    envelopes: [{ label: "PG2004", lengthMm: 5482, widthMm: 2317, heightMm: 3077, wheelbaseMm: 2858 }],
    groundClearanceMm: { pg2004: 410 },
    sources: WEB,
  },
  contact: SITE_CONTACT,
  confirmNote: CONFIRM_NOTE,
  sources: [webSource("6", "PG2004"), SRC_CONTACT],
  excluded: [
    {
      id: "emission",
      label: "Engine emission standard (website: National III)",
      reason: "unverified-claim",
      detail: "A compliance claim supported only by the website. Withheld until the manufacturer datasheet confirms it, consistent with the other website-only sheets.",
    },
    {
      id: "optional-gps",
      label: "'Optional GPS navigation and unmanned driving'",
      reason: "unverified-claim",
      detail: "An optional-equipment claim with no supporting document; no optional upgrades are published.",
    },
    {
      id: "marketing-claims",
      label: "Website narrative claims ('intelligent operation', 'top global components and sensors', 'brand-new design', 25% torque reserve, power reversing, load sensing, fault self-diagnosis, automatic PTO)",
      reason: "unverified-claim",
      detail: "Marketing copy not present as table values and not corroborated by another source; not reproduced as technical fact.",
    },
    {
      id: "fuel-consumption",
      label: "Fuel consumption rate",
      reason: "not-supplied",
      detail: "The PG2004 website table does not publish it, so no row is shown.",
    },
    PRICE_EXCLUSION,
    WARRANTY_CERT_EXCLUSION,
    ENGINE_DETAIL_EXCLUSION,
  ],
}

export default sheet

import type { SpecSheet } from "./types"
import {
  CONFIRM_NOTE, ENGINE_DETAIL_EXCLUSION, OPTIONAL_NOTE, PRICE_EXCLUSION, SITE_CONTACT, SRC_CONTACT,
  WARRANTY_CERT_EXCLUSION, same, webSource,
} from "./shared"

/**
 * Zoomlion DV3504 Wheeled Tractor (M3-A5 Batch 2).
 *
 * DV3504 appears in no JOLU document other than the website product data, so every published value is
 * WEBSITE-PUBLISHED. Nothing is corroborated and nothing is manufacturer-verified.
 *
 * Withheld: the website's powertrain description (a hybrid system), the "CVT with AMT" transmission terms, the
 * ground-clearance wording, the PTO speed range and the damper/coupling clutch entry. See `excluded`.
 */
const WEB = ["web-products"]
const C = ["dv3504"]

const sheet: SpecSheet = {
  slug: "zoomlion-dv3504-wheeled-tractor",
  reviewState: "preview",
  productName: "Zoomlion DV3504 Wheeled Tractor",
  modelDesignation: "DV3504",
  category: "Wheeled tractor",
  image: "@/assets/tractor-9.png",
  imageAlt: "Zoomlion DV3504 wheeled tractor",
  imageFit: {
    scale: 1,
    subject: { left: 0.074, top: 0.186, right: 0.963, bottom: 0.829 },
    sourceWidthPx: 700,
    rationale: "Lower-resolution 700 × 700 px source and the tractor already spans ~89% of its width, so it is shown at 100% (no enlargement, no crop) to keep the whole machine in the panel.",
  },
  doc: { code: "JM-DV3504-DS", revision: "PREVIEW 00", issued: "2026-11" },
  variants: [{ id: "dv3504", label: "DV3504", short: "DV3504", title: "DV3504", kind: "single-machine" }],
  lede:
    "Published specifications for the Zoomlion DV3504 wheeled tractor, supplied by JOLU Machineries. " +
    "All values are published on the JOLU website only and have not been verified against a manufacturer datasheet. Transmission, PTO-speed and ground-clearance details are withheld pending manufacturer confirmation. Confirm all figures with JOLU before purchase.",
  quoteHp: undefined,
  quick: [
    { label: "OVERALL L × W × H", value: "6446×3050×3450 mm" },
    { label: "MASS", value: "13,000 kg" },
    { label: "RATED POWER", value: "257.4 kW" },
    { label: "TRACTION FORCE", value: "≥113 kN" },
  ],
  kpis: [
    {
      id: "rated-power",
      label: "Rated power",
      value: "257.4",
      unit: "kW",
      foot: "WEBSITE-PUBLISHED",
      status: "website-published",
      sources: WEB,
    },
    {
      id: "traction",
      label: "Traction force",
      value: "≥113",
      unit: "kN",
      foot: "WEBSITE-PUBLISHED",
      status: "website-published",
      sources: WEB,
    },
    {
      id: "mass",
      label: "Minimum operating mass",
      value: "13,000",
      unit: "kg",
      foot: "WEBSITE-PUBLISHED",
      status: "website-published",
      sources: WEB,
    },
  ],
  capabilities: [
    {
      id: "power",
      tag: "01 / POWER AND MASS",
      title: "Rated power and mass",
      text: "257.4 kW rated power with a 13,000 kg minimum operating mass and ≥113 kN traction force.",
      derivedFrom: ["rated-power", "mass", "traction"],
    },
    {
      id: "implements",
      tag: "02 / IMPLEMENT SUPPORT",
      title: "Hitch and hydraulics",
      text: "Category 4N three-point rear hitch, ≥90 kN maximum lifting force, a split hydraulic system and a five-position proportional multi-way valve.",
      derivedFrom: ["hitch", "lifting", "hydraulic-system", "valves"],
    },
    {
      id: "chassis",
      tag: "03 / CHASSIS AND CAB",
      title: "Tyres and cab",
      text: "600/70R30 front and 710/70R42 rear tyres on a 3,100 mm wheelbase, with an air-conditioned pressure cabin.",
      derivedFrom: ["tyres", "wheelbase", "cab"],
    },
  ],
  groups: [
    {
      id: "dimensions",
      title: "01 / DIMENSIONS AND MASS",
      rows: [
        { id: "dimensions", label: "Overall dimensions (L×W×H)", entries: same(C, "6446×3050×3450", "website-published", WEB, "mm") },
        { id: "wheelbase", label: "Wheelbase", entries: same(C, "3100", "website-published", WEB, "mm") },
        { id: "mass", label: "Minimum operating mass", entries: same(C, "13000", "website-published", WEB, "kg") },
      ],
    },
    {
      id: "drivetrain",
      title: "02 / ENGINE AND RUNNING GEAR",
      rows: [
        { id: "rated-power", label: "Rated power", entries: same(C, "257.4", "website-published", WEB, "kW") },
        { id: "tyres", label: "Tyre size (front / rear)", entries: same(C, "600/70R30, 710/70R42", "website-published", WEB) },
      ],
    },
    {
      id: "hydraulics",
      title: "03 / HYDRAULICS AND HITCH",
      rows: [
        { id: "hydraulic-system", label: "Hydraulic system", entries: same(C, "Split type", "website-published", WEB) },
        { id: "lifting", label: "Maximum lifting force", entries: same(C, "≥90", "website-published", WEB, "kN") },
        { id: "tillage", label: "Tillage control", entries: same(C, "Electrohydraulic control", "website-published", WEB) },
        { id: "valves", label: "Hydraulic valves", entries: same(C, "Five-position electro-hydraulic proportional multi-way valve", "website-published", WEB) },
        { id: "hitch", label: "Hitch", entries: same(C, "Three-point rear suspension, Category 4N", "website-published", WEB) },
        { id: "flow", label: "Hydraulic output flow rate", entries: same(C, "120 / 227", "website-published", WEB, "L/min", "Published as the pair 120/227 L/min; the source does not say what each figure refers to.") },
        { id: "traction", label: "Traction force", entries: same(C, "≥113", "website-published", WEB, "kN") },
      ],
    },
    {
      id: "operator",
      title: "04 / OPERATOR",
      rows: [{ id: "cab", label: "Cab", entries: same(C, "Air-conditioned pressure cabin", "website-published", WEB, undefined, "Website table reads 'Air-conditioned intelligent pressure cabin'; the marketing adjective 'intelligent' is dropped.") }],
    },
  ],
  standardEquipment: [
    { label: "Air-conditioned pressure cabin", rowId: "cab" },
    { label: "Three-point hitch, Category 4N", rowId: "hitch" },
    { label: "Five-position proportional valve", rowId: "valves" },
    { label: "Electrohydraulic tillage control", rowId: "tillage" },
  ],
  optionalConfigurationNote: OPTIONAL_NOTE,
  dimensions: {
    envelopes: [{ label: "DV3504", lengthMm: 6446, widthMm: 3050, heightMm: 3450, wheelbaseMm: 3100 }],
    groundClearanceMm: {},
    sources: WEB,
  },
  contact: SITE_CONTACT,
  confirmNote: CONFIRM_NOTE,
  sources: [webSource("15", "DV3504"), SRC_CONTACT],
  excluded: [
    {
      id: "hybrid-system",
      label: "Hybrid-powertrain description (dual-motor coupling, generator-start, direct-drive motor, motor-driven PTO, 'hybrid tractor' wording)",
      reason: "unverified-claim",
      detail: "Present only in the website narrative; no table value, technical document or second source supports a hybrid system. The tractor is not described as hybrid anywhere on the sheet. Rated power is shown as the website table publishes it.",
    },
    {
      id: "transmission",
      label: "Gearbox 'CVT with AMT' and the 0–40 km/h stepless speed claim",
      reason: "disputed",
      detail: "The terms combine a continuously variable transmission with an automated manual transmission, which are different designs, and the source does not explain them. No gearbox row, gear count or speed range is published.",
    },
    {
      id: "clutch",
      label: "Clutch type 'Torsional Vibration Damper (Coupling)'",
      reason: "unverified-claim",
      detail: "A damper or coupling is not a clutch, and the entry belongs to the same unexplained drivetrain terminology as the transmission and hybrid claims. Withheld with them.",
    },
    {
      id: "ground-clearance",
      label: "Ground clearance '≥430 mm (Tilting traction)'",
      reason: "disputed",
      detail: "The qualifier 'Tilting traction' does not say at which condition the clearance applies, so the figure is ambiguous. No ground-clearance value is published and the diagram draws none.",
    },
    {
      id: "pto-speed",
      label: "PTO speed '0–1000 rpm'",
      reason: "disputed",
      detail: "A continuous range from 0 is unusual for a PTO and is not explained; other website sheets publish discrete PTO speeds. No PTO-speed row is published.",
    },
    {
      id: "emission",
      label: "Engine emission standard (website: National III)",
      reason: "unverified-claim",
      detail: "A compliance claim supported only by the website. Withheld until the manufacturer datasheet confirms it, consistent with the other website-only sheets.",
    },
    {
      id: "marketing-claims",
      label: "Website narrative claims (360° panoramic camera, intelligent pressure cabin functions, cold/warm storage box, rotatable air-suspension seat, ergonomic joystick, 'redefines comfort, safety and productivity', and the 'intelligent' adjective in the cab name)",
      reason: "unverified-claim",
      detail: "Marketing copy not present as table values and not corroborated by another source; not reproduced as technical fact.",
    },
    PRICE_EXCLUSION,
    WARRANTY_CERT_EXCLUSION,
    ENGINE_DETAIL_EXCLUSION,
  ],
}

export default sheet

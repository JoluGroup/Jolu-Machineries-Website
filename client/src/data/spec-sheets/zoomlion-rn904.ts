import type { SpecSheet } from "./types"
import {
  CONFIRM_NOTE, ENGINE_DETAIL_EXCLUSION, OPTIONAL_NOTE, PRICE_EXCLUSION, SITE_CONTACT, SRC_CATALOGUE, SRC_CONTACT,
  WARRANTY_CERT_EXCLUSION, E, same, webSource,
} from "./shared"

/**
 * Zoomlion RN904/1104 Wheeled Tractor (M3-A5 Batch 2).
 *
 * Columns are the two PUBLISHED CONFIGURATIONS the website table prints: "RN904Pro/RN1104Pro" and
 * "RN904/RN1104 (2025 New)". The sources do not publish separate RN904 and RN1104 figures, so none are shown.
 * The JOLU catalogue (page 2) lists only "RN904 (PRO)"; it is not treated as corroborating the combined columns,
 * so every published value is WEBSITE-PUBLISHED. Nothing is manufacturer-verified.
 *
 * Traction is withheld: website Pro ≥25 kN, website 2025 New 50 kN and catalogue RN904 (PRO) 34.5 kN disagree.
 */
const WEB = ["web-products"]
const C = ["pro", "new2025"]

const sheet: SpecSheet = {
  slug: "zoomlion-rn904",
  reviewState: "preview",
  productName: "Zoomlion RN904/1104 Wheeled Tractor",
  modelDesignation: "RN904/1104",
  category: "Wheeled tractor",
  image: "@/assets/tractor-1.png",
  imageAlt: "Zoomlion RN904/1104 wheeled tractor",
  imageFit: {
    scale: 1.2,
    subject: { left: 0.228, top: 0.032, right: 0.833, bottom: 0.958 },
    sourceWidthPx: 990,
    rationale: "Tractor spans ~61% of the 990 px source; 120% clips only empty margin and keeps the machine fully inside the panel.",
  },
  doc: { code: "JM-RN904-1104-DS", revision: "PREVIEW 00", issued: "2026-11" },
  variants: [
    { id: "pro", label: "RN904Pro/RN1104Pro", short: "PRO", title: "Pro configuration", kind: "published-configuration" },
    { id: "new2025", label: "RN904/RN1104 (2025 New)", short: "2025 NEW", title: "2025 New configuration", kind: "published-configuration" },
  ],
  lede:
    "Published specifications for the Zoomlion RN904/1104 wheeled tractor, supplied by JOLU Machineries. " +
    "Values are shown for each published configuration; the sources do not publish separate RN904 and RN1104 figures, and the power figure is published as a pair. " +
    "Traction force is withheld because the published figures disagree. Confirm all figures with JOLU before purchase.",
  quoteHp: undefined,
  quick: [
    { label: "OVERALL L × W × H", value: "4600×2095×2950 mm" },
    { label: "MASS", value: "4,300 kg" },
    { label: "WHEELBASE", value: "2,350 mm" },
    { label: "HYDRAULIC OUTPUT", value: "3 groups" },
  ],
  kpis: [
    {
      id: "wheelbase",
      label: "Wheelbase",
      value: "2,350",
      unit: "mm",
      foot: "WEBSITE-PUBLISHED",
      status: "website-published",
      sources: WEB,
    },
    {
      id: "mass",
      label: "Minimum operating mass",
      value: "4,300",
      unit: "kg",
      foot: "WEBSITE-PUBLISHED",
      status: "website-published",
      sources: WEB,
    },
    {
      id: "length",
      label: "Overall length",
      value: "4,600",
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
      title: "Gears and tyres",
      text: "16F+8R (Pro) or 12F+12R (2025 New) gears, on 12.4-24 front and 16.9-34 rear tyres.",
      derivedFrom: ["gears", "tyres"],
    },
    {
      id: "implements",
      tag: "02 / IMPLEMENT SUPPORT",
      title: "Hydraulics and tillage control",
      text: "Three hydraulic output groups, with position adjustment and floating control (Pro) or draft control (2025 New).",
      derivedFrom: ["hydraulic-output", "tillage"],
    },
    {
      id: "chassis",
      tag: "03 / CHASSIS",
      title: "Size and mass",
      text: "4,600 mm overall length on a 2,350 mm wheelbase, with a 4,300 kg minimum operating mass.",
      derivedFrom: ["dimensions", "wheelbase", "mass"],
    },
  ],
  groups: [
    {
      id: "dimensions",
      title: "01 / DIMENSIONS AND MASS",
      rows: [
        { id: "dimensions", label: "Overall dimensions (L×W×H)", entries: same(C, "4600×2095×2950", "website-published", WEB, "mm") },
        { id: "wheelbase", label: "Wheelbase", entries: same(C, "2350", "website-published", WEB, "mm") },
        { id: "mass", label: "Minimum operating mass", entries: same(C, "4300", "website-published", WEB, "kg") },
      ],
    },
    {
      id: "drivetrain",
      title: "02 / ENGINE-RELATED AND DRIVETRAIN",
      rows: [
        {
          id: "power",
          label: "Calibration power",
          entries: same(C, "67 / 81", "website-published", WEB, "kW (series-level pair; not per model)", "Published as a pair for the series; the source does not attribute either figure to RN904 or RN1104."),
        },
        { id: "gears", label: "Number of gears", entries: [E("pro", "16F + 8R", "website-published", WEB), E("new2025", "12F + 12R", "website-published", WEB)] },
        { id: "tyres", label: "Tyre size (front / rear)", entries: same(C, "12.4-24 / 16.9-34", "website-published", WEB) },
      ],
    },
    {
      id: "hydraulics",
      title: "03 / HYDRAULICS AND CONTROL",
      rows: [
        { id: "hydraulic-output", label: "Hydraulic output", entries: same(C, "3 groups", "website-published", WEB) },
        {
          id: "tillage",
          label: "Tillage depth control",
          entries: [
            E("pro", "Position adjustment and floating control", "website-published", WEB),
            E("new2025", "Draft control", "website-published", WEB),
          ],
        },
      ],
    },
  ],
  standardEquipment: [
    { label: "Three hydraulic output groups", rowId: "hydraulic-output" },
    { label: "Tyres 12.4-24 / 16.9-34", rowId: "tyres" },
  ],
  optionalConfigurationNote: OPTIONAL_NOTE,
  dimensions: {
    envelopes: [{ label: "RN904/1104", lengthMm: 4600, widthMm: 2095, heightMm: 2950, wheelbaseMm: 2350 }],
    groundClearanceMm: {},
    sources: WEB,
  },
  contact: SITE_CONTACT,
  confirmNote: CONFIRM_NOTE,
  sources: [webSource("1", "RN904/1104"), SRC_CATALOGUE, SRC_CONTACT],
  excluded: [
    {
      id: "traction",
      label: "Pull / traction force: website Pro '≥25', website 2025 New '50', JOLU catalogue RN904 (PRO) '34.5 kN'",
      reason: "disputed",
      detail: "Three figures that disagree (website Pro column ≥25 and 2025 New column 50, both unitless in the table; Product Catalogue page 2, Product Features block, 34.5 kN for RN904 (PRO)). No source is preferred over another, so no traction figure and no row is published until the manufacturer datasheet resolves it.",
    },
    {
      id: "emission",
      label: "Engine emission standard (Product Catalogue page 2: RN904 (PRO) National III; no website value)",
      reason: "unverified-claim",
      detail: "Supported by a single JOLU document for one named model only, and not stated on the website, so it is not corroborated for the combined configurations. Withheld.",
    },
    {
      id: "model-split",
      label: "Separate RN904 and RN1104 values (power pair 67 / 81 kW, 90–110 hp headline, catalogue 90 HP for RN904 (PRO))",
      reason: "variant-unattributable",
      detail: "No source says which figure of a pair belongs to RN904 or RN1104. The pair is shown as published; no per-model figure and no hp headline is derived or published.",
    },
    {
      id: "narrative-equipment",
      label: "Narrative equipment claims (4-pillar air-conditioned cab, 150 L fuel tank, 4.3-inch digital instrument panel, imported friction clutch, plug-in parts, low-temperature battery)",
      reason: "unverified-claim",
      detail: "Present only in the advantages copy, not as table values for either configuration and not corroborated. No cab, clutch or fuel-tank row is published.",
    },
    {
      id: "marketing-claims",
      label: "'High-efficiency engine', 'strong pressure lifter for composite machinery', 'quality transmission and hydraulic oil' and similar claims",
      reason: "unverified-claim",
      detail: "Marketing copy, not reproduced as technical fact.",
    },
    PRICE_EXCLUSION,
    WARRANTY_CERT_EXCLUSION,
    ENGINE_DETAIL_EXCLUSION,
  ],
}

export default sheet

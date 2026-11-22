import type { SpecEntry, SpecSheet, PublishableStatus } from "./types"

/**
 * Zoomlion RS1304/1604 Wheeled Tractor: M3-A2 pilot data.
 *
 * Sources
 *  - WEB  : JOLU website product data (client/src/data/products.ts, product id 12, spec table).
 *  - PROF : JOLU Company Profile PDF, page 6 (public/lovable-uploads/docs/company-profile.pdf).
 *           A JOLU document, NOT a manufacturer datasheet.
 *  No value here is manufacturer-verified yet.
 *
 * Configurations are the two columns the sources publish: "RS1304/1604" and "RS1304/1604 (2025 New)".
 * Figures are published per column for the series; separate RS1304 and RS1604 figures are not
 * published for most values, so anything that would need that split is in `excluded`.
 */

const WEB = ["web-products"]
const BOTH = ["web-products", "company-profile-p6"]

const std = (value: string, status: PublishableStatus, sources: string[], unit?: string): SpecEntry => ({
  variant: "standard",
  value,
  unit,
  status,
  sources,
})
const nw = (value: string, status: PublishableStatus, sources: string[], unit?: string): SpecEntry => ({
  variant: "new2025",
  value,
  unit,
  status,
  sources,
})
/** Same value in both published configuration columns. */
const both = (value: string, status: PublishableStatus, sources: string[], unit?: string): SpecEntry[] => [
  std(value, status, sources, unit),
  nw(value, status, sources, unit),
]

const sheet: SpecSheet = {
  slug: "zoomlion-rs1304-1604",
  reviewState: "pilot-preview",
  productName: "Zoomlion RS1304/1604 Wheeled Tractor",
  modelDesignation: "RS1304/1604",
  category: "Wheeled tractor",
  image: "@/assets/tractor-7.png",
  imageAlt: "Zoomlion RS1304/1604 wheeled tractor",
  imageFit: {
    scale: 1.2,
    subject: { left: 0.181, top: 0.039, right: 0.792, bottom: 0.953 },
    sourceWidthPx: 990,
    rationale: "Tractor spans ~61% of the source width; 120% clips only empty margin (approved M3-A2 pilot setting).",
  },
  quoteHp: "130–160 hp",
  quick: [
    { label: "OVERALL L × W × H", value: "5200×2435×3250 mm" },
    { label: "MASS · STANDARD", value: "5,810 kg" },
    { label: "MASS · 2025 NEW", value: "6,500 kg" },
    { label: "POWER RANGE", value: "130–160 hp" },
  ],
  doc: { code: "JM-RS1304-1604-DS", revision: "PILOT 00", issued: "2026-11" },
  variants: [
    { id: "standard", label: "RS1304/1604", short: "STANDARD", title: "Standard configuration", kind: "published-configuration" },
    { id: "new2025", label: "RS1304/1604 (2025 New)", short: "2025 NEW", title: "2025 New configuration", kind: "published-configuration" },
  ],
  lede:
    "Published specifications for the Zoomlion RS1304/1604 wheeled tractor, supplied by JOLU Machineries. " +
    "Values are shown for each published configuration; the sources do not publish separate RS1304 and RS1604 figures. Confirm all figures with JOLU before purchase.",
  kpis: [
    {
      id: "power-range",
      label: "Engine power range (series)",
      value: "130–160",
      unit: "hp",
      foot: "WEBSITE-PUBLISHED · SERIES RANGE",
      status: "website-published",
      sources: WEB,
    },
    {
      id: "traction",
      label: "Calibrated traction",
      value: "51",
      unit: "kN",
      foot: "CORROBORATED · BOTH CONFIGURATIONS",
      status: "corroborated",
      sources: BOTH,
    },
    {
      id: "mass",
      label: "Minimum operating mass",
      value: "5,810 / 6,500",
      unit: "kg",
      foot: "CORROBORATED · STANDARD / 2025 NEW",
      status: "corroborated",
      sources: BOTH,
    },
  ],
  capabilities: [
    {
      id: "drivetrain",
      tag: "01 / DRIVETRAIN",
      title: "Gearbox and clutch",
      text:
        "16F+8R gearbox in the standard configuration and 24F+8R in the 2025 New configuration, with a dry, independently operated double-action clutch.",
      derivedFrom: ["gearbox", "clutch"],
    },
    {
      id: "implements",
      tag: "02 / IMPLEMENT SUPPORT",
      title: "Hitch, hydraulics and PTO",
      text:
        "Class III three-point rear hitch, three hydraulic valve groups and a 540/1000 rpm PTO for mounted and driven implements.",
      derivedFrom: ["hitch", "valves", "pto-speed"],
    },
    {
      id: "chassis",
      tag: "03 / CHASSIS AND CAB",
      title: "Cab, tyres and clearance",
      text:
        "Air-conditioned cab on 14.9-26 front and 18.4-38 rear tyres, with 450 mm (standard) or 490 mm (2025 New) ground clearance.",
      derivedFrom: ["cab", "tyres", "ground-clearance"],
    },
  ],
  groups: [
    {
      id: "dimensions",
      title: "01 / DIMENSIONS AND MASS",
      rows: [
        { id: "dimensions", label: "Overall dimensions (L×W×H)", entries: both("5200×2435×3250", "corroborated", BOTH, "mm") },
        { id: "wheelbase", label: "Wheelbase", entries: both("2640", "corroborated", BOTH, "mm") },
        {
          id: "mass",
          label: "Minimum operating mass",
          entries: [std("5810", "corroborated", BOTH, "kg"), nw("6500", "corroborated", BOTH, "kg")],
        },
        {
          id: "ground-clearance",
          label: "Ground clearance",
          entries: [std("450", "corroborated", BOTH, "mm"), nw("490", "corroborated", BOTH, "mm")],
        },
      ],
    },
    {
      id: "drivetrain",
      title: "02 / ENGINE-RELATED AND DRIVETRAIN",
      rows: [
        { id: "fuel", label: "Fuel consumption rate", entries: both("≤250", "corroborated", BOTH, "g/kW·h") },
        {
          id: "gearbox",
          label: "Gearbox",
          entries: [std("16F+8R", "corroborated", BOTH), nw("24F+8R", "corroborated", BOTH)],
        },
        {
          id: "clutch",
          label: "Clutch type",
          entries: both("Dry, independently operated double action", "website-published", WEB),
        },
        { id: "tyres", label: "Tyre size (front / rear)", entries: both("14.9-26 / 18.4-38", "website-published", WEB) },
      ],
    },
    {
      id: "hydraulics",
      title: "03 / HYDRAULICS, HITCH AND PTO",
      rows: [
        {
          id: "hydraulic-system",
          label: "Hydraulic system",
          entries: both("Lifting device with separated units", "website-published", WEB),
        },
        {
          id: "tillage",
          label: "Tillage control",
          entries: [
            std("Position control", "website-published", WEB),
            nw("Draft and position control (electro-hydraulic)", "website-published", WEB),
          ],
        },
        { id: "valves", label: "Hydraulic valves", entries: both("3 groups", "website-published", WEB) },
        { id: "hitch", label: "Hitch", entries: both("Three-point rear suspension, Class III", "website-published", WEB) },
        { id: "traction", label: "Calibrated traction", entries: both("51", "corroborated", BOTH, "kN") },
        { id: "pto-speed", label: "PTO speed", entries: both("540/1000", "corroborated", BOTH, "rpm") },
      ],
    },
    {
      id: "operator",
      title: "04 / OPERATOR",
      rows: [{ id: "cab", label: "Cab", entries: both("Air-conditioned cab", "website-published", WEB) }],
    },
  ],
  standardEquipment: [
    { label: "Air-conditioned cab", rowId: "cab" },
    { label: "Three-point rear hitch, Class III", rowId: "hitch" },
    { label: "Three hydraulic valve groups", rowId: "valves" },
    { label: "540/1000 rpm power take-off", rowId: "pto-speed" },
  ],
  optionalConfigurationNote:
    "No optional configurations have been verified for this machine. Ask JOLU Machineries for available options.",
  dimensions: {
    envelopes: [{ label: "RS1304/1604", lengthMm: 5200, widthMm: 2435, heightMm: 3250, wheelbaseMm: 2640 }],
    groundClearanceMm: { standard: 450, new2025: 490 },
    sources: BOTH,
  },
  contact: {
    phones: ["+254 705 038 679", "0743 682 700"],
    email: "info@jolumachineries.com",
    offices: ["Head Office: Thome, Nairobi, Kenya", "Regional Office and Showroom: West Road, Nakuru, Kenya"],
    sources: ["web-site-contact"],
  },
  confirmNote:
    "Published specifications are supplied for guidance and may change. Please confirm all figures, configuration and availability with JOLU Machineries before purchase.",
  sources: [
    {
      id: "web-products",
      label: "JOLU website product data (product 12 specification table)",
      kind: "website",
      note: "client/src/data/products.ts",
    },
    {
      id: "company-profile-p6",
      label: "JOLU Company Profile PDF, page 6",
      kind: "jolu-document",
      note: "A JOLU document, not a manufacturer datasheet.",
    },
    {
      id: "web-site-contact",
      label: "JOLU website header and footer contact details",
      kind: "website",
      note: "client/src/components/Header.tsx, Footer.tsx",
    },
  ],
  excluded: [
    {
      id: "engine-emission",
      label: "Engine emission classification",
      reason: "disputed",
      detail: "Website says National III; Company Profile page 6 says National II. Not published until resolved against the manufacturer datasheet.",
    },
    {
      id: "max-lifting-force",
      label: "Maximum lifting force",
      reason: "disputed",
      detail: "Website gives 28200 kg @ 610 mm; Company Profile gives 28200 kN @ 610 mm. Unit conflict; not published.",
    },
    {
      id: "rated-power",
      label: "Rated / calibrated power (95.5 / 117.6 kW)",
      reason: "variant-unattributable",
      detail: "Sources list two values without stating which belongs to RS1304 and which to RS1604. Only the 130–160 hp series range is shown.",
    },
    {
      id: "pto-power",
      label: "PTO power output (85 / 105 kW)",
      reason: "variant-unattributable",
      detail: "Two values with no stated per-model attribution.",
    },
    {
      id: "marketing-claims",
      label: "Website narrative claims (engine layout, fuel system, cab brand, electronics, advantages list)",
      reason: "unverified-claim",
      detail: "Marketing copy not corroborated by another source; not reproduced as technical fact.",
    },
    {
      id: "optional-gearbox",
      label: "24F+8R described as 'optional'",
      reason: "unverified-claim",
      detail: "The website key-spec line calls 24F+8R optional, while the table presents it as the 2025 New configuration. Shown only in the 2025 New configuration.",
    },
    {
      id: "price",
      label: "Prices",
      reason: "not-supplied",
      detail: "Prices are not published on specification sheets.",
    },
    {
      id: "warranty-certifications",
      label: "Warranty terms and ISO / CE certifications",
      reason: "not-supplied",
      detail: "No verified terms or certificates supplied.",
    },
    {
      id: "engine-details",
      label: "Engine make, displacement, torque, tank capacities, speeds",
      reason: "not-supplied",
      detail: "Not present in any JOLU source reviewed.",
    },
  ],
}

export default sheet

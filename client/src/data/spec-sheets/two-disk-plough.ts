import type { SourceRef, SpecSheet } from "./types"
import { CONFIRM_NOTE, OPTIONAL_NOTE, PRICE_EXCLUSION, SITE_CONTACT, SRC_CONTACT, WARRANTY_CERT_EXCLUSION, same, webSource } from "./shared"

/**
 * 2 Disk Plough (M3-A7B): the second agricultural-implement sheet, on the approved one-page "implement" layout.
 *
 * Product record: client/src/data/products.ts, product id 17, slug "implements-set" (the owner approved retaining this
 * slug for the current phase). Every displayed value is WEBSITE-PUBLISHED only. The JOLU Product Catalogue and Company
 * Profile do not list a 2-disc plough, so nothing here is corroborated and nothing is manufacturer-verified.
 *
 * Displayed: number of discs, disc diameter, working width, depth of cut (published as "Up to 25 cm").
 * Withheld, with the original evidence preserved in `excluded`: tractor power (the website contradicts itself), weight
 * (suspect), mounting configuration, hitch category, overall dimensions and unsupported marketing claims.
 */
const WEB = ["web-products"]
const C = ["plough2"]
const w = (v: string, unit?: string, note?: string) => same(C, v, "website-published", WEB, unit, note)

const SRC_CARD: SourceRef = {
  id: "web-catalogue-card",
  label: "JOLU website catalogue card (product 7, 2 Disk Plough)",
  kind: "website",
  note: "client/src/components/ProductsSection.tsx. Used only to preserve the card's tractor-power wording as excluded evidence; no displayed value cites it.",
}

const SRC_CATALOGUE_ABSENT: SourceRef = {
  id: "catalogue-implements-no-2-disc",
  label: "JOLU Product Catalogue (new-product-catalogue.pdf) page 2 Implements block, and Company Profile (company-profile.pdf) PDF page 6 'Farming Implements'",
  kind: "jolu-document",
  note: "JOLU documents, not manufacturer datasheets. They show a 3-disc and an advanced 5-disc plough, harrows and bowsers as photographs with captions; no 2-disc plough is listed and no technical values are given. They do not corroborate this product or any of its values.",
}

const sheet: SpecSheet = {
  slug: "implements-set",
  machine: "implement",
  reviewState: "preview",
  productName: "2 Disk Plough",
  modelDesignation: "2 Disk Plough",
  category: "Agricultural implement · disc plough",
  image: "@/assets/twodiskplough.png",
  imageAlt: "Red two-disc plough with two black discs and a rear land wheel",
  imageFit: {
    scale: 1,
    subject: { left: 0.111, top: 0.105, right: 0.889, bottom: 0.887 },
    sourceWidthPx: 1000,
    rationale: "1000 × 1110 px source; the whole implement is visible with a clear margin on every side and fills ~78% of the width and height, so it is shown at 100%: no enlargement, no crop and the aspect ratio is preserved.",
  },
  heroHeightMm: 100,
  doc: { code: "JM-2DISK-PLOUGH-DS", revision: "PREVIEW 00", issued: "2026-11" },
  variants: [{ id: "plough2", label: "2 Disk Plough", short: "2 Disk", title: "2 Disk Plough", kind: "single-machine" }],
  lede:
    "A two-disc plough for initial soil breaking and turning. " +
    "All values are published on the JOLU website only and have not been verified against a manufacturer datasheet. " +
    "Depth of cut is published as an upper limit. Confirm all figures, including the tractor requirement, with JOLU before purchase.",
  quoteHp: undefined,
  quick: [],
  kpis: [
    { id: "discs", label: "Number of discs", value: "2", unit: "discs", foot: "WEBSITE-PUBLISHED", status: "website-published", sources: WEB },
    { id: "disc-diameter", label: "Disc diameter", value: "660", unit: "mm", foot: "WEBSITE-PUBLISHED", status: "website-published", sources: WEB },
    { id: "width", label: "Working width", value: "0.6–0.8", unit: "m", foot: "WEBSITE-PUBLISHED", status: "website-published", sources: WEB },
  ],
  capabilities: [],
  groups: [
    {
      id: "implement",
      title: "01 / IMPLEMENT",
      rows: [
        { id: "discs", label: "Number of discs", entries: w("2") },
        { id: "disc-diameter", label: "Disc diameter", entries: w("660", "mm (26 inches)") },
        { id: "working-width", label: "Working width", entries: w("0.6–0.8", "m", "Published as '0.6 – 0.8 m' (key-spec card); not converted.") },
        { id: "depth-of-cut", label: "Depth of cut", entries: w("Up to 25", "cm", "Published as 'Up to 25 cm' (key-spec card and catalogue card); an upper limit, not a fixed or typical depth.") },
      ],
    },
  ],
  standardEquipment: [],
  optionalConfigurationNote: OPTIONAL_NOTE,
  notPublished: [
    { label: "Tractor power requirement (to be confirmed)", excludedId: "tractor-power" },
    { label: "Weight (to be confirmed)", excludedId: "weight" },
    { label: "Hitch category", excludedId: "hitch-category" },
    { label: "Mounting specification", excludedId: "mounting-configuration" },
    { label: "Overall dimensions", excludedId: "overall-dimensions" },
  ],
  sourceStatement:
    "Technical values: JOLU website product data only. The JOLU Product Catalogue does not corroborate this implement. No value has been verified against a manufacturer datasheet.",
  contact: SITE_CONTACT,
  confirmNote: CONFIRM_NOTE,
  sources: [webSource("17", "2 Disk Plough"), SRC_CARD, SRC_CATALOGUE_ABSENT, SRC_CONTACT],
  excluded: [
    {
      id: "tractor-power",
      label: "Tractor horsepower requirement",
      reason: "disputed",
      detail:
        "The website gives two incompatible requirements for this product: an upper limit of 60 HP in the key-spec card and catalogue card, and a 50–120 HP range in the specification table. No source or evidence selects one, so neither is displayed and none is inferred. Both original values are preserved here.",
      evidence: [
        { value: "60 HP and Below Tractors", location: "client/src/data/products.ts, product id 17 (implements-set), keySpecs 'Compatibility'" },
        { value: "Compatible with 60 HP and Below Tractors", location: "client/src/components/ProductsSection.tsx, catalogue card id 7 (implements-set), 'horsepower'" },
        { value: "50–120 HP", location: "client/src/data/products.ts, product id 17 (implements-set), specTable row 'Tractor Power'" },
      ],
    },
    {
      id: "weight",
      label: "Weight 'Approx. 320–400 kg' (website specification table)",
      reason: "unverified-claim",
      detail:
        "Withheld as questionable: it appears only in the specification table, its basis is not stated, and it is not consistent with the same website's 3-Disk Plough (Approx. 320–350 kg), which has three discs of the same 660 mm diameter and a wider working width (90–110 cm). The lighter, narrower two-disc implement should not be the heavier one without evidence. The original approximate value is preserved.",
      evidence: [{ value: "Approx. 320–400 kg", location: "client/src/data/products.ts, product id 17 (implements-set), specTable row 'Weight'" }],
    },
    {
      id: "mounting-configuration",
      label: "Mounting configuration (mounted, semi-mounted or trailed; linkage and attachment)",
      reason: "unverified-claim",
      detail:
        "The website says only 'Easy attachment and smooth operation with tractors' and 'Easy tractor attachment'. No mounting type, attachment points or linkage geometry is published, and none is inferred from the photograph.",
      evidence: [
        { value: "Easy attachment and smooth operation with tractors", location: "client/src/data/products.ts, product id 17, advantages" },
        { value: "Easy tractor attachment", location: "client/src/components/ProductsSection.tsx, catalogue card id 7, features" },
      ],
    },
    {
      id: "hitch-category",
      label: "Hitch category",
      reason: "not-supplied",
      detail: "No source states a hitch or linkage category for this plough, and none is inferred.",
    },
    {
      id: "overall-dimensions",
      label: "Overall dimensions (L×W×H)",
      reason: "not-supplied",
      detail: "No overall length, width or height is published. None is invented and no dimension drawing is shown. 'Working width' is a different measurement and is not used as an overall dimension.",
    },
    {
      id: "operating-characteristics",
      label: "Operating characteristics and performance claims ('strong penetration for hard and dry soils', 'breaks clods and buries weeds effectively', 'smooth operation', 'ideal for tough soils and virgin land', 'built to handle tough conditions')",
      reason: "unverified-claim",
      detail: "Marketing copy on the website, not a measured specification, with no supporting document. No penetration, clod-breaking, speed or field-capacity figure is published, so none is shown.",
    },
    {
      id: "materials-and-durability",
      label: "Materials and durability claims ('2 high-strength, heat-treated steel discs', 'strong build', 'durable frame', 'low maintenance, long service life')",
      reason: "unverified-claim",
      detail: "Marketing copy with no material specification, heat-treatment standard or service-life evidence in any JOLU source reviewed. Not reproduced as technical fact.",
      evidence: [{ value: "2 high-strength, heat-treated steel discs", location: "client/src/data/products.ts, product id 17 (implements-set), keySpecs 'Discs'" }],
    },
    PRICE_EXCLUSION,
    WARRANTY_CERT_EXCLUSION,
  ],
}

export default sheet

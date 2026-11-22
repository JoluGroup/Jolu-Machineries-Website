import type { SourceRef, SpecSheet } from "./types"
import { CONFIRM_NOTE, OPTIONAL_NOTE, PRICE_EXCLUSION, SITE_CONTACT, SRC_CONTACT, WARRANTY_CERT_EXCLUSION, same, webSource } from "./shared"

/**
 * 3-Disk Plough (M3-A7A): the first agricultural-implement sheet, on the one-page "implement" layout.
 *
 * Every technical value is WEBSITE-PUBLISHED only (client/src/data/products.ts, product 3). The JOLU Product Catalogue and
 * Company Profile list a "3 Disc Mounted Disc Plough" as a photograph with a caption and no values; they support the
 * designation and the existence of the product, and corroborate no value. Nothing is manufacturer-verified.
 *
 * Ranges and approximate values are shown exactly as published (no conversion, no rounding, no "exact" promise).
 * `quick`, `capabilities` and `standardEquipment` are intentionally empty: the one-page layout does not use them.
 */
const WEB = ["web-products"]
const C = ["plough3"]
const w = (v: string, unit?: string, note?: string) => same(C, v, "website-published", WEB, unit, note)

const SRC_CATALOGUE_CAPTION: SourceRef = {
  id: "catalogue-p2-implements",
  label: "JOLU Product Catalogue (new-product-catalogue.pdf), page 2, Implements block, caption '3 Disc Mounted Disc Plough'",
  kind: "jolu-document",
  note: "A JOLU document, not a manufacturer datasheet. A photograph with a caption and no technical values; it supports the designation only. Prices on the page are never reproduced.",
}

const SRC_PROFILE_FARMING_IMPLEMENTS: SourceRef = {
  id: "company-profile-p6-implements",
  label: "JOLU Company Profile (company-profile.pdf), PDF page 6, 'Farming Implements' captions",
  kind: "jolu-document",
  note: "A JOLU document, not a manufacturer datasheet. Repeats the caption '3 Disc Mounted Disc Plough' beside a photograph; no technical values.",
}

const sheet: SpecSheet = {
  slug: "3-disk-plough",
  machine: "implement",
  reviewState: "preview",
  productName: "3-Disk Plough",
  modelDesignation: "3-Disk Plough",
  category: "Agricultural implement · disc plough",
  image: "@/assets/threeDiskPlough.webp",
  imageAlt: "Red three-disc plough with three black discs and a rear land wheel",
  imageFit: {
    scale: 1,
    subject: { left: 0.029, top: 0.009, right: 0.827, bottom: 0.98 },
    sourceWidthPx: 700,
    rationale: "700 × 460 px source; the whole implement is visible and fills ~80% of the width and ~97% of the height, so it is shown at 100%: no enlargement, no crop and the aspect ratio is preserved.",
  },
  doc: { code: "JM-3DISK-PLOUGH-DS", revision: "PREVIEW 00", issued: "2026-11" },
  variants: [{ id: "plough3", label: "3-Disk Plough", short: "3-Disk", title: "3-Disk Plough", kind: "single-machine" }],
  lede:
    "A three-disc plough for primary tillage and soil turning, published for tractors in the 70–90 HP range. " +
    "All values are published on the JOLU website only and have not been verified against a manufacturer datasheet. " +
    "Working width and weight are published as approximate. Confirm all figures with JOLU before purchase.",
  quoteHp: undefined,
  quick: [],
  kpis: [
    { id: "discs", label: "Number of discs", value: "3", unit: "discs", foot: "WEBSITE-PUBLISHED", status: "website-published", sources: WEB },
    { id: "power", label: "Tractor power", value: "70–90", unit: "HP", foot: "WEBSITE-PUBLISHED", status: "website-published", sources: WEB },
    { id: "width", label: "Working width · approx.", value: "90–110", unit: "cm", foot: "APPROXIMATE · WEBSITE-PUBLISHED", status: "website-published", sources: WEB },
  ],
  capabilities: [],
  groups: [
    {
      id: "implement",
      title: "01 / IMPLEMENT",
      rows: [
        { id: "discs", label: "Number of discs", entries: w("3") },
        { id: "disc-diameter", label: "Disc diameter", entries: w("660", "mm (26 in)") },
        { id: "working-width", label: "Working width", entries: w("Approx. 90–110", "cm", "Published as 'Approx. 90 cm – 110 cm' (key-spec) and '90–110 cm' (table); shown as approximate.") },
        { id: "working-depth", label: "Working depth", entries: w("25–30", "cm") },
      ],
    },
    {
      id: "matching",
      title: "02 / TRACTOR MATCHING AND MASS",
      rows: [
        { id: "tractor-power", label: "Tractor power", entries: w("70–90", "HP") },
        { id: "weight", label: "Weight", entries: w("Approx. 320–350", "kg", "Published as 'Approx. Weight'; the basis (dry, shipping or working mass) is not stated.") },
      ],
    },
  ],
  standardEquipment: [],
  optionalConfigurationNote: OPTIONAL_NOTE,
  catalogueDesignation: { value: "3 Disc Mounted Disc Plough", sources: ["catalogue-p2-implements", "company-profile-p6-implements"] },
  notPublished: [
    { label: "Hitch category", excludedId: "hitch-category" },
    { label: "Mounting specification", excludedId: "mounting-specification" },
    { label: "Overall dimensions", excludedId: "overall-dimensions" },
  ],
  sourceStatement:
    "Technical values: JOLU website product data only. Designation: JOLU Product Catalogue caption, a JOLU document that lists no values. No value has been verified against a manufacturer datasheet.",
  contact: SITE_CONTACT,
  confirmNote: CONFIRM_NOTE,
  sources: [webSource("3", "3-Disk Plough"), SRC_CATALOGUE_CAPTION, SRC_PROFILE_FARMING_IMPLEMENTS, SRC_CONTACT],
  excluded: [
    {
      id: "hitch-category",
      label: "Hitch category",
      reason: "not-supplied",
      detail:
        "No source states a hitch or linkage category. The JOLU catalogue caption '3 Disc Mounted Disc Plough' uses the word 'mounted'; that wording is shown only as the catalogue designation and no hitch category is inferred from it.",
    },
    {
      id: "mounting-specification",
      label: "Mounting specification (attachment points, linkage geometry, required hydraulics or PTO)",
      reason: "not-supplied",
      detail: "The website states only that the plough attaches to a tractor. No mounting dimensions, pin sizes, linkage geometry or hydraulic or PTO requirement is published anywhere, so none is shown.",
    },
    {
      id: "overall-dimensions",
      label: "Overall dimensions (L×W×H)",
      reason: "not-supplied",
      detail: "No overall length, width or height is published for this implement. None is invented and no dimension drawing is shown. 'Working width' is a different measurement and is not used as an overall dimension.",
    },
    {
      id: "durability-and-soil-claims",
      label: "Durability and soil-condition claims ('heavy-duty frame', 'strong frame and construction for long service life', 'effective in hard, dry and rocky soils', 'low maintenance', 'penetrates hard soils with ease')",
      reason: "unverified-claim",
      detail: "Marketing copy on the website, not a measured specification, with no supporting document. Not reproduced as technical fact.",
    },
    {
      id: "operating-characteristics",
      label: "Operating characteristics ('adjustable working depth', 'uniform working depth', 'suitable for medium-scale farming')",
      reason: "unverified-claim",
      detail: "Described only in narrative copy. No adjustment range, depth mechanism, field capacity or farm-size limit is documented, so none is published beyond the 25–30 cm working-depth value in the specification table.",
    },
    {
      id: "materials",
      label: "Materials and component specification (disc steel, bearings, frame section)",
      reason: "not-supplied",
      detail: "No material or component specification is present in any JOLU source reviewed.",
    },
    PRICE_EXCLUSION,
    WARRANTY_CERT_EXCLUSION,
  ],
}

export default sheet

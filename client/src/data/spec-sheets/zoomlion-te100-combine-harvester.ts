import type { SpecSheet } from "./types"
import { CONFIRM_NOTE, OPTIONAL_NOTE, PRICE_EXCLUSION, SITE_CONTACT, SRC_CONTACT, WARRANTY_CERT_EXCLUSION, same, webSource } from "./shared"

/**
 * Zoomlion TE100 Combine Harvester (M3-A6).
 *
 * TE100 appears in no JOLU document other than the website product data, so every value is WEBSITE-PUBLISHED.
 * The website table's "Cutting Width (Corn/Soybean)" entry reads "5–6 row / 4000 mm", which mixes a row count with a
 * width in millimetres; it is withheld rather than read as one measurement. Only the wheat cutting width is shown.
 */
const WEB = ["web-products"]
const C = ["te100"]
const w = (v: string, unit?: string) => same(C, v, "website-published", WEB, unit)

const sheet: SpecSheet = {
  slug: "zoomlion-te100-combine-harvester",
  machine: "harvester",
  reviewState: "preview",
  productName: "Zoomlion TE100 Combine Harvester",
  modelDesignation: "TE100",
  category: "Combine harvester",
  image: "@/assets/harvester-5.png",
  imageAlt: "Zoomlion TE100 combine harvester",
  imageFit: {
    scale: 1,
    subject: { left: 0.053, top: 0.017, right: 0.94, bottom: 0.963 },
    sourceWidthPx: 990,
    rationale: "The machine already spans ~89% of the 990 px source width, so it is shown at 100%: no enlargement and no crop, keeping the whole harvester in the panel.",
  },
  doc: { code: "JM-TE100-DS", revision: "PREVIEW 00", issued: "2026-11" },
  variants: [{ id: "te100", label: "TE100", short: "TE100", title: "TE100", kind: "single-machine" }],
  lede:
    "Published specifications for the Zoomlion TE100 combine harvester, supplied by JOLU Machineries. " +
    "All values are published on the JOLU website only and have not been verified against a manufacturer datasheet. Confirm all figures with JOLU before purchase.",
  quoteHp: undefined,
  quick: [
    { label: "OVERALL L × W × H", value: "6100×2800×3420 mm" },
    { label: "WEIGHT", value: "7,230 kg" },
    { label: "WHEAT CUT WIDTH", value: "4,000 mm" },
    { label: "UNLOADING RATE", value: "52 L/sec" },
  ],
  kpis: [
    { id: "output", label: "Maximum output", value: "190", unit: "hp", foot: "WEBSITE-PUBLISHED", status: "website-published", sources: WEB },
    { id: "feeding", label: "Feeding capacity", value: "10", unit: "kg/s", foot: "WEBSITE-PUBLISHED", status: "website-published", sources: WEB },
    { id: "grain-tank", label: "Grain tank capacity", value: "3.2", unit: "m³", foot: "WEBSITE-PUBLISHED", status: "website-published", sources: WEB },
  ],
  capabilities: [
    {
      id: "harvesting",
      tag: "01 / HARVESTING",
      title: "Feeding and cutting width",
      text: "10 kg/s feeding capacity through a 920 mm conveyor, with a 4,000 mm wheat cutting width.",
      derivedFrom: ["feeding", "conveyor", "cutting-wheat"],
    },
    {
      id: "threshing",
      tag: "02 / THRESHING AND CLEANING",
      title: "Axial-flow threshing",
      text: "Single longitudinal axial-flow threshing with a 3,180 mm × φ620 mm rotor, 2.5 m² concave area and 2.08 m² cleaning area.",
      derivedFrom: ["threshing-type", "rotor", "concave", "cleaning"],
    },
    {
      id: "grain",
      tag: "03 / GRAIN HANDLING",
      title: "Grain tank and fuel",
      text: "3.2 m³ grain tank with a 52 L/sec unloading rate, and a 440 L fuel tank.",
      derivedFrom: ["grain-tank", "unloading", "fuel-tank"],
    },
  ],
  groups: [
    {
      id: "dimensions",
      title: "01 / DIMENSIONS AND MASS",
      rows: [
        { id: "dimensions", label: "Overall dimensions (L×W×H)", entries: w("6100×2800×3420", "mm") },
        { id: "weight", label: "Weight", entries: w("7230", "kg") },
      ],
    },
    {
      id: "engine",
      title: "02 / ENGINE AND DRIVETRAIN",
      rows: [
        { id: "engine-type", label: "Engine type", entries: w("YCA05190-T300") },
        { id: "output", label: "Maximum output", entries: w("190", "hp") },
        { id: "fuel-tank", label: "Fuel tank capacity", entries: w("440", "L") },
        { id: "transmission", label: "Transmission type", entries: w("Hydraulic, 3 speeds") },
        { id: "max-speed", label: "Max speed", entries: w("40", "km/h") },
        { id: "tyres", label: "Tyre size (front / rear)", entries: w("540/70R24 / 300/80R15.3") },
      ],
    },
    {
      id: "harvesting",
      title: "03 / HARVESTING SYSTEM",
      rows: [
        { id: "feeding", label: "Feeding capacity", entries: w("10", "kg/s") },
        { id: "conveyor", label: "Conveyor width", entries: w("920", "mm") },
        { id: "cutting-wheat", label: "Cutting width (wheat)", entries: w("4000", "mm") },
        { id: "threshing-type", label: "Threshing type", entries: w("Single longitudinal axial flow") },
        { id: "rotor", label: "Rotor dimensions", entries: w("3180 mm × φ620 mm") },
        { id: "concave", label: "Concave area", entries: w("2.5", "m²") },
        { id: "cleaning", label: "Cleaning area", entries: w("2.08", "m²") },
        { id: "fan", label: "Fan speed", entries: w("910–1480", "rpm") },
      ],
    },
    {
      id: "grain",
      title: "04 / GRAIN HANDLING",
      rows: [
        { id: "grain-tank", label: "Grain tank capacity", entries: w("3.2", "m³") },
        { id: "unloading", label: "Unloading rate", entries: w("52", "L/sec") },
      ],
    },
  ],
  standardEquipment: [
    { label: "Axial-flow threshing", rowId: "threshing-type" },
    { label: "3.2 m³ grain tank", rowId: "grain-tank" },
    { label: "920 mm conveyor", rowId: "conveyor" },
    { label: "Hydraulic transmission", rowId: "transmission" },
  ],
  optionalConfigurationNote: OPTIONAL_NOTE,
  dimensions: {
    envelopes: [{ label: "TE100", lengthMm: 6100, widthMm: 2800, heightMm: 3420 }],
    groundClearanceMm: {},
    sources: WEB,
  },
  contact: SITE_CONTACT,
  confirmNote: CONFIRM_NOTE,
  sources: [webSource("14", "TE100"), SRC_CONTACT],
  excluded: [
    {
      id: "cutting-width-corn-soybean",
      label: "Cutting Width (Corn/Soybean) '5–6 row / 4000 mm'",
      reason: "disputed",
      detail: "The entry combines a row count (a header configuration) with a width in millimetres and does not say how they relate. Rows and millimetres are not interchangeable measurements, so the entry is withheld. The wheat cutting width (4000 mm) is a separate table row and is published as such.",
    },
    {
      id: "crop-claims",
      label: "Crop-capability claims (wheat, corn, sorghum, soybeans 'and more') and the optional corn/soybean headers",
      reason: "unverified-claim",
      detail: "Present only in narrative copy. Beyond the wheat cutting-width row, no crop capability and no optional header is published.",
    },
    {
      id: "emission",
      label: "Engine emission standard (website: National III)",
      reason: "unverified-claim",
      detail: "A compliance claim supported only by the website. Withheld until the manufacturer datasheet confirms it, consistent with the other website-only sheets.",
    },
    {
      id: "narrative-claims",
      label: "Narrative claims (Yuchai common-rail engine, hydrostatic drive, mono-lever control, air-conditioned cab, hydraulic main clutch, flail chopper, 4.5 m unloading height, concave design)",
      reason: "unverified-claim",
      detail: "Present only in the advantages copy, not as table values, and not corroborated by another source; not reproduced as technical fact.",
    },
    PRICE_EXCLUSION,
    WARRANTY_CERT_EXCLUSION,
  ],
}

export default sheet

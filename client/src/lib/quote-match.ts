// Utilities to map a product's category + horsepower range onto the
// "Product Interest" options used by the quote form.

import { productOptions } from "@/data/options";

export type ProductCategory = "tractors" | "harvesters" | "implements";

type Band = { option: string; min: number; max: number };

// Tractor HP bands. Bands are treated as half-open [min, max) so a value that
// lands exactly on a boundary (e.g. 100) belongs to the HIGHER band.
const TRACTOR_BANDS: Band[] = [
  { option: "Tractors (50-100 HP)", min: 0, max: 100 },
  { option: "Tractors (100-150 HP)", min: 100, max: 150 },
  { option: "Tractors (150+ HP)", min: 150, max: Infinity },
];

/**
 * Parse a horsepower string into a [min, max] numeric range.
 * Handles: "90–110 HP", "90-110 HP", "120 HP", "Compatible with 80–120 HP",
 * "Compatible with 60 HP and Below Tractors", "50 HP".
 * Returns null when no numbers are found (e.g. a capacity-only spec).
 */
export function parseHpRange(input?: string | null): [number, number] | null {
  if (!input) return null;
  const nums = (input.match(/\d+(?:\.\d+)?/g) || []).map(Number);
  if (nums.length === 0) return null;

  if (nums.length === 1) {
    // "60 HP and Below" -> everything up to 60.
    if (/below/i.test(input)) return [0, nums[0]];
    return [nums[0], nums[0]];
  }

  const min = Math.min(nums[0], nums[1]);
  const max = Math.max(nums[0], nums[1]);
  return [min, max];
}

/** Infer a product category from its name when one isn't supplied. */
export function inferCategory(name: string): ProductCategory {
  const n = name.toLowerCase();
  if (n.includes("harvester")) return "harvesters";
  if (/plough|plow|harrow|bowser|trailer|implement/.test(n)) return "implements";
  return "tractors";
}

function overlap(a1: number, a2: number, b1: number, b2: number): number {
  return Math.max(0, Math.min(a2, b2) - Math.max(a1, b1));
}

/**
 * Choose the best "Product Interest" option for a product.
 * - Harvesters / implements map directly to their option.
 * - Tractors pick the band with the greatest numeric overlap with the product's
 *   HP range; ties are broken by the band that contains the range midpoint
 *   (boundary values go to the higher band).
 */
export function matchProductInterest(opts: {
  name: string;
  category?: string | null;
  hp?: string | null;
}): string {
  const category = (opts.category || inferCategory(opts.name)).toLowerCase();

  if (category.includes("harvest")) return "Harvesters";
  if (category.includes("implement")) return "Agricultural Implements";

  const range = parseHpRange(opts.hp);
  // No usable HP info: fall back to the lowest tractor band.
  if (!range) return TRACTOR_BANDS[0].option;

  const [lo, hi] = range;
  const mid = (lo + hi) / 2;

  // Score each band by overlap. For the open-ended top band, cap its upper
  // edge just above the product range so overlap stays meaningful.
  const scored = TRACTOR_BANDS.map((band) => {
    const bandMax = band.max === Infinity ? Math.max(hi, band.min + 50) : band.max;
    return { band, ov: overlap(lo, hi, band.min, bandMax) };
  });

  const bestOverlap = Math.max(...scored.map((s) => s.ov));
  const ties = scored.filter((s) => s.ov === bestOverlap);

  if (ties.length > 1) {
    // Tie-break with the midpoint; boundaries resolve to the higher band.
    const byMid = TRACTOR_BANDS.find((b) => mid >= b.min && mid < b.max);
    if (byMid) return byMid.option;
  }

  return ties[0].band.option;
}

// Keep the exported options handy for consumers that render the dropdown.
export { productOptions };

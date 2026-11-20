// Pure helpers for the generated responsive-image manifest.
// (Kept free of imports so the Node test runner can load this file directly.)

export interface ImageVariant {
  w: number
  h: number
  file: string
  bytes: number
}

export interface ImageManifestEntry {
  w: number
  h: number
  alpha: boolean
  variants: ImageVariant[]
}

export type ImageManifest = Record<string, ImageManifestEntry>

/**
 * Turns the `src` a component used to pass to <img> into the manifest key.
 * Accepts "/lovable-uploads/x.jpg", "${BASE_URL}lovable-uploads/x.jpg" and
 * "@/assets/x.png". Query strings and hashes are ignored.
 */
export function normalizeImageKey(src: string, baseUrl = "/"): string {
  let key = src.split(/[?#]/)[0]
  if (key.startsWith("@/assets/")) return key
  if (baseUrl !== "/" && key.startsWith(baseUrl)) key = key.slice(baseUrl.length)
  return key.startsWith("/") ? key : `/${key}`
}

/** `srcset` value listing every generated width (never larger than the source). */
export function buildSrcSet(entry: ImageManifestEntry): string {
  return entry.variants.map((v) => `${v.file} ${v.w}w`).join(", ")
}

/**
 * Fallback `src` for browsers that ignore srcset: the smallest variant that is
 * at least `target` pixels wide, otherwise the largest one available.
 */
export function pickDefaultVariant(entry: ImageManifestEntry, target = 800): ImageVariant {
  const sorted = [...entry.variants].sort((a, b) => a.w - b.w)
  return sorted.find((v) => v.w >= target) ?? sorted[sorted.length - 1]
}

export interface ResolvedImage {
  src: string
  srcSet: string
  width: number
  height: number
}

/** Returns responsive attributes, or null when the image has no generated variants. */
export function resolveImage(manifest: ImageManifest, src: string, baseUrl = "/"): ResolvedImage | null {
  const entry = manifest[normalizeImageKey(src, baseUrl)]
  if (!entry || entry.variants.length === 0) return null
  return {
    src: pickDefaultVariant(entry).file,
    srcSet: buildSrcSet(entry),
    width: entry.w,
    height: entry.h,
  }
}

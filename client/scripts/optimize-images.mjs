// Deterministic responsive-image generation for the Vite site.
//
//   node scripts/optimize-images.mjs
//
// Reads the ORIGINAL photographs (never modified, moved or deleted) and writes
// content-hashed WebP derivatives into public/_img/ (git-ignored, regenerated on
// every dev/build) plus src/generated/image-manifest.json (git-ignored) which the
// <ResponsiveImage> component uses to build srcSet/sizes/width/height.
//
// Rules
//  - Never upscale: only widths below the source width are produced, plus the
//    source's own width (capped at MAX_WIDTH) as the largest variant.
//  - EXIF orientation is baked in and output is sRGB, so a photo looks the same
//    as the original <img>.
//  - Logos, favicons, the social-sharing image and PDFs are never converted.
//  - Output filenames contain a hash of the source bytes and the encoder
//    settings, so they are safe to cache for a year and stable across builds.
//
// Environment overrides (used by the tests): IMG_OUT_DIR, IMG_MANIFEST, IMG_ONLY.
import crypto from "node:crypto"
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import sharp from "sharp"

export const ENCODER_VERSION = "webp-q82-effort4-v1"
export const STANDARD_WIDTHS = [480, 800, 1200, 1600]
export const MAX_WIDTH = 1600
const WEBP_COPY_THROUGH_BYTES = 150 * 1024 // small existing WebP files are copied, not re-encoded

const CLIENT_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")

// Source trees. `keyPrefix` is the key the components use to look an image up.
export const SOURCE_TREES = [
  { dir: "public/lovable-uploads", keyPrefix: "/lovable-uploads" },
  { dir: "src/assets", keyPrefix: "@/assets" },
]

// Files that must keep their exact original rendering/format.
export const EXCLUDE = /(logo|favicon|og-image|placeholder|android-chrome|apple-touch)/i
const RASTER = /\.(jpe?g|png|webp)$/i

/** Widths to generate for a source of `width` pixels. Never exceeds the source. */
export function planWidths(width) {
  const top = Math.min(width, MAX_WIDTH)
  const below = STANDARD_WIDTHS.filter((w) => w < top)
  return [...below, top]
}

function walk(dir) {
  const out = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) out.push(...walk(full))
    else out.push(full)
  }
  return out
}

function slugify(key) {
  return key.replace(/^@\/assets/, "assets").replace(/^\/lovable-uploads/, "uploads").replace(/^\/+/, "").replace(/\.[^.]+$/, "").replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-|-$/g, "").toLowerCase()
}

export async function generate({
  root = CLIENT_ROOT,
  outDir = process.env.IMG_OUT_DIR ? path.resolve(process.env.IMG_OUT_DIR) : path.join(root, "public/_img"),
  manifestPath = process.env.IMG_MANIFEST ? path.resolve(process.env.IMG_MANIFEST) : path.join(root, "src/generated/image-manifest.json"),
  only = process.env.IMG_ONLY ? new RegExp(process.env.IMG_ONLY) : null,
  quiet = false,
} = {}) {
  fs.mkdirSync(outDir, { recursive: true })
  fs.mkdirSync(path.dirname(manifestPath), { recursive: true })

  const manifest = {}
  const keep = new Set()
  let originalBytes = 0
  let derivativeBytes = 0
  let generated = 0
  let reused = 0

  for (const tree of SOURCE_TREES) {
    const base = path.join(root, tree.dir)
    if (!fs.existsSync(base)) continue
    for (const file of walk(base)) {
      const rel = path.relative(base, file).split(path.sep).join("/")
      if (!RASTER.test(rel) || EXCLUDE.test(rel)) continue
      const key = `${tree.keyPrefix}/${rel}`
      if (only && !only.test(key)) continue

      const bytes = fs.readFileSync(file)
      const sourceHash = crypto.createHash("sha256").update(bytes).digest("hex")
      const hash = crypto.createHash("sha256").update(bytes).update(ENCODER_VERSION).digest("hex").slice(0, 10)
      const meta = await sharp(bytes, { failOn: "none" }).metadata()
      const swap = (meta.orientation || 1) >= 5
      const width = swap ? meta.height : meta.width
      const height = swap ? meta.width : meta.height
      if (!width || !height) throw new Error(`Cannot read dimensions of ${key}`)

      const isWebp = /\.webp$/i.test(rel)
      const copyThrough = isWebp && bytes.length <= WEBP_COPY_THROUGH_BYTES
      const widths = copyThrough ? [width] : planWidths(width)
      const slug = slugify(key)
      const variants = []

      for (const w of widths) {
        const name = `${slug}.${hash}-${w}.webp`
        const out = path.join(outDir, name)
        keep.add(name)
        let size
        if (fs.existsSync(out)) {
          size = fs.statSync(out).size
          reused++
        } else {
          if (copyThrough) {
            fs.writeFileSync(out, bytes)
          } else {
            await sharp(bytes, { failOn: "none" })
              .rotate()
              .resize({ width: w, withoutEnlargement: true })
              .toColorspace("srgb")
              .webp({ quality: meta.hasAlpha ? 84 : 82, alphaQuality: 90, effort: 4, smartSubsample: true })
              .toFile(out)
          }
          size = fs.statSync(out).size
          generated++
        }
        variants.push({ w, h: Math.round((height * w) / width), file: `/_img/${name}`, bytes: size })
        derivativeBytes += size
      }
      originalBytes += bytes.length
      manifest[key] = { w: width, h: height, alpha: Boolean(meta.hasAlpha), originalBytes: bytes.length, sourceHash, variants }
    }
  }

  // Prune stale generated files (only inside the generated directory) on full runs.
  if (!only) {
    for (const f of fs.readdirSync(outDir)) if (f.endsWith(".webp") && !keep.has(f)) fs.rmSync(path.join(outDir, f))
  }

  const sorted = Object.fromEntries(Object.keys(manifest).sort().map((k) => [k, manifest[k]]))
  fs.writeFileSync(manifestPath, JSON.stringify(sorted, null, 1) + "\n")
  if (!quiet) {
    const mb = (n) => (n / 1048576).toFixed(1)
    console.log(
      `[images] ${Object.keys(sorted).length} sources -> ${keep.size} variants (${generated} written, ${reused} reused); originals ${mb(originalBytes)} MB, all variants ${mb(derivativeBytes)} MB`,
    )
  }
  return sorted
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  generate().catch((err) => {
    console.error(err)
    process.exit(1)
  })
}

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
//  - Output filenames are content-addressed: they contain a hash of the ACTUAL
//    ENCODED BYTES of the file (not of its inputs). A URL can therefore never
//    serve different bytes, which is what makes `Cache-Control: immutable` safe,
//    even if sharp/libvips or the encoder settings change.
//  - A separate generation cache (git-ignored, default node_modules/.cache/
//    jolu-images) is keyed by the *inputs* (source bytes, encoder version, sharp
//    and libvips versions, settings, width). It only decides whether encoding
//    can be skipped; it never decides a public file name.
//  - Manifest dimensions are read back from the encoded files themselves.
//
// Environment overrides (used by the tests): IMG_OUT_DIR, IMG_MANIFEST, IMG_ONLY, IMG_CACHE_DIR.
import crypto from "node:crypto"
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import sharp from "sharp"

export const ENCODER_VERSION = "webp-q82-effort4-v1"
export const STANDARD_WIDTHS = [480, 800, 1200, 1600]
export const MAX_WIDTH = 1600
const WEBP_COPY_THROUGH_BYTES = 150 * 1024 // small existing WebP files are copied, not re-encoded
export const CONTENT_HASH_LENGTH = 16 // hex chars of sha256(encoded bytes) used in public file names

const ENCODE_OPTIONS = (hasAlpha) => ({ quality: hasAlpha ? 84 : 82, alphaQuality: 90, effort: 4, smartSubsample: true })

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

/** sha256 hex of a buffer. */
export const sha256 = (...parts) => {
  const h = crypto.createHash("sha256")
  for (const p of parts) h.update(p)
  return h.digest("hex")
}

/**
 * Identity of one *generation* (input side). Changes whenever anything that could
 * change the encoded bytes changes. Used only for the build cache, never in URLs.
 */
export function generationKey({ sourceBytes, width, copyThrough, hasAlpha, versions = encoderVersions() }) {
  const identity = JSON.stringify({
    encoder: ENCODER_VERSION,
    sharp: versions.sharp,
    vips: versions.vips,
    width,
    copyThrough,
    options: copyThrough ? null : ENCODE_OPTIONS(hasAlpha),
  })
  return sha256(sourceBytes, "\0", identity).slice(0, 32)
}

export function encoderVersions() {
  return { sharp: sharp.versions.sharp ?? "unknown", vips: sharp.versions.vips ?? "unknown" }
}

/** A cache entry is only trusted if it still decodes as a WebP of the expected width. */
async function isValidWebp(file, expectedWidth) {
  try {
    const m = await sharp(file, { failOn: "none" }).metadata()
    return m.format === "webp" && Boolean(m.width) && (expectedWidth === null || m.width === expectedWidth)
  } catch {
    return false
  }
}

/** Names this generator produces: <slug>-<width>.<16 hex>.webp. Only these are ever pruned. */
export const GENERATED_NAME = new RegExp(`-\\d+\\.[0-9a-f]{${CONTENT_HASH_LENGTH}}\\.webp$`)

/** Resolve a path through symlinks even if the leaf (and some parents) do not exist yet. */
function realResolve(p) {
  let cur = path.resolve(p)
  const rest = []
  for (;;) {
    try {
      return path.join(fs.realpathSync(cur), ...rest.reverse())
    } catch {
      const parent = path.dirname(cur)
      if (parent === cur) return path.resolve(p)
      rest.push(path.basename(cur))
      cur = parent
    }
  }
}
const isInside = (child, parent) => {
  const rel = path.relative(parent, child)
  return rel === "" || (!rel.startsWith("..") && !path.isAbsolute(rel))
}

/**
 * The output directory is cleaned of stale generated files, so it must be a directory that
 * only holds generated output: never a filesystem root, the project root (or any parent of it),
 * a source-image tree (or anything containing or inside one), or the cache directory.
 * Throws before anything is created or deleted.
 */
export function assertSafeOutputs({ root, outDir, cacheDir, manifestPath }) {
  const real = { root: realResolve(root), out: realResolve(outDir), cache: realResolve(cacheDir), manifest: realResolve(manifestPath) }
  const sources = SOURCE_TREES.map((t) => realResolve(path.join(root, t.dir)))
  const fail = (why) => {
    throw new Error(`[images] refusing unsafe output directory ${outDir}: ${why}`)
  }
  if (real.out === path.parse(real.out).root) fail("it is a filesystem root")
  if (isInside(real.root, real.out)) fail("it is the project root or a parent of it")
  for (const src of sources) {
    if (isInside(real.out, src) || isInside(src, real.out)) fail(`it overlaps the source image directory ${src}`)
    if (isInside(real.manifest, src)) fail("the manifest path is inside a source image directory")
  }
  if (isInside(real.cache, real.out) || isInside(real.out, real.cache)) fail("it overlaps the generation cache")
  if (isInside(real.manifest, real.out)) fail("the manifest path is inside the output directory")
}

/** Public file name derived from the encoded bytes. */
export function contentName(slug, width, encodedBytes) {
  return `${slug}-${width}.${sha256(encodedBytes).slice(0, CONTENT_HASH_LENGTH)}.webp`
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
  cacheDir = process.env.IMG_CACHE_DIR ? path.resolve(process.env.IMG_CACHE_DIR) : path.join(root, "node_modules/.cache/jolu-images"),
  quiet = false,
} = {}) {
  assertSafeOutputs({ root, outDir, cacheDir, manifestPath })
  fs.mkdirSync(outDir, { recursive: true })
  fs.mkdirSync(cacheDir, { recursive: true })
  const versions = encoderVersions()
  fs.mkdirSync(path.dirname(manifestPath), { recursive: true })

  const manifest = {}
  const keep = new Set()
  let originalBytes = 0
  let derivativeBytes = 0
  let encoded = 0
  let fromCache = 0
  let written = 0

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
        // 1. Obtain the encoded bytes: from the generation cache, or by encoding.
        const gKey = generationKey({ sourceBytes: bytes, width: w, copyThrough, hasAlpha: Boolean(meta.hasAlpha), versions })
        const cached = path.join(cacheDir, `${gKey}.webp`)
        let data
        if (fs.existsSync(cached) && (await isValidWebp(cached, copyThrough ? null : w))) {
          data = fs.readFileSync(cached)
          fromCache++
        } else {
          data = copyThrough
            ? bytes
            : await sharp(bytes, { failOn: "none" })
                .rotate()
                .resize({ width: w, withoutEnlargement: true })
                .toColorspace("srgb")
                .webp(ENCODE_OPTIONS(meta.hasAlpha))
                .toBuffer()
          fs.writeFileSync(cached + ".tmp", data)
          fs.renameSync(cached + ".tmp", cached)
          encoded++
        }

        // 2. Public name comes from the ACTUAL bytes. Same name => same bytes.
        const name = contentName(slug, w, data)
        const out = path.join(outDir, name)
        keep.add(name)
        if (!fs.existsSync(out) || sha256(fs.readFileSync(out)) !== sha256(data)) {
          fs.writeFileSync(out, data)
          written++
        }

        // 3. Dimensions come from the encoded file, not from arithmetic.
        const actual = await sharp(data, { failOn: "none" }).metadata()
        if (actual.format !== "webp" || !actual.width || !actual.height) throw new Error(`Encoded file for ${key}@${w} is not a valid WebP`)
        variants.push({ w: actual.width, h: actual.height, file: `/_img/${name}`, bytes: data.length })
        derivativeBytes += data.length
      }
      originalBytes += bytes.length
      manifest[key] = { w: width, h: height, alpha: Boolean(meta.hasAlpha), originalBytes: bytes.length, sourceHash, variants }
    }
  }

  // Prune stale generated files (only inside the generated directory) on full runs.
  if (!only) {
    for (const f of fs.readdirSync(outDir)) {
      if (keep.has(f) || !GENERATED_NAME.test(f)) continue // unrelated files are never touched
      const full = path.join(outDir, f)
      if (fs.lstatSync(full).isFile()) fs.rmSync(full) // never follow or remove symlinks/directories
    }
  }

  const sorted = Object.fromEntries(Object.keys(manifest).sort().map((k) => [k, manifest[k]]))
  fs.writeFileSync(manifestPath, JSON.stringify(sorted, null, 1) + "\n")
  if (!quiet) {
    const mb = (n) => (n / 1048576).toFixed(1)
    console.log(
      `[images] ${Object.keys(sorted).length} sources -> ${keep.size} variants (${encoded} encoded, ${fromCache} from cache, ${written} files written); originals ${mb(originalBytes)} MB, all variants ${mb(derivativeBytes)} MB`,
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

// Regression tests for the responsive-image pipeline (node:test, no extra dependencies).
//   npm test        (regenerates the manifest first, see "pretest")
import assert from "node:assert/strict"
import crypto from "node:crypto"
import fs from "node:fs"
import os from "node:os"
import path from "node:path"
import test from "node:test"
import { fileURLToPath, pathToFileURL } from "node:url"
import { build } from "esbuild"
import React from "react"
import { renderToStaticMarkup } from "react-dom/server"
import sharp from "sharp"
import { CONTENT_HASH_LENGTH, ENCODER_VERSION, EXCLUDE, MAX_WIDTH, SOURCE_TREES, STANDARD_WIDTHS, contentName, generate, generationKey, planWidths, sha256 } from "../scripts/optimize-images.mjs"
import { buildSrcSet, normalizeImageKey, pickDefaultVariant, resolveImage } from "../src/lib/image-utils.ts"

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const MANIFEST_PATH = path.join(ROOT, "src/generated/image-manifest.json")
const RASTER = /\.(jpe?g|png|webp)$/i

const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf8"))

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const full = path.join(dir, e.name)
    return e.isDirectory() ? walk(full) : [full]
  })
}

function sourceFiles() {
  const out = []
  for (const tree of SOURCE_TREES) {
    const base = path.join(ROOT, tree.dir)
    for (const file of walk(base)) {
      const rel = path.relative(base, file).split(path.sep).join("/")
      if (RASTER.test(rel) && !EXCLUDE.test(rel)) out.push({ key: `${tree.keyPrefix}/${rel}`, file })
    }
  }
  return out
}

const sha = (buf) => crypto.createHash("sha256").update(buf).digest("hex")

// ---------------------------------------------------------------- planning

test("planWidths never upscales and always ends at the source width (capped)", () => {
  assert.deepEqual(planWidths(224), [224])
  assert.deepEqual(planWidths(480), [480])
  assert.deepEqual(planWidths(700), [480, 700])
  assert.deepEqual(planWidths(990), [480, 800, 990])
  assert.deepEqual(planWidths(1300), [480, 800, 1200, 1300])
  assert.deepEqual(planWidths(1920), [480, 800, 1200, 1600])
  assert.deepEqual(planWidths(6000), [480, 800, 1200, 1600])
  for (const w of [100, 479, 480, 481, 799, 1199, 1601, 4000]) {
    const widths = planWidths(w)
    assert.ok(widths.every((x) => x <= w), `no variant wider than the ${w}px source`)
    assert.equal(widths.at(-1), Math.min(w, MAX_WIDTH))
    assert.deepEqual([...widths].sort((a, b) => a - b), widths, "ascending")
    assert.equal(new Set(widths).size, widths.length, "no duplicates")
  }
  assert.deepEqual(STANDARD_WIDTHS, [480, 800, 1200, 1600])
})

// ---------------------------------------------------------------- manifest

test("every raster source has a manifest entry and no entry is orphaned", () => {
  const keys = sourceFiles().map((s) => s.key).sort()
  assert.deepEqual(Object.keys(manifest).sort(), keys)
})

test("every variant file exists, is a WebP, and is not an upscale", () => {
  for (const [key, entry] of Object.entries(manifest)) {
    assert.ok(entry.variants.length > 0, `${key} has variants`)
    let previous = 0
    for (const v of entry.variants) {
      assert.ok(v.w <= entry.w, `${key}: ${v.w}px variant exceeds the ${entry.w}px source`)
      assert.ok(v.w > previous, `${key}: variants must be strictly ascending`)
      previous = v.w
      const file = path.join(ROOT, "public", v.file)
      assert.ok(fs.existsSync(file), `${key}: missing ${v.file}`)
      const head = fs.readFileSync(file).subarray(0, 12)
      assert.equal(head.subarray(0, 4).toString("ascii"), "RIFF", `${v.file} is RIFF`)
      assert.equal(head.subarray(8, 12).toString("ascii"), "WEBP", `${v.file} is WebP`)
      assert.match(v.file, new RegExp(`-\\d+\\.[0-9a-f]{${CONTENT_HASH_LENGTH}}\\.webp$`), `${v.file} is content-addressed`)
    }
    assert.equal(entry.variants.at(-1).w, Math.min(entry.w, MAX_WIDTH))
  }
})

test("the largest derivative is far smaller than the original for big photographs", () => {
  for (const [key, entry] of Object.entries(manifest)) {
    if (entry.originalBytes > 1_000_000) {
      const top = entry.variants.at(-1).bytes
      assert.ok(top < entry.originalBytes * 0.35, `${key}: ${top} B vs original ${entry.originalBytes} B`)
    }
  }
})

// ---------------------------------------------------------------- originals

test("generation never modifies, moves or deletes original images", async () => {
  const before = new Map(sourceFiles().map((s) => [s.file, sha(fs.readFileSync(s.file))]))
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "img-orig-"))
  await generate({ outDir: path.join(tmp, "out"), manifestPath: path.join(tmp, "m.json"), cacheDir: path.join(tmp, "cache"), only: /gallery\/ceo\.jpg|assets\/tractor-1\.png/, quiet: true })
  const after = new Map(sourceFiles().map((s) => [s.file, sha(fs.readFileSync(s.file))]))
  assert.deepEqual([...after.keys()].sort(), [...before.keys()].sort(), "same set of originals")
  for (const [file, hash] of before) assert.equal(after.get(file), hash, `${file} unchanged`)
  // Derivatives live only in the generated output directory.
  assert.ok(fs.readdirSync(path.join(tmp, "out")).every((f) => f.endsWith(".webp")))
  fs.rmSync(tmp, { recursive: true, force: true })
})

// ---------------------------------------------------------------- missing assets

test("every image referenced in the source code exists and has variants", () => {
  const files = walk(path.join(ROOT, "src")).filter((f) => /\.(tsx?|css)$/.test(f) && !f.endsWith("src/lib/image-utils.ts"))
  const missingFiles = []
  const missingVariants = []
  for (const file of files) {
    const text = fs.readFileSync(file, "utf8")
    for (const m of text.matchAll(/lovable-uploads\/([^"'`\s)\\]+\.(?:jpe?g|png|webp))/gi)) {
      const key = `/lovable-uploads/${m[1]}`
      if (!fs.existsSync(path.join(ROOT, "public", key))) missingFiles.push(`${path.relative(ROOT, file)} -> ${key}`)
      else if (!EXCLUDE.test(key) && !manifest[key]) missingVariants.push(`${path.relative(ROOT, file)} -> ${key}`)
    }
    for (const m of text.matchAll(/@\/assets\/([^"'`\s)\\]+\.(?:jpe?g|png|webp))/gi)) {
      const key = `@/assets/${m[1]}`
      if (!fs.existsSync(path.join(ROOT, "src/assets", m[1]))) missingFiles.push(`${path.relative(ROOT, file)} -> ${key}`)
      else if (!manifest[key]) missingVariants.push(`${path.relative(ROOT, file)} -> ${key}`)
    }
  }
  assert.deepEqual(missingFiles, [], "referenced files must exist")
  assert.deepEqual(missingVariants, [], "referenced images must have generated variants")
})

// ---------------------------------------------------------------- selection helpers

test("normalizeImageKey handles paths, BASE_URL prefixes, asset keys and queries", () => {
  assert.equal(normalizeImageKey("/lovable-uploads/a.jpg"), "/lovable-uploads/a.jpg")
  assert.equal(normalizeImageKey("lovable-uploads/a.jpg"), "/lovable-uploads/a.jpg")
  assert.equal(normalizeImageKey("/app/lovable-uploads/a.jpg", "/app/"), "/lovable-uploads/a.jpg")
  assert.equal(normalizeImageKey("@/assets/hero/x.jpg"), "@/assets/hero/x.jpg")
  assert.equal(normalizeImageKey("/lovable-uploads/a.jpg?v=2#top"), "/lovable-uploads/a.jpg")
})

test("responsive selection: srcset lists every variant; default is the smallest >= 800px", () => {
  const entry = {
    w: 4000,
    h: 3000,
    alpha: false,
    variants: [480, 800, 1200, 1600].map((w) => ({ w, h: Math.round(w * 0.75), file: `/_img/x-${w}.webp`, bytes: w })),
  }
  assert.equal(buildSrcSet(entry), "/_img/x-480.webp 480w, /_img/x-800.webp 800w, /_img/x-1200.webp 1200w, /_img/x-1600.webp 1600w")
  assert.equal(pickDefaultVariant(entry).w, 800)
  assert.equal(pickDefaultVariant(entry, 1000).w, 1200)
  assert.equal(pickDefaultVariant(entry, 5000).w, 1600)
  assert.equal(pickDefaultVariant({ ...entry, variants: [entry.variants[0]] }).w, 480)
  const resolved = resolveImage({ "/lovable-uploads/x.jpg": entry }, "/lovable-uploads/x.jpg")
  assert.deepEqual([resolved.width, resolved.height], [4000, 3000])
  assert.equal(resolveImage({}, "/lovable-uploads/none.jpg"), null)
})

// ---------------------------------------------------------------- reproducibility

test("generation is reproducible: same inputs give identical manifests and identical bytes", async () => {
  const only = /gallery\/ceo\.jpg|assets\/tractor-1\.png|assets\/hero\/tractor3\.jpg/
  const a = fs.mkdtempSync(path.join(os.tmpdir(), "img-a-"))
  const b = fs.mkdtempSync(path.join(os.tmpdir(), "img-b-"))
  const ma = await generate({ outDir: path.join(a, "o"), manifestPath: path.join(a, "m.json"), cacheDir: path.join(a, "c"), only, quiet: true })
  const mb = await generate({ outDir: path.join(b, "o"), manifestPath: path.join(b, "m.json"), cacheDir: path.join(b, "c"), only, quiet: true })
  assert.ok(Object.keys(ma).length === 3)
  assert.deepEqual(ma, mb)
  assert.equal(fs.readFileSync(path.join(a, "m.json"), "utf8"), fs.readFileSync(path.join(b, "m.json"), "utf8"))
  const names = fs.readdirSync(path.join(a, "o")).sort()
  assert.deepEqual(names, fs.readdirSync(path.join(b, "o")).sort())
  for (const n of names) assert.equal(sha(fs.readFileSync(path.join(a, "o", n))), sha(fs.readFileSync(path.join(b, "o", n))), n)
  // ...and the committed-manifest entries match what a fresh run produces.
  for (const [key, entry] of Object.entries(ma)) assert.deepEqual(entry, manifest[key], key)
  fs.rmSync(a, { recursive: true, force: true })
  fs.rmSync(b, { recursive: true, force: true })
})

// ---------------------------------------------------------------- D-01 content addressing

test("D-01: every public file name embeds the hash of the file's ACTUAL bytes", () => {
  for (const [key, entry] of Object.entries(manifest)) {
    for (const v of entry.variants) {
      const bytes = fs.readFileSync(path.join(ROOT, "public", v.file))
      const m = v.file.match(new RegExp(`\\.([0-9a-f]{${CONTENT_HASH_LENGTH}})\\.webp$`))
      assert.ok(m, `${key}: ${v.file} has a content hash`)
      assert.equal(m[1], sha256(bytes).slice(0, CONTENT_HASH_LENGTH), `${v.file}: name hash must match file bytes`)
      assert.equal(bytes.length, v.bytes, `${v.file}: manifest bytes match file`)
    }
  }
})

test("D-01: the generation-cache key reacts to every input that can change encoded bytes", () => {
  const base = { sourceBytes: Buffer.from("source"), width: 800, copyThrough: false, hasAlpha: false, versions: { sharp: "0.35.5", vips: "8.17.0" } }
  const k = generationKey(base)
  assert.equal(generationKey({ ...base }), k, "stable for identical input")
  assert.notEqual(generationKey({ ...base, sourceBytes: Buffer.from("source2") }), k, "source bytes")
  assert.notEqual(generationKey({ ...base, width: 1200 }), k, "width")
  assert.notEqual(generationKey({ ...base, hasAlpha: true }), k, "encoder options (alpha)")
  assert.notEqual(generationKey({ ...base, copyThrough: true }), k, "copy-through")
  assert.notEqual(generationKey({ ...base, versions: { ...base.versions, sharp: "0.36.0" } }), k, "sharp version")
  assert.notEqual(generationKey({ ...base, versions: { ...base.versions, vips: "8.18.0" } }), k, "libvips version")
  assert.ok(typeof ENCODER_VERSION === "string" && ENCODER_VERSION.length > 0)
})

test("D-01: a URL can never serve different bytes (changed source or tampered cache => new URL)", async () => {
  const only = /gallery\/ceo\.jpg/
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "img-cas-"))
  const run = (name) => generate({ outDir: path.join(tmp, name, "o"), manifestPath: path.join(tmp, name, "m.json"), cacheDir: path.join(tmp, "cache"), only, quiet: true })
  const first = await run("first")
  const files = (m) => Object.values(m)[0].variants.map((v) => v.file)

  // 1. Second run reuses the cache and yields the same names.
  const second = await run("second")
  assert.deepEqual(files(second), files(first))

  // 2. Corrupt a cache entry: the result must still be a valid WebP, and any change in bytes changes the name.
  const cacheFiles = fs.readdirSync(path.join(tmp, "cache"))
  assert.ok(cacheFiles.length >= 2)
  fs.writeFileSync(path.join(tmp, "cache", cacheFiles[0]), "not a webp")
  const third = await run("third")
  assert.deepEqual(files(third), files(first), "corrupt cache entry is detected and re-encoded, not shipped")

  // 3. Replace a cache entry with a DIFFERENT valid webp of the same width: bytes differ => name must differ.
  const victim = Object.values(first)[0].variants[0]
  const other = await sharp({ create: { width: victim.w, height: victim.h, channels: 3, background: "#123456" } }).webp().toBuffer()
  const hit = cacheFiles.find((f) => fs.statSync(path.join(tmp, "cache", f)).size === victim.bytes) ?? cacheFiles[1]
  fs.writeFileSync(path.join(tmp, "cache", hit), other)
  const fourth = await run("fourth")
  const changed = files(fourth).filter((f, i) => f !== files(first)[i])
  for (const f of files(fourth)) {
    const bytes = fs.readFileSync(path.join(tmp, "fourth", "o", path.basename(f)))
    assert.equal(path.basename(f).split(".").at(-2), sha256(bytes).slice(0, CONTENT_HASH_LENGTH), "name always matches bytes")
  }
  assert.ok(changed.length <= 1)
  assert.equal(contentName("x", 1, other).split(".").at(-2), sha256(other).slice(0, CONTENT_HASH_LENGTH))
  fs.rmSync(tmp, { recursive: true, force: true })
})

test("D-01: a warm cache encodes nothing and is much faster than a cold run", async () => {
  const only = /gallery\/ceo\.jpg/
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "img-warm-"))
  const opts = { outDir: path.join(tmp, "o"), manifestPath: path.join(tmp, "m.json"), cacheDir: path.join(tmp, "c"), only, quiet: true }
  const logs = []
  const orig = console.log
  console.log = (...a) => logs.push(a.join(" "))
  try {
    await generate({ ...opts, quiet: false })
    await generate({ ...opts, quiet: false })
  } finally {
    console.log = orig
  }
  assert.match(logs[0], /\(\d+ encoded, 0 from cache/)
  assert.match(logs[1], /\(0 encoded, \d+ from cache, 0 files written/)
  fs.rmSync(tmp, { recursive: true, force: true })
})

// ---------------------------------------------------------------- F-04 manifest dimensions

test("F-04: manifest variant dimensions equal the real metadata of each generated file", async () => {
  const mismatches = []
  for (const [key, entry] of Object.entries(manifest)) {
    for (const v of entry.variants) {
      const meta = await sharp(path.join(ROOT, "public", v.file)).metadata()
      if (meta.format !== "webp" || meta.width !== v.w || meta.height !== v.h) mismatches.push(`${key} ${v.file}: manifest ${v.w}x${v.h}, file ${meta.width}x${meta.height}`)
    }
  }
  assert.deepEqual(mismatches, [])
})

test("F-04: variant aspect ratio matches the source within rounding", () => {
  for (const [key, entry] of Object.entries(manifest)) {
    for (const v of entry.variants) {
      const expectedH = (entry.h * v.w) / entry.w
      assert.ok(Math.abs(v.h - expectedH) <= 1, `${key}@${v.w}: height ${v.h} vs ${expectedH.toFixed(2)}`)
    }
  }
})

// ---------------------------------------------------------------- F-03 news speaker sizing

test("F-03: news speaker and client cards declare their real rendered width, not a viewport fraction", () => {
  const src = fs.readFileSync(path.join(ROOT, "src/pages/News.tsx"), "utf8")
  const sizes = [...src.matchAll(/sizes="([^"]+)"/g)].map((m) => m[1])
  const card = "(min-width: 1024px) 276px, (min-width: 768px) calc(50vw - 236px), calc(100vw - 4rem)"
  assert.equal(sizes.filter((s) => s === card).length, 2, "speaker + client cards")
  assert.ok(!sizes.some((s) => /33vw/.test(s) && /768px/.test(s) && /50vw, calc/.test(s)), "old speaker sizes are gone")
})

// ---------------------------------------------------------------- rendered markup

async function loadComponent() {
  const cache = path.join(ROOT, "node_modules/.cache")
  fs.mkdirSync(cache, { recursive: true })
  const tmp = fs.mkdtempSync(path.join(cache, "img-cmp-"))
  const outfile = path.join(tmp, "ResponsiveImage.mjs")
  await build({
    entryPoints: [path.join(ROOT, "src/components/ResponsiveImage.tsx")],
    outfile,
    bundle: true,
    format: "esm",
    platform: "node",
    jsx: "automatic",
    external: ["react", "react-dom", "react/jsx-runtime"],
    alias: { "@": path.join(ROOT, "src") },
    loader: { ".json": "json" },
    define: { "import.meta.env.BASE_URL": '"/"', "import.meta.env.DEV": "false" },
    logLevel: "silent",
  })
  const mod = await import(pathToFileURL(outfile).href)
  return { Component: mod.default, cleanup: () => fs.rmSync(tmp, { recursive: true, force: true }) }
}

test("<ResponsiveImage> renders responsive, layout-stable and correctly prioritised markup", async () => {
  const { Component, cleanup } = await loadComponent()
  try {
    const key = "/lovable-uploads/gallery/ceo.jpg"
    const entry = manifest[key]
    const lazy = renderToStaticMarkup(React.createElement(Component, { src: key, alt: "CEO", sizes: "50vw" }))
    assert.match(lazy, /loading="lazy"/)
    assert.match(lazy, /decoding="async"/)
    assert.match(lazy, new RegExp(`width="${entry.w}"`))
    assert.match(lazy, new RegExp(`height="${entry.h}"`))
    assert.match(lazy, /sizes="50vw"/)
    assert.match(lazy, /srcSet="[^"]*\.webp \d+w/)
    assert.doesNotMatch(lazy, /fetchpriority/)
    assert.doesNotMatch(lazy, /ceo\.jpg"/, "the original is not requested when variants exist")

    const eager = renderToStaticMarkup(React.createElement(Component, { src: key, alt: "CEO", priority: true }))
    assert.match(eager, /loading="eager"/)
    assert.match(eager, /fetchpriority="high"/)

    const low = renderToStaticMarkup(React.createElement(Component, { src: key, alt: "CEO", loading: "eager", fetchPriority: "low" }))
    assert.match(low, /loading="eager"/)
    assert.match(low, /fetchpriority="low"/)

    const fallback = renderToStaticMarkup(React.createElement(Component, { src: "/lovable-uploads/gallery/not-in-manifest.jpg", alt: "x" }))
    assert.match(fallback, /src="\/lovable-uploads\/gallery\/not-in-manifest\.jpg"/)
    assert.doesNotMatch(fallback, /srcSet/)
    assert.doesNotMatch(fallback, /width=/)

    const asset = renderToStaticMarkup(React.createElement(Component, { src: "@/assets/hero/tractor1.jpg", alt: "hero", priority: true }))
    assert.match(asset, /srcSet="[^"]*_img\/assets-hero-tractor1-/)
  } finally {
    cleanup()
  }
})

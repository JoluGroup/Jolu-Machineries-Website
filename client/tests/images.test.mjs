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
import { EXCLUDE, MAX_WIDTH, SOURCE_TREES, STANDARD_WIDTHS, generate, planWidths } from "../scripts/optimize-images.mjs"
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
      assert.ok(/-\d+\.webp$/.test(v.file) && /\.[0-9a-f]{10}-/.test(v.file), `${v.file} is content-hashed`)
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
  await generate({ outDir: path.join(tmp, "out"), manifestPath: path.join(tmp, "m.json"), only: /gallery\/ceo\.jpg|assets\/tractor-1\.png/, quiet: true })
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
  const ma = await generate({ outDir: path.join(a, "o"), manifestPath: path.join(a, "m.json"), only, quiet: true })
  const mb = await generate({ outDir: path.join(b, "o"), manifestPath: path.join(b, "m.json"), only, quiet: true })
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
    assert.match(asset, /srcSet="[^"]*_img\/assets-hero-tractor1\./)
  } finally {
    cleanup()
  }
})

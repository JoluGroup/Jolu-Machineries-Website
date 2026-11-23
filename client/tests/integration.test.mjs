// Integration-level regression tests for the combined M2 + M2-C + M2-B release candidate.
import assert from "node:assert/strict"
import fs from "node:fs"
import path from "node:path"
import test from "node:test"
import { fileURLToPath } from "node:url"

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const read = (f) => fs.readFileSync(path.join(ROOT, f), "utf8")
const manifest = JSON.parse(read("src/generated/image-manifest.json"))
const productsSrc = read("src/data/products.ts")

const imageKeys = [...productsSrc.matchAll(/^\s*(?:const\s+\w+\s*=|image:)\s*"(@\/assets\/[^"]+)"/gm)].map((m) => m[1])

test("every catalogue image key resolves in the generated manifest with existing derivatives", () => {
  const entries = manifest.images ?? manifest
  assert.ok(imageKeys.length >= 18, `expected >= 18 keys, got ${imageKeys.length}`)
  for (const key of new Set(imageKeys)) {
    const entry = entries[key]
    assert.ok(entry, `manifest missing ${key}`)
    const variants = entry.variants ?? entry
    assert.ok(variants.length > 0, key)
    for (const v of variants) assert.ok(fs.existsSync(path.join(ROOT, "public", v.file)), `${key}: ${v.file} missing`)
  }
})

test("ProductList renders product images only through ResponsiveImage", () => {
  const src = read("src/pages/ProductList.tsx")
  assert.match(src, /<ResponsiveImage[\s\S]*src=\{product\.image\}/)
  assert.doesNotMatch(src, /<img[^>]*src=\{product\.image\}/)
  assert.match(src, /<Header \/>/)
  assert.match(src, /<Footer \/>/)
})

test("generated image filenames are content-addressed (<slug>-<w>.<16hex>.webp)", () => {
  const files = fs.readdirSync(path.join(ROOT, "public/_img")).filter((f) => f.endsWith(".webp"))
  assert.ok(files.length > 300)
  for (const f of files) assert.match(f, /-\d+\.[0-9a-f]{16}\.webp$/, f)
})

test("a failed hero image is never treated as ready", () => {
  const hero = read("src/components/Hero.tsx")
  assert.doesNotMatch(hero, /onError=\{\(\)\s*=>\s*markSettled/)
  assert.match(hero, /onError=\{\(\)\s*=>\s*markFailed\(index\)\}/)
  assert.match(hero, /settledSlides\.current\.delete\(index\)/)
})

test("npm test glob discovers every test file", () => {
  const pkg = JSON.parse(read("package.json"))
  assert.equal(pkg.scripts.test, "node --test tests/*.test.mjs")
  const files = fs.readdirSync(path.join(ROOT, "tests")).filter((f) => f.endsWith(".mjs"))
  for (const f of files) assert.match(f, /\.test\.mjs$/, `${f} would be silently excluded`)
})

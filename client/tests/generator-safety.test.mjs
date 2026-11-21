// R-03: the image generator must never delete or overwrite files outside its generated-output directory.
// Every test uses a disposable temp project; no real project assets are touched.
import assert from "node:assert/strict"
import fs from "node:fs"
import os from "node:os"
import path from "node:path"
import test from "node:test"
import sharp from "sharp"
import { generate, assertSafeOutputs } from "../scripts/optimize-images.mjs"

const mk = () => fs.mkdtempSync(path.join(os.tmpdir(), "jolu-gen-safety-"))
async function project() {
  const root = mk()
  for (const d of ["src/assets", "public/lovable-uploads"]) fs.mkdirSync(path.join(root, d), { recursive: true })
  await sharp({ create: { width: 900, height: 600, channels: 3, background: "#3a7" } }).png().toFile(path.join(root, "src/assets/pic.png"))
  // An original that is itself a .webp: the exact kind of file a bad prune would delete.
  await sharp({ create: { width: 300, height: 200, channels: 3, background: "#a33" } }).webp().toFile(path.join(root, "public/lovable-uploads/original.webp"))
  const o = { root, outDir: path.join(root, "public/_img"), manifestPath: path.join(root, "src/generated/m.json"), cacheDir: path.join(root, "cache"), quiet: true }
  return { root, o }
}
const snapshot = (dir) => Object.fromEntries(fs.readdirSync(dir, { recursive: true }).filter((f) => fs.statSync(path.join(dir, f)).isFile()).map((f) => [f, fs.readFileSync(path.join(dir, f)).length]))

test("valid output directory generates and prunes only stale generated files", async () => {
  const { root, o } = await project()
  fs.mkdirSync(o.outDir, { recursive: true })
  fs.writeFileSync(path.join(o.outDir, "stale-480.0123456789abcdef.webp"), "x") // stale generated
  fs.writeFileSync(path.join(o.outDir, "notes.txt"), "keep")
  fs.writeFileSync(path.join(o.outDir, "handmade.webp"), "keep") // not a generated name
  const m = await generate(o)
  assert.ok(Object.keys(m).includes("@/assets/pic.png"))
  const files = fs.readdirSync(o.outDir)
  assert.ok(!files.includes("stale-480.0123456789abcdef.webp"), "stale generated file pruned")
  assert.ok(files.includes("notes.txt") && files.includes("handmade.webp"), "unrelated files preserved")
  assert.ok(files.some((f) => /^assets-pic-\d+\.[0-9a-f]{16}\.webp$/.test(f)))
})

test("rejects the project root, its parents, and filesystem root", async () => {
  const { root, o } = await project()
  const before = snapshot(root)
  for (const bad of [root, path.dirname(root), path.parse(root).root, path.join(root, "src/..")]) {
    await assert.rejects(() => generate({ ...o, outDir: bad }), /refusing unsafe output directory/, bad)
  }
  assert.deepEqual(snapshot(root), before, "nothing created or deleted")
})

test("rejects source image directories and anything inside or containing them", async () => {
  const { root, o } = await project()
  const before = snapshot(root)
  for (const bad of ["src/assets", "public/lovable-uploads", "public/lovable-uploads/sub", "src", "public"]) {
    await assert.rejects(() => generate({ ...o, outDir: path.join(root, bad) }), /refusing unsafe output directory/, bad)
  }
  assert.ok(fs.existsSync(path.join(root, "public/lovable-uploads/original.webp")), "original .webp survives")
  assert.deepEqual(snapshot(root), before)
})

test("rejects relative traversal that resolves into a source tree", async () => {
  const { root, o } = await project()
  await assert.rejects(() => generate({ ...o, outDir: path.join(root, "public/_img/../../src/assets") }), /refusing/)
  assert.ok(fs.existsSync(path.join(root, "src/assets/pic.png")))
})

test("rejects an absolute path that is the real source tree via a symlink escape", async () => {
  const { root, o } = await project()
  const link = path.join(root, "innocent-looking")
  fs.symlinkSync(path.join(root, "public/lovable-uploads"), link)
  await assert.rejects(() => generate({ ...o, outDir: link }), /refusing/)
  assert.ok(fs.existsSync(path.join(root, "public/lovable-uploads/original.webp")))
  // a symlinked parent of a not-yet-existing output dir is resolved too
  await assert.rejects(() => generate({ ...o, outDir: path.join(link, "new-subdir") }), /refusing/)
})

test("rejects overlap with the cache directory and manifest placement", async () => {
  const { root, o } = await project()
  await assert.rejects(() => generate({ ...o, outDir: o.cacheDir }), /refusing/)
  await assert.rejects(() => generate({ ...o, cacheDir: path.join(o.outDir, "cache") }), /refusing/)
  await assert.rejects(() => generate({ ...o, manifestPath: path.join(root, "src/assets/m.json") }), /refusing/)
})

test("an output directory outside the project (disposable temp dir) is allowed, and a missing one is created", async () => {
  const { o } = await project()
  const out = path.join(mk(), "does", "not", "exist")
  await generate({ ...o, outDir: out })
  assert.ok(fs.readdirSync(out).length > 0)
})

test("cleanup never follows symlinks or removes directories", async () => {
  const { o } = await project()
  const victim = mk(); const target = path.join(victim, "precious.webp"); fs.writeFileSync(target, "precious")
  fs.mkdirSync(o.outDir, { recursive: true })
  fs.symlinkSync(target, path.join(o.outDir, "link-480.0123456789abcdef.webp"))
  fs.mkdirSync(path.join(o.outDir, "dir-480.0123456789abcdef.webp"))
  await generate(o)
  assert.equal(fs.readFileSync(target, "utf8"), "precious", "symlink target untouched")
  assert.ok(fs.existsSync(path.join(o.outDir, "dir-480.0123456789abcdef.webp")), "directory untouched")
})

test("a corrupted cache entry is detected and re-encoded without touching other files", async () => {
  const { o } = await project()
  await generate(o)
  const first = fs.readdirSync(o.outDir).sort()
  const entry = fs.readdirSync(o.cacheDir)[0]
  fs.writeFileSync(path.join(o.cacheDir, entry), "garbage")
  await generate(o)
  assert.deepEqual(fs.readdirSync(o.outDir).sort(), first, "identical output after recovery")
})

test("assertSafeOutputs accepts the real default layout", () => {
  const root = path.resolve(import.meta.dirname, "..")
  assert.doesNotThrow(() => assertSafeOutputs({ root, outDir: path.join(root, "public/_img"), cacheDir: path.join(root, "node_modules/.cache/jolu-images"), manifestPath: path.join(root, "src/generated/image-manifest.json") }))
})

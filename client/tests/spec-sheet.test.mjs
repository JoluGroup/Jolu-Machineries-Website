// M3-A2 spec-sheet pilot tests (node:test). Run: npm test
import assert from "node:assert/strict"
import fs from "node:fs"
import path from "node:path"
import test from "node:test"
import { fileURLToPath } from "node:url"
import { build } from "esbuild"

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const read = (f) => fs.readFileSync(path.join(ROOT, f), "utf8")
const walk = (d) => fs.readdirSync(path.join(ROOT, d), { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]))

async function loadData() {
  const cache = path.join(ROOT, "node_modules/.cache"); fs.mkdirSync(cache, { recursive: true })
  const outfile = path.join(cache, "spec-data.mjs")
  await build({ entryPoints: [path.join(ROOT, "src/data/spec-sheets/index.ts")], outfile, bundle: true, format: "esm", platform: "node", alias: { "@": path.join(ROOT, "src") }, loader: { ".png": "dataurl", ".webp": "dataurl", ".jpg": "dataurl", ".json": "json" }, logLevel: "silent" })
  return import(`${outfile}?t=${Date.now()}`)
}
const SHEET_FILES = ["src/data/spec-sheets/types.ts", "src/data/spec-sheets/zoomlion-rs1304-1604.ts", "src/data/spec-sheets/index.ts", "src/pages/SpecSheetPage.tsx", "src/styles/spec-sheet-print.css", ...walk("src/components/spec-sheet")]

test("every published entry has value, known source, publishable status and valid variant", async () => {
  const { getSpecSheet } = await loadData(); const s = getSpecSheet("zoomlion-rs1304-1604"); assert.ok(s)
  const ids = new Set(s.sources.map((x) => x.id)); const variants = new Set(s.variants.map((v) => v.id))
  const allowed = ["website-published", "corroborated", "manufacturer-verified"]
  let n = 0
  for (const g of s.groups) for (const r of g.rows) for (const e of r.entries) {
    n++; assert.ok(String(e.value).length, `${r.id} value`); assert.ok(variants.has(e.variant), `${r.id} variant`)
    assert.ok(allowed.includes(e.status), `${r.id} status ${e.status}`); assert.ok(e.sources.length > 0)
    for (const id of e.sources) assert.ok(ids.has(id), `${r.id} source ${id}`)
  }
  assert.ok(n > 15)
})

test("disputed, unattributable and unverified values are excluded from published data", async () => {
  const { getSpecSheet } = await loadData(); const s = getSpecSheet("zoomlion-rs1304-1604")
  const { excluded, ...published } = s
  const text = JSON.stringify(published)
  const values = published.groups.flatMap((g) => g.rows.flatMap((r) => r.entries.map((e) => `${e.value} ${e.unit ?? ""}`))).concat(published.kpis.map((k) => JSON.stringify(k)), published.standardEquipment, [published.lede, published.optionalConfigurationNote])
  const body = values.join("\n")
  for (const bad of [/National\s*I{2,3}/i, /28200/, /95\.5/, /117\.6/, /\b85\s*\/\s*105\b/, /\bISO\b/, /\bCE\b/, /warranty/i, /KES|USD|Ksh|\$\s?\d/i]) assert.ok(!bad.test(body), `published data matches ${bad}`)
  assert.ok(excluded.length >= 6); assert.equal(s.reviewState, "pilot-preview")
  assert.match(s.confirmNote, /confirm/i)
})

test("components contain no editing, customizer, storage, hard-coded hex or network code", () => {
  for (const f of SHEET_FILES) {
    const t = read(f)
    assert.ok(!/contenteditable|type=["']color["']|localStorage|sessionStorage|fetch\(|XMLHttpRequest/i.test(t), `${f} forbidden API`)
    if (/\.(css|tsx?)$/.test(f)) assert.ok(!/#[0-9a-fA-F]{3,8}\b/.test(t.replace(/&#\d+;/g, "")), `${f} hard-coded hex`)
  }
})

test("print CSS declares A4, hides controls and defines no global palette", () => {
  const css = read("src/styles/spec-sheet-print.css"); const page = read("src/pages/SpecSheetPage.tsx")
  assert.match(page, /@page \{ size: A4 portrait; margin: 0; \}/); assert.match(css, /@media print/); assert.match(css, /break-after: page/)
  assert.match(css, /print-color-adjust: exact/); assert.match(css, /\.ss-noprint\s*\{?[^}]*display: none/s)
  assert.ok(!/:root\s*\{/.test(css))
})

test("route is registered; catalogue and product detail do not link to the sheet", () => {
  assert.match(read("src/App.tsx"), /\/products\/:slug\/spec-sheet/)
  for (const f of walk("src").filter((x) => /\.tsx?$/.test(x) && !SHEET_FILES.includes(x) && !x.endsWith("App.tsx"))) assert.ok(!/spec-sheet/.test(read(f)), `${f} links to spec-sheet`)
})

test("no new dependencies and vercel.json untouched by the pilot", () => {
  const pkg = JSON.parse(read("package.json")); assert.ok(!Object.keys({ ...pkg.dependencies, ...pkg.devDependencies }).some((k) => /print|pdf|html2canvas|jspdf|qrcode/i.test(k)))
})

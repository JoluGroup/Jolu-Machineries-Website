// Specification-sheet tests (M3-A2 pilot + M3-A4 Batch 1). node:test. Run: npm test
import assert from "node:assert/strict"
import fs from "node:fs"
import path from "node:path"
import test from "node:test"
import { fileURLToPath } from "node:url"
import { build } from "esbuild"
import sharp from "sharp"

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const read = (f) => fs.readFileSync(path.join(ROOT, f), "utf8")
const walk = (d) => fs.readdirSync(path.join(ROOT, d), { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]))

async function loadData() {
  const cache = path.join(ROOT, "node_modules/.cache"); fs.mkdirSync(cache, { recursive: true })
  const outfile = path.join(cache, "spec-data.mjs")
  await build({ entryPoints: [path.join(ROOT, "src/data/spec-sheets/index.ts")], outfile, bundle: true, format: "esm", platform: "node", alias: { "@": path.join(ROOT, "src") }, loader: { ".png": "dataurl", ".webp": "dataurl", ".jpg": "dataurl", ".json": "json" }, logLevel: "silent" })
  return import(`${outfile}?t=${Date.now()}`)
}
const SLUGS = ["zoomlion-rs1304-1604", "zoomlion-rc904-1104", "zoomlion-rk504-704", "zoomlion-pg2004", "zoomlion-pl2304"]
const SHEET_FILES = ["src/pages/SpecSheetPage.tsx", "src/styles/spec-sheet-print.css", ...walk("src/data/spec-sheets"), ...walk("src/components/spec-sheet")]
const entriesOf = (s) => s.groups.flatMap((g) => g.rows.flatMap((r) => r.entries.map((e) => ({ row: r.id, ...e }))))
/** Every customer-facing string of a sheet (excludes the internal `excluded` and `sources` records and notes). */
const publishedText = (s) => {
  const { excluded, sources, ...pub } = s
  const strip = (o) => JSON.parse(JSON.stringify(o, (k, v) => (k === "note" || k === "rationale" || k === "sources" || k === "derivedFrom" || k === "image" || k === "id" || k === "rowId" || k === "subject" ? undefined : v)))
  return JSON.stringify(strip(pub))
}

test("registry holds exactly the five approved sheets; unknown slugs resolve to undefined", async () => {
  const { specSheets, getSpecSheet } = await loadData()
  assert.deepEqual(Object.keys(specSheets).sort(), [...SLUGS].sort())
  for (const bad of [undefined, "", "nope", "constructor", "__proto__", "toString", "hasOwnProperty", "zoomlion-rn904", "zoomlion-rs1304-1604/"]) assert.equal(getSpecSheet(bad), undefined, String(bad))
  for (const s of SLUGS) assert.equal(getSpecSheet(s).slug, s)
})

test("every published entry has value, known source, publishable status, valid column, and nothing is 'approved' or manufacturer-verified", async () => {
  const { specSheets } = await loadData()
  const allowed = ["website-published", "corroborated", "manufacturer-verified"]
  for (const slug of SLUGS) {
    const s = specSheets[slug]; const ids = new Set(s.sources.map((x) => x.id)); const cols = new Set(s.variants.map((v) => v.id)); let n = 0
    assert.notEqual(s.reviewState, "approved", `${slug} must stay un-approved until the owner approves`)
    for (const e of entriesOf(s)) {
      n++; assert.ok(String(e.value).length, `${slug}/${e.row} value`); assert.ok(cols.has(e.variant), `${slug}/${e.row} column ${e.variant}`)
      assert.ok(allowed.includes(e.status), `${slug}/${e.row} status`); assert.notEqual(e.status, "manufacturer-verified", `${slug}/${e.row}: no manufacturer datasheet exists`)
      assert.ok(e.sources.length > 0); for (const id of e.sources) assert.ok(ids.has(id), `${slug}/${e.row} source ${id}`)
      if (e.status === "corroborated") assert.ok(e.sources.some((id) => s.sources.find((x) => x.id === id).kind === "jolu-document"), `${slug}/${e.row} corroborated needs a JOLU document`)
    }
    for (const k of s.kpis) { assert.ok(allowed.includes(k.status)); for (const id of k.sources) assert.ok(ids.has(id)) }
    assert.ok(n >= 15, slug)
    for (const r of s.groups.flatMap((g) => g.rows)) assert.equal(r.entries.length, s.variants.length, `${slug}/${r.id} has an entry per column`)
  }
})

test("model / configuration attribution: column kinds are explicit and never conflated", async () => {
  const { specSheets } = await loadData(); const S = specSheets
  const kinds = (s) => new Set(s.variants.map((v) => v.kind))
  for (const slug of SLUGS) assert.equal(kinds(S[slug]).size, 1, `${slug} columns share one kind`)
  assert.deepEqual([...kinds(S["zoomlion-rs1304-1604"])], ["published-configuration"])
  assert.deepEqual([...kinds(S["zoomlion-rc904-1104"])], ["distinct-model"])
  assert.deepEqual([...kinds(S["zoomlion-rk504-704"])], ["distinct-model"])
  assert.deepEqual([...kinds(S["zoomlion-pg2004"])], ["single-machine"]); assert.deepEqual([...kinds(S["zoomlion-pl2304"])], ["single-machine"])
  assert.equal(S["zoomlion-pg2004"].variants.length, 1); assert.equal(S["zoomlion-pl2304"].variants.length, 1)
  // model-specific values stay with their model
  const val = (s, row, col) => entriesOf(s).find((e) => e.row === row && e.variant === col)
  const rc = S["zoomlion-rc904-1104"], rk = S["zoomlion-rk504-704"]
  assert.equal(val(rc, "dimensions", "rc904").value, "4390×2095×2950"); assert.equal(val(rc, "dimensions", "rc1104").value, "4500×2095×2950")
  assert.equal(val(rc, "rated-power", "rc904").value, "66.2"); assert.equal(val(rc, "rated-power", "rc1104").value, "81")
  assert.equal(val(rc, "traction", "rc904").value, "25.4"); assert.equal(val(rc, "traction", "rc1104").value, "29.4")
  assert.equal(val(rk, "dimensions", "rk504").value, "3980×1750×2620"); assert.equal(val(rk, "dimensions", "rk704").value, "4030×1728×2840")
  assert.equal(val(rk, "rated-power", "rk504").value, "36.8"); assert.equal(val(rk, "rated-power", "rk704").value, "51.5")
  assert.equal(val(rk, "pto-speed", "rk504").value, "540/1000"); assert.equal(val(rk, "pto-speed", "rk704").value, "540/760")
  // RC per-model split of merged slash pairs is website-only, not "corroborated"
  for (const row of ["rated-power", "lifting", "traction"]) for (const c of ["rc904", "rc1104"]) assert.equal(val(rc, row, c).status, "website-published", `rc ${row}`)
  // RK per-model cells are printed separately in the Company Profile
  for (const c of ["rk504", "rk704"]) assert.equal(val(rk, "rated-power", c).status, "corroborated")
  // diagram envelopes follow the columns; equal columns share one envelope
  assert.equal(rc.dimensions.envelopes.length, 2); assert.equal(rk.dimensions.envelopes.length, 2)
  assert.deepEqual(rc.dimensions.envelopes.map((e) => e.lengthMm), [4390, 4500]); assert.deepEqual(rk.dimensions.envelopes.map((e) => e.lengthMm), [3980, 4030])
  for (const slug of ["zoomlion-rs1304-1604", "zoomlion-pg2004", "zoomlion-pl2304"]) assert.equal(S[slug].dimensions.envelopes.length, 1)
  for (const slug of SLUGS) for (const c of S[slug].variants) assert.equal(typeof S[slug].dimensions.groundClearanceMm[c.id], "number", `${slug} clearance ${c.id}`)
  // pilot keeps its configuration wording and never presents separate models
  assert.match(S["zoomlion-rs1304-1604"].variants[0].title, /configuration/i)
  assert.ok(!S["zoomlion-rs1304-1604"].variants.some((v) => v.kind === "distinct-model"))
})

test("website-only sheets (PG2004, PL2304) never claim corroboration or a JOLU document", async () => {
  const { specSheets } = await loadData()
  for (const slug of ["zoomlion-pg2004", "zoomlion-pl2304"]) {
    const s = specSheets[slug]
    assert.ok(entriesOf(s).every((e) => e.status === "website-published"), slug); assert.ok(s.kpis.every((k) => k.status === "website-published"), slug)
    assert.ok(s.sources.every((x) => x.kind !== "jolu-document" && x.kind !== "manufacturer"), slug)
    assert.match(s.lede, /website only/i)
  }
})

test("content exclusions: disputed, unverified, optional, price and certification content never reaches a sheet", async () => {
  const { specSheets } = await loadData()
  const always = [/\bISO\b/, /\bCE\b/, /warrant/i, /KES|USD|Ksh|\$\s?\d|\bprice/i, /GPS|driverless|unmanned|hybrid|intelligent|smart|world'?s top|brand-new|top global/i, /Eur(o|opean)/i, /\boptional\b/i, /\boption\b/i]
  for (const slug of SLUGS) { const t = publishedText(specSheets[slug]); for (const re of always) assert.ok(!re.test(t.replace("No optional configurations have been verified for this machine. Ask JOLU Machineries for available options.", "")), `${slug} matches ${re}`) }
  const text = (slug) => publishedText(specSheets[slug])
  assert.ok(!/National/.test(text("zoomlion-rs1304-1604")), "pilot: disputed emission excluded"); assert.ok(!/28200|28,200/.test(text("zoomlion-rs1304-1604")))
  assert.ok(!/95\.5|117\.6|\b85\s*\/\s*105\b/.test(text("zoomlion-rs1304-1604")))
  for (const slug of ["zoomlion-pg2004", "zoomlion-pl2304"]) assert.ok(!/National|emission|front PTO/i.test(text(slug)), `${slug}: no emission or front-PTO claim`)
  for (const slug of ["zoomlion-rc904-1104", "zoomlion-rk504-704"]) { const t = text(slug); assert.ok(!/National III/.test(t)); assert.ok(/National II/.test(t)); }
  const rk = text("zoomlion-rk504-704"); assert.ok(!/50\s*[–-]\s*70|50\/75|75\s*HP|70\s*hp|\bhp\b/i.test(rk), "RK: conflicting hp headline withheld")
  const rc = text("zoomlion-rc904-1104"); assert.ok(!/old model|new model|RC1104-A|Cab \(|\bcab\b/i.test(rc), "RC: no old/new split and no cab claim"); assert.ok(!/90\s*[–/-]\s*110|\bhp\b/i.test(rc))
  // every excluded record carries a reason and detail
  for (const slug of SLUGS) { const s = specSheets[slug]; assert.ok(s.excluded.length >= 6, slug); for (const x of s.excluded) { assert.ok(x.reason && x.detail && x.label, `${slug}/${x.id}`) }
    for (const id of ["price", "warranty-certifications"]) assert.ok(s.excluded.some((x) => x.id === id), `${slug} records ${id}`) }
  for (const [slug, id] of [["zoomlion-rk504-704", "hp-headline"], ["zoomlion-pl2304", "emission"], ["zoomlion-pl2304", "european-standards"], ["zoomlion-pg2004", "emission"], ["zoomlion-rc904-1104", "cab-optional"], ["zoomlion-rc904-1104", "rc1104-old-new"]]) assert.ok(specSheets[slug].excluded.some((x) => x.id === id), `${slug} excludes ${id}`)
  assert.equal(specSheets["zoomlion-pl2304"].excluded.find((x) => x.id === "emission").reason, "disputed")
})

test("quick-strip and KPI figures are present in the published rows", async () => {
  const { specSheets } = await loadData()
  const num = (v) => String(v).replace(/,/g, "").match(/[\d.]+/g) ?? []
  for (const slug of SLUGS) {
    const s = specSheets[slug]; const have = new Set(entriesOf(s).flatMap((e) => num(e.value)).concat(s.kpis.flatMap((k) => num(k.value))))
    for (const q of s.quick) { assert.equal(q.value.length > 0, true); for (const n of num(q.value)) assert.ok(have.has(n) || s.groups.some((g) => g.rows.some((r) => r.entries.some((e) => num(e.value).includes(n)))), `${slug} quick ${q.label} ${n}`) }
    for (const k of s.kpis) for (const n of num(k.value)) assert.ok(entriesOf(s).some((e) => num(e.value).includes(n)) || slug === "zoomlion-rs1304-1604", `${slug} kpi ${k.id} ${n}`)
  }
})

test("per-product image fit keeps the whole machine visible without distortion or needless upscaling", async () => {
  const { specSheets } = await loadData()
  for (const slug of SLUGS) {
    const s = specSheets[slug]; const f = s.imageFit; const file = path.join(ROOT, "src", s.image.replace("@/", ""))
    const { data, info } = await sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
    let x0 = info.width, x1 = -1, y0 = info.height, y1 = -1
    for (let y = 0; y < info.height; y++) for (let x = 0; x < info.width; x++) { const i = (y * info.width + x) * 4; if (data[i + 3] > 20 && data[i] + data[i + 1] + data[i + 2] < 735) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y } }
    const m = { left: x0 / info.width, top: y0 / info.height, right: (x1 + 1) / info.width, bottom: (y1 + 1) / info.height }
    for (const k of Object.keys(m)) assert.ok(Math.abs(m[k] - f.subject[k]) <= 0.005, `${slug} subject.${k} data ${f.subject[k]} vs measured ${m[k].toFixed(3)}`)
    assert.equal(f.sourceWidthPx, info.width, `${slug} source width`)
    // centre-scaled window must contain the whole subject on both axes
    const win = 0.5 / f.scale; assert.ok(f.subject.left >= 0.5 - win - 1e-6 && f.subject.right <= 0.5 + win + 1e-6, `${slug} subject cropped horizontally`)
    assert.ok(f.scale >= 1 && f.scale <= 1.25, `${slug} scale bounds`)
    assert.ok((f.subject.right - f.subject.left) * f.scale <= 0.9, `${slug} subject fills too much of the panel`)
    if (info.width < 990) assert.ok(f.scale <= 1.15, `${slug}: lower-resolution source must not be enlarged beyond 115%`)
    assert.ok(380 * f.scale <= info.width, `${slug}: displayed width must not exceed the source resolution`)
    assert.ok(f.rationale.length > 20)
  }
  const css = read("src/styles/spec-sheet-print.css"); assert.match(css, /--ss-img-scale/); assert.ok(!/width: 120%/.test(css), "no hard-coded 120% image enlargement")
})

test("components contain no editing, customizer, storage, hard-coded hex or network code", () => {
  for (const f of SHEET_FILES) {
    const t = read(f)
    assert.ok(!/contenteditable|type=["']color["']|localStorage|sessionStorage|fetch\(|XMLHttpRequest/i.test(t), `${f} forbidden API`)
    if (/\.(css|tsx?)$/.test(f)) assert.ok(!/#[0-9a-fA-F]{3,8}\b/.test(t.replace(/&#\d+;/g, "")), `${f} hard-coded hex`)
  }
})

test("print CSS declares A4, hides controls and defines no global palette; diagram disclaimer is present", () => {
  const css = read("src/styles/spec-sheet-print.css"); const page = read("src/pages/SpecSheetPage.tsx"); const ov = read("src/components/spec-sheet/ProductOverview.tsx")
  assert.match(page, /@page \{ size: A4 portrait; margin: 0; \}/); assert.match(css, /@media print/); assert.match(css, /break-after: page/)
  assert.match(css, /print-color-adjust: exact/); assert.match(css, /\.ss-noprint\s*\{?[^}]*display: none/s); assert.ok(!/:root\s*\{/.test(css))
  const sentence = "Illustrative diagram — not to scale. Confirm installation dimensions before purchase."
  assert.ok(page.includes(sentence.replace(" — not", " — not")) || page.replace(/\s+/g, " ").includes(sentence), "page 2 diagram note"); assert.ok(ov.includes(sentence), "page 1 diagram caption")
})

test("generic route is registered; catalogue and product detail do not link to any sheet; robots noindex is applied", () => {
  const app = read("src/App.tsx"); assert.match(app, /\/products\/:slug\/spec-sheet/); assert.equal((app.match(/spec-sheet/g) || []).length, 1, "single generic route")
  assert.match(read("src/pages/SpecSheetPage.tsx"), /noindex,nofollow/)
  for (const f of walk("src").filter((x) => /\.tsx?$/.test(x) && !SHEET_FILES.includes(x) && !x.endsWith("App.tsx"))) assert.ok(!/spec-sheet/.test(read(f)), `${f} links to spec-sheet`)
})

test("no new dependencies", () => {
  const pkg = JSON.parse(read("package.json")); assert.ok(!Object.keys({ ...pkg.dependencies, ...pkg.devDependencies }).some((k) => /print|pdf|html2canvas|jspdf|qrcode/i.test(k)))
})

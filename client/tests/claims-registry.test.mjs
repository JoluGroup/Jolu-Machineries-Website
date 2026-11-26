// M2-CLAIMS-01 regression tests (node:test). Run: npm test
// The registry must be the only source of contact details, unsupported claims must never render, and only verified
// claims may reach metadata/structured data.
import assert from "node:assert/strict"
import fs from "node:fs"
import path from "node:path"
import test from "node:test"
import { fileURLToPath, pathToFileURL } from "node:url"
import { build } from "esbuild"
import React from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { MemoryRouter } from "react-router-dom"

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")

async function bundle(entry, name, extraDefine = {}) {
  const cache = path.join(ROOT, "node_modules/.cache")
  fs.mkdirSync(cache, { recursive: true })
  const outfile = path.join(cache, `${name}.mjs`)
  await build({
    entryPoints: [path.join(ROOT, entry)], outfile, bundle: true, format: "esm", platform: "node", jsx: "automatic",
    external: ["react", "react-dom", "react-dom/server", "react-router-dom", "react/jsx-runtime"],
    alias: { "@": path.join(ROOT, "src") }, mainFields: ["module", "main"], conditions: ["module", "import"],
    loader: { ".png": "dataurl", ".jpg": "dataurl", ".jpeg": "dataurl", ".webp": "dataurl", ".svg": "dataurl", ".json": "json", ".css": "empty" },
    define: { "import.meta.env.BASE_URL": '"/"', "import.meta.env.DEV": "false", "import.meta.env.VITE_API_BASE": '""', ...extraDefine }, logLevel: "silent",
  })
  return import(pathToFileURL(outfile).href + "?t=" + Date.now())
}

const render = (Comp) => renderToStaticMarkup(React.createElement(MemoryRouter, null, React.createElement(Comp)))
const reg = await bundle("src/config/business.ts", "claims-registry")

// Wording that must never reach customers (or the client bundle) while its claim is unsupported. Case-insensitive.
const FORBIDDEN = [
  "facebook.com/search", "leading distributors", "premier dealer", "trusted partner", "trusted dealer",
  "Trusted Agricultural Partner", "global leader in agricultural technology", "Genuine OEM", "Genuine Spare Parts",
  "genuine spare parts", "authentic Zoomlion", "In Stock", "Low Stock", "Best Seller", "New Arrival", " reviews)",
  "Faith Yegon", "Geoffrey Bosire", "John Ouma", "FILE_ID_",
]
const forbiddenIn = (text) => FORBIDDEN.filter((f) => text.toLowerCase().includes(f.toLowerCase()))

test("every claim has an id, owner item C1-C19, a valid status and a recorded source", () => {
  assert.ok(reg.ALL_CLAIMS.length >= 25)
  const ids = new Set()
  for (const c of reg.ALL_CLAIMS) {
    assert.ok(c.id && !ids.has(c.id), `duplicate or missing id ${c.id}`); ids.add(c.id)
    assert.match(c.ownerItem, /^C(1[0-9]|[1-9])(\/C(1[0-9]|[1-9]))?$/, c.id)
    assert.ok(["verified", "pending", "unsupported"].includes(c.status), c.id)
    assert.ok(c.source && c.source.length > 3, `${c.id} has no source`)
  }
  // Every owner item C1-C19 is represented.
  const items = new Set(reg.ALL_CLAIMS.flatMap((c) => c.ownerItem.split("/")))
  for (let i = 1; i <= 19; i++) assert.ok(items.has(`C${i}`), `C${i} missing from registry`)
})

test("nothing is marked verified until the owner confirms it (this branch ships no owner confirmations)", () => {
  assert.deepEqual(reg.ALL_CLAIMS.filter((c) => c.status === "verified").map((c) => c.id), [])
})

test("visible(): verified and pending shown, unsupported never; forStructuredData(): verified only", () => {
  const mk = (status) => ({ id: "x", ownerItem: "C1", status, value: "v", source: "test" })
  assert.equal(reg.visible(mk("verified")), "v")
  assert.equal(reg.visible(mk("pending")), "v")
  assert.equal(reg.visible(mk("unsupported")), undefined)
  assert.equal(reg.forStructuredData(mk("verified")), "v")
  assert.equal(reg.forStructuredData(mk("pending")), undefined)
  assert.equal(reg.forStructuredData(mk("unsupported")), undefined)
  // With today's registry no identity, contact or location value is eligible for structured data.
  for (const c of reg.ALL_CLAIMS) assert.equal(reg.forStructuredData(c), undefined, c.id)
})

test("strict mode (VITE_CLAIMS_STRICT=true) hides pending claims from visible content too", async () => {
  const strict = await bundle("src/config/business.ts", "claims-registry-strict", { "import.meta.env.VITE_CLAIMS_STRICT": '"true"' })
  assert.equal(strict.STRICT, true)
  assert.equal(strict.visible(strict.phones.primary), undefined)
  assert.equal(strict.visible({ ...strict.phones.primary, status: "verified" })?.e164, "+254705038679")
  assert.equal(reg.STRICT, false)
})

test("conflicts are recorded, not resolved: both Migori addresses and all three emails remain distinct entries", () => {
  assert.notEqual(reg.locations.migoriFooter.value.address, reg.locations.migoriFloating.value.address)
  assert.deepEqual(new Set([reg.emails.general.value, reg.emails.gmail.value, reg.emails.group.value]).size, 3)
  assert.equal(reg.social.facebook.status, "unsupported")
  assert.equal(reg.testimonials.status, "unsupported")
  assert.equal(reg.spareParts.stockBadges.status, "unsupported")
  assert.equal(reg.manufacturer.relationship.status, "unsupported")
  assert.deepEqual(reg.stats.homepage.value.map((s) => s.target), [500, 5, 480])
  assert.equal(reg.stats.homepage.status, "pending")
})

test("no phone number, email address, wa.me or tel: literal exists outside the registry", () => {
  const files = []
  const walk = (d) => { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const f = path.join(d, e.name); if (e.isDirectory()) walk(f); else if (/\.(tsx?|jsx?)$/.test(e.name)) files.push(f) } }
  walk(path.join(ROOT, "src"))
  const offenders = []
  for (const f of files) {
    const rel = path.relative(ROOT, f)
    if (rel === path.join("src", "config", "business.ts")) continue
    const src = fs.readFileSync(f, "utf8")
    const hits = [
      ...src.matchAll(/(\+?254|\b0)[ -]?7\d{2}[ -]?\d{3}[ -]?\d{3}/g),
      ...src.matchAll(/[A-Za-z0-9._%+-]+@(?!example\.)[a-z0-9-]+\.[a-z.]{2,}/g),
      ...src.matchAll(/wa\.me\/\d+|tel:\+?\d+/g),
    ].map((m) => m[0])
    if (hits.length) offenders.push(`${rel}: ${[...new Set(hits)].join(", ")}`)
  }
  assert.deepEqual(offenders, [])
})

test("<AboutSection> renders no testimonials, no superlative manufacturer wording and no OEM claims", async () => {
  const { default: About } = await bundle("src/components/AboutSection.tsx", "claims-about")
  const html = render(About)
  assert.deepEqual(forbiddenIn(html), [], "AboutSection")
  assert.ok(html.includes("supplies Zoomlion tractors, harvesters and farm implements"), "neutral description present")
  assert.ok(html.includes("5+ Years Experience"), "experience card still rendered from the registry")
  assert.ok(html.includes("24/7 Support"), "pending service claims still shown (non-strict)")
  assert.ok(!/<svg[^>]*text-yellow-400/.test(html), "no star ratings rendered")
})

test("<Footer> renders registry contacts, no Facebook search link and the neutral description", async () => {
  const { default: Footer } = await bundle("src/components/Footer.tsx", "claims-footer")
  const html = render(Footer)
  assert.deepEqual(forbiddenIn(html), [], "Footer")
  for (const s of ["0705 038 679", "info@jolumachineries.com", "0721 700 393", "Near KENGAS Rongo, Migori, Kenya", "0743 682 700", "https://wa.me/254705038679", "instagram.com/jolu_machineries"]) assert.ok(html.includes(s), `Footer lost ${s}`)
  assert.ok(html.includes(reg.manufacturer.neutralDescription))
  assert.ok(!/href="(undefined|)"/.test(html), "no empty or undefined hrefs")
})

test("<SparePartsSection> shows 'Ask for availability' instead of hard-coded stock levels", async () => {
  const { default: Parts } = await bundle("src/components/SparePartsSection.tsx", "claims-parts")
  const html = render(Parts)
  assert.deepEqual(forbiddenIn(html), [], "SparePartsSection")
  assert.ok((html.match(/Ask for availability/g) || []).length >= 1)
})

test("<FloatingContact> and <Header> keep their previously published values via the registry", async () => {
  const { default: Header } = await bundle("src/components/Header.tsx", "claims-header")
  const h = render(Header)
  assert.ok(h.includes("+254 705 038 679 | 0743 682 700"), "header phone line unchanged")
  assert.ok(h.includes("info@jolumachineries.com"))
  const src = fs.readFileSync(path.join(ROOT, "src/components/FloatingContact.tsx"), "utf8")
  assert.match(src, /locations\.migoriFloating/)
  assert.match(src, /waHref\(visible\(phones\.primary\)\)/)
})

test("no unsupported wording anywhere in client source shipped to the browser (src/**, excluding comments)", () => {
  const files = []
  const walk = (d) => { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const f = path.join(d, e.name); if (e.isDirectory()) walk(f); else if (/\.(tsx?|jsx?|json)$/.test(e.name)) files.push(f) } }
  walk(path.join(ROOT, "src"))
  const offenders = []
  for (const f of files) {
    const code = fs.readFileSync(f, "utf8").replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:])\/\/.*$/gm, "$1")
    const hits = forbiddenIn(code)
    if (hits.length) offenders.push(`${path.relative(ROOT, f)}: ${hits.join(", ")}`)
  }
  assert.deepEqual(offenders, [])
  // Unsupported claims carry no value, so withheld wording cannot be bundled through the registry.
  for (const c of reg.ALL_CLAIMS.filter((c) => c.status === "unsupported")) {
    assert.ok(c.value === "" || (Array.isArray(c.value) && c.value.length === 0), `${c.id} still carries a value`)
  }
})

test("<Hero>, <ProductsSection> and <News> render no unsupported claims (ratings, reviews, sales badges, trusted/genuine wording)", async () => {
  for (const [entry, name] of [["src/components/Hero.tsx", "claims-hero"], ["src/components/ProductsSection.tsx", "claims-products"], ["src/pages/News.tsx", "claims-news"]]) {
    const { default: Comp } = await bundle(entry, name)
    const html = render(Comp)
    assert.deepEqual(forbiddenIn(html), [], entry)
    assert.ok(!/text-yellow-400/.test(html), `${entry}: no star ratings`)
  }
})

test("strict mode degrades gracefully: no undefined or empty links, no empty contact rows", async () => {
  const strict = { "import.meta.env.VITE_CLAIMS_STRICT": '"true"' }
  for (const [entry, name] of [
    ["src/components/Header.tsx", "strict-header"], ["src/components/Footer.tsx", "strict-footer"], ["src/components/Hero.tsx", "strict-hero"],
    ["src/components/FloatingContact.tsx", "strict-floating"], ["src/components/ContactSection.tsx", "strict-contact"], ["src/pages/Careers.tsx", "strict-careers"],
    ["src/pages/News.tsx", "strict-news"], ["src/pages/Mud4Fun.tsx", "strict-mud4fun"], ["src/pages/NakuruLaunch.tsx", "strict-nakuru"],
    ["src/pages/ProductDetail.tsx", "strict-product"], ["src/pages/UsedTractors.tsx", "strict-used"],
  ]) {
    const { default: Comp } = await bundle(entry, name, strict)
    const html = render(Comp)
    assert.doesNotMatch(html, /href="(undefined|null|)[?"]/, `${entry}: undefined/empty href`)
    assert.doesNotMatch(html, /(mailto|tel):(undefined)?[?"]|wa\.me\/undefined/, `${entry}: empty contact link`)
    assert.doesNotMatch(html, /<a(?=[\s>])(?![^>]*\shref=)[^>]*>/, `${entry}: anchor without href`)
    for (const s of ["0705 038 679", "0743 682 700", "info@jolumachineries.com", "0721 700 393"]) assert.ok(!html.includes(s), `${entry}: pending ${s} shown in strict mode`)
  }
})

test("default (non-strict) links are byte-identical to the previously published ones", async () => {
  const { default: Hero } = await bundle("src/components/Hero.tsx", "links-hero")
  assert.ok(render(Hero).includes('href="https://wa.me/254705038679?text=Hello%20Jolu%20Machineries%2C%20I%20would%20like%20to%20inquire%20about%20your%20machinery%20fleet."'))
  assert.equal(reg.mailHref(reg.emails.general.value, "Application for Director - Operations & Head of Operations"),
    "mailto:info@jolumachineries.com?subject=Application%20for%20Director%20-%20Operations%20%26%20Head%20of%20Operations")
  assert.equal(reg.mailHref([reg.emails.general.value, reg.emails.gmail.value], " Inquiry - Jolu Machineries"),
    "mailto:info@jolumachineries.com,jolumachineries@gmail.com?subject=%20Inquiry%20-%20Jolu%20Machineries")
  assert.equal(reg.mailHref([undefined, undefined]), undefined)
  assert.equal(reg.waHref(undefined, "x"), undefined)
})

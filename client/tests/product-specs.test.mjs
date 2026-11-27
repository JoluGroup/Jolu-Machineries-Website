// M2-PRODUCT-VERIFY-01: production shows only manufacturer-verified specifications (node:test). Run: npm test
import assert from "node:assert/strict"
import fs from "node:fs"
import path from "node:path"
import test from "node:test"
import { fileURLToPath, pathToFileURL } from "node:url"
import { build } from "esbuild"
import React from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { MemoryRouter, Route, Routes } from "react-router-dom"

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
async function bundle(entry, name, env) {
  const cache = path.join(ROOT, "node_modules/.cache"); fs.mkdirSync(cache, { recursive: true })
  const outfile = path.join(cache, `${name}.mjs`)
  await build({
    entryPoints: [path.join(ROOT, entry)], outfile, bundle: true, format: "esm", platform: "node", jsx: "automatic",
    external: ["react", "react-dom", "react-dom/server", "react-router-dom", "react/jsx-runtime"],
    alias: { "@": path.join(ROOT, "src") }, mainFields: ["module", "main"], conditions: ["module", "import"],
    loader: { ".png": "dataurl", ".jpg": "dataurl", ".jpeg": "dataurl", ".webp": "dataurl", ".svg": "dataurl", ".json": "json" },
    define: { "import.meta.env.BASE_URL": '"/"', "import.meta.env.DEV": "false", "import.meta.env.VITE_API_BASE": '""', "import.meta.env.VITE_DEPLOY_ENV": JSON.stringify(env) }, logLevel: "silent",
  })
  return import(pathToFileURL(outfile).href + "?t=" + Date.now())
}
const prod = await bundle("src/data/spec-verification.ts", "specs-prod", "production")
const { products } = await bundle("src/data/products.ts", "specs-products", "production")
const evidence = [...JSON.parse(fs.readFileSync(path.join(ROOT, "../docs/m2-products/tractors.json"))), ...JSON.parse(fs.readFileSync(path.join(ROOT, "../docs/m2-products/harvesters-implements.json")))]

test("every product and every published spec has a verification status backed by the evidence files", () => {
  assert.equal(Object.keys(prod.SPEC_STATUS).length, 18)
  for (const p of products) {
    const st = prod.SPEC_STATUS[p.slug]; assert.ok(st, p.slug)
    for (const k of p.keySpecs ?? []) assert.ok(st.keySpecs[k.label], `${p.slug} key ${k.label}`)
    for (const r of p.specTable?.rows ?? []) assert.ok(st.table[r[0]], `${p.slug} row ${r[0]}`)
  }
  for (const r of evidence.filter((r) => r.status === "VERIFIED")) assert.match(r.source_url ?? "", /^https:\/\//, `${r.slug} ${r.spec_label} verified without a source`)
})

test("strict mode withholds every non-publishable value; previews keep everything for owner review", () => {
  for (const p of products) {
    const s = prod.shownSpecs(p, true); const st = prod.SPEC_STATUS[p.slug]
    for (const k of s.keySpecs) assert.ok(prod.isPublishable(st.keySpecs[k.label]), `${p.slug} ${k.label}`)
    for (const r of s.specTable?.rows ?? []) assert.ok(prod.isPublishable(st.table[r[0]]), `${p.slug} ${r[0]}`)
    const all = prod.shownSpecs(p, false)
    assert.equal(all.keySpecs.length, p.keySpecs?.length ?? 0)
  }
  // Known manufacturer conflicts never reach production.
  const te = products.find((p) => p.slug === "zoomlion-te100-combine-harvester")
  assert.ok(!JSON.stringify(prod.shownSpecs(te, true)).includes("7230"), "TE100 weight conflicts with Zoomlion (7300 kg)")
  const rn = products.find((p) => p.slug === "zoomlion-rn904")
  assert.equal(prod.shownSpecs(rn, true).keySpecs.length, 0, "RN904/1104 has no manufacturer source yet")
  assert.equal(prod.shownSpecs(rn, true).withheld, true)
  const pg = products.find((p) => p.slug === "zoomlion-pg2004")
  assert.equal(prod.shownSpecs(pg, true).withheld, false, "PG2004 is fully verified")
})

test("production product page and homepage cards render no withheld value", async () => {
  const { default: ProductDetail } = await bundle("src/pages/ProductDetail.tsx", "specs-detail-prod", "production")
  const html = renderToStaticMarkup(React.createElement(MemoryRouter, { initialEntries: ["/products/zoomlion-te100-combine-harvester"] },
    React.createElement(Routes, null, React.createElement(Route, { path: "/products/:slug", element: React.createElement(ProductDetail) }))))
  assert.ok(html.includes("Zoomlion TE100"), "page rendered")
  for (const v of ["7230", "3.2 m", "52 L/s", "540/70R24"]) assert.ok(!html.includes(v), `TE100 conflicting value ${v} shown in production`)
  assert.ok(html.includes("being confirmed with the manufacturer"))
  const cards = prod.gateCardSpecs([{ slug: "zoomlion-rc904-1104", horsepower: "90–110 HP", features: ["16F+8R Gearbox", "Full Hydraulic Steering"] }, { slug: "zoomlion-pg2004", horsepower: "200 HP", features: [] }], products, true)
  assert.equal(cards[0].horsepower, undefined, "unverified RC904 power hidden on the card")
  assert.deepEqual(cards[0].features, ["Full Hydraulic Steering"], "numeric feature hidden, qualitative kept")
})

test("strict mode also gates product copy: descriptions, advantages and the catalogue list", async () => {
  const { default: ProductDetail } = await bundle("src/pages/ProductDetail.tsx", "specs-detail-prod2", "production")
  const page = (slug) => renderToStaticMarkup(React.createElement(MemoryRouter, { initialEntries: [`/products/${slug}`] },
    React.createElement(Routes, null, React.createElement(Route, { path: "/products/:slug", element: React.createElement(ProductDetail) }))))
  const rs = page("zoomlion-rs1304-1604")
  for (const v of ["28200", "100L/min", "37%", "920", "partially synchronized"]) assert.ok(!rs.includes(v), `RS1304 copy leaks ${v}`)
  const zc = page("zc123s-combine-harvester")
  assert.ok(!zc.includes("220L") && !/Xinchai/i.test(zc), "ZC123S conflicting fuel tank / unsupported engine claim")
  for (const [slug, v] of [["zl105-combine-harvester", "660"], ["3-disk-plough", "70–90"], ["zoomlion-pl2304", "European standards"]]) assert.ok(!page(slug).includes(v), `${slug} copy leaks ${v}`)
  const { default: ProductList } = await bundle("src/pages/ProductList.tsx", "specs-list-prod", "production")
  const list = renderToStaticMarkup(React.createElement(MemoryRouter, null, React.createElement(ProductList)))
  for (const v of ["300hp", "70–90", "World's top", "World&#x27;s top"]) assert.ok(!list.includes(v), `catalogue list leaks ${v}`)
  const { default: PreviewDetail } = await bundle("src/pages/ProductDetail.tsx", "specs-detail-preview", "preview")
  const pv = renderToStaticMarkup(React.createElement(MemoryRouter, { initialEntries: ["/products/zoomlion-rs1304-1604"] },
    React.createElement(Routes, null, React.createElement(Route, { path: "/products/:slug", element: React.createElement(PreviewDetail) }))))
  assert.ok(pv.includes("28200"), "previews keep the published copy for owner review")
})

test("publishable statuses rest on manufacturer sources (official Zoomlion domains or the listed manufacturer brochure)", () => {
  const OFFICIAL = /^https:\/\/(en-product\.zoomlion\.com|en\.zoomlion-ag\.com|www\.zoomlion\.com)\//
  // Zoomlion-authored PG Series brochure (© 2023) hosted by a dealer: accepted pending owner sign-off (see report).
  const BROCHURE = "https://www.titanmachinery.ua/images/media/6152/PG-EN.pdf"
  for (const r of evidence.filter((r) => r.status === "VERIFIED" || r.status === "CONFIGURATION-DEPENDENT")) {
    assert.ok(OFFICIAL.test(r.source_url ?? "") || r.source_url === BROCHURE, `${r.slug} ${r.spec_label}: ${r.source_url}`)
  }
  assert.equal(prod.SPEC_STATUS["zoomlion-dv3504-wheeled-tractor"].keySpecs["Horse Power"], "SOURCE UNAVAILABLE")
  assert.equal(prod.SPEC_STATUS["zoomlion-pg2004"].keySpecs["Weight"], "CONFIGURATION-DEPENDENT")
})

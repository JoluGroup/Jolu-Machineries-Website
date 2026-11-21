// Catalogue regression tests (node:test). Run: npm test
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
const read = (f) => fs.readFileSync(path.join(ROOT, f), "utf8")
const CATEGORIES = ["tractors", "harvesters", "implements"]

async function bundle(entry, name) {
  const cache = path.join(ROOT, "node_modules/.cache")
  fs.mkdirSync(cache, { recursive: true })
  const outfile = path.join(cache, `${name}.mjs`)
  await build({
    entryPoints: [path.join(ROOT, entry)], outfile, bundle: true, format: "esm", platform: "node", jsx: "automatic",
    external: ["react", "react-dom", "react-dom/server", "react-router-dom", "react/jsx-runtime"],
    alias: { "@": path.join(ROOT, "src") }, mainFields: ["module", "main"], conditions: ["module", "import"],
    loader: { ".png": "dataurl", ".jpg": "dataurl", ".jpeg": "dataurl", ".webp": "dataurl", ".svg": "dataurl", ".json": "json" },
    define: { "import.meta.env.BASE_URL": '"/"', "import.meta.env.DEV": "false", "import.meta.env.VITE_API_BASE": '""' }, logLevel: "silent",
  })
  return import(pathToFileURL(outfile).href + "?t=" + Date.now())
}

const { products } = await bundle("src/data/products.ts", "catalogue-products")
const { groupProducts, CATALOGUE_GROUPS, productPath } = await bundle("src/data/catalogue.ts", "catalogue-helpers")

test("all 18 products exist with unique ids and slugs", () => {
  assert.equal(products.length, 18)
  assert.equal(new Set(products.map((p) => p.id)).size, 18)
  assert.equal(new Set(products.map((p) => p.slug)).size, 18)
  for (const p of products) assert.match(p.slug, /^[a-z0-9-]+$/, p.slug)
})

test("every product has a valid category (9 tractors, 5 harvesters, 4 implements)", () => {
  for (const p of products) assert.ok(CATEGORIES.includes(p.category), `${p.slug}: ${p.category}`)
  const count = (c) => products.filter((p) => p.category === c).length
  assert.deepEqual([count("tractors"), count("harvesters"), count("implements")], [9, 5, 4])
})

test("categories agree with the established classification on the home page catalogue", () => {
  const src = read("src/components/ProductsSection.tsx")
  const home = Object.fromEntries([...src.matchAll(/slug:\s*"([^"]+)",\s*name:\s*"[^"]*",\s*category:\s*"([^"]+)"/g)].map((m) => [m[1], m[2]]))
  assert.equal(Object.keys(home).length, 18)
  for (const p of products) assert.equal(home[p.slug], p.category, `${p.slug} differs from ProductsSection`)
})

test("grouping covers every product exactly once", () => {
  const groups = groupProducts(products)
  assert.deepEqual(groups.map((g) => g.category), CATALOGUE_GROUPS.map((g) => g.category))
  assert.equal(groups.reduce((n, g) => n + g.items.length, 0), 18)
  assert.equal(new Set(groups.flatMap((g) => g.items.map((p) => p.slug))).size, 18)
})

test("no singular /product/<slug> links remain anywhere in the client source", () => {
  const files = []
  const walk = (d) => { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const f = path.join(d, e.name); if (e.isDirectory()) walk(f); else if (/\.(tsx?|html|xml|txt|json|webmanifest)$/.test(e.name)) files.push(f) } }
  walk(path.join(ROOT, "src")); walk(path.join(ROOT, "public")); files.push(path.join(ROOT, "index.html"))
  const hits = files.filter((f) => /["'`]\/product\//.test(fs.readFileSync(f, "utf8")) || /to=\{`\/product\//.test(fs.readFileSync(f, "utf8")))
  assert.deepEqual(hits.map((f) => path.relative(ROOT, f)), [])
})

test("routes exist for the catalogue and every product slug resolves through /products/:slug", () => {
  const app = read("src/App.tsx")
  assert.match(app, /path="\/products"/)
  assert.match(app, /path="\/products\/:slug"/)
  assert.match(read("src/pages/ProductDetail.tsx"), /\.slug\s*===/)
  for (const p of products) assert.equal(productPath(p.slug), `/products/${p.slug}`)
})

test("<ProductList> renders all 18 products with correct links and no undefined values", async () => {
  const mod = await bundle("src/pages/ProductList.tsx", "catalogue-list")
  const html = renderToStaticMarkup(React.createElement(MemoryRouter, null, React.createElement(mod.default)))
  for (const p of products) assert.ok(html.includes(`href="/products/${p.slug}"`), `missing link for ${p.slug}`)
  assert.equal((html.match(/View Details/g) || []).length, 18)
  assert.equal((html.match(/<header/g) || []).length, 1, "exactly one site header")
  assert.equal((html.match(/<footer/g) || []).length, 1, "exactly one site footer")
  assert.equal((html.match(/@\/assets\//g) || []).length, 0, "no raw image keys leaked into the DOM")
  assert.equal((html.match(/<img[^>]*\ssrcset=/gi) || []).length >= 18, true, "all product images are ResponsiveImage (srcset)")
  assert.equal((html.match(/href="\/product\//g) || []).length, 0)
  for (const g of CATALOGUE_GROUPS) assert.ok(html.includes(g.heading), g.heading)
  const text = html.replace(/<[^>]*>/g, " ")
  assert.ok(!/\b(undefined|NaN|null)\b/.test(text), "no undefined/NaN/null in rendered text")
  assert.ok(!/(src|href)="[^"]*\bundefined\b/.test(html), "no undefined in src/href")
})

test("header and footer link to the /products catalogue", () => {
  assert.match(read("src/components/Header.tsx"), /href:\s*"\/products"/)
  assert.match(read("src/components/Footer.tsx"), /to="\/products"/)
})

// ---- /products card presentation regression (M2-R04: product images must not be cropped) ----
async function renderProductList() {
  const mod = await bundle("src/pages/ProductList.tsx", "catalogue-list-visuals")
  return renderToStaticMarkup(React.createElement(MemoryRouter, null, React.createElement(mod.default)))
}

test("/products renders exactly 18 product cards (9 tractors, 5 harvesters, 4 implements)", async () => {
  const html = await renderProductList()
  const cards = html.match(/<article\b[\s\S]*?<\/article>/g) || []
  assert.equal(cards.length, 18)
  const perGroup = groupProducts(products).map((g) => g.items.length)
  assert.deepEqual(perGroup, [9, 5, 4])
  // each product appears exactly once, in a card, with its slug link and its name
  for (const p of products) {
    const owning = cards.filter((c) => c.includes(`href="/products/${p.slug}"`))
    assert.equal(owning.length, 1, `${p.slug} must be in exactly one card`)
    assert.ok(owning[0].includes(p.name.replace(/&/g, "&amp;")), `${p.slug}: name rendered in its card`)
  }
})

test("/products product images are never cropped: object-contain, not object-cover", async () => {
  const html = await renderProductList()
  const imgs = html.match(/<img\b[^>]*>/g) || []
  const productImgs = imgs.filter((i) => /\ssrcset=/i.test(i))
  assert.equal(productImgs.length, 18)
  for (const i of productImgs) {
    assert.match(i, /class="[^"]*\bobject-contain\b/, "product image uses object-contain")
    assert.ok(!/\bobject-(cover|fill)\b/.test(i), "no object-cover/object-fill on product images")
  }
  assert.ok(!/object-cover/.test(read("src/pages/ProductList.tsx")), "ProductList source has no object-cover")
})

test("/products images keep ResponsiveImage behaviour: srcset, sizes, intrinsic size, lazy loading", async () => {
  const html = await renderProductList()
  const productImgs = (html.match(/<img\b[^>]*>/g) || []).filter((i) => /\ssrcset=/i.test(i))
  assert.equal(productImgs.length, 18)
  for (const i of productImgs) {
    assert.match(i, /\swidth="\d+"/)
    assert.match(i, /\sheight="\d+"/)
    assert.match(i, /\sloading="lazy"/)
    assert.match(i, /\ssizes="[^"]+"/)
    assert.match(i, /\salt="[^"]+"/, "non-empty alt text")
  }
})

test("/products image area has a fixed aspect-ratio stage so cards stay aligned", async () => {
  const html = await renderProductList()
  const stages = html.match(/<div class="[^"]*\baspect-\[[^\]]+\][^"]*"/g) || []
  assert.equal(stages.length, 18, "one aspect-ratio image stage per card")
  assert.equal(new Set(stages.map((s) => s.match(/aspect-\[[^\]]+\]/)[0])).size, 1, "same ratio for every card")
  assert.ok(/\bh-full\b/.test(html.match(/<article\b[^>]*>/)[0]), "cards fill their grid row height")
})

test("/products sizes attribute matches the grid (1 col, 2 cols from md, 3 cols from xl)", async () => {
  const html = await renderProductList()
  const src = read("src/pages/ProductList.tsx")
  assert.match(src, /md:grid-cols-2/)
  assert.match(src, /xl:grid-cols-3/)
  const sizes = new Set((html.match(/<img\b[^>]*\ssizes="([^"]+)"/g) || []).map((i) => i.match(/sizes="([^"]+)"/)[1]))
  assert.equal(sizes.size, 1)
  const s = [...sizes][0]
  assert.match(s, /^\(min-width: 1280px\) [^,]*\/ 3\)?, \(min-width: 768px\) [^,]*\/ 2\)?, calc\(100vw - \d+(\.\d+)?rem\)$/)
})

test("/products keeps category headings in order, one header and one footer, valid links", async () => {
  const html = await renderProductList()
  const idx = CATALOGUE_GROUPS.map((g) => html.indexOf(`>${g.heading}</h2>`))
  assert.ok(idx.every((i) => i >= 0) && idx[0] < idx[1] && idx[1] < idx[2], "headings present in order")
  assert.equal((html.match(/<header/g) || []).length, 1)
  assert.equal((html.match(/<footer/g) || []).length, 1)
  const links = [...html.matchAll(/<article[\s\S]*?href="(\/products\/[^"]+)"/g)].map((m) => m[1])
  assert.deepEqual(links.sort(), products.map((p) => `/products/${p.slug}`).sort())
})

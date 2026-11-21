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
    alias: { "@": path.join(ROOT, "src") },
    loader: { ".png": "dataurl", ".jpg": "dataurl", ".jpeg": "dataurl", ".webp": "dataurl", ".svg": "dataurl", ".json": "json" },
    define: { "import.meta.env.BASE_URL": '"/"', "import.meta.env.DEV": "false" }, logLevel: "silent",
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

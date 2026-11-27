// M2-SEC-ROUTER-01: React Router 7 regression tests (node:test). Run: npm test
// Exercises the same build-time renderer the prerender uses (StaticRouter + the shared route table), so a router API
// change that broke direct route access, route parameters, category anchors or the catch-all would fail here.
import assert from "node:assert/strict"
import fs from "node:fs"
import path from "node:path"
import test from "node:test"
import { fileURLToPath } from "node:url"
import { matchPath } from "react-router-dom"
import { loadRenderer } from "../scripts/prerender.mjs"

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const r = await loadRenderer("preview")
const pkg = (name) => JSON.parse(fs.readFileSync(path.join(ROOT, "node_modules", name, "package.json"), "utf8"))

test("installed router is v7 (>= 7.18.0, the release that fixes GHSA-wrjc-x8rr-h8h6 and GHSA-337j-9hxr-rhxg)", () => {
  for (const name of ["react-router", "react-router-dom"]) {
    const [maj, min] = pkg(name).version.split(".").map(Number)
    assert.ok(maj === 7 && min >= 18, `${name} ${pkg(name).version}`)
  }
  assert.ok(!fs.existsSync(path.join(ROOT, "node_modules/@remix-run/router")), "v6 router core is no longer installed")
})

test("no source imports the removed v6 subpath react-router-dom/server", () => {
  const files = []
  const walk = (d) => { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); if (e.isDirectory()) walk(p); else if (/\.(tsx?|mjs)$/.test(e.name)) files.push(p) } }
  walk(path.join(ROOT, "src"))
  for (const f of files) assert.doesNotMatch(fs.readFileSync(f, "utf8"), /from\s+["']react-router-dom\/server["']/, path.relative(ROOT, f))
})

test("route parameters: every product route resolves :slug and renders its own product", async () => {
  const products = r.allRoutes().filter((x) => x.kind === "product")
  assert.equal(products.length, 18)
  for (const p of products) {
    const m = matchPath({ path: "/products/:slug", end: true }, p.path)
    assert.ok(m?.params.slug, p.path)
    const html = await r.renderRoute(p.path)
    assert.ok(html.includes(p.product.name), `${p.path} renders ${p.product.name}`)
    assert.ok(!html.includes(">404<"), `${p.path} is not the 404 page`)
  }
})

test("direct access: every registered route renders without the 404 page; unknown routes render the catch-all", async () => {
  for (const path of r.ROUTE_PATTERNS.filter((x) => !x.includes(":"))) {
    const html = await r.renderRoute(path)
    assert.ok(html.length > 500 && !html.includes(">404<"), path)
  }
  for (const missing of ["/definitely-missing", "/products/not-a-real-product-slug/extra", "/PRODUCTS-x"]) {
    const html = await r.renderRoute(missing)
    assert.ok(html.includes(">404<"), `${missing} renders the catch-all`)
  }
  assert.equal(r.routeForPath("/definitely-missing").kind, "notfound")
})

test("category routes: the catalogue renders every category group and links to product routes", async () => {
  const html = await r.renderRoute("/products")
  for (const heading of ["Our Tractors", "Our Harvesters", "Farm Implements"]) assert.ok(html.includes(heading), heading)
  assert.ok(!(await r.renderRoute("/products/")).includes(">404<"), "trailing slash still reaches the catalogue")
  assert.match(html, /href="\/products\/[a-z0-9-]+"/)
})

test("navigation links resolve to absolute in-app paths (no relative-splat behaviour change in v7)", async () => {
  const html = await r.renderRoute("/")
  const hrefs = [...html.matchAll(/<a [^>]*href="([^"]*)"/g)].map((m) => m[1]).filter((h) => !/^(https?:|mailto:|tel:|#)/.test(h))
  assert.ok(hrefs.length > 5)
  for (const h of hrefs) assert.match(h, /^\//, `in-app link ${h} is absolute`)
})

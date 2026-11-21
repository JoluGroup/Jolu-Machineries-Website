// R-01: missing generated images must not be rewritten to the SPA's index.html (which would be a 200 HTML
// response served for an image URL, under the immutable /_img/ cache header).
// Semantics (Vercel docs): static files take precedence over rewrites; a path that matches no rewrite is a 404.
// The rewrite source below was also checked against path-to-regexp@6 (the matcher Vercel uses).
import assert from "node:assert/strict"
import fs from "node:fs"
import path from "node:path"
import test from "node:test"
import { fileURLToPath } from "node:url"

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const cfg = JSON.parse(fs.readFileSync(path.join(ROOT, "vercel.json"), "utf8"))
const spa = cfg.rewrites.find((r) => r.destination === "/index.html")
// The only construct used is "/((?!<prefix>/).*)"; translate it to the equivalent RegExp.
const m = /^\/\(\(\?!([^)]*)\)\.\*\)$/.exec(spa.source)
const rewrites = (p) => new RegExp(`^/((?!${m[1]}).*)$`).test(p)
const exists = (p) => { try { return fs.statSync(path.join(ROOT, "public", p)).isFile() } catch { return false } } // stand-in for "file in the deployment output"
// Vercel resolution: file exists -> served; else rewrite match -> index.html (200); else -> 404.
const resolve = (p) => (exists(p) ? "file" : rewrites(p) ? "spa-index-200" : "404")

test("vercel.json has exactly one SPA rewrite that excludes /_img/ and keeps the immutable header", () => {
  assert.equal(cfg.rewrites.length, 1)
  assert.ok(m, `unexpected rewrite source ${spa.source}`)
  assert.equal(m[1], "_img/")
  const h = cfg.headers.find((x) => x.source === "/_img/(.*)")
  assert.equal(h.headers.find((x) => x.key === "Cache-Control").value, "public, max-age=31536000, immutable")
})

test("a valid generated image is a static file (never rewritten)", () => {
  const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, "src/generated/image-manifest.json"), "utf8"))
  const file = Object.values(manifest)[0].variants[0].file
  assert.match(file, /^\/_img\//)
  assert.equal(resolve(file), "file")
  assert.equal(rewrites(file), false)
})

test("a missing generated image is a 404, not SPA HTML", () => {
  for (const p of ["/_img/does-not-exist-480.0123456789abcdef.webp", "/_img/", "/_img/sub/x.webp"]) assert.equal(resolve(p), "404", p)
})

test("valid SPA routes, product-detail routes and unknown app routes still reach index.html", () => {
  const slugs = [...fs.readFileSync(path.join(ROOT, "src/data/products.ts"), "utf8").matchAll(/slug:\s*"([^"]+)"/g)].map((x) => x[1])
  assert.ok(slugs.length >= 18)
  for (const p of ["/", "/products", "/gallery", "/news", "/showroom-launch", "/some/unknown/route", ...slugs.map((s) => `/products/${s}`)]) assert.equal(resolve(p), "spa-index-200", p)
  assert.equal(resolve("/_imgs"), "spa-index-200") // only the /_img/ directory is excluded
})

test("existing static assets in public/ are served as files", () => {
  for (const p of ["/favicon.ico", "/robots.txt"]) if (exists(p)) assert.equal(resolve(p), "file", p)
})

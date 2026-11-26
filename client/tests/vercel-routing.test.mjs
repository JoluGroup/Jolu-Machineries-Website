// Routing and cache-header contract for client/vercel.json (R-01 + M2-R03 + M2-SEO-01).
//
// M2-SEO-01: pages are prerendered to flat files (dist/products.html, dist/products/<slug>.html, dist/404.html).
// After the filesystem phase, a clean URL is rewritten to "/$1.html" with `check: true` (used only if that file exists;
// otherwise routing continues), then every remaining non-/_img/ path gets /404.html with status 404. Missing /_img/*
// files still fall through to the platform's plain 404 (no rule matches them), so R-01 is unchanged.
//
// Why `routes` and not `headers`/`rewrites`: a vercel.json `headers` rule runs before the filesystem phase and matches the
// request path only, so it also stamped `Cache-Control: immutable` on the 404 for a missing /_img/* file (observed live).
// Rules placed after `{ "handle": "hit" }` run only for requests that resolved to an existing file.
//
// IMPORTANT: this file tests the CONFIG CONTRACT and a small model of the documented phases. The `hit` phase semantics
// are not spelled out in Vercel's docs; the corrected preview deployment is the real acceptance test.
import assert from "node:assert/strict"
import fs from "node:fs"
import path from "node:path"
import test from "node:test"
import { fileURLToPath } from "node:url"

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const cfg = JSON.parse(fs.readFileSync(path.join(ROOT, "vercel.json"), "utf8"))
const IMMUTABLE = "public, max-age=31536000, immutable"

const phase = { filesystem: [], hit: [] }
{
  let cur = null
  for (const r of cfg.routes) { if (r.handle) { cur = r.handle; assert.ok(cur in phase, `unexpected phase ${cur}`); continue } assert.ok(cur, "route before any handle phase"); phase[cur].push(r) }
}
const re = (src) => new RegExp(`^${src}$`) // Vercel anchors route sources
const exists = (p) => { try { return fs.statSync(path.join(ROOT, "public", p)).isFile() } catch { return false } }

// Files produced by the build: public/ assets plus the prerendered pages (M2-SEO-01).
const SLUGS = [...fs.readFileSync(path.join(ROOT, "src/data/products.ts"), "utf8").matchAll(/slug:\s*"([^"]+)"/g)].map((x) => x[1])
const STATIC_PAGES = [...fs.readFileSync(path.join(ROOT, "src/seo/routes.ts"), "utf8").matchAll(/path:\s*"(\/[^"]*)",\s*kind:/g)].map((x) => x[1]).filter((p) => p !== "/404")
const PRERENDERED = new Set(["/index.html", "/404.html", ...STATIC_PAGES.filter((p) => p !== "/").map((p) => `${p}.html`), ...SLUGS.map((s) => `/products/${s}.html`)])
const built = (p) => PRERENDERED.has(p) || exists(p) || (p === "/" && PRERENDERED.has("/index.html"))

/** Model of the documented phases: existing file -> hit-phase routes; miss -> filesystem-phase routes in order
 *  (a `check: true` rewrite applies only if its destination exists, otherwise routing continues); else 404. */
function respond(p) {
  if (built(p)) {
    const headers = {}
    for (const r of phase.hit) if (re(r.src).test(p)) Object.assign(headers, r.headers)
    return { status: 200, kind: p === "/" || p.endsWith(".html") ? "page" : "file", file: p === "/" ? "/index.html" : p, headers }
  }
  for (const r of phase.filesystem) {
    const m = p.match(re(r.src))
    if (!m) continue
    const dest = r.dest.replace(/\$(\d)/g, (_, i) => m[Number(i)] ?? "")
    if (r.check && !built(dest)) continue
    if (r.status === 404) return { status: 404, kind: "404-page", file: dest, headers: {} }
    return { status: 200, kind: "page", file: dest, headers: {} }
  }
  return { status: 404, kind: "404", headers: {} }
}

test("config shape: routes only (no headers/rewrites keys that would run before the filesystem phase)", () => {
  assert.deepEqual(Object.keys(cfg), ["routes"])
  assert.deepEqual(cfg.routes.filter((r) => r.handle).map((r) => r.handle), ["filesystem", "hit"], "phase order")
  assert.equal(phase.filesystem.length, 2)
  assert.equal(phase.filesystem[0].dest, "/$1.html")
  assert.equal(phase.filesystem[0].check, true, "clean-URL rewrite must only apply when the prerendered file exists")
  assert.equal(phase.filesystem[1].dest, "/404.html")
  assert.equal(phase.filesystem[1].status, 404)
  for (const r of phase.filesystem) assert.ok(r.src.includes("(?!_img/)"), "never rewrite /_img/* (R-01)")
  assert.equal(phase.hit.length, 1)
  assert.equal(phase.hit[0].continue, true, "hit-phase header rules must continue")
  assert.equal(phase.hit[0].dest, undefined)
  assert.equal(phase.hit[0].status, undefined)
  assert.equal(phase.hit[0].headers["Cache-Control"], IMMUTABLE)
})

test("invariants 1-3: existing generated assets are files carrying the immutable header", () => {
  const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, "src/generated/image-manifest.json"), "utf8"))
  const files = Object.values(manifest).flatMap((e) => e.variants.map((v) => v.file))
  assert.ok(files.length > 300)
  for (const f of files) {
    const r = respond(f)
    assert.equal(r.kind, "file", f)
    assert.equal(r.headers["Cache-Control"], IMMUTABLE, f)
  }
})

test("invariants 4-6: missing generated assets are 404, never immutable, never SPA HTML", () => {
  for (const p of ["/_img/m2-verification-nonexistent.webp", "/_img/x.webp", "/_img/", "/_img/sub/x.webp", "/_img/assets-gone-480.0123456789abcdef.webp"]) {
    const r = respond(p)
    assert.equal(r.status, 404, p)
    assert.equal(r.kind, "404", p)
    assert.equal(r.headers["Cache-Control"], undefined, p)
  }
})

test("defence in depth: the immutable rule only matches content-addressed names", () => {
  const rule = re(phase.hit[0].src)
  assert.equal(rule.test("/_img/assets-tractor-1-480.eacd4f5465bab8f9.webp"), true)
  for (const p of ["/_img/x.webp", "/_img/nonexistent.webp", "/_img/a-480.XYZ.webp", "/_img/a-480.0123456789abcde.webp", "/lovable-uploads/a-480.0123456789abcdef.webp"]) assert.equal(rule.test(p), false, p)
})

test("invariant 7 (M2-SEO-01): every route serves its own prerendered page; unknown routes get the 404 page with status 404", () => {
  assert.ok(SLUGS.length >= 18)
  assert.ok(STATIC_PAGES.length >= 13, `static pages found: ${STATIC_PAGES.length}`)
  const expectations = [["/", "/index.html"], ...STATIC_PAGES.filter((p) => p !== "/").map((p) => [p, `${p}.html`]), ...SLUGS.map((s) => [`/products/${s}`, `/products/${s}.html`])]
  for (const [p, file] of expectations) {
    for (const variant of p === "/" ? [p] : [p, `${p}/`]) {
      const r = respond(variant)
      assert.equal(r.status, 200, variant)
      assert.equal(r.file, file, `${variant} -> ${r.file}`)
      assert.equal(r.headers["Cache-Control"], undefined, `${variant} must not be immutable`)
    }
  }
  for (const p of ["/some/unknown/route", "/_imgs", "/products/not-a-product", "/assets/missing-chunk.js", "/index"]) {
    const r = respond(p)
    if (p === "/index") { assert.equal(r.status, 200); continue } // /index.html exists, as before
    assert.equal(r.status, 404, p)
    assert.equal(r.kind, "404-page", p)
    assert.equal(r.headers["Cache-Control"], undefined, p)
  }
})

test("existing static assets outside /_img are files without the immutable header", () => {
  for (const p of ["/favicon.ico", "/robots.txt"]) if (exists(p)) assert.equal(respond(p).headers["Cache-Control"], undefined, p)
})

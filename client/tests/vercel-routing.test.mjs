// Routing and cache-header contract for client/vercel.json (R-01 + M2-R03).
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

/** Model of the documented phases: existing file -> hit-phase routes; miss -> filesystem-phase routes; else 404. */
function respond(p) {
  if (exists(p)) {
    const headers = {}
    for (const r of phase.hit) if (re(r.src).test(p)) Object.assign(headers, r.headers)
    return { status: 200, kind: "file", headers }
  }
  for (const r of phase.filesystem) if (re(r.src).test(p)) return { status: 200, kind: "spa-html", headers: {} }
  return { status: 404, kind: "404", headers: {} }
}

test("config shape: routes only (no headers/rewrites keys that would run before the filesystem phase)", () => {
  assert.deepEqual(Object.keys(cfg), ["routes"])
  assert.deepEqual(cfg.routes.filter((r) => r.handle).map((r) => r.handle), ["filesystem", "hit"], "phase order")
  assert.equal(phase.filesystem.length, 1)
  assert.equal(phase.filesystem[0].dest, "/index.html")
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

test("invariant 7: SPA deep links, product-detail routes and unknown routes still get index.html", () => {
  const slugs = [...fs.readFileSync(path.join(ROOT, "src/data/products.ts"), "utf8").matchAll(/slug:\s*"([^"]+)"/g)].map((x) => x[1])
  assert.ok(slugs.length >= 18)
  for (const p of ["/", "/products", "/gallery", "/news", "/showroom-launch", "/some/unknown/route", "/_imgs", ...slugs.map((s) => `/products/${s}`)]) {
    const r = respond(p)
    // "/" resolves to the built index.html, either way it is the SPA shell
    assert.ok(r.kind === "spa-html" || r.kind === "file", `${p} -> ${r.kind}`)
    assert.notEqual(r.status, 404, p)
    assert.equal(r.headers["Cache-Control"], undefined, `${p} must not be immutable`)
  }
})

test("existing static assets outside /_img are files without the immutable header", () => {
  for (const p of ["/favicon.ico", "/robots.txt"]) if (exists(p)) assert.equal(respond(p).headers["Cache-Control"], undefined, p)
})

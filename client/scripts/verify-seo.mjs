#!/usr/bin/env node
// M2-SEO-01 verification (CI: `npm run verify:seo` after `npm run build`).
//  1. The CI build itself is non-production: every page must be noindex, robots.txt must disallow all, no sitemap.
//  2. A production variant is prerendered into a temp dir and checked: unique self-canonicals on the www host, unique
//     titles/descriptions, valid sitemap covering exactly the indexable routes, meaningful initial HTML with one <h1>,
//     parseable JSON-LD of allowed types without offers/prices/ratings, no unsupported claims, crawler policy, 404.
import fs from "node:fs"
import os from "node:os"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { buildSitemap, prerender } from "./prerender.mjs"

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const DIST = path.join(ROOT, "dist")
const ORIGIN = "https://www.jolumachineries.com"
const errors = []
const fail = (m) => errors.push(m)

// Unsupported claims withheld by M2-CLAIMS-01 must never reach crawlable HTML/metadata.
const FORBIDDEN = ["facebook.com/search", "leading distributors", "premier dealer", "trusted partner", "trusted dealer",
  "global leader in agricultural technology", "Genuine OEM", "Genuine Spare Parts", "authentic Zoomlion", "In Stock",
  "Low Stock", "Faith Yegon", "Geoffrey Bosire", "John Ouma"]
// Unverified specifications/superlatives (registry C16) must not appear in <title>, meta tags or JSON-LD.
const META_FORBIDDEN = [/\b\d+\s?hp\b/i, /World's top/i, /\bsuperior\b/i, /European standards/i, /\boutstanding\b/i, /\d+\s?(kg\/s|L)\b/, /Jolu Group|Jolu Machineries/]
const FORBIDDEN_LD_KEYS = ["offers", "price", "priceCurrency", "availability", "aggregateRating", "review", "brand"]
const ALLOWED_TYPES = new Set(["Organization", "WebSite", "BreadcrumbList", "ListItem", "Product", "ItemList", "Article", "FAQPage", "Question", "Answer", "ImageObject"])
// Routes owned by another lane that do not yet render an <h1> (reported, not failed).
const H1_EXCEPTIONS = new Set(["/schedule"])

const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]))
const htmlFiles = (d) => walk(d).filter((f) => f.endsWith(".html"))
const routeOf = (dir, f) => { const r = "/" + path.relative(dir, f).replace(/\\/g, "/").replace(/\.html$/, ""); return r === "/index" ? "/" : r }
const attr = (html, re) => (html.match(re) || [])[1]
const headOf = (html) => html.slice(0, html.indexOf("</head>"))
const bodyOf = (html) => { const i = html.indexOf('<div id="root">'); return i < 0 ? "" : html.slice(i) }
const text = (html) => html.replace(/<script[\s\S]*?<\/script>/g, " ").replace(/<[^>]*>/g, " ").replace(/&[a-z#0-9]+;/g, " ").replace(/\s+/g, " ").trim()

// ---------------------------------------------------------------- 1. CI (non-production) build
if (!fs.existsSync(DIST)) fail("dist/ missing: run npm run build first")
else {
  const files = htmlFiles(DIST)
  if (files.length < 30) fail(`expected >= 30 prerendered pages in dist, found ${files.length}`)
  for (const f of files) if (!/<meta name="robots" content="noindex, nofollow"/.test(headOf(fs.readFileSync(f, "utf8")))) fail(`preview build: ${path.relative(DIST, f)} is indexable`)
  const robots = fs.existsSync(path.join(DIST, "robots.txt")) ? fs.readFileSync(path.join(DIST, "robots.txt"), "utf8") : ""
  if (!/User-agent: \*\nDisallow: \/\n/.test(robots) || /Sitemap:/.test(robots)) fail("preview build: robots.txt must be 'User-agent: * / Disallow: /' without a sitemap")
  if (fs.existsSync(path.join(DIST, "sitemap.xml"))) fail("preview build: sitemap.xml must not be published")
}

// ---------------------------------------------------------------- 2. production variant
const out = fs.mkdtempSync(path.join(os.tmpdir(), "seo-prod-"))
const { routes } = await prerender({ outDir: out, envOverride: "production" })
const pages = htmlFiles(out).filter((f) => !f.endsWith("404.html"))
const seen = { canonical: new Map(), title: new Map(), description: new Map() }
const indexableUrls = []
for (const f of pages) {
  const route = routeOf(out, f)
  const html = fs.readFileSync(f, "utf8"); const head = headOf(html); const body = bodyOf(html)
  const canonical = attr(head, /<link rel="canonical" href="([^"]+)"/)
  const title = attr(head, /<title>([^<]*)<\/title>/)
  const description = attr(head, /<meta name="description" content="([^"]*)"/)
  const robots = attr(head, /<meta name="robots" content="([^"]*)"/)
  const expected = route === "/" ? `${ORIGIN}/` : `${ORIGIN}${route}`
  if (canonical !== expected) fail(`${route}: canonical ${canonical} != ${expected}`)
  if (attr(head, /<meta property="og:url" content="([^"]+)"/) !== expected) fail(`${route}: og:url mismatch`)
  for (const [k, v] of [["canonical", canonical], ["title", title], ["description", description]]) {
    if (!v) { fail(`${route}: missing ${k}`); continue }
    if (seen[k].has(v)) fail(`${route}: duplicate ${k} shared with ${seen[k].get(v)}`); else seen[k].set(v, route)
  }
  if (description && (description.length < 50 || description.length > 300)) fail(`${route}: description length ${description.length}`)
  for (const tag of ["og:title", "og:description", "og:image", "og:type"]) if (!new RegExp(`property="${tag}" content="[^"]+"`).test(head)) fail(`${route}: missing ${tag}`)
  if (!/name="twitter:card" content="summary_large_image"/.test(head)) fail(`${route}: missing twitter:card`)
  if (/content="[^"]*@\/assets/.test(head)) fail(`${route}: build-time image key leaked into metadata`)
  const noindexExpected = route === "/quote" || route === "/schedule"
  if (noindexExpected && robots !== "noindex, follow") fail(`${route}: expected noindex, follow (got ${robots})`)
  if (!noindexExpected && robots) fail(`${route}: production page must be indexable (robots=${robots})`)
  if (!noindexExpected) indexableUrls.push(expected)
  const h1 = (body.match(/<h1[\s>]/g) || []).length
  if (h1 !== 1 && !(h1 === 0 && H1_EXCEPTIONS.has(route))) fail(`${route}: ${h1} <h1> elements`)
  if (h1 === 0 && H1_EXCEPTIONS.has(route)) console.warn(`verify-seo: ${route} has no <h1> (owned by another lane; reported)`)
  if (text(body).length < 300) fail(`${route}: initial HTML has only ${text(body).length} characters of text`)
  const imgsNoAlt = (body.match(/<img(?![^>]*\balt=)[^>]*>/g) || []).length
  if (imgsNoAlt) fail(`${route}: ${imgsNoAlt} <img> without alt`)
  for (const s of FORBIDDEN) if (html.includes(s)) fail(`${route}: unsupported claim "${s}" present`)
  const headPart = html.slice(0, html.indexOf("</head>"))
  const metaText = [...headPart.matchAll(/<title>([^<]*)<\/title>|<meta [^>]*content="([^"]*)"|<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => m[1] || m[2] || m[3] || "").join(" \n ")
  for (const re of META_FORBIDDEN) if (re.test(metaText)) fail(`${route}: metadata/JSON-LD contains unverified wording ${re}`)
  for (const f of html.match(/<form\b[^>]*>/g) || []) if (!/onsubmit="return false"/.test(f) || !/method="post"/.test(f)) fail(`${route}: prerendered <form> can submit natively: ${f.slice(0, 80)}`)
  for (const m of head.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)) {
    let j; try { j = JSON.parse(m[1]) } catch (e) { fail(`${route}: JSON-LD does not parse: ${e.message}`); continue }
    const walkLd = (o) => {
      if (Array.isArray(o)) return o.forEach(walkLd)
      if (o && typeof o === "object") {
        if (o["@type"] && !ALLOWED_TYPES.has(o["@type"])) fail(`${route}: JSON-LD type ${o["@type"]} not allowed`)
        for (const k of Object.keys(o)) { if (FORBIDDEN_LD_KEYS.includes(k)) fail(`${route}: JSON-LD contains "${k}"`); walkLd(o[k]) }
      }
    }
    walkLd(j)
    if (j["@type"] === "Organization" || j["@type"] === "WebSite") fail(`${route}: ${j["@type"]} emitted while identity (C1) is unverified`)
  }
  if (route.startsWith("/products/") && !/"@type":"Product"/.test(head)) fail(`${route}: Product JSON-LD missing`)
  if (route !== "/" && !/"@type":"BreadcrumbList"/.test(head)) fail(`${route}: BreadcrumbList missing`)
}
if (routes.length !== pages.length) fail(`prerendered ${pages.length} pages but registry has ${routes.length} routes`)
if (routes.filter((r) => r.startsWith("/products/")).length !== 18) fail("expected 18 product pages")

const sitemap = fs.readFileSync(path.join(out, "sitemap.xml"), "utf8")
if (!/^<\?xml version="1\.0" encoding="UTF-8"\?>\n<urlset xmlns="http:\/\/www\.sitemaps\.org\/schemas\/sitemap\/0\.9">\n(  <url>\n    <loc>https:\/\/www\.jolumachineries\.com\/[^<&"']*<\/loc>\n  <\/url>\n)+<\/urlset>\n$/.test(sitemap)) fail("sitemap.xml is not well-formed")
const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((x) => x[1])
if (new Set(locs).size !== locs.length) fail("sitemap has duplicate URLs")
if (JSON.stringify([...locs].sort()) !== JSON.stringify([...indexableUrls].sort())) fail(`sitemap != indexable pages (sitemap ${locs.length}, indexable ${indexableUrls.length})`)
if (sitemap !== buildSitemap(locs)) fail("sitemap differs from builder output")

const robots = fs.readFileSync(path.join(out, "robots.txt"), "utf8")
for (const [agent, rule] of [["Googlebot", "Allow"], ["Bingbot", "Allow"], ["OAI-SearchBot", "Allow"], ["ChatGPT-User", "Allow"], ["PerplexityBot", "Allow"], ["Claude-SearchBot", "Allow"], ["Claude-User", "Allow"], ["GPTBot", "Disallow"], ["Google-Extended", "Disallow"], ["ClaudeBot", "Disallow"], ["*", "Allow"]]) {
  if (!robots.includes(`User-agent: ${agent}\n${rule}: /\n`)) fail(`robots.txt: expected ${agent} ${rule}`)
}
if (!robots.includes(`Sitemap: ${ORIGIN}/sitemap.xml`)) fail("robots.txt: missing Sitemap line")

const nf = fs.readFileSync(path.join(out, "404.html"), "utf8")
if (!/<meta name="robots" content="noindex/.test(headOf(nf)) || /rel="canonical"/.test(headOf(nf))) fail("404.html must be noindex without canonical")
if (!/404/.test(text(bodyOf(nf)))) fail("404.html does not render the not-found page")

fs.rmSync(out, { recursive: true, force: true })
if (errors.length) {
  console.error(`verify-seo: ${errors.length} problem(s)`)
  for (const e of errors) console.error(` - ${e}`)
  if (process.env.GITHUB_ACTIONS) for (const e of errors.slice(0, 40)) console.log(`::error title=verify-seo::${e.replace(/%/g, "%25").replace(/\n/g, "%0A")}`)
  process.exit(1)
}
console.log(`verify-seo: OK (${pages.length} pages, ${locs.length} sitemap URLs, preview build noindex)`)

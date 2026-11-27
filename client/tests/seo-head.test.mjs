// M2-SEO-01 / M2-AEO-GEO-01 unit tests: route registry, head model, structured-data gates, robots policy, sitemap and
// indexability. The full prerender output is checked by scripts/verify-seo.mjs (CI step "SEO / prerender verification").
import assert from "node:assert/strict"
import fs from "node:fs"
import path from "node:path"
import test from "node:test"
import { fileURLToPath, pathToFileURL } from "node:url"
import { build } from "esbuild"
import { buildSitemap, neutraliseForms, onVercel, resolveIndexable } from "../scripts/prerender.mjs"

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const ORIGIN = "https://www.jolumachineries.com"

async function bundle(entry, name) {
  const cache = path.join(ROOT, "node_modules/.cache")
  fs.mkdirSync(cache, { recursive: true })
  const outfile = path.join(cache, `${name}.mjs`)
  await build({
    entryPoints: [path.join(ROOT, entry)], outfile, bundle: true, format: "esm", platform: "node", jsx: "automatic",
    external: ["react", "react-dom", "react-dom/server", "react-router-dom", "react/jsx-runtime"],
    alias: { "@": path.join(ROOT, "src") }, loader: { ".json": "json" },
    define: { "import.meta.env": JSON.stringify({ BASE_URL: "/", DEV: false }) }, logLevel: "silent",
  })
  return import(pathToFileURL(outfile).href + "?t=" + Date.now())
}

const routes = await bundle("src/seo/routes.ts", "seo-routes")
const head = await bundle("src/seo/head.ts", "seo-head")
const sd = await bundle("src/seo/structured-data.ts", "seo-sd")
const crawlers = await bundle("src/seo/crawlers.ts", "seo-crawlers")
const FORBIDDEN = ["leading distributors", "premier dealer", "trusted partner", "trusted dealer", "Genuine OEM", "authentic Zoomlion", "In Stock", "Low Stock", "exclusive"]

test("registry: 13 static routes + 18 products, unique paths, titles and descriptions, no unsupported claims", () => {
  const all = routes.allRoutes()
  assert.equal(all.filter((r) => r.kind === "product").length, 18)
  assert.equal(all.length, 31)
  for (const key of ["path", "title", "description"]) assert.equal(new Set(all.map((r) => r[key])).size, all.length, `duplicate ${key}`)
  for (const r of all) {
    for (const s of FORBIDDEN) assert.ok(!`${r.title} ${r.description}`.includes(s), `${r.path} contains "${s}"`)
    assert.ok(r.description.length >= 50, `${r.path} description too short`)
  }
})

test("registry covers every route in the router ROUTE_TABLE", () => {
  const app = fs.readFileSync(path.join(ROOT, "src/routeTable.tsx"), "utf8")
  const appPaths = [...app.matchAll(/\{ path: "([^"]+)", page:/g)].map((m) => m[1]).filter((p) => p !== "*") // "*" = 404 catch-all
  assert.ok(appPaths.length >= 14)
  const registered = new Set(routes.allRoutes().map((r) => r.path))
  for (const p of appPaths) {
    if (p === "/products/:slug") assert.ok([...registered].some((x) => x.startsWith("/products/")))
    else assert.ok(registered.has(p), `${p} has no SEO metadata`)
  }
})

test("head: self-referencing www canonical, route-specific OG/Twitter, no robots meta on indexable production pages", () => {
  const p = routes.allRoutes().find((r) => r.kind === "product")
  const h = head.buildHead(p, { indexable: true })
  assert.equal(h.canonical, `${ORIGIN}${p.path}`)
  const meta = Object.fromEntries(h.metas.map((m) => [m.id, m.content]))
  assert.equal(meta["og:url"], h.canonical)
  assert.equal(meta["og:type"], "product")
  assert.ok(h.title.startsWith(p.product.name))
  assert.match(meta["og:image"], /^https:\/\/www\.jolumachineries\.com\//)
  assert.ok(!meta["og:image"].includes("@/assets"))
  assert.equal(meta.robots, undefined)
  // C1 displayName is owner-directed (M2-INTEG-02 §7) and verified, so og:site_name carries it; the legal name never does.
  assert.equal(meta["og:site_name"], "JOLU MACHINERIES")
  assert.ok(!Object.values(meta).some((v) => /Jolu Agricultural & Construction Machineries/.test(v)), "pending legal name never in metadata")
  assert.equal(head.buildHead(routes.routeForPath("/"), { indexable: true }).canonical, `${ORIGIN}/`)
  assert.equal(head.buildHead(routes.routeForPath("/products/"), { indexable: true }).canonical, `${ORIGIN}/products`)
})

test("head: forms are noindex,follow in production; everything is noindex,nofollow in non-production builds", () => {
  const robots = (r, indexable) => head.buildHead(routes.routeForPath(r), { indexable }).metas.find((m) => m.id === "robots")?.content
  assert.equal(robots("/quote", true), "noindex, follow")
  assert.equal(robots("/schedule", true), "noindex, follow")
  assert.equal(robots("/products", false), "noindex, nofollow")
  assert.equal(robots("/", false), "noindex, nofollow")
  assert.equal(routes.routeForPath("/definitely-missing").kind, "notfound")
})

test("renderHeadHtml escapes attributes and keeps JSON-LD inside its <script>", () => {
  const html = head.renderHeadHtml({ title: 'A "<b>" & C', metas: [{ key: "name", id: "description", content: '"x" <y>' }], canonical: `${ORIGIN}/`, jsonLd: [{ "@type": "Thing", name: "</script><script>alert(1)</script>" }] })
  assert.ok(html.includes("<title>A &quot;&lt;b&gt;&quot; &amp; C</title>"))
  assert.ok(html.includes('content="&quot;x&quot; &lt;y&gt;"'))
  assert.equal((html.match(/<\/script>/g) || []).length, 1, "payload cannot close the script element")
  assert.ok(!head.renderHeadHtml({ title: "t", metas: [], canonical: "c", jsonLd: [] }, { canonical: false }).includes("canonical"))
})

test("structured data: Product carries only name/description/image/url (no offers, price, availability, brand, ratings)", () => {
  for (const r of routes.allRoutes().filter((x) => x.kind === "product")) {
    const j = sd.product(r)
    assert.deepEqual(Object.keys(j).sort(), ["@context", "@type", "image", "name", "url"], "no description while specs are unverified (C16)")
    assert.equal(j.url, `${ORIGIN}${r.path}`)
    assert.match(j.image, /^https:\/\/www\.jolumachineries\.com\/(_img|lovable-uploads|og-image)/)
  }
})

test("structured data gates: Organization/WebSite only from the verified display name, never the pending legal name; FAQPage only from visible questions", () => {
  // M2-INTEG-02: the owner directed the public-facing brand JOLU MACHINERIES (C1 displayName verified); legalName pending.
  const [org, site] = sd.siteEntities()
  assert.deepEqual([org["@type"], org.name, org.url, org.legalName], ["Organization", "JOLU MACHINERIES", `${ORIGIN}/`, undefined])
  assert.deepEqual([site["@type"], site.name], ["WebSite", "JOLU MACHINERIES"])
  const types = (p) => sd.structuredDataFor(routes.routeForPath(p), routes.allRoutes().filter((r) => r.kind === "product")).map((j) => j["@type"])
  assert.deepEqual(types("/"), ["Organization", "WebSite"])
  assert.deepEqual(types("/products"), ["BreadcrumbList", "ItemList"])
  assert.deepEqual(types("/news"), ["BreadcrumbList", "Article"])
  for (const r of routes.allRoutes()) assert.equal(sd.faqPage(r), null, `${r.path} has no visible Q&A`)
  const faq = sd.faqPage({ ...routes.routeForPath("/spare-parts"), questions: [{ question: "Q?", answer: "A." }] })
  assert.equal(faq["@type"], "FAQPage")
  assert.equal(faq.mainEntity[0].acceptedAnswer.text, "A.")
})

test("Article dates appear only where the page visibly prints one", () => {
  assert.equal(sd.article(routes.routeForPath("/news")).datePublished, "2025-08-23")
  for (const p of ["/ktn-interview", "/mud4fun", "/showroom-launch"]) assert.equal(sd.article(routes.routeForPath(p)).datePublished, undefined, p)
  assert.match(fs.readFileSync(path.join(ROOT, "src/pages/News.tsx"), "utf8"), /Aug\. 23, 2025/)
})

test("robots.txt: production policy allows search/answer crawlers, disallows training crawlers; preview disallows all", () => {
  const prod = crawlers.buildRobotsTxt(true, `${ORIGIN}/sitemap.xml`)
  for (const a of ["Googlebot", "Bingbot", "OAI-SearchBot", "ChatGPT-User", "PerplexityBot", "Claude-SearchBot", "Claude-User"]) assert.ok(prod.includes(`User-agent: ${a}\nAllow: /\n`), a)
  for (const a of ["GPTBot", "Google-Extended", "ClaudeBot"]) assert.ok(prod.includes(`User-agent: ${a}\nDisallow: /\n`), a)
  assert.ok(prod.includes("User-agent: *\nAllow: /\n"))
  assert.ok(prod.includes(`Sitemap: ${ORIGIN}/sitemap.xml`))
  assert.equal(crawlers.buildRobotsTxt(false, "x"), "# Non-production build: not for indexing.\nUser-agent: *\nDisallow: /\n")
})

test("indexability is production-only and refuses to guess on Vercel without VERCEL_ENV", () => {
  const local = "/home/runner/work"
  assert.equal(resolveIndexable({ VERCEL: "1", VERCEL_ENV: "production" }, undefined, local), true)
  assert.equal(resolveIndexable({ VERCEL: "1", VERCEL_ENV: "preview" }, undefined, local), false)
  assert.equal(resolveIndexable({}, undefined, local), false)
  assert.equal(resolveIndexable({ SEO_INDEXABLE: "true" }, undefined, local), true, "local verification override")
  assert.equal(resolveIndexable({ VERCEL: "1", VERCEL_ENV: "preview", SEO_INDEXABLE: "true" }, undefined, local), false, "override cannot index a preview")
  assert.throws(() => resolveIndexable({ VERCEL: "1" }, undefined, local), /VERCEL_ENV/)
  // Vercel detected without VERCEL=1 (system env vars not exposed): still refuses to guess.
  assert.throws(() => resolveIndexable({ VERCEL_URL: "x.vercel.app" }, undefined, local), /VERCEL_ENV/)
  assert.throws(() => resolveIndexable({}, undefined, "/vercel/path0/client"), /VERCEL_ENV/)
  assert.equal(onVercel({}, local), false)
  assert.equal(resolveIndexable({}, "production", local), true)
})

test("prerendered forms cannot submit natively before the app mounts (no personal data in URLs)", () => {
  const out = neutraliseForms('<div><form class="grid"><input name="email"/></form><form onsubmit="x"></form></div>')
  assert.equal(out, '<div><form method="post" action="#" onsubmit="return false" class="grid"><input name="email"/></form><form onsubmit="x"></form></div>')
  const src = fs.readFileSync(path.join(ROOT, "scripts/prerender.mjs"), "utf8")
  assert.match(src, /const body = neutraliseForms\(bodyHtml\)/)
  assert.match(src, /html\.replace\('<div id="root"><\/div>', \(\) =>/, "function replacement: $ patterns in content cannot corrupt output")
})

test("metadata carries no pending business name and no unverified product specifications (C1, C16)", () => {
  const all = routes.allRoutes()
  assert.equal(routes.brandSuffix(), " | JOLU MACHINERIES", "brand suffix comes only from the verified display name")
  for (const r of all) {
    const meta = `${routes.fullTitle(r)} ${r.description} ${r.article?.headline ?? ""}`
    assert.doesNotMatch(meta.replaceAll(" | JOLU MACHINERIES", ""), /Jolu Group|Jolu Machineries|World's top|superior|outstanding|European standards|\b\d+\s?hp\b|milestone|proudly/i, r.path)
  }
  for (const r of all.filter((r) => r.kind === "product")) {
    assert.equal(r.description, routes.productSeoDescription(r.product))
    assert.ok(r.description.startsWith(r.product.name))
  }
  const nf = head.buildHead(routes.NOT_FOUND_ROUTE, { indexable: false })
  assert.ok(!nf.metas.some((m) => m.id === "og:url"), "404 has no og:url")
})

test("ScrollToTop does not jump on first mount; index.html reveals animated content without JavaScript", () => {
  const stt = fs.readFileSync(path.join(ROOT, "src/components/ScrollToTop.tsx"), "utf8")
  assert.match(stt, /if \(first\.current\) \{\s*first\.current = false;\s*if \(!hash\) return;/)
  const html = fs.readFileSync(path.join(ROOT, "index.html"), "utf8")
  assert.match(html, /<noscript><style>\[data-reveal\]\.opacity-0\{opacity:1!important/)
  assert.doesNotMatch(html, /<noscript><style>\.opacity-0\{/, "no-JS rule must not reveal hover overlays")
})

test("sitemap builder output is well-formed", () => {
  const xml = buildSitemap([`${ORIGIN}/`, `${ORIGIN}/products`])
  assert.equal(xml, `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url>\n    <loc>${ORIGIN}/</loc>\n  </url>\n  <url>\n    <loc>${ORIGIN}/products</loc>\n  </url>\n</urlset>\n`)
})

test("no page manipulates document.head directly any more (RouteSeo owns client-side head updates)", () => {
  for (const f of ["News", "Mud4Fun", "NakuruLaunch", "Careers"]) {
    const src = fs.readFileSync(path.join(ROOT, `src/pages/${f}.tsx`), "utf8")
    assert.doesNotMatch(src, /document\.title|document\.head/, f)
  }
  assert.ok(!fs.existsSync(path.join(ROOT, "public/robots.txt")), "robots.txt is generated per environment")
})

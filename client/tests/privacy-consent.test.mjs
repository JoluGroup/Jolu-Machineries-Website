// M2-PRIVACY-01: consent-gated analytics (node:test, plain fakes — no DOM library).
import assert from "node:assert/strict"
import fs from "node:fs"
import path from "node:path"
import test from "node:test"
import { fileURLToPath, pathToFileURL } from "node:url"
import { build } from "esbuild"
import React from "react"
import { renderToStaticMarkup } from "react-dom/server"

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")

async function bundle(entry, name, define = {}) {
  const cache = path.join(ROOT, "node_modules/.cache")
  fs.mkdirSync(cache, { recursive: true })
  const outfile = path.join(cache, `${name}.mjs`)
  await build({
    entryPoints: [path.join(ROOT, entry)], outfile, bundle: true, format: "esm", platform: "node", jsx: "automatic",
    external: ["react", "react-dom", "react-dom/server", "react-router-dom", "react/jsx-runtime"],
    alias: { "@": path.join(ROOT, "src") }, mainFields: ["module", "main"], conditions: ["module", "import"],
    loader: { ".png": "dataurl", ".jpg": "dataurl", ".jpeg": "dataurl", ".webp": "dataurl", ".svg": "dataurl", ".json": "json", ".css": "empty" },
    define: { "import.meta.env.BASE_URL": '"/"', "import.meta.env.DEV": "false", "import.meta.env.VITE_API_BASE": '""', ...define }, logLevel: "silent",
  })
  return import(pathToFileURL(outfile).href + "?t=" + Date.now())
}

const analytics = await bundle("src/privacy/analytics.ts", "privacy-analytics")
const consent = await bundle("src/privacy/consent.ts", "privacy-consent")
const config = await bundle("src/privacy/config.ts", "privacy-config")

const ID = "G-TEST1234"

/** Minimal fake browser: cookie jar with domain tracking, head with appended scripts, history, location. */
function fakeEnv(href = "https://www.jolumachineries.com/products/rc904?email=a%40b.com&phone=0700000000#top") {
  const jar = new Map([["_ga", "GA1.1.123.456"], ["_ga_TEST1234", "GS1.1.1"], ["other", "keep"]])
  const writes = []
  const appended = []
  const document = {
    title: "RC904 | Jolu",
    referrer: "https://www.google.com/search?q=tractor+0700000000",
    head: { appendChild: (el) => appended.push(el) },
    createElement: (tag) => ({ tag }),
    get cookie() { return [...jar].map(([k, v]) => `${k}=${v}`).join("; ") },
    set cookie(v) {
      writes.push(v)
      const [pair] = v.split(";"); const [k] = pair.split("=")
      if (/expires=Thu, 01 Jan 1970/.test(v) || /max-age=0/.test(v)) jar.delete(k.trim())
    },
  }
  const window = {
    location: { href, hostname: new URL(href).hostname },
    history: { pushState() {}, replaceState() {} },
    addEventListener() {},
  }
  return { env: { window, document }, jar, writes, appended }
}

test("module import has no side effects: no dataLayer, no gtag, no script before grant()", () => {
  const f = fakeEnv()
  const a = analytics.createAnalytics(ID, f.env)
  assert.equal(a.active, false)
  a.pageView()
  assert.equal(f.env.window.dataLayer, undefined)
  assert.equal(f.env.window.gtag, undefined)
  assert.equal(f.appended.length, 0)
})

test("rejection (withdraw without grant) never initialises analytics and clears any _ga cookies", () => {
  const f = fakeEnv()
  const a = analytics.createAnalytics(ID, f.env)
  a.withdraw()
  assert.equal(f.env.window.dataLayer, undefined)
  assert.equal(f.appended.length, 0)
  assert.equal(f.env.window[`ga-disable-${ID}`], true)
  assert.ok(!f.jar.has("_ga") && !f.jar.has("_ga_TEST1234"), "analytics cookies deleted")
  assert.equal(f.jar.get("other"), "keep", "unrelated cookies untouched")
})

test("acceptance loads ONLY the configured gtag URL with advertising denied and signals off", () => {
  const f = fakeEnv()
  const a = analytics.createAnalytics(ID, f.env)
  a.grant()
  assert.equal(f.appended.length, 1)
  assert.equal(f.appended[0].src, `https://www.googletagmanager.com/gtag/js?id=${ID}`)
  const calls = f.env.window.dataLayer.map((args) => Array.from(args))
  const consentDefault = calls.find((c) => c[0] === "consent" && c[1] === "default")
  assert.deepEqual(consentDefault[2], { analytics_storage: "granted", ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied" })
  const cfg = calls.find((c) => c[0] === "config")
  assert.equal(cfg[1], ID)
  assert.equal(cfg[2].send_page_view, false)
  assert.equal(cfg[2].allow_google_signals, false)
  assert.equal(cfg[2].allow_ad_personalization_signals, false)
  assert.ok(calls.findIndex((c) => c[0] === "consent") < calls.findIndex((c) => c[0] === "config"), "consent precedes config")
  a.grant() // idempotent
  assert.equal(f.appended.length, 1)
})

test("no personal data: page_location and referrer are reduced to origin + path", () => {
  const f = fakeEnv()
  analytics.createAnalytics(ID, f.env).grant()
  const sent = JSON.stringify(f.env.window.dataLayer.map((args) => Array.from(args)))
  assert.ok(sent.includes("https://www.jolumachineries.com/products/rc904"))
  for (const leak of ["email", "%40", "0700000000", "#top", "q=tractor", "?"]) assert.ok(!sent.includes(leak), `leaked ${leak}`)
  const pv = f.env.window.dataLayer.map((a) => Array.from(a)).find((c) => c[0] === "event" && c[1] === "page_view")
  assert.deepEqual(Object.keys(pv[2]).sort(), ["page_location", "page_title"])
})

test("withdrawal after acceptance stops tracking, sets the disable flag and deletes _ga cookies on every domain", () => {
  const f = fakeEnv()
  const a = analytics.createAnalytics(ID, f.env)
  a.grant()
  const before = f.env.window.dataLayer.length
  a.withdraw()
  assert.equal(a.active, false)
  assert.equal(f.env.window[`ga-disable-${ID}`], true)
  const last = Array.from(f.env.window.dataLayer.at(-1))
  assert.deepEqual(last, ["consent", "update", { analytics_storage: "denied" }])
  assert.ok(!f.jar.has("_ga") && !f.jar.has("_ga_TEST1234"))
  for (const d of ["", "; domain=.www.jolumachineries.com", "; domain=.jolumachineries.com"]) {
    assert.ok(f.writes.some((w) => w.startsWith("_ga=;") && w.endsWith(`path=/${d}`)), `delete attempted for domain '${d}'`)
  }
  const afterWithdraw = f.env.window.dataLayer.length
  a.pageView()
  assert.equal(f.env.window.dataLayer.length, afterWithdraw, "no hits after withdrawal")
  assert.equal(afterWithdraw, before + 1)
})

test("SPA navigation sends a sanitized page_view only while granted", async () => {
  const f = fakeEnv("https://www.jolumachineries.com/")
  const a = analytics.createAnalytics(ID, f.env)
  a.grant()
  const n = () => f.env.window.dataLayer.filter((x) => x[0] === "event").length
  const start = n()
  f.env.window.location.href = "https://www.jolumachineries.com/products?ref=x"
  f.env.window.history.pushState({}, "", "/products?ref=x")
  await new Promise((r) => setTimeout(r, 5))
  assert.equal(n(), start + 1)
  a.withdraw()
  f.env.window.history.pushState({}, "", "/news")
  await new Promise((r) => setTimeout(r, 5))
  assert.equal(n(), start + 1, "no page_view after withdrawal")
})

test("consent storage: versioned record, corrupt or unavailable storage means not consented", () => {
  const store = new Map()
  const storage = { getItem: (k) => store.get(k) ?? null, setItem: (k, v) => store.set(k, v) }
  assert.equal(consent.readConsent(storage), null)
  assert.equal(consent.writeConsent("granted", storage, 1700000000000), true)
  assert.deepEqual(JSON.parse(store.get("jolu-consent-v1")), { v: 1, analytics: "granted", ts: 1700000000000 })
  assert.equal(consent.isGranted(consent.readConsent(storage)), true)
  consent.writeConsent("denied", storage)
  assert.equal(consent.isGranted(consent.readConsent(storage)), false)
  store.set("jolu-consent-v1", "{not json")
  assert.equal(consent.readConsent(storage), null)
  store.set("jolu-consent-v1", JSON.stringify({ v: 2, analytics: "granted", ts: 1 }))
  assert.equal(consent.readConsent(storage), null)
  const broken = { getItem() { throw new Error("SecurityError") }, setItem() { throw new Error("QuotaExceeded") } }
  assert.equal(consent.readConsent(broken), null)
  assert.equal(consent.writeConsent("granted", broken), false)
  assert.equal(consent.readConsent(null), null)
})

test("measurement ID is configuration-only and validated", async () => {
  assert.equal(config.resolveMeasurementId(undefined), null)
  assert.equal(config.resolveMeasurementId(""), null)
  assert.equal(config.resolveMeasurementId("UA-12345-1"), null)
  assert.equal(config.resolveMeasurementId("G-<script>"), null)
  assert.equal(config.resolveMeasurementId(" G-ABCD1234 "), "G-ABCD1234")
  assert.equal(config.configuredMeasurementId(), null, "unset in the default build")
  const set = await bundle("src/privacy/config.ts", "privacy-config-set", { "import.meta.env.VITE_GA_MEASUREMENT_ID": '"G-ABCD1234"' })
  assert.equal(set.configuredMeasurementId(), "G-ABCD1234")
})

test("unconfigured build: no banner, no cookie-settings control", async () => {
  const mod = await bundle("src/privacy/ConsentBanner.tsx", "privacy-banner-unset")
  assert.equal(renderToStaticMarkup(React.createElement(mod.default)), "")
  assert.equal(renderToStaticMarkup(React.createElement(mod.CookieSettingsButton)), "")
})

test("configured build: banner is never in server-rendered HTML (appears only after mount); settings control present", async () => {
  const mod = await bundle("src/privacy/ConsentBanner.tsx", "privacy-banner-set", { "import.meta.env.VITE_GA_MEASUREMENT_ID": '"G-ABCD1234"' })
  assert.equal(renderToStaticMarkup(React.createElement(mod.default)), "")
  assert.match(renderToStaticMarkup(React.createElement(mod.CookieSettingsButton)), /Cookie settings/)
})

test("Accept and Reject have identical styling (equal prominence) and are real buttons", async () => {
  const mod = await bundle("src/privacy/ConsentBanner.tsx", "privacy-bar")
  const html = renderToStaticMarkup(React.createElement(mod.ConsentBar, { onChoose() {} }))
  const buttons = [...html.matchAll(/<button([^>]*)>([^<]*)<\/button>/g)]
  assert.deepEqual(buttons.map((b) => b[2]), ["Reject", "Accept analytics"])
  const cls = (attrs) => attrs.match(/class="([^"]*)"/)[1]
  assert.equal(cls(buttons[0][1]), cls(buttons[1][1]))
  assert.match(html, /role="region"/)
  assert.ok(!/aria-modal/.test(html), "non-modal")
})

test("the previously embedded GA4 property ID appears nowhere in the client source or index.html", () => {
  const files = [path.join(ROOT, "index.html")]
  const walk = (d) => { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const f = path.join(d, e.name); if (e.isDirectory()) walk(f); else files.push(f) } }
  walk(path.join(ROOT, "src")); walk(path.join(ROOT, "public"))
  const hits = files.filter((f) => /G-R80L7FBXQS/.test(fs.readFileSync(f, "latin1")))
  assert.deepEqual(hits.map((f) => path.relative(ROOT, f)), [])
  const html = fs.readFileSync(path.join(ROOT, "index.html"), "utf8")
  assert.ok(!/googletagmanager|gtag\(|dataLayer/.test(html), "no unconditional analytics in index.html")
})

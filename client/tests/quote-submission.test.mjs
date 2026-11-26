// M2-QUOTE-01 regression tests. Evidence-based reconstruction of the missing quotation correction (ad79b25 was not
// recovered; these tests encode the five defects reproduced in M2-FINAL-RELEASE-01 against the real server contract
// in server/app.js on release/m2-rc1).
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

async function bundle(entry, name, apiBase = "") {
  const cache = path.join(ROOT, "node_modules/.cache")
  fs.mkdirSync(cache, { recursive: true })
  const outfile = path.join(cache, `${name}.mjs`)
  await build({
    entryPoints: [path.join(ROOT, entry)], outfile, bundle: true, format: "esm", platform: "node", jsx: "automatic",
    external: ["react", "react-dom", "react-dom/server", "react-router-dom", "react/jsx-runtime"],
    alias: { "@": path.join(ROOT, "src") }, mainFields: ["module", "main"], conditions: ["module", "import"],
    loader: { ".png": "dataurl", ".jpg": "dataurl", ".jpeg": "dataurl", ".webp": "dataurl", ".svg": "dataurl", ".json": "json", ".css": "empty" },
    define: { "import.meta.env.BASE_URL": '"/"', "import.meta.env.DEV": "false", "import.meta.env.VITE_API_BASE": JSON.stringify(apiBase) }, logLevel: "silent",
  })
  return import(pathToFileURL(outfile).href + "?t=" + Date.now())
}

const api = await bundle("src/lib/api.ts", "quote-api")
const fb = await bundle("src/lib/submit-feedback.ts", "quote-feedback")
const SUCCESS = { title: "Quote request sent" }

// Exact bodies produced by server/app.js (release/m2-rc1).
const SERVER = {
  created: [201, { ok: true, message: "Quote request received." }],
  duplicate: [200, { ok: true, duplicate: true, message: "Your request has already been received." }],
  countyMissing: [400, { ok: false, errors: { formErrors: [], fieldErrors: { county: ["Too small: expected string to have >=2 characters"] } } }],
  invalidJson: [400, { ok: false, code: "invalid_json", message: "Invalid request body." }],
  origin: [403, { ok: false, code: "origin_not_allowed", message: "This origin is not allowed." }],
  inProgress: [409, { ok: false, code: "in_progress", message: "This request is already being processed. Please wait a moment." }],
  tooLarge: [413, { ok: false, code: "payload_too_large", message: "Request is too large." }],
  rateLimited: [429, { ok: false, code: "rate_limited", message: "Too many requests. Please wait a minute and try again." }],
  notified: [502, { ok: false, code: "notification_failed", requestId: "r1", message: "We saved your request but could not notify our team." }],
  unavailable: [503, { ok: false, code: "service_unavailable", message: "The service is temporarily unavailable." }],
  storageFailed: [503, { ok: false, code: "storage_failed", requestId: "r2", message: "We could not save your request." }],
  serverError: [500, { ok: false, code: "server_error", message: "Server error" }],
  subscribed: [201, { ok: true, status: "subscribed" }],
  alreadySubscribed: [200, { ok: true, status: "already_subscribed" }],
}

const fakeFetch = (status, body, calls = []) => async (url, init) => {
  calls.push({ url, init })
  return new Response(typeof body === "string" ? body : JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } })
}

const payload = { name: "Synthetic Tester", email: "synthetic@example.invalid", phone: "0700000000", county: "Nairobi", area: "Test Area", productInterest: null, message: "Synthetic regression test message" }

test("classifyResponse maps every server response in the contract", () => {
  const k = (name) => api.classifyResponse(...SERVER[name]).kind
  assert.equal(k("created"), "received")
  assert.equal(k("duplicate"), "duplicate")
  assert.deepEqual(api.classifyResponse(...SERVER.countyMissing), { kind: "invalid", fields: ["county"] })
  assert.equal(k("invalidJson"), "rejected")
  assert.equal(k("origin"), "rejected")
  assert.equal(k("inProgress"), "in_progress")
  assert.equal(k("tooLarge"), "rejected")
  assert.equal(k("rateLimited"), "rate_limited")
  assert.equal(k("notified"), "saved_not_notified")
  assert.equal(k("unavailable"), "unavailable")
  assert.equal(k("storageFailed"), "unavailable")
  assert.equal(k("serverError"), "unexpected")
  assert.equal(k("subscribed"), "received")
  assert.equal(k("alreadySubscribed"), "duplicate")
  assert.equal(api.classifyResponse(400, null).kind, "invalid")
  assert.equal(api.classifyResponse(200, { ok: false }).kind, "unexpected")
})

test("DEFECT 1: a 400 validation response never exposes raw backend JSON or messages to customers", async () => {
  const outcome = await api.send("/api/quotes", payload, { base: "https://api.example.invalid", fetchImpl: fakeFetch(...SERVER.countyMissing) })
  const f = fb.describeOutcome(outcome, SUCCESS)
  const text = `${f.title} ${f.description} ${Object.values(f.fieldErrors).join(" ")}`
  assert.doesNotMatch(text, /[{}[\]]/, "no JSON punctuation")
  assert.doesNotMatch(text, /Too small|expected string|>=/, "no zod wording")
  assert.equal(f.fieldErrors.county, "Please choose your county.")
  assert.equal(f.stored, false)
  assert.equal(f.variant, "destructive")
})

test("DEFECT 2: county (and schedule product) are required client-side before any request is sent", async () => {
  assert.deepEqual(fb.missingSelections({ county: "" }, ["county"]), { county: "Please choose your county." })
  assert.deepEqual(fb.missingSelections({ county: "  " }, ["county"]), { county: "Please choose your county." })
  assert.deepEqual(fb.missingSelections({ county: "Nakuru" }, ["county"]), {})
  assert.deepEqual(fb.missingSelections({ product: "" }, ["product"]), { product: "Please choose a product." })
  for (const [file, field] of [["src/pages/GetQuote.tsx", "county"], ["src/components/QuoteDrawer.tsx", "county"], ["src/components/ContactSection.tsx", "county"], ["src/pages/ScheduleVisit.tsx", "product"]]) {
    const src = read(file)
    assert.match(src, new RegExp(`missingSelections\\((form|formData), \\["${field}"\\]\\)`), `${file} prechecks ${field}`)
    assert.match(src, new RegExp(`errorProps\\(fieldErrors, "${field}", ID\\)`), `${file} links ${field} to its error`)
    assert.match(src, /aria-required="true"/, `${file} marks the select as required`)
    assert.match(src, new RegExp(`<FieldError errors=\\{fieldErrors\\} name="${field}"`), `${file} renders the inline ${field} error`)
  }
})

test("DEFECT 3: a stored quotation whose staff email failed (502) is presented as received, never as a failure to resend", async () => {
  const outcome = await api.send("/api/quotes", payload, { base: "https://api.example.invalid", fetchImpl: fakeFetch(...SERVER.notified) })
  assert.equal(outcome.kind, "saved_not_notified")
  const f = fb.describeOutcome(outcome, SUCCESS)
  assert.equal(f.stored, true, "form is cleared/closed: the request is stored")
  assert.equal(f.variant, "default")
  assert.equal(f.title, "Request received")
  assert.doesNotMatch(`${f.title} ${f.description}`, /fail|try again|resend|resubmit|send it again/i)
  assert.match(f.description, /saved/)
})

test("DEFECT 4: network failures and timeouts give human-readable messages, not technical errors", async () => {
  const net = await api.send("/api/quotes", payload, { base: "https://api.example.invalid", fetchImpl: async () => { throw new TypeError("Failed to fetch") } })
  assert.equal(net.kind, "network")
  const n = fb.describeOutcome(net, SUCCESS)
  assert.doesNotMatch(n.description, /Failed to fetch|TypeError/)
  assert.match(n.description, /couldn't reach our server/)
  assert.doesNotMatch(n.description, /was not sent/, "the client cannot know the request never arrived")
  const slow = (_url, init) => new Promise((_resolve, reject) => init.signal.addEventListener("abort", () => reject(new DOMException("aborted", "AbortError"))))
  const to = await api.send("/api/quotes", payload, { base: "https://api.example.invalid", fetchImpl: slow, timeoutMs: 20 })
  assert.equal(to.kind, "timeout")
  const t = fb.describeOutcome(to, SUCCESS)
  assert.match(t.description, /may still have arrived/)
  assert.doesNotMatch(t.description, /was not sent/, "a timeout must not claim the request was lost")
  // Only /api/quotes de-duplicates; contact and schedule do not, and all three share this wording.
  assert.doesNotMatch(t.description, /duplicate/i, "no de-duplication promise")
  const html = await api.send("/api/quotes", payload, { base: "https://api.example.invalid", fetchImpl: fakeFetch(405, "<html>405</html>") })
  assert.equal(html.kind, "unexpected")
})

test("rate limiting, in-progress and service-unavailable outcomes have distinct, non-technical wording", () => {
  const d = (kind) => fb.describeOutcome({ kind }, SUCCESS)
  assert.match(d("rate_limited").description, /wait a minute/)
  assert.match(d("in_progress").description, /already processing/)
  assert.equal(d("in_progress").stored, true, "409 means an identical quote is already stored")
  assert.doesNotMatch(d("in_progress").description, /try again/)
  assert.match(d("unavailable").description, /was not sent/)
  for (const kind of ["rate_limited", "unavailable", "rejected", "network", "timeout", "misconfigured", "unexpected"]) {
    const f = d(kind)
    assert.equal(f.stored, false, kind)
    assert.doesNotMatch(`${f.title} ${f.description}`, /[{}[\]]|undefined|null|NaN/, kind)
  }
  for (const kind of ["received", "duplicate", "saved_not_notified", "in_progress"]) assert.equal(d(kind).stored, true, kind)
  assert.match(d("duplicate").description, /no need to send it again/)
})

test("DEFECT 5: a missing or invalid VITE_API_BASE sends nothing and never falls back to another destination", async () => {
  for (const bad of [undefined, null, "", "undefined", "null", "   ", "api.example.com", "ftp://x.example", "http://api.example.com", "https://user:pw@api.example.com", "https://api.example.com/?x=1"]) {
    assert.equal(api.resolveApiBase(bad), null, String(bad))
  }
  assert.equal(api.resolveApiBase("https://api.example.com/"), "https://api.example.com")
  assert.equal(api.resolveApiBase("http://localhost:5000"), "http://localhost:5000")
  const calls = []
  const outcome = await api.send("/api/quotes", payload, { base: null, fetchImpl: fakeFetch(201, {}, calls) })
  assert.equal(outcome.kind, "misconfigured")
  assert.equal(calls.length, 0, "no request was made")
  // The module-level base is null when the env value is empty (as in this bundle) ...
  assert.equal(api.API_BASE, null)
  // ... and the configured value is used verbatim when valid.
  const configured = await bundle("src/lib/api.ts", "quote-api-configured", "https://api.example.invalid/")
  const seen = []
  await configured.api.quote(payload, { fetchImpl: fakeFetch(...SERVER.created, seen) })
  assert.equal(seen[0].url, "https://api.example.invalid/api/quotes")
  // No production backend URL is hard-coded anywhere in the client source.
  const files = []
  const walk = (d) => { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const f = path.join(d, e.name); if (e.isDirectory()) walk(f); else if (/\.(tsx?|jsx?)$/.test(e.name)) files.push(f) } }
  walk(path.join(ROOT, "src"))
  assert.deepEqual(files.filter((f) => /onrender\.com|https?:\/\/[^"'`]*\/api\/(quotes|contact|schedule|subscribe)/.test(fs.readFileSync(f, "utf8"))).map((f) => path.relative(ROOT, f)), [])
})

test("build guard: Vercel production fails without a valid VITE_API_BASE; preview/CI/local only warn", async () => {
  const { checkApiBaseForBuild } = await bundle("src/lib/api-base-guard.ts", "quote-guard")
  for (const bad of [undefined, "", "undefined", "http://api.example.com"]) {
    assert.deepEqual({ ...checkApiBaseForBuild(bad, "production"), message: undefined }, { ok: false, fatal: true, message: undefined }, String(bad))
    for (const env of ["preview", "development", undefined]) {
      const r = checkApiBaseForBuild(bad, env)
      assert.equal(r.fatal, false, `${bad}/${env}`); assert.equal(r.ok, false); assert.match(r.message, /warning/)
    }
  }
  assert.deepEqual(checkApiBaseForBuild("https://api.ci.invalid", undefined), { ok: true, fatal: false }, "CI value passes")
  assert.deepEqual(checkApiBaseForBuild("https://api.example.com", "production"), { ok: true, fatal: false })
  const vite = read("vite.config.ts")
  assert.match(vite, /checkApiBaseForBuild\(env\.VITE_API_BASE, process\.env\.VERCEL_ENV\)/, "vite config uses the guard")
  assert.match(vite, /if \(check\.fatal\) throw new Error/)
  assert.match(vite, /if \(command === "build"\) assertApiBase\(mode\)/, "dev server is never blocked")
})

test("rendered error state: aria-invalid and aria-describedby point at the announced inline error", async () => {
  const { default: FieldError } = await bundle("src/components/FieldError.tsx", "quote-fielderror")
  const { errorProps } = await bundle("src/hooks/use-submission.ts", "quote-hook")
  const errors = { county: "Please choose your county." }
  const props = errorProps(errors, "county", "quote")
  assert.deepEqual(props, { "aria-invalid": true, "aria-describedby": "quote-county-error" })
  assert.deepEqual(errorProps(errors, "email", "quote"), { "aria-invalid": false })
  const html = renderToStaticMarkup(React.createElement("div", null,
    React.createElement("button", { type: "button", ...props }, "County"),
    React.createElement(FieldError, { errors, name: "county", idPrefix: "quote" }),
    React.createElement(FieldError, { errors, name: "email", idPrefix: "quote" })))
  assert.match(html, /<button type="button" aria-invalid="true" aria-describedby="quote-county-error">/)
  assert.match(html, /<p id="quote-county-error" role="alert"[^>]*>Please choose your county\.<\/p>/)
  assert.equal((html.match(/role="alert"/g) || []).length, 1, "only the invalid field shows an error")
  // ScheduleVisit's optional notes field is wired too (server limit 2000 characters).
  const schedule = read("src/pages/ScheduleVisit.tsx")
  assert.match(schedule, /maxLength=\{2000\}/)
  assert.match(schedule, /<FieldError errors=\{fieldErrors\} name="notes"/)
})

test("late results cannot close a re-opened quote drawer; subscribe uses a synchronous ref guard", () => {
  const drawer = read("src/components/QuoteDrawer.tsx")
  assert.match(drawer, /openSession\.current \+= 1/)
  assert.match(drawer, /if \(session !== openSession\.current\) return;/)
  const footer = read("src/components/Footer.tsx")
  assert.match(footer, /if \(subscribing\.current\) return;/)
})

test("requests are JSON POSTs to the configured origin with a timeout signal", async () => {
  const calls = []
  const outcome = await api.send("/api/quotes", payload, { base: "https://api.example.invalid", fetchImpl: fakeFetch(...SERVER.created, calls) })
  assert.equal(outcome.kind, "received")
  assert.equal(calls[0].url, "https://api.example.invalid/api/quotes")
  assert.equal(calls[0].init.method, "POST")
  assert.equal(calls[0].init.headers["Content-Type"], "application/json")
  assert.deepEqual(JSON.parse(calls[0].init.body), payload)
  assert.ok(calls[0].init.signal, "AbortSignal attached")
})

test("duplicate-submission protection: one request in flight per form, buttons disabled while sending", () => {
  const hook = read("src/hooks/use-submission.ts")
  assert.match(hook, /if \(inFlight\.current\) return null/)
  assert.match(hook, /inFlight\.current = true/)
  assert.match(hook, /finally \{\s*inFlight\.current = false/)
  for (const file of ["src/pages/GetQuote.tsx", "src/components/QuoteDrawer.tsx", "src/components/ContactSection.tsx", "src/pages/ScheduleVisit.tsx"]) {
    const src = read(file)
    assert.match(src, /useSubmission\(\)/, file)
    assert.match(src, /disabled=\{isSubmitting\}/, file)
    assert.doesNotMatch(src, /err\?\.message|JSON\.stringify\(|Failed to send/, `${file} no longer surfaces raw errors`)
  }
  assert.match(read("src/components/Footer.tsx"), /api\.subscribe\(\{ email \}\)/, "subscribe uses the validated client")
  assert.doesNotMatch(read("src/components/Footer.tsx"), /import\.meta\.env\.VITE_API_BASE/)
})

test("<GetQuote> renders labelled fields and a required county select with no error before submission", async () => {
  const { default: GetQuote } = await bundle("src/pages/GetQuote.tsx", "quote-page")
  const html = renderToStaticMarkup(React.createElement(MemoryRouter, null, React.createElement(GetQuote)))
  for (const f of ["name", "email", "phone", "county", "area", "message"]) {
    assert.ok(html.includes(`for="quote-${f}"`), `label for ${f}`)
    assert.ok(html.includes(`id="quote-${f}"`), `control id for ${f}`)
  }
  assert.match(html, /aria-required="true"/)
  assert.doesNotMatch(html, /role="alert"/, "no errors shown before submission")
  assert.doesNotMatch(html, /aria-invalid="true"/)
})

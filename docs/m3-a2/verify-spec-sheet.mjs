// M3-A2 verification: responsive screen checks and A4 print-to-PDF evidence.
// Usage: node verify-spec-sheet.mjs <dist> <outDir>
import http from "node:http"; import fs from "node:fs"; import path from "node:path"
import { createRequire } from "node:module"
const require = createRequire("/opt/npm-tools/node_modules/"); const { chromium } = require("playwright")
const [dist, out] = process.argv.slice(2); fs.mkdirSync(out, { recursive: true })
const SLUG = "zoomlion-rs1304-1604", ROUTE = `/products/${SLUG}/spec-sheet`
const mime = { ".html":"text/html", ".js":"text/javascript", ".css":"text/css", ".webp":"image/webp", ".png":"image/png", ".jpg":"image/jpeg", ".svg":"image/svg+xml", ".json":"application/json" }
const server = http.createServer((req, res) => { let p = decodeURIComponent(req.url.split("?")[0]); let f = path.join(dist, p); if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) f = path.join(dist, "index.html"); res.writeHead(200, { "Content-Type": mime[path.extname(f)] || "application/octet-stream" }); res.end(fs.readFileSync(f)) })
await new Promise((r) => server.listen(0, "127.0.0.1", r)); const base = `http://127.0.0.1:${server.address().port}`
const b = await chromium.launch({ executablePath: "/usr/bin/google-chrome", args: ["--no-sandbox"] }); const report = { screen: [], print: {} }
for (const [w, h, mob] of [[360, 740, true], [390, 844, true], [412, 823, true], [768, 1024, false], [820, 1180, false], [1024, 768, false], [1280, 800, false], [1440, 900, false]]) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, isMobile: mob, hasTouch: mob }); const p = await ctx.newPage(); const errs = []; let nonGet = 0; const failed = []
  p.on("pageerror", (e) => errs.push(String(e))); p.on("requestfailed", (r) => failed.push(r.url()))
  await p.route("**/*", (r) => { const q = r.request(); if (!q.url().startsWith(base)) return r.abort(); if (q.method() !== "GET") { nonGet++; return r.abort() } r.continue() })
  await p.goto(base + ROUTE, { waitUntil: "load" }); await p.waitForSelector(".ss-page"); await p.waitForTimeout(700)
  const m = await p.evaluate(() => { const img = document.querySelector(".ss-stage-img img"); const pages = [...document.querySelectorAll(".ss-page")]; return { hscroll: document.documentElement.scrollWidth - innerWidth, pages: pages.length, imgOk: !!img && img.complete && img.naturalWidth > 0, scale: getComputedStyle(document.querySelector(".ss-root")).getPropertyValue("--ss-scale").trim(), stageW: Math.round(document.querySelector(".ss-stage").getBoundingClientRect().width), inner: pages.map((pg) => { const i = pg.querySelector(".ss-inner"); return i.scrollHeight - i.clientHeight }), edit: document.querySelectorAll("[contenteditable]").length, colorInputs: document.querySelectorAll('input[type=color]').length } })
  await p.screenshot({ path: `${out}/screen-${w}.png`, fullPage: true })
  report.screen.push({ w, ...m, errors: errs.length, failed: failed.length, nonGet })
  await ctx.close()
}
// direct-route + tabs + quote drawer (no submit)
{
  const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } }); const p = await ctx.newPage(); let nonGet = 0
  await p.route("**/*", (r) => { const q = r.request(); if (!q.url().startsWith(base)) return r.abort(); if (q.method() !== "GET") { nonGet++; return r.abort() } r.continue() })
  await p.goto(base + ROUTE, { waitUntil: "load" }); await p.waitForSelector(".ss-page")
  await p.click('button:has-text("DIMENSIONS")'); await p.waitForTimeout(200); report.dimTab = await p.locator(".ss-stage-diagram svg").count()
  await p.screenshot({ path: `${out}/screen-1280-dimtab.png`, clip: { x: 0, y: 0, width: 1280, height: 900 } })
  await p.click('button:has-text("PHOTO")')
  await p.getByRole("button", { name: /Request a quote/i }).click(); await p.waitForTimeout(600)
  report.quoteDialog = await p.locator('[role="dialog"]').count(); report.quoteProductPrefilled = await p.locator('[role="dialog"]').innerText().then((t) => /Product Interest/i.test(t)).catch(() => false)
  await p.keyboard.press("Escape"); await p.waitForTimeout(400); report.quoteClosed = (await p.locator('[role="dialog"]').count()) === 0; report.nonGet = nonGet
  report.unknownSlug = await (async () => { await p.goto(base + "/products/nope/spec-sheet", { waitUntil: "load" }); await p.waitForTimeout(400); return await p.evaluate(() => /404|not found/i.test(document.body.innerText)) })()
  report.noindex = await (async () => { await p.goto(base + ROUTE, { waitUntil: "load" }); await p.waitForSelector(".ss-page"); return await p.evaluate(() => document.querySelector('meta[name=robots]')?.content) })()
  // existing product routes still work and have no link to the sheet
  for (const r of ["/", "/products", "/products/zoomlion-rs1304-1604"]) { await p.goto(base + r, { waitUntil: "load" }); await p.waitForTimeout(600); report["route " + r] = await p.evaluate(() => ({ h: !!document.querySelector("h1,h2,h3"), linksToSheet: [...document.querySelectorAll("a")].filter((a) => /spec-sheet/.test(a.getAttribute("href") || "")).length })) }
  await ctx.close()
}
// print: A4 PDF
{
  const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } }); const p = await ctx.newPage()
  await p.route("**/*", (r) => (r.request().url().startsWith(base) ? r.continue() : r.abort()))
  await p.goto(base + ROUTE, { waitUntil: "load" }); await p.waitForSelector(".ss-page"); await p.waitForTimeout(800)
  await p.emulateMedia({ media: "print" })
  report.print = await p.evaluate(() => { const mm = (px) => +(px / 96 * 25.4).toFixed(1); const stages = [...document.querySelectorAll(".ss-stage")]; return { toolbarHidden: getComputedStyle(document.querySelector(".ss-toolbar")).display === "none", tabsHidden: getComputedStyle(document.querySelector(".ss-view-tabs")).display === "none", pages: stages.map((s, i) => { const r = s.getBoundingClientRect(); const pg = s.querySelector(".ss-page"); const inner = pg.querySelector(".ss-inner"); const kids = [...inner.children].map((c) => c.getBoundingClientRect()); const innerR = inner.getBoundingClientRect(); const overlaps = []; for (let a = 0; a < kids.length; a++) for (let c = a + 1; c < kids.length; c++) { const A = kids[a], C = kids[c]; if (A.height > 0 && C.height > 0 && A.bottom > C.top + 1 && A.top < C.bottom - 1 && A.right > C.left + 1 && A.left < C.right - 1) overlaps.push([a, c]) } return { wMm: mm(r.width), hMm: mm(r.height), transform: getComputedStyle(pg).transform, innerOverflowPx: inner.scrollHeight - inner.clientHeight, lastChildBottomWithinPage: Math.round(kids[kids.length - 1].bottom) <= Math.round(innerR.bottom) + 1, overlaps } }), tables: [...document.querySelectorAll(".ss-table td")].map((td) => parseFloat(getComputedStyle(td).fontSize)).reduce((a, c) => Math.min(a, c), 99), minFontPx: [...document.querySelectorAll(".ss-page *")].filter((e) => e.childNodes.length && [...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())).map((e) => parseFloat(getComputedStyle(e).fontSize)).reduce((a, c) => Math.min(a, c), 99), darkBg: getComputedStyle(document.querySelector(".ss-dark")).backgroundColor, accent: getComputedStyle(document.querySelector(".ss-btn-primary")).backgroundColor } })
  await p.pdf({ path: `${out}/rs1304-1604-spec-sheet.pdf`, preferCSSPageSize: true, printBackground: true })
  await ctx.close()
}
console.log(JSON.stringify(report, null, 1)); fs.writeFileSync(`${out}/report.json`, JSON.stringify(report, null, 1)); await b.close(); server.close()

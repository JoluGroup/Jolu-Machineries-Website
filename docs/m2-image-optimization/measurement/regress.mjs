import http from "node:http"; import fs from "node:fs"; import path from "node:path"; import zlib from "node:zlib"
import { createRequire } from "node:module"
const require = createRequire("/opt/npm-tools/node_modules/"); const { chromium } = require("playwright")
const [,, dist, label] = process.argv
const mime = { ".html":"text/html", ".js":"text/javascript", ".css":"text/css", ".png":"image/png", ".jpg":"image/jpeg", ".jpeg":"image/jpeg", ".webp":"image/webp", ".svg":"image/svg+xml", ".ico":"image/x-icon", ".json":"application/json", ".pdf":"application/pdf" }
const server = http.createServer((req, res) => { let p = decodeURIComponent(req.url.split("?")[0]); let f = path.join(dist, p); if (!f.startsWith(dist) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) f = path.join(dist, "index.html"); const ext = path.extname(f).toLowerCase(); res.writeHead(200, { "Content-Type": mime[ext] || "application/octet-stream" }); res.end(fs.readFileSync(f)) })
await new Promise((r) => server.listen(0, r)); const base = `http://127.0.0.1:${server.address().port}`
const slugs = fs.readFileSync("/tmp/perf/slugs.txt", "utf8").trim().split("\n")
const routes = ["/", "/quote", "/schedule", "/products", ...slugs.map((s) => `/products/${s}`), "/spare-parts", "/used-tractors", "/team", "/careers", "/gallery", "/news", "/ktn-interview", "/mud4fun", "/showroom-launch", "/does-not-exist-404", "/products/not-a-real-product"]
const shotPages = { home: "/", gallery: "/gallery", news: "/news", products: "/products", product_detail: "/products/zoomlion-rn904", event: "/showroom-launch" }
const browser = await chromium.launch({ executablePath: "/usr/bin/google-chrome", args: ["--no-sandbox"] })
const out = { routes: {}, hero: null }
fs.mkdirSync(`/tmp/shots/${label}`, { recursive: true })
const ctx = await browser.newContext({ viewport: { width: 1366, height: 800 } })
for (const r of routes) {
  const page = await ctx.newPage(); const errs = []; const failed = []
  page.on("pageerror", (e) => errs.push(String(e).slice(0, 160)))
  page.on("console", (m) => { if (m.type() === "error" && !/googletagmanager|ERR_|Failed to load resource/.test(m.text())) errs.push(m.text().slice(0, 160)) })
  page.on("requestfailed", (q) => { if (!/googletagmanager|google-analytics|youtube|ytimg|fonts\.g/.test(q.url())) failed.push(q.url().slice(-80)) })
  page.on("response", (q) => { if (q.status() >= 400 && q.url().startsWith(base) && !/favicon/.test(q.url())) failed.push(q.status() + " " + q.url().slice(-80)) })
  await page.goto(base + r, { waitUntil: "load" }); await page.waitForTimeout(800)
  const h = await page.evaluate(() => document.documentElement.scrollHeight)
  for (let y = 0; y < h; y += 500) { await page.evaluate((yy) => window.scrollTo(0, yy), y); await page.waitForTimeout(120) }
  await page.waitForTimeout(1200)
  const info = await page.evaluate(() => { const imgs = [...document.images]; const bad = imgs.filter((i) => i.complete && i.naturalWidth === 0 && i.currentSrc && !/youtube|ytimg/.test(i.currentSrc)).map((i) => i.currentSrc.slice(-60)); const pending = imgs.filter((i) => !i.complete && i.loading !== "lazy").length; return { title: document.title.slice(0, 50), imgs: imgs.length, bad, pending, h1: (document.querySelector("h1")?.textContent || "").slice(0, 40), noImgDims: imgs.filter((i) => !i.getAttribute("width") && !i.closest("svg") && !/ytimg/.test(i.src)).length } })
  out.routes[r] = { errs, failed, ...info }
  await page.close()
}
// screenshots (desktop + mobile)
for (const [dev, vp, mob] of [["desktop", { width: 1366, height: 800 }, false], ["mobile", { width: 390, height: 844 }, true]]) {
  const c = await browser.newContext({ viewport: vp, deviceScaleFactor: 1, isMobile: mob, hasTouch: mob })
  for (const [name, url] of Object.entries(shotPages)) {
    const p = await c.newPage(); await p.goto(base + url, { waitUntil: "load" }); await p.waitForTimeout(1500)
    const h = await p.evaluate(() => document.documentElement.scrollHeight)
    for (let y = 0; y < h; y += 400) { await p.evaluate((yy) => window.scrollTo(0, yy), y); await p.waitForTimeout(150) }
    await p.waitForTimeout(2000); await p.evaluate(() => window.scrollTo(0, 0)); await p.waitForTimeout(600)
    await p.screenshot({ path: `/tmp/shots/${label}/${dev}-${name}.png`, fullPage: true }); await p.close()
  }
  await c.close()
}
// hero behaviour: sample slide transform and image completeness for 20s
{
  const p = await ctx.newPage(); const reqs = []
  p.on("request", (q) => { if (q.resourceType() === "image") reqs.push({ t: Date.now(), u: q.url().slice(-55) }) })
  const t0 = Date.now(); await p.goto(base + "/", { waitUntil: "load" })
  const samples = []
  for (let i = 0; i < 26; i++) { await p.waitForTimeout(1000); samples.push(await p.evaluate(() => { const row = document.querySelector("section img")?.closest("div")?.parentElement; const imgs = row ? [...row.querySelectorAll("img")] : []; const tr = row?.style.transform || ""; return { tr, nImgs: imgs.length, allDone: imgs.every((i) => i.complete && i.naturalWidth > 0) } })) }
  out.hero = { requestsFirst3s: reqs.filter((r) => r.t - t0 < 3000).map((r) => r.u), totalImgReqs: reqs.length, samples: samples.filter((_, i) => i % 3 === 0) }
  await p.close()
}
fs.writeFileSync(`/tmp/perf/regress-${label}.json`, JSON.stringify(out, null, 1)); await browser.close(); server.close()
const bad = Object.entries(out.routes).filter(([, v]) => v.errs.length || v.failed.length || v.bad.length)
console.log(label, "routes", Object.keys(out.routes).length, "with problems", bad.length); for (const [r, v] of bad) console.log(" ", r, JSON.stringify({ errs: v.errs, failed: v.failed, bad: v.bad }).slice(0, 300))

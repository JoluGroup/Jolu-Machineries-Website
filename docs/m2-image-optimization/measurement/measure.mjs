import http from "node:http"
import fs from "node:fs"
import path from "node:path"
import zlib from "node:zlib"
import { createRequire } from "node:module"
const require = createRequire("/opt/npm-tools/node_modules/")
const { chromium } = require("playwright")
const [,, dist, label, runsArg] = process.argv
const RUNS = Number(runsArg || 3)
const mime = { ".html":"text/html", ".js":"text/javascript", ".css":"text/css", ".png":"image/png", ".jpg":"image/jpeg", ".jpeg":"image/jpeg", ".webp":"image/webp", ".svg":"image/svg+xml", ".ico":"image/x-icon", ".json":"application/json", ".pdf":"application/pdf" }
const server = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split("?")[0])
  let f = path.join(dist, p)
  if (!f.startsWith(dist) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) f = path.join(dist, "index.html")
  const ext = path.extname(f).toLowerCase()
  let body = fs.readFileSync(f)
  const h = { "Content-Type": mime[ext] || "application/octet-stream", "Cache-Control": "no-store" }
  if (/\.(js|css|html|svg|json)$/.test(ext) && /gzip/.test(req.headers["accept-encoding"] || "")) { body = zlib.gzipSync(body); h["Content-Encoding"] = "gzip" }
  h["Content-Length"] = body.length
  res.writeHead(200, h); res.end(body)
})
await new Promise((r) => server.listen(0, r))
const base = `http://127.0.0.1:${server.address().port}`
const pages = { home: "/", gallery: "/gallery", news: "/news", products: "/products", product_detail: "/products/zoomlion-rn904", event_nakuru: "/showroom-launch" }
const browser = await chromium.launch({ executablePath: "/usr/bin/google-chrome", args: ["--no-sandbox"] })
const median = (a) => [...a].sort((x, y) => x - y)[Math.floor(a.length / 2)]
const results = {}
for (const [name, url] of Object.entries(pages)) {
  const runs = []
  for (let i = 0; i < RUNS; i++) {
    const ctx = await browser.newContext({ viewport: { width: 412, height: 823 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, userAgent: "Mozilla/5.0 (Linux; Android 11; Moto G Power) AppleWebKit/537.36 Chrome/120 Mobile Safari/537.36" })
    const page = await ctx.newPage()
    const cdp = await ctx.newCDPSession(page)
    await cdp.send("Network.enable")
    await cdp.send("Network.emulateNetworkConditions", { offline: false, latency: 150, downloadThroughput: (1.6 * 1024 * 1024) / 8, uploadThroughput: (750 * 1024) / 8 })
    await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 })
    let img = 0, total = 0, imgCount = 0, pending = 0, last = Date.now()
    const sizes = new Map()
    cdp.on("Network.requestWillBeSent", () => { pending++; last = Date.now() })
    cdp.on("Network.loadingFailed", () => { pending--; last = Date.now() })
    cdp.on("Network.responseReceived", (e) => sizes.set(e.requestId, e.type))
    cdp.on("Network.loadingFinished", (e) => { pending--; last = Date.now(); total += e.encodedDataLength; if (sizes.get(e.requestId) === "Image") { img += e.encodedDataLength; imgCount++ } })
    await page.addInitScript(() => {
      window.__lcp = 0; window.__cls = 0
      new PerformanceObserver((l) => { for (const e of l.getEntries()) window.__lcp = e.startTime }).observe({ type: "largest-contentful-paint", buffered: true })
      new PerformanceObserver((l) => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__cls += e.value }).observe({ type: "layout-shift", buffered: true })
    })
    const t0 = Date.now()
    await page.goto(base + url, { waitUntil: "load", timeout: 180000 })
    await page.waitForTimeout(2500)
    // scroll to bottom in steps to trigger lazy loading, as a user would
    const h = await page.evaluate(() => document.documentElement.scrollHeight)
    const afterLoad = { img, total, imgCount }
    for (let y = 0; y < h; y += 600) { await page.evaluate((yy) => window.scrollTo(0, yy), y); await page.waitForTimeout(250) }
    const t1 = Date.now()
    while (Date.now() - t1 < 420000 && (pending > 0 || Date.now() - last < 3000)) await page.waitForTimeout(500)
    const m = await page.evaluate(() => ({ lcp: window.__lcp, cls: window.__cls, h: document.documentElement.scrollHeight }))
    runs.push({ lcp: Math.round(m.lcp), cls: +m.cls.toFixed(4), initialImgKB: Math.round(afterLoad.img / 1024), initialTotalKB: Math.round(afterLoad.total / 1024), fullImgKB: Math.round(img / 1024), fullTotalKB: Math.round(total / 1024), fullImgCount: imgCount, settleSec: Math.round((Date.now() - t0) / 1000) })
    await ctx.close()
  }
  const keys = Object.keys(runs[0])
  results[name] = Object.fromEntries(keys.map((k) => [k, median(runs.map((r) => r[k]))]))
  results[name].runs = runs
  console.error(label, name, JSON.stringify(results[name], (k, v) => (k === "runs" ? undefined : v)))
}
fs.writeFileSync(`/tmp/perf/${label}.json`, JSON.stringify(results, null, 1))
await browser.close(); server.close()

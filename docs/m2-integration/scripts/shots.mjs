import http from "node:http"; import fs from "node:fs"; import path from "node:path"
import { createRequire } from "node:module"
const require = createRequire("/opt/npm-tools/node_modules/"); const { chromium } = require("playwright")
const dist = process.argv[2], out = process.argv[3]; fs.mkdirSync(out, { recursive: true })
const mime = { ".html":"text/html", ".js":"text/javascript", ".css":"text/css", ".webp":"image/webp", ".png":"image/png", ".jpg":"image/jpeg", ".svg":"image/svg+xml", ".json":"application/json" }
const server = http.createServer((req, res) => { let p = decodeURIComponent(req.url.split("?")[0]); let f = path.join(dist, p); if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) f = path.join(dist, "index.html"); res.writeHead(200, { "Content-Type": mime[path.extname(f)] || "application/octet-stream" }); res.end(fs.readFileSync(f)) })
await new Promise((r) => server.listen(0, "127.0.0.1", r)); const base = `http://127.0.0.1:${server.address().port}`
const browser = await chromium.launch({ executablePath: "/usr/bin/google-chrome", args: ["--no-sandbox"] })
for (const [n, vp, m] of [["desktop", { width: 1366, height: 900 }, false], ["mobile", { width: 412, height: 823 }, true]]) {
  const ctx = await browser.newContext({ viewport: vp, deviceScaleFactor: m ? 2 : 1, isMobile: m, hasTouch: m }); const p = await ctx.newPage()
  for (const [k, u] of [["home-hero", "/"], ["product-detail", "/products/zoomlion-rn904"], ["gallery", "/gallery"], ["news", "/news"], ["nakuru-event", "/showroom-launch"]]) {
    await p.goto(base + u, { waitUntil: "load" }); await p.waitForTimeout(2500)
    await p.evaluate(async () => { for (let y = 0; y < Math.min(document.body.scrollHeight, 6000); y += 500) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 80)) } window.scrollTo(0, 0) }); await p.waitForTimeout(800)
    await p.screenshot({ path: `${out}/${k}-${n}.png` })
  }
  await p.goto(base + "/products", { waitUntil: "load" }); await p.waitForSelector("h3")
  for (const [i, h] of ["Our Tractors", "Our Harvesters", "Farm Implements"].entries()) { await p.evaluate((h) => { [...document.querySelectorAll("h2")].find((x) => x.textContent.trim() === h).scrollIntoView() }, h); await p.waitForTimeout(1200); await p.screenshot({ path: `${out}/catalogue-${["tractors", "harvesters", "implements"][i]}-${n}.png` }) }
  await p.goto(base + "/", { waitUntil: "load" }); await p.waitForTimeout(1500)
  if (m) { await p.evaluate(() => document.querySelector('header button[aria-label*="enu" i], header button')?.click()); await p.waitForTimeout(800) }
  await p.screenshot({ path: `${out}/nav-${n}.png` }); await ctx.close()
}
await browser.close(); server.close()

import http from "node:http"; import fs from "node:fs"; import path from "node:path"
import { createRequire } from "node:module"
const require = createRequire("/opt/npm-tools/node_modules/"); const { chromium } = require("playwright")
const [dist, outDir, label] = process.argv.slice(2); fs.mkdirSync(outDir, { recursive: true })
const mime = { ".html":"text/html", ".js":"text/javascript", ".css":"text/css", ".webp":"image/webp", ".png":"image/png", ".jpg":"image/jpeg", ".svg":"image/svg+xml", ".json":"application/json" }
const server = http.createServer((req, res) => { let p = decodeURIComponent(req.url.split("?")[0]); let f = path.join(dist, p); if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) f = path.join(dist, "index.html"); res.writeHead(200, { "Content-Type": mime[path.extname(f)] || "application/octet-stream" }); res.end(fs.readFileSync(f)) })
await new Promise((r) => server.listen(0, "127.0.0.1", r)); const base = `http://127.0.0.1:${server.address().port}`
const browser = await chromium.launch({ executablePath: "/usr/bin/google-chrome", args: ["--no-sandbox"] })
const VPS = [["mobile-360x640", 360, 640, 2, true], ["mobile-412x823", 412, 823, 2, true], ["mobile-390x844", 390, 844, 3, true], ["landscape-844x390", 844, 390, 2, true], ["tablet-820x1180", 820, 1180, 2, true], ["laptop-1024x768", 1024, 768, 1, false], ["desktop-1366x900", 1366, 900, 1, false], ["wide-1920x1080", 1920, 1080, 1, false]]
const out = {}
for (const [name, w, h, dpr, mobile] of VPS) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: dpr, isMobile: mobile, hasTouch: mobile }); const p = await ctx.newPage()
  const errs = []; p.on("pageerror", (e) => errs.push(String(e)))
  await p.goto(base + "/", { waitUntil: "load" }); await p.waitForSelector('button[aria-label="Go to slide 1"]'); await p.waitForTimeout(1500)
  // bring the stats block into view so the count-up runs, then wait for it to finish
  await p.evaluate(() => { const s = document.querySelector("#home .grid.grid-cols-1"); s?.scrollIntoView({ block: "center" }) }); await p.waitForTimeout(2200)
  const m = await p.evaluate(() => {
    const sec = document.querySelector("#home"); const sy = scrollY
    const R = (el) => { const r = el.getBoundingClientRect(); return { x: r.left, y: r.top + sy, w: r.width, h: r.height, r: r.right, b: r.bottom + sy } }
    const vis = (el) => el && getComputedStyle(el).display !== "none" && el.getBoundingClientRect().width > 0
    const content = [...sec.querySelectorAll("h1, h1 + div, p, a[href='#products'], a[href*='wa.me'], a[href*='whatsapp'], .grid.grid-cols-1 > div")].filter(vis).map((el) => ({ n: ((el.textContent || "").trim().slice(0, 24) || el.getAttribute("aria-label") || el.getAttribute("href") || el.className.toString().slice(0,40)), ...R(el) }))
    const dots = [...sec.querySelectorAll('button[aria-label^="Go to slide"]')].filter(vis).map(R)
    const arrows = [...sec.querySelectorAll('button[aria-label="Previous slide"], button[aria-label="Next slide"]')].filter(vis).map((el) => ({ n: el.getAttribute("aria-label"), ...R(el) }))
    const hit = (a, b) => a.x < b.r && a.r > b.x && a.y < b.b && a.b > b.y
    const overlaps = []
    for (const d of dots) for (const c of content) if (hit(d, c)) overlaps.push(["dot", c.n])
    for (const a of arrows) for (const c of content) if (hit(a, c)) overlaps.push([a.n, c.n])
    const stats = [...sec.querySelectorAll(".grid.grid-cols-1 > div")].map((d) => d.innerText.replace(/\n+/g, " | "))
    const secR = R(sec)
    const dotsInside = dots.every((d) => d.b <= secR.b + 1 && d.y >= secR.y)
    return { stats, nDots: dots.length, nArrows: arrows.length, overlaps: [...new Set(overlaps.map((o) => o.join("~")))], dotsInside, sectionH: Math.round(secR.h), hscroll: document.documentElement.scrollWidth > innerWidth }
  })
  m.pageErrors = errs.length; out[name] = m
  // screenshot: stats + controls region
  await p.screenshot({ path: path.join(outDir, `${label}-${name}.png`) })
  await ctx.close()
}
console.log(JSON.stringify(out, null, 1)); await browser.close(); server.close()

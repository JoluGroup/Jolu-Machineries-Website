import http from "node:http"; import fs from "node:fs"; import path from "node:path"
import { createRequire } from "node:module"
const require = createRequire("/opt/npm-tools/node_modules/"); const { chromium } = require("playwright")
const dist = process.argv[2]; const shots = process.argv[3]; fs.mkdirSync(shots, { recursive: true })
const mime = { ".html":"text/html", ".js":"text/javascript", ".css":"text/css", ".webp":"image/webp", ".png":"image/png", ".jpg":"image/jpeg", ".svg":"image/svg+xml", ".json":"application/json" }
const server = http.createServer((req, res) => { let p = decodeURIComponent(req.url.split("?")[0]); let f = path.join(dist, p); if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) f = path.join(dist, "index.html"); res.writeHead(200, { "Content-Type": mime[path.extname(f)] || "application/octet-stream" }); res.end(fs.readFileSync(f)) })
await new Promise((r) => server.listen(0, "127.0.0.1", r)); const base = `http://127.0.0.1:${server.address().port}`
const browser = await chromium.launch({ executablePath: "/usr/bin/google-chrome", args: ["--no-sandbox"] })
const out = {}
for (const [name, vp, mobile] of [["desktop", { width: 1366, height: 900 }, false], ["mobile", { width: 412, height: 823 }, true]]) {
  const ctx = await browser.newContext({ viewport: vp, deviceScaleFactor: mobile ? 2 : 1, isMobile: mobile, hasTouch: mobile }); const page = await ctx.newPage()
  const errs = []; page.on("pageerror", (e) => errs.push(String(e))); const imgReqs = []; page.on("response", (r) => { if (r.url().includes("/_img/")) imgReqs.push({ s: r.status(), ct: r.headers()["content-type"] }) })
  await page.goto(base + "/products", { waitUntil: "load" }); await page.waitForSelector("h3")
  const initialImgReqs = imgReqs.length
  // scroll through to trigger lazy images
  await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 400) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 120)) } window.scrollTo(0, 0) }); await page.waitForTimeout(1500)
  const info = await page.evaluate(async () => {
    const main = document.querySelector("main") || document.body
    const cards = [...document.querySelectorAll("h3")].map((h) => h.closest("div.border"))
    const imgs = cards.map((c) => c.querySelector("img"))
    const dec = await Promise.all(imgs.map(async (i) => { try { await i.decode(); return i.naturalWidth > 0 } catch { return false } }))
    const links = cards.map((c) => c.querySelector("a")?.getAttribute("href"))
    const heads = [...document.querySelectorAll("h2")].map((h) => h.textContent.trim())
    const per = heads.map((h) => ({ h, n: [...document.querySelectorAll("h2")].find((x) => x.textContent.trim() === h).nextElementSibling.children.length }))
    const t = document.body.innerText
    return { cards: cards.length, decoded: dec.filter(Boolean).length, broken: dec.filter((x) => !x).length, rawKeys: imgs.filter((i) => /@\/assets/.test(i.currentSrc + i.src)).length, srcsetAll: imgs.every((i) => i.srcset), withDims: imgs.every((i) => i.width && i.height), lazy: imgs.filter((i) => i.loading === "lazy").length, links, heads: per, header: document.querySelectorAll("header").length, footer: document.querySelectorAll("footer").length, nav: [...document.querySelectorAll("header a")].map((a) => a.textContent.trim()).filter(Boolean), forbidden: /\b(reviews?|rating|horsepower|\bhp\b|★)/i.test(main.innerText), hscroll: document.documentElement.scrollWidth > innerWidth }
  })
  info.imgReqStatuses = [...new Set(imgReqs.map((r) => r.s + " " + r.ct))]; info.initialImgReqs = initialImgReqs; info.totalImgReqs = imgReqs.length
  await page.screenshot({ path: `${shots}/catalogue-${name}-top.png` })
  await page.screenshot({ path: `${shots}/catalogue-${name}-full.png`, fullPage: true })
  // every link loads detail; back returns
  const detail = []; for (const href of info.links) { await page.goto(base + "/products", { waitUntil: "domcontentloaded" }); await page.waitForSelector("h3"); await page.click(`a[href="${href}"]`); await page.waitForSelector("h1", { timeout: 15000 }); const ok = await page.evaluate(() => { const i = document.querySelector("main img"); return location.pathname.startsWith("/products/") && !!document.querySelector("h1")?.textContent.trim() && i && i.complete && i.naturalWidth > 0 }); detail.push(ok) }
  await page.goBack(); await page.waitForSelector("h3"); info.backWorks = new URL(page.url()).pathname === "/products"
  info.detailOk = detail.filter(Boolean).length; info.detailTotal = detail.length; info.pageErrors = errs.length; info.links = undefined
  // nav "Catalogue" works from home
  await page.goto(base + "/", { waitUntil: "load" }); info.homeProductCards = await page.evaluate(() => document.querySelectorAll('a[href^="/products/"]').length)
  out[name] = info; await ctx.close()
}
console.log(JSON.stringify(out, null, 1)); await browser.close(); server.close()

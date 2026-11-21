// M2-R05 responsive navigation verification. Usage: node verify-nav.mjs <dist> <out.json>
import http from "node:http"; import fs from "node:fs"; import path from "node:path"
import { createRequire } from "node:module"
const require = createRequire("/opt/npm-tools/node_modules/"); const { chromium } = require("playwright")
const [dist, outFile] = process.argv.slice(2)
const mime = { ".html":"text/html", ".js":"text/javascript", ".css":"text/css", ".webp":"image/webp", ".png":"image/png", ".jpg":"image/jpeg", ".svg":"image/svg+xml", ".json":"application/json" }
const server = http.createServer((req, res) => { let p = decodeURIComponent(req.url.split("?")[0]); let f = path.join(dist, p); if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) f = path.join(dist, "index.html"); res.writeHead(200, { "Content-Type": mime[path.extname(f)] || "application/octet-stream" }); res.end(fs.readFileSync(f)) })
await new Promise((r) => server.listen(0, "127.0.0.1", r)); const base = `http://127.0.0.1:${server.address().port}`
const WIDTHS = [360, 390, 412, 640, 767, 768, 820, 834, 893, 900, 1024, 1139, 1140, 1280, 1440]
const PAGES = ["/", "/products", "/products/zoomlion-rn904", "/gallery", "/news"]
const TOP = ["Home", "Products", "Catalogue", "Spare Parts", "About", "Media & Events", "Schedule", "Careers"]
const SUB = ["About Us", "Documents", "Nakuru Regional Office & Showroom Grand Launch", "Mud4Fun 4x4 Challenge", "Head Office - Nairobi Business Launch", "KTN Interview", "Gallery"]
const b = await chromium.launch({ executablePath: "/usr/bin/google-chrome", args: ["--no-sandbox"] }); const out = []
for (const pg of PAGES) {
  const ctx = await b.newContext({ viewport: { width: 800, height: 900 } }); const p = await ctx.newPage(); const errs = []; p.on("pageerror", (e) => errs.push(String(e)))
  await p.goto(base + pg, { waitUntil: "load" }); await p.waitForTimeout(700)
  for (const w of WIDTHS) {
    await p.setViewportSize({ width: w, height: 900 }); await p.waitForTimeout(80)
    const row = { page: pg, w }
    const st = await p.evaluate(() => { const h = document.querySelector("header"); const nav = h.querySelector("nav"); const tog = h.querySelector('[aria-label="Toggle menu"]'); const vis = (e) => e && getComputedStyle(e).display !== "none"; return { mode: vis(nav) ? "desktop" : "mobile", toggle: vis(tog), docW: document.documentElement.scrollWidth, innerW: innerWidth, headerOverflow: h.scrollWidth > h.clientWidth + 1 } })
    row.mode = st.mode; row.hscroll = st.docW - st.innerW
    row.pageHeaderOverflow = st.headerOverflow
    if (st.mode === "desktop") {
      row.ctaInViewport = await p.evaluate(() => { const bt = [...document.querySelectorAll("header nav button")].find((x) => x.textContent.trim() === "Request a Quote"); const r = bt.getBoundingClientRect(); return r.left >= 0 && r.right <= innerWidth })
      row.topLabels = await p.evaluate(() => [...document.querySelectorAll("header nav > a, header nav > div > button")].map((e) => e.textContent.trim()))
      row.brandSqueezed = await p.evaluate(() => { const a = document.querySelector("header nav").parentElement.firstElementChild.getBoundingClientRect(); return a.width < 188 })
      row.allTop = TOP.every((t) => row.topLabels.includes(t))
    } else {
      // open menu, check links and CTA, close again
      await p.click('[aria-label="Toggle menu"]'); await p.waitForTimeout(150)
      const m = await p.evaluate(() => { const h = document.querySelector("header"); const menu = h.querySelector("button[aria-label='Toggle menu']").closest("div.flex").parentElement.lastElementChild; const txt = [...menu.querySelectorAll("a,summary")].map((e) => e.textContent.replace(/(NEW|HOT)$/, "").trim()); const cta = [...menu.querySelectorAll("button")].find((x) => x.textContent.trim() === "Request a Quote"); const r = cta && cta.getBoundingClientRect(); return { txt, ctaInViewportWidth: !!r && r.left >= 0 && r.right <= innerWidth, hscroll: document.documentElement.scrollWidth - innerWidth } })
      row.menuTop = TOP.every((t) => m.txt.includes(t)); row.menuSubDefined = true
      // expand details to reach sub items
      await p.evaluate(() => document.querySelectorAll("header details").forEach((d) => (d.open = true))); await p.waitForTimeout(80)
      const subs = await p.evaluate(() => [...document.querySelectorAll("header details a")].map((a) => a.textContent.replace(/(NEW|HOT)$/, "").trim()))
      row.menuSubs = SUB.every((s) => subs.includes(s)); row.ctaFits = m.ctaInViewportWidth; row.hscrollOpen = (await p.evaluate(() => document.documentElement.scrollWidth - innerWidth))
      // CTA opens the quote drawer
      await p.evaluate(() => document.querySelectorAll("header details").forEach((d) => (d.open = false)))
      await p.locator("header").getByRole("button", { name: "Request a Quote" }).click(); await p.waitForTimeout(500)
      row.ctaOpensDialog = (await p.locator('[role="dialog"]').count()) > 0
      await p.keyboard.press("Escape"); await p.waitForTimeout(400)
      // toggle closes
      if ((await p.locator('[aria-label="Toggle menu"]').count()) && (await p.locator("header >> text=Spare Parts").last().isVisible().catch(() => false))) await p.click('[aria-label="Toggle menu"]')
      await p.waitForTimeout(100)
      row.menuClosedByToggle = !(await p.locator("header >> text=Spare Parts").last().isVisible().catch(() => false))
      // keyboard: focus toggle, Enter opens, Tab reaches first link
      await p.focus('[aria-label="Toggle menu"]'); await p.keyboard.press("Enter"); await p.waitForTimeout(100); await p.keyboard.press("Tab")
      row.kbdTabToFirstLink = await p.evaluate(() => document.activeElement?.textContent.trim())
      await p.keyboard.press("Enter") // activates Home link (closes menu on navigation)
      await p.waitForTimeout(200)
      if (await p.locator("header >> text=Spare Parts").last().isVisible().catch(() => false)) await p.click('[aria-label="Toggle menu"]')
      await p.goto(base + pg, { waitUntil: "load" }); await p.setViewportSize({ width: w, height: 900 })
    }
    row.errors = errs.length
    out.push(row)
  }
  await ctx.close()
}
fs.writeFileSync(outFile, JSON.stringify(out, null, 1)); await b.close(); server.close()
const bad = out.filter((r) => r.hscroll > 0 || r.errors || (r.mode === "desktop" && (!r.ctaInViewport || !r.allTop || r.brandSqueezed)) || (r.mode === "mobile" && (!r.menuTop || !r.menuSubs || !r.ctaFits || !r.ctaOpensDialog || !r.menuClosedByToggle)))
console.log("rows", out.length, "problem rows", bad.length); for (const r of bad.slice(0, 40)) console.log(JSON.stringify(r))

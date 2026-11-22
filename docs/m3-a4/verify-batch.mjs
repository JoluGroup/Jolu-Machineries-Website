// M3-A4 verification: responsive screen checks, image fit, quote drawer and A4 print-to-PDF for every sheet.
// Usage: node verify-batch.mjs <dist> <outDir> <clientRoot>
import http from "node:http"; import fs from "node:fs"; import path from "node:path"
import { createRequire } from "node:module"
const require = createRequire("/opt/npm-tools/node_modules/"); const { chromium } = require("playwright")
const [dist, out, root] = process.argv.slice(2); fs.mkdirSync(out, { recursive: true })
const { build } = await import(path.join(root, "node_modules/esbuild/lib/main.js"))
await build({ entryPoints: [path.join(root, "src/data/spec-sheets/index.ts")], outfile: "/tmp/m3a4-data.mjs", bundle: true, format: "esm", platform: "node", alias: { "@": path.join(root, "src") }, loader: { ".png": "dataurl", ".webp": "dataurl", ".jpg": "dataurl", ".json": "json" }, logLevel: "silent" })
const { specSheets } = await import("/tmp/m3a4-data.mjs?" + Date.now())
const SLUGS = Object.keys(specSheets)
const mime = { ".html":"text/html", ".js":"text/javascript", ".css":"text/css", ".webp":"image/webp", ".png":"image/png", ".jpg":"image/jpeg", ".svg":"image/svg+xml", ".json":"application/json" }
const server = http.createServer((req, res) => { let p = decodeURIComponent(req.url.split("?")[0]); let f = path.join(dist, p); if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) f = path.join(dist, "index.html"); res.writeHead(200, { "Content-Type": mime[path.extname(f)] || "application/octet-stream" }); res.end(fs.readFileSync(f)) })
await new Promise((r) => server.listen(0, "127.0.0.1", r)); const base = `http://127.0.0.1:${server.address().port}`
const b = await chromium.launch({ executablePath: "/usr/bin/google-chrome", args: ["--no-sandbox"] })
const R = { widths: {}, slugs: {}, routes: {} }
const WIDTHS = [[360,740,true],[390,844,true],[412,823,true],[640,900,false],[768,1024,false],[820,1180,false],[893,1000,false],[1024,768,false],[1280,800,false],[1440,900,false]]
const guard = (base) => async (r) => { const q = r.request(); if (!q.url().startsWith(base)) return r.abort(); if (q.method() !== "GET") { r.__nonget = true; return r.abort() } r.continue() }

for (const slug of SLUGS) {
  const sheet = specSheets[slug]; const ROUTE = `/products/${slug}/spec-sheet`; const rec = { screen: [] }
  for (const [w, h, mob] of WIDTHS) {
    const ctx = await b.newContext({ viewport: { width: w, height: h }, isMobile: mob, hasTouch: mob }); const p = await ctx.newPage(); const errs = []; const failed = []
    p.on("pageerror", (e) => errs.push(String(e))); p.on("requestfailed", (r) => failed.push(r.url()))
    await p.route("**/*", guard(base))
    await p.goto(base + ROUTE, { waitUntil: "load" }); await p.waitForSelector(".ss-page"); await p.waitForTimeout(600)
    const m = await p.evaluate((fit) => {
      const stage = document.querySelector(".ss-stage-img"); const img = stage.querySelector("img"); const sr = stage.getBoundingClientRect(); const ir = img.getBoundingClientRect()
      const nw = img.naturalWidth, nh = img.naturalHeight, k = Math.min(ir.width / nw, ir.height / nh), dw = nw * k, dh = nh * k, ox = ir.left + (ir.width - dw) / 2, oy = ir.top + (ir.height - dh) / 2
      const box = { l: ox + fit.left * dw, r: ox + fit.right * dw, t: oy + fit.top * dh, b: oy + fit.bottom * dh }
      const ratio = (ir.width / ir.height) / (nw / nh)
      const pages = [...document.querySelectorAll(".ss-page")]
      return { hscroll: document.documentElement.scrollWidth - innerWidth, pages: pages.length, imgOk: img.complete && nw > 0, inner: pages.map((pg) => { const i = pg.querySelector(".ss-inner"); return i.scrollHeight - i.clientHeight }), subjectInside: box.l >= sr.left - 1 && box.r <= sr.right + 1 && box.t >= sr.top - 1 && box.b <= sr.bottom + 1, subjectW: +((box.r - box.l) / sr.width).toFixed(3), drawnToStage: +(dw / sr.width).toFixed(2), edit: document.querySelectorAll("[contenteditable]").length }
    }, sheet.imageFit.subject)
    await p.screenshot({ path: `${out}/${slug}-${w}.png`, fullPage: true })
    rec.screen.push({ w, ...m, errors: errs.length, failed: failed.length })
    await ctx.close()
  }
  // functional: tabs + quote drawer (non-GET blocked)
  {
    const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } }); const p = await ctx.newPage(); let nonGet = 0
    await p.route("**/*", async (r) => { const q = r.request(); if (!q.url().startsWith(base)) return r.abort(); if (q.method() !== "GET") { nonGet++; return r.abort() } r.continue() })
    await p.goto(base + ROUTE, { waitUntil: "load" }); await p.waitForSelector(".ss-page")
    await p.click('button:has-text("DIMENSIONS")'); await p.waitForTimeout(200)
    rec.dimTab = await p.locator(".ss-stage-diagram svg").count()
    await p.screenshot({ path: `${out}/${slug}-dimtab.png`, clip: { x: 0, y: 0, width: 1280, height: 900 } })
    await p.click('button:has-text("PHOTO")')
    await p.getByRole("button", { name: /Request a quote/i }).click(); await p.waitForTimeout(600)
    const dlg = p.locator('[role="dialog"]'); rec.quoteDialog = await dlg.count(); const txt = await dlg.innerText().catch(() => ""); rec.quoteHasProduct = txt.includes(sheet.productName) || txt.includes(sheet.modelDesignation)
    await p.keyboard.press("Escape"); await p.waitForTimeout(400); rec.quoteClosed = (await dlg.count()) === 0; rec.nonGetAttempts = nonGet
    rec.noindex = await p.evaluate(() => document.querySelector("meta[name=robots]")?.content)
    await ctx.close()
  }
  // print
  {
    const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } }); const p = await ctx.newPage()
    await p.route("**/*", (r) => (r.request().url().startsWith(base) ? r.continue() : r.abort()))
    await p.goto(base + ROUTE, { waitUntil: "load" }); await p.waitForSelector(".ss-page"); await p.waitForTimeout(800)
    await p.emulateMedia({ media: "print" })
    rec.print = await p.evaluate(() => { const mm = (px) => +(px / 96 * 25.4).toFixed(1); const stages = [...document.querySelectorAll(".ss-stage")]
      return { toolbarHidden: getComputedStyle(document.querySelector(".ss-toolbar")).display === "none", tabsHidden: getComputedStyle(document.querySelector(".ss-view-tabs")).display === "none",
        pages: stages.map((s) => { const r = s.getBoundingClientRect(); const pg = s.querySelector(".ss-page"); const inner = pg.querySelector(".ss-inner"); const kids = [...inner.children].map((c) => c.getBoundingClientRect()); const innerR = inner.getBoundingClientRect(); const overlaps = []
          for (let a = 0; a < kids.length; a++) for (let c = a + 1; c < kids.length; c++) { const A = kids[a], C = kids[c]; if (A.height > 0 && C.height > 0 && A.bottom > C.top + 1 && A.top < C.bottom - 1 && A.right > C.left + 1 && A.left < C.right - 1) overlaps.push([a, c]) }
          return { wMm: mm(r.width), hMm: mm(r.height), overflowPx: inner.scrollHeight - inner.clientHeight, lastWithin: Math.round(kids[kids.length - 1].bottom) <= Math.round(innerR.bottom) + 1, overlaps } }),
        minFontPx: [...document.querySelectorAll(".ss-page *")].filter((e) => [...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())).map((e) => parseFloat(getComputedStyle(e).fontSize)).reduce((a, c) => Math.min(a, c), 99),
        darkBg: getComputedStyle(document.querySelector(".ss-dark")).backgroundColor, accent: getComputedStyle(document.querySelector(".ss-btn-primary")).backgroundColor } })
    await p.pdf({ path: `${out}/${slug}.pdf`, preferCSSPageSize: true, printBackground: true })
    await ctx.close()
  }
  R.slugs[slug] = rec
}
// unknown slug + existing routes
{
  const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } }); const p = await ctx.newPage(); await p.route("**/*", guard(base))
  for (const u of ["/products/nope/spec-sheet", "/products/constructor/spec-sheet", "/products/zoomlion-rn904/spec-sheet", "/products/__proto__/spec-sheet"]) { await p.goto(base + u, { waitUntil: "load" }); await p.waitForTimeout(400); R.routes[u] = await p.evaluate(() => /404|not found/i.test(document.body.innerText)) }
  for (const r of ["/", "/products", "/products/zoomlion-rc904-1104", "/products/zoomlion-pl2304"]) { await p.goto(base + r, { waitUntil: "load" }); await p.waitForTimeout(600); R.routes[r] = await p.evaluate(() => ({ h: !!document.querySelector("h1,h2,h3"), linksToSheet: [...document.querySelectorAll("a")].filter((a) => /spec-sheet/.test(a.getAttribute("href") || "")).length, cards: document.querySelectorAll('a[href^="/products/"]').length })) }
  await ctx.close()
}
fs.writeFileSync(`${out}/report.json`, JSON.stringify(R, null, 1)); await b.close(); server.close()
const sum = Object.entries(R.slugs).map(([s, r]) => [s, "scr:" + r.screen.every((x) => x.hscroll <= 0 && x.pages === 2 && x.imgOk && x.errors === 0 && x.subjectInside && x.inner.every((v) => v <= 0)), "tab" + r.dimTab, "dlg" + r.quoteDialog + "/" + r.quoteHasProduct + "/" + r.quoteClosed, "nonget" + r.nonGetAttempts, "print:" + r.print.pages.map((p) => `${p.wMm}x${p.hMm} ov${p.overflowPx} lw${p.lastWithin} x${p.overlaps.length}`).join(","), "minfont" + r.print.minFontPx])
console.log(sum.map((x) => x.join(" ")).join("\n")); console.log(JSON.stringify(R.routes))

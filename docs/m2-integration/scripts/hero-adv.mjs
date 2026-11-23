import http from "node:http"; import fs from "node:fs"; import path from "node:path"
import { createRequire } from "node:module"
const require = createRequire("/opt/npm-tools/node_modules/"); const { chromium } = require("playwright")
const dist = process.argv[2]
const mime = { ".html":"text/html", ".js":"text/javascript", ".css":"text/css", ".webp":"image/webp", ".png":"image/png", ".jpg":"image/jpeg", ".svg":"image/svg+xml", ".json":"application/json" }
const server = http.createServer((req, res) => { let p = decodeURIComponent(req.url.split("?")[0]); let f = path.join(dist, p); if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) f = path.join(dist, "index.html"); res.writeHead(200, { "Content-Type": mime[path.extname(f)] || "application/octet-stream" }); res.end(fs.readFileSync(f)) })
await new Promise((r) => server.listen(0, "127.0.0.1", r)); const base = `http://127.0.0.1:${server.address().port}`
const browser = await chromium.launch({ executablePath: "/usr/bin/google-chrome", args: ["--no-sandbox"] })
async function fresh(mode, throttle = true) {
  const ctx = await browser.newContext({ viewport: { width: 412, height: 823 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true }); const page = await ctx.newPage()
  const errs = []; page.on("pageerror", (e) => errs.push(String(e)))
  const st = { mode: "none", reqs: [] }; st.errs = errs
  await ctx.route("**/_img/**", async (route) => {
    const url = route.request().url(); st.reqs.push(url)
    if (st.mode === "500") return route.fulfill({ status: 500, body: "err" })
    if (st.mode === "corrupt") return route.fulfill({ status: 200, contentType: "image/webp", body: Buffer.from("not a webp at all") })
    if (st.mode === "reset") return route.abort("connectionreset")
    if (st.mode === "slow") { await new Promise((r) => setTimeout(r, 3000 + Math.random() * 3000)); return route.continue() }
    return route.continue()
  })
  if (throttle) { const cdp = await ctx.newCDPSession(page); await cdp.send("Network.enable"); await cdp.send("Network.emulateNetworkConditions", { offline: false, latency: 150, downloadThroughput: (1.6 * 1024 * 1024) / 8, uploadThroughput: 90000 }); await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 }) }
  await page.goto(base + "/", { waitUntil: "load" }); await page.waitForSelector('button[aria-label="Go to slide 4"]', { timeout: 90000 })
  await page.waitForFunction(() => { const im = document.querySelector('button[aria-label="Go to slide 1"]').closest("section").querySelector("img"); return im && im.complete && im.naturalWidth > 0 }, null, { timeout: 90000 })
  st.mode = mode; st.ctx = ctx; st.page = page; st.eager = st.reqs.length; return st
}
const installSampler = (page) => page.evaluate(() => { window.__s = []; const hero = document.querySelector('button[aria-label="Go to slide 1"]').closest("section"); const row = hero.querySelector("img").closest("div").parentElement; window.__t = setInterval(() => { const m = /translateX\(-?([\d.]+)%\)/.exec(row.style.transform || ""); const idx = m ? Math.round(+m[1] / 100) : 0; const im = row.children[idx]?.querySelector("img"); window.__s.push({ idx, ok: !!im && im.complete && im.naturalWidth > 0 }) }, 40) })
const stats = (page) => page.evaluate(() => { clearInterval(window.__t); const s = window.__s; return { samples: s.length, blank: s.filter((x) => !x.ok).length, shown: [...new Set(s.map((x) => x.idx))], final: s.at(-1)?.idx } })
const click = (page, n) => page.evaluate((n) => document.querySelector(`button[aria-label="Go to slide ${n}"]`)?.click(), n)
const btn = (page, l) => page.evaluate((l) => document.querySelector(`button[aria-label="${l}"]`)?.click(), l)
const R = {}
const run = async (name, mode, fn, throttle = true) => { const st = await fresh(mode, throttle); await installSampler(st.page); try { await fn(st) } catch (e) { st.err = String(e).slice(0, 200) } const s = await stats(st.page); R[name] = { ...s, pageErrors: st.errs.length, extraErr: st.err, initialRequests: st.eager, totalImgReqs: st.reqs.length }; await st.ctx.close() }
const w = (p, ms) => p.waitForTimeout(ms)
await run("01_unloaded_nav_normal", "none", async ({ page }) => { await click(page, 4); await w(page, 12000) })
await run("02_rapid_dots_normal", "none", async ({ page }) => { await click(page, 4); await w(page, 80); await click(page, 3); await w(page, 80); await click(page, 5); await w(page, 14000) })
await run("03_stale_slow_rapid", "slow", async ({ page }) => { await click(page, 4); await w(page, 200); await click(page, 2); await w(page, 200); await click(page, 5); await w(page, 14000) })
await run("04_during_autoadvance", "none", async ({ page }) => { await w(page, 5500); await click(page, 3); await w(page, 3000); await click(page, 5); await w(page, 12000) })
await run("05_http500", "500", async ({ page }) => { await click(page, 4); await w(page, 2000); await click(page, 2); await btn(page, "Next slide"); await w(page, 12000) })
await run("06_decode_fail", "corrupt", async ({ page }) => { await click(page, 4); await w(page, 2000); await btn(page, "Next slide"); await btn(page, "Previous slide"); await w(page, 12000) })
await run("07_interrupted", "reset", async ({ page }) => { await click(page, 5); await w(page, 2000); await click(page, 3); await w(page, 12000) })
await run("08_slow_network", "slow", async ({ page }) => { await click(page, 3); await w(page, 14000) })
await run("09_prev_next", "none", async ({ page }) => { for (let i = 0; i < 6; i++) { await btn(page, "Next slide"); await w(page, 300) } for (let i = 0; i < 6; i++) { await btn(page, "Previous slide"); await w(page, 300) } await w(page, 10000) })
await run("10_unmount_pending", "slow", async ({ page }) => { await click(page, 4); await w(page, 300); await page.evaluate(() => document.querySelector('a[href="/gallery"]')?.click()); await page.evaluate(() => history.pushState({}, "", "/gallery")); await w(page, 8000) })
await run("11_recovery_after_failure", "500", async (st) => { await click(st.page, 4); await w(st.page, 2500); st.mode = "none"; await click(st.page, 4); await w(st.page, 12000); await click(st.page, 5); await w(st.page, 12000) })
await run("12_repeated_autoadvance", "none", async ({ page }) => { await w(page, 30000) }, false)
// does recovery eventually show slide 4 / 5? report final shown separately
console.log(JSON.stringify(R, null, 1)); await browser.close(); server.close()

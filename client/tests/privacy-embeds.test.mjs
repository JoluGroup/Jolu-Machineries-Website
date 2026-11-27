// M2-PRIVACY-01: third-party embeds load nothing before the visitor interacts.
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

async function bundle(entry, name) {
  const cache = path.join(ROOT, "node_modules/.cache")
  fs.mkdirSync(cache, { recursive: true })
  const outfile = path.join(cache, `${name}.mjs`)
  await build({
    entryPoints: [path.join(ROOT, entry)], outfile, bundle: true, format: "esm", platform: "node", jsx: "automatic",
    external: ["react", "react-dom", "react-dom/server", "react-router-dom", "react/jsx-runtime"],
    alias: { "@": path.join(ROOT, "src") }, mainFields: ["module", "main"], conditions: ["module", "import"],
    loader: { ".png": "dataurl", ".jpg": "dataurl", ".jpeg": "dataurl", ".webp": "dataurl", ".svg": "dataurl", ".json": "json", ".css": "empty" },
    define: { "import.meta.env.BASE_URL": '"/"', "import.meta.env.DEV": "false", "import.meta.env.VITE_API_BASE": '""' }, logLevel: "silent",
  })
  return import(pathToFileURL(outfile).href + "?t=" + Date.now())
}

const render = (Comp, props = {}) => renderToStaticMarkup(React.createElement(MemoryRouter, null, React.createElement(Comp, props)))

/** Any attribute that makes the browser fetch (src, srcset, poster, data) pointing at a non-first-party host. */
function thirdPartyFetches(html) {
  const urls = []
  for (const m of html.matchAll(/\s(src|srcset|poster|data)="([^"]*)"/g)) {
    for (const part of m[2].split(",")) {
      const u = part.trim().split(/\s+/)[0]
      if (/^(https?:)?\/\//i.test(u)) urls.push(u)
    }
  }
  return urls
}

test("<YouTubeEmbed> renders a local placeholder: no iframe, no third-party request", async () => {
  const mod = await bundle("src/components/YouTubeEmbed.tsx", "embed-youtube")
  const html = render(mod.default, { videoId: "-jVldmfO1j8", title: "Farm Mechanization" })
  assert.ok(!/<iframe/i.test(html))
  assert.deepEqual(thirdPartyFetches(html), [])
  // The visible label may mention YouTube; what must not appear is any YouTube host (no URL, no request).
  assert.ok(!/youtube\.com|youtube-nocookie|ytimg|youtu\.be/i.test(html))
  assert.match(html, /<button[^>]*aria-label="Play video: Farm Mechanization \(loads YouTube\)"/)
  assert.equal(mod.youtubeNoCookieUrl("-jVldmfO1j8"), "https://www.youtube-nocookie.com/embed/-jVldmfO1j8")
  assert.throws(() => mod.youtubeNoCookieUrl("x\"><script>"))
})

test("<MapEmbed> renders the label and a plain link: no Google Maps iframe before interaction", async () => {
  const mod = await bundle("src/components/MapEmbed.tsx", "embed-map")
  const html = render(mod.default, { title: "Map", label: "KFA Building, Nakuru", query: "KFA Building, Nakuru", embedSrc: "https://www.google.com/maps/embed?pb=x" })
  assert.ok(!/<iframe/i.test(html))
  assert.deepEqual(thirdPartyFetches(html), [])
  assert.ok(!html.includes("maps/embed"))
  assert.match(html, /href="https:\/\/www\.google\.com\/maps\/search\/\?api=1&amp;query=KFA%20Building%2C%20Nakuru"/)
  assert.match(html, /Show map/)
})

for (const [entry, name] of [
  ["src/components/ContactSection.tsx", "ContactSection"],
  ["src/pages/KTNInterview.tsx", "KTNInterview"],
  ["src/pages/Mud4Fun.tsx", "Mud4Fun"],
]) {
  test(`${name}: initial HTML contains no iframe and no request to YouTube/Google`, async () => {
    const mod = await bundle(entry, `embed-page-${name}`)
    const html = render(mod.default)
    assert.ok(!/<iframe/i.test(html), "no iframe before interaction")
    const fetched = thirdPartyFetches(html).filter((u) => /youtube|ytimg|google|gstatic|doubleclick/i.test(u))
    assert.deepEqual(fetched, [])
    assert.ok(!/googletagmanager|google-analytics/.test(html))
  })
}

test("no remaining youtube.com/embed or img.youtube.com usage in client source", () => {
  const files = []
  const walk = (d) => { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const f = path.join(d, e.name); if (e.isDirectory()) walk(f); else if (/\.(tsx?|jsx?)$/.test(e.name)) files.push(f) } }
  walk(path.join(ROOT, "src"))
  const hits = files.filter((f) => /youtube\.com\/embed|img\.youtube\.com|i\.ytimg\.com/.test(fs.readFileSync(f, "utf8")))
  assert.deepEqual(hits.map((f) => path.relative(ROOT, f)), [])
})

#!/usr/bin/env node
// M2-SEO-01: build-time static prerender, run after `vite build` (npm run build).
//
// For every route in src/seo/routes.ts it renders the real page components (src/entry-server.tsx, bundled here with
// esbuild exactly like the existing component tests) and writes a flat HTML file with route-specific <head> and
// meaningful initial content:  "/" -> dist/index.html, "/products" -> dist/products.html,
// "/products/<slug>" -> dist/products/<slug>.html, plus dist/404.html, dist/robots.txt and (production only)
// dist/sitemap.xml. vercel.json maps clean URLs to these files and serves 404.html with status 404.
//
// Indexability is decided here, at build time:
//   indexable  <=> VERCEL_ENV === "production"  (or SEO_INDEXABLE=true for local verification)
//   VERCEL=1 without VERCEL_ENV  => the build FAILS (refuse to guess; a wrong guess could noindex production).
//
// Usage: node scripts/prerender.mjs [--out <dir>] [--template <dist/index.html>] [--env production|preview]
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath, pathToFileURL } from "node:url"
import { build } from "esbuild"

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const arg = (name, fallback) => { const i = process.argv.indexOf(`--${name}`); return i > -1 ? process.argv[i + 1] : fallback }

/** True when the build runs on Vercel, even if system environment variables are not exposed. */
export function onVercel(env = process.env, cwd = process.cwd()) {
  return env.VERCEL === "1" || Boolean(env.VERCEL_URL || env.VERCEL_GIT_COMMIT_SHA || env.NOW_BUILDER) || cwd.startsWith("/vercel/")
}

export function resolveIndexable(env = process.env, override, cwd = process.cwd()) {
  if (override === "production") return true
  if (override === "preview") return false
  if (onVercel(env, cwd)) {
    if (!env.VERCEL_ENV) {
      throw new Error("prerender: running on Vercel but VERCEL_ENV is not set. Enable 'Automatically expose System Environment Variables' in Vercel; refusing to guess indexability.")
    }
    // On Vercel only the production environment is ever indexable; SEO_INDEXABLE cannot open a preview to crawlers.
    return env.VERCEL_ENV === "production"
  }
  return env.SEO_INDEXABLE === "true"
}

/**
 * Until the client mounts, prerendered forms must not submit natively: a default GET submit would put names, emails
 * and phone numbers in the URL (logs, history, referrers). React replaces this markup on mount.
 */
export function neutraliseForms(html) {
  return html.replace(/<form(?![^>]*\sonsubmit=)/g, '<form method="post" action="#" onsubmit="return false"')
}

export async function loadRenderer(deployEnv = process.env.VERCEL_ENV ?? "") {
  const cache = path.join(ROOT, "node_modules/.cache/prerender")
  fs.mkdirSync(cache, { recursive: true })
  const outfile = path.join(cache, "entry-server.mjs")
  const env = { BASE_URL: "/", DEV: false, PROD: true, MODE: "production", SSR: true }
  for (const [k, v] of Object.entries(process.env)) if (k.startsWith("VITE_")) env[k] = v
  // M2-CLAIMS-02: the prerendered HTML must apply the same claim policy as the client bundle for this deployment.
  env.VITE_DEPLOY_ENV = deployEnv
  await build({
    entryPoints: [path.join(ROOT, "src/entry-server.tsx")], outfile, bundle: true, format: "esm", platform: "node", jsx: "automatic",
    external: ["react", "react-dom", "react-dom/server", "react-router-dom", "react/jsx-runtime"],
    // M2-SEC-ROUTER-01: react-router-dom v7 ships an "exports" map and exports StaticRouter from its main entry, so the
    // v6 "react-router-dom/server" resolver shim is no longer needed.
    alias: { "@": path.join(ROOT, "src") }, mainFields: ["module", "main"], conditions: ["module", "import"],
    loader: { ".png": "file", ".jpg": "file", ".jpeg": "file", ".webp": "file", ".svg": "file", ".json": "json", ".css": "empty" },
    define: { "import.meta.env": JSON.stringify(env) }, logLevel: "warning",
  })
  return import(pathToFileURL(outfile).href + "?t=" + Date.now())
}

const fileFor = (p) => (p === "/" ? "index.html" : `${p.slice(1)}.html`)

function inject(template, headHtml, bodyHtml) {
  const start = template.indexOf("<!-- seo:start")
  const end = template.indexOf("<!-- seo:end -->")
  if (start < 0 || end < 0) throw new Error("prerender: index.html is missing the <!-- seo:start --> / <!-- seo:end --> block")
  const lineStart = template.lastIndexOf("\n", start) + 1
  let html = template.slice(0, lineStart) + headHtml + "\n" + template.slice(end + "<!-- seo:end -->".length).replace(/^[^\S\n]*\n/, "")
  if (!html.includes('<div id="root"></div>')) throw new Error("prerender: template has no empty #root")
  const body = neutraliseForms(bodyHtml)
  return html.replace('<div id="root"></div>', () => `<div id="root">${body}</div>`)
}

export function buildSitemap(urls) {
  const body = urls.map((u) => `  <url>\n    <loc>${u}</loc>\n  </url>`).join("\n")
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`
}

export async function prerender({ outDir, templatePath, envOverride } = {}) {
  outDir = path.resolve(ROOT, outDir ?? "dist")
  // The pristine Vite template is cached before dist/index.html is overwritten with the prerendered home page, so the
  // script can run again (e.g. verify:seo renders a production variant into a temp dir).
  const cachedTemplate = path.join(ROOT, "node_modules/.cache/prerender/template.html")
  templatePath = path.resolve(ROOT, templatePath ?? path.join("dist", "index.html"))
  let template = fs.readFileSync(templatePath, "utf8")
  if (template.includes('<div id="root"></div>')) {
    fs.mkdirSync(path.dirname(cachedTemplate), { recursive: true })
    fs.writeFileSync(cachedTemplate, template)
  } else if (fs.existsSync(cachedTemplate)) {
    template = fs.readFileSync(cachedTemplate, "utf8")
  }
  const indexable = resolveIndexable(process.env, envOverride)
  const m = await loadRenderer(envOverride ?? process.env.VERCEL_ENV ?? "")
  const routes = m.allRoutes()
  const written = []

  for (const r of routes) {
    const body = await m.renderRoute(r.path)
    if (!/<h1[\s>]/.test(body)) { console.warn(`prerender: ${r.path} has no <h1>`); if (process.env.GITHUB_ACTIONS) console.log(`::warning title=prerender::${r.path} has no <h1>`) }
    if (body.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim().length < 200) throw new Error(`prerender: ${r.path} rendered too little content`)
    const head = m.renderHeadHtml(m.buildHead(r, { indexable }))
    const file = path.join(outDir, fileFor(r.path))
    fs.mkdirSync(path.dirname(file), { recursive: true })
    fs.writeFileSync(file, inject(template, head, body))
    written.push(r.path)
  }

  const nf = m.NOT_FOUND_ROUTE
  const nfBody = await m.renderRoute("/__m2-not-found__")
  fs.writeFileSync(path.join(outDir, "404.html"), inject(template, m.renderHeadHtml(m.buildHead(nf, { indexable: false }), { canonical: false }), nfBody))

  const sitemapUrl = `${m.SITE_ORIGIN}/sitemap.xml`
  fs.writeFileSync(path.join(outDir, "robots.txt"), m.buildRobotsTxt(indexable, sitemapUrl))
  const sitemapFile = path.join(outDir, "sitemap.xml")
  if (indexable) fs.writeFileSync(sitemapFile, buildSitemap(routes.filter((r) => r.indexable).map((r) => m.canonicalUrl(r.path))))
  else fs.rmSync(sitemapFile, { force: true })

  console.log(`prerender: ${written.length} routes + 404 -> ${path.relative(ROOT, outDir)} (indexable=${indexable})`)
  return { indexable, routes: written }
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  prerender({ outDir: arg("out"), templatePath: arg("template"), envOverride: arg("env") }).catch((e) => {
    console.error(e)
    if (process.env.GITHUB_ACTIONS) console.log(`::error title=prerender::${String(e && e.stack || e).slice(0, 1500).replace(/%/g, "%25").replace(/\n/g, "%0A")}`)
    process.exit(1)
  })
}

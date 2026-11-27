// M2-SEO-01: keeps <title>, description, canonical, Open Graph/Twitter and JSON-LD in step with client-side navigation.
// The prerendered HTML already carries the correct head for the first page; this only matters after SPA navigation.
// Robots directives are build-time only (see scripts/prerender.mjs) and are never changed here.
import { useEffect } from "react"
import { useLocation } from "react-router-dom"
import { buildHead } from "./head"
import { routeForPath } from "./routes"

function setMeta(key: "name" | "property", id: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${key}="${id}"]`)
  if (!el) {
    el = document.createElement("meta")
    el.setAttribute(key, id)
    document.head.appendChild(el)
  }
  el.setAttribute("content", content)
}

export default function RouteSeo() {
  const { pathname } = useLocation()
  useEffect(() => {
    const route = routeForPath(pathname)
    const head = buildHead(route, { indexable: true })
    document.title = head.title
    for (const m of head.metas) if (m.id !== "robots") setMeta(m.key, m.id, m.content)
    let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
    if (route.kind === "notfound") {
      link?.remove()
    } else {
      if (!link) {
        link = document.createElement("link")
        link.rel = "canonical"
        document.head.appendChild(link)
      }
      link.href = head.canonical
    }
    document.head.querySelectorAll('script[data-seo="jsonld"]').forEach((s) => s.remove())
    for (const j of head.jsonLd) {
      const s = document.createElement("script")
      s.type = "application/ld+json"
      s.dataset.seo = "jsonld"
      s.textContent = JSON.stringify(j)
      document.head.appendChild(s)
    }
  }, [pathname])
  return null
}

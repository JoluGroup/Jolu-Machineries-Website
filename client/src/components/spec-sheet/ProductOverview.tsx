import { useEffect, useState } from "react"
import ResponsiveImage from "@/components/ResponsiveImage"
import type { SpecSheet } from "@/data/spec-sheets/types"
import KpiRow from "./KpiRow"
import DimensionDiagram from "./DimensionDiagram"

type View = "photo" | "dimensions"

/** Page 1 content: executive overview. */
const ProductOverview = ({ sheet }: { sheet: SpecSheet }) => {
  const [view, setView] = useState<View>("photo")
  // The printed brochure always shows the product photograph on page 1.
  useEffect(() => {
    const reset = () => setView("photo")
    window.addEventListener("beforeprint", reset)
    return () => window.removeEventListener("beforeprint", reset)
  }, [])
  const caption =
    view === "photo"
      ? "PRODUCT PHOTOGRAPH · IMAGE FOR REFERENCE"
      : "ILLUSTRATIVE SCHEMATIC · NOT A MANUFACTURER DRAWING · NOT TO SCALE"
  return (
    <>
      <header className="ss-top">
        <div>
          <div className="ss-wordmark">JOLU <em>MACHINERIES</em></div>
          <div className="ss-caps ss-subbrand">Agricultural machinery · Zoomlion dealer</div>
        </div>
        <div className="ss-modeltag">
          <div className="ss-caps" style={{ color: "var(--ss-highlight)" }}>MODEL</div>
          <strong className="ss-mono">{sheet.modelDesignation}</strong>
          <div className="ss-variants">
            {sheet.variants.map((v) => (
              <span className="ss-chip" key={v.id}>{v.label.toUpperCase()}</span>
            ))}
          </div>
        </div>
      </header>
      <div className="ss-eyebrow ss-caps">{sheet.category} · product specification</div>
      <h1>{sheet.productName}</h1>
      <p className="ss-lede">{sheet.lede}</p>
      <div className="ss-hero">
        <div className="ss-viewport">
          <div className="ss-viewport-head">
            <span className="ss-caps">{view === "photo" ? "PRODUCT VIEW" : "DIMENSION VIEW"}</span>
            <span className="ss-mono">{view === "photo" ? "VIEW 01 / PHOTO" : "VIEW 02 / DIMENSIONS"}</span>
          </div>
          {view === "photo" ? (
            <div className="ss-stage-img">
              <ResponsiveImage
                src={sheet.image}
                alt={sheet.imageAlt}
                sizes="(min-width: 900px) 420px, 90vw"
                priority
              />
            </div>
          ) : (
            <div className="ss-stage-diagram">
              <DimensionDiagram d={sheet.dimensions} />
            </div>
          )}
          <div className="ss-view-caption ss-mono">{caption}</div>
          <div className="ss-view-tabs" role="group" aria-label="Machine views">
            <button type="button" aria-pressed={view === "photo"} onClick={() => setView("photo")}>PHOTO</button>
            <button type="button" aria-pressed={view === "dimensions"} onClick={() => setView("dimensions")}>DIMENSIONS</button>
          </div>
        </div>
        <KpiRow kpis={sheet.kpis} />
      </div>
      <div className="ss-section-title">
        <h2>Published capabilities</h2>
        <span className="ss-mono">SPECIFICATION-DERIVED / 03 AREAS</span>
      </div>
      <div className="ss-caps-grid">
        {sheet.capabilities.map((c) => (
          <div className="ss-capability" key={c.id}>
            <div className="num">{c.tag}</div>
            <h3>{c.title}</h3>
            <p>{c.text}</p>
          </div>
        ))}
      </div>
      <footer className="ss-dark-foot">
        <span>Specifications as published by JOLU Machineries; confirm before purchase. Illustrations are not manufacturer drawings.</span>
        <strong className="ss-mono">JOLU / 01—02</strong>
      </footer>
    </>
  )
}

export default ProductOverview

import { useEffect, useLayoutEffect, useRef, useState } from "react"
import { Link, useParams } from "react-router-dom"
import { getSpecSheet } from "@/data/spec-sheets"
import A4Page from "@/components/spec-sheet/A4Page"
import ProductOverview from "@/components/spec-sheet/ProductOverview"
import DimensionDiagram from "@/components/spec-sheet/DimensionDiagram"
import SpecTable from "@/components/spec-sheet/SpecTable"
import ConfigurationList from "@/components/spec-sheet/ConfigurationList"
import ProcurementBlock from "@/components/spec-sheet/ProcurementBlock"
import { STATUS_MARK, entryFor, entryText, fmtInt, rowById } from "@/components/spec-sheet/format"
import NotFound from "@/pages/NotFound"
import "@/styles/spec-sheet-print.css"

const A4_WIDTH_PX = 793.7 // 210 mm at 96 dpi

/** Scales the fixed A4 sheets down to fit narrow screens (screen only; print is always 1:1). */
function useFitScale() {
  const ref = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const update = () => setScale(Math.min(1, Math.max(0.3, (el.clientWidth - 24) / A4_WIDTH_PX)))
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  return { ref, scale }
}

const SpecSheetPage = () => {
  const { slug } = useParams<{ slug: string }>()
  const sheet = getSpecSheet(slug)
  const { ref, scale } = useFitScale()

  // Pilot: keep out of search results until the owner approves publication.
  useEffect(() => {
    if (!sheet) return
    const meta = document.createElement("meta")
    meta.name = "robots"
    meta.content = "noindex,nofollow"
    document.head.appendChild(meta)
    const prevTitle = document.title
    document.title = `${sheet.productName} | Specification sheet | JOLU Machineries`
    return () => {
      meta.remove()
      document.title = prevTitle
    }
  }, [sheet])

  if (!sheet) return <NotFound />

  const dims = rowById(sheet, "dimensions")!
  const mass = rowById(sheet, "mass")!
  const [va, vb] = sheet.variants
  const massA = entryFor(mass.entries, va.id)!
  const massB = entryFor(mass.entries, vb.id)!

  return (
    <div className="ss-root" ref={ref} style={{ ["--ss-scale" as string]: scale }}>
      {/* A4 page rule exists only while this sheet is mounted, so printing other pages is unaffected. */}
      <style>{"@page { size: A4 portrait; margin: 0; }"}</style>
      <div className="ss-toolbar ss-noprint">
        <div className="ss-toolbar-inner">
          <span className="ss-toolbar-title">{sheet.productName} · Specification sheet</span>
          <div className="ss-toolbar-actions">
            <Link className="ss-btn ss-btn-ghost" to={`/products/${sheet.slug}`}>Product page</Link>
            <button type="button" className="ss-btn ss-btn-primary" onClick={() => window.print()}>
              Print / Save as PDF
            </button>
          </div>
        </div>
        {sheet.reviewState !== "approved" && (
          <div className="ss-pilot" role="note">
            Pilot preview. This sheet is pending owner approval. In the print dialog, enable "Background graphics" for full colour.
          </div>
        )}
      </div>

      <main className="ss-pages">
        <A4Page tone="dark" label="Page 1 executive overview" index="01 / 02">
          <ProductOverview sheet={sheet} />
        </A4Page>

        <A4Page tone="light" label="Page 2 technical specification" index="02 / 02">
          <header className="ss-light-top">
            <div>
              <div className="ss-wordmark">JOLU MACHINERIES</div>
              <h2 className="ss-title">{sheet.modelDesignation} / Technical data</h2>
              <div className="ss-sub">{sheet.productName} · values shown per published variant</div>
            </div>
            <div className="ss-revision ss-mono">
              <div><strong>DOC</strong> {sheet.doc.code}</div>
              <div><strong>REV</strong> {sheet.doc.revision}</div>
              <div><strong>ISSUED</strong> {sheet.doc.issued}</div>
            </div>
          </header>
          <div className="ss-quick">
            <div><span className="ss-caps">OVERALL L × W × H</span><b>{entryText(entryFor(dims.entries, va.id)!)}</b></div>
            <div><span className="ss-caps">MASS · {va.short}</span><b>{fmtInt(Number(massA.value))} {massA.unit}</b></div>
            <div><span className="ss-caps">MASS · {vb.short}</span><b>{fmtInt(Number(massB.value))} {massB.unit}</b></div>
            <div><span className="ss-caps">POWER RANGE</span><b>130–160 hp</b></div>
          </div>
          <div className="ss-diagram-title">
            <h3>Dimension schematic</h3>
            <span className="ss-mono">ILLUSTRATIVE · NOT TO SCALE</span>
          </div>
          <div className="ss-footprint">
            <DimensionDiagram d={sheet.dimensions} />
          </div>
          <div className="ss-diagram-note">
            Illustration drawn from the published overall dimensions only. It is not a manufacturer drawing, does not show the machine outline
            or axle positions, and is not suitable for installation planning.
          </div>
          <h3 className="ss-spec-title">
            Technical specification
            <small>
              {STATUS_MARK.corroborated.mark} corroborated by a second JOLU document · {STATUS_MARK["website-published"].mark} published on the JOLU website
            </small>
          </h3>
          <SpecTable sheet={sheet} />
          <ConfigurationList sheet={sheet} />
          <ProcurementBlock sheet={sheet} />
        </A4Page>
      </main>
    </div>
  )
}

export default SpecSheetPage

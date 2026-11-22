import { useEffect, useLayoutEffect, useRef, useState } from "react"
import { Link, useParams } from "react-router-dom"
import { getSpecSheet } from "@/data/spec-sheets"
import A4Page from "@/components/spec-sheet/A4Page"
import ProductOverview from "@/components/spec-sheet/ProductOverview"
import DimensionDiagram from "@/components/spec-sheet/DimensionDiagram"
import SpecTable from "@/components/spec-sheet/SpecTable"
import ConfigurationList from "@/components/spec-sheet/ConfigurationList"
import ProcurementBlock from "@/components/spec-sheet/ProcurementBlock"
import { STATUS_MARK, columnsStatement } from "@/components/spec-sheet/format"
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

  const stmt = columnsStatement(sheet)
  // Long tables (>= 17 rows) get tighter spacing, never smaller type.
  const rowCount = sheet.groups.reduce((n, g) => n + g.rows.length, 0)
  const dense = rowCount >= 17
  // Legend lists only the evidence statuses actually used on this sheet.
  const used = new Set(sheet.groups.flatMap((g) => g.rows.flatMap((r) => r.entries.map((e) => e.status))))
  const legend = (["corroborated", "website-published", "manufacturer-verified"] as const).filter((s) => used.has(s))

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
            Preview. This sheet is pending owner approval and is not for public circulation. In the print dialog, enable "Background graphics" for full colour.
          </div>
        )}
      </div>

      <main className="ss-pages">
        <A4Page tone="dark" label="Page 1 executive overview" index="01 / 02">
          <ProductOverview sheet={sheet} />
        </A4Page>

        <A4Page tone="light" label="Page 2 technical specification" index="02 / 02" className={dense ? "ss-dense" : undefined}>
          <header className="ss-light-top">
            <div>
              <div className="ss-wordmark">JOLU MACHINERIES</div>
              <h2 className="ss-title">{sheet.modelDesignation} / Technical data</h2>
              <div className="ss-sub">{sheet.productName} · {stmt.sub}</div>
            </div>
            <div className="ss-revision ss-mono">
              <div><strong>DOC</strong> {sheet.doc.code}</div>
              <div><strong>REV</strong> {sheet.doc.revision}</div>
              <div><strong>ISSUED</strong> {sheet.doc.issued}</div>
            </div>
          </header>
          <div className="ss-quick">
            {sheet.quick.map((q) => (
              <div key={q.label}><span className="ss-caps">{q.label}</span><b>{q.value}</b></div>
            ))}
          </div>
          <div className="ss-diagram-title">
            <h3>Dimension schematic</h3>
            <span className="ss-mono">ILLUSTRATIVE · NOT TO SCALE</span>
          </div>
          <div className="ss-footprint">
            <DimensionDiagram d={sheet.dimensions} columns={sheet.variants} />
          </div>
          <div className="ss-diagram-note">
            Illustrative diagram — not to scale. Confirm installation dimensions before purchase. Drawn from the published overall dimensions
            only; it is not a manufacturer drawing and does not show the machine outline or axle positions.
          </div>
          <h3 className="ss-spec-title">
            Technical specification
            <small>
              {legend.map((s, i) => (
                <span key={s}>
                  {i > 0 && " · "}
                  {STATUS_MARK[s].mark} {STATUS_MARK[s].legend}
                </span>
              ))}
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

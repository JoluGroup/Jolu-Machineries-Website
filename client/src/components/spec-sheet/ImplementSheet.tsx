import ResponsiveImage from "@/components/ResponsiveImage"
import type { SpecSheet } from "@/data/spec-sheets/types"
import A4Page from "./A4Page"
import KpiRow from "./KpiRow"
import SpecTable from "./SpecTable"
import ProcurementBlock from "./ProcurementBlock"
import { STATUS_MARK } from "./format"

interface ImplementSheetProps {
  sheet: SpecSheet
  /** Evidence statuses actually used on this sheet (legend). */
  legend: readonly ("corroborated" | "website-published" | "manufacturer-verified")[]
}

/**
 * One-page A4 layout for agricultural implements (M3-A7A). Reuses the shared KPI row, specification table, image fitting
 * and procurement block of the two-page sheets; only the page composition is new. It never shows the dimension
 * schematic, capacity panel, capability cards or configuration list, because implements publish too little for them.
 */
const ImplementSheet = ({ sheet, legend }: ImplementSheetProps) => (
  <A4Page tone="light" label="Implement specification sheet" index="01 / 01" className="ss-implement">
    <header className="ss-imp-head">
      <div>
        <div className="ss-wordmark">JOLU <em>MACHINERIES</em></div>
        <div className="ss-caps ss-subbrand">Agricultural machinery · Zoomlion dealer</div>
        <div className="ss-eyebrow ss-caps">{sheet.category}</div>
        <h1>{sheet.productName}</h1>
      </div>
      {sheet.catalogueDesignation && (
        <div className="ss-modeltag">
          <div className="ss-caps" style={{ color: "var(--ss-highlight)" }}>JOLU CATALOGUE DESIGNATION</div>
          <strong className="ss-mono">{sheet.catalogueDesignation.value}</strong>
          <div className="ss-modelnote">Caption only · the catalogue lists no technical values</div>
        </div>
      )}
    </header>

    <p className="ss-imp-lede">{sheet.lede}</p>

    <div className="ss-imp-hero">
      <div className="ss-imp-photo">
        <div className="ss-imp-photo-head ss-caps">Product photograph</div>
        <div className="ss-stage-img" style={{ ["--ss-img-scale" as string]: sheet.imageFit.scale }}>
          <ResponsiveImage src={sheet.image} alt={sheet.imageAlt} sizes="(min-width: 900px) 520px, 90vw" priority />
        </div>
        <div className="ss-view-caption ss-mono">IMAGE FOR REFERENCE</div>
      </div>
      <div className="ss-imp-kpis">
        <KpiRow kpis={sheet.kpis} />
      </div>
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

    {sheet.notPublished && sheet.notPublished.length > 0 && (
      <div className="ss-imp-notpub">
        <strong>Not published for this implement:</strong> {sheet.notPublished.map((n) => n.label.toLowerCase()).join(" · ")}. Ask JOLU Machineries.
      </div>
    )}
    {sheet.sourceStatement && <div className="ss-imp-source">{sheet.sourceStatement}</div>}

    <ProcurementBlock sheet={sheet} />
  </A4Page>
)

export default ImplementSheet

import type { CapacityPanel as CapacityData } from "@/data/spec-sheets/types"

/**
 * Capacity-oriented engineering panel for machines whose overall dimensions are not published.
 * Shows only supported published values; draws no dimension arrows and no outline.
 */
const CapacityPanel = ({ panel }: { panel: CapacityData }) => {
  const cols = panel.items.length > 4 ? 3 : panel.items.length
  return (
    <div className="ss-capacity-grid" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }} role="group" aria-label={panel.title}>
      {panel.items.map((it) => (
        <div className="ss-capacity-cell" key={it.label}>
          <span className="ss-caps">{it.label}</span>
          <b className="ss-mono">
            {it.value}
            {it.unit && <small> {it.unit}</small>}
          </b>
        </div>
      ))}
    </div>
  )
}

export default CapacityPanel

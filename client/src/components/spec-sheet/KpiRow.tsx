import type { KpiItem } from "@/data/spec-sheets/types"

const KpiRow = ({ kpis }: { kpis: KpiItem[] }) => (
  <div className="ss-kpis">
    {kpis.map((k) => (
      <div className="ss-kpi" key={k.id}>
        <div className="ss-kpi-label">{k.label}</div>
        <div className="ss-kpi-number">
          {k.value}
          <span>{k.unit}</span>
        </div>
        <div className="ss-kpi-foot">{k.foot}</div>
      </div>
    ))}
  </div>
)

export default KpiRow

import type { SpecSheet } from "@/data/spec-sheets/types"

const ConfigurationList = ({ sheet }: { sheet: SpecSheet }) => (
  <div className="ss-config">
    <div className="ss-config-col">
      <h3>Standard equipment (as published)</h3>
      <ul>
        {sheet.standardEquipment.map((s) => (
          <li key={s.rowId}>{s.label}</li>
        ))}
      </ul>
    </div>
    <div className="ss-config-col">
      <h3>Optional configurations</h3>
      <p>{sheet.optionalConfigurationNote}</p>
    </div>
  </div>
)

export default ConfigurationList

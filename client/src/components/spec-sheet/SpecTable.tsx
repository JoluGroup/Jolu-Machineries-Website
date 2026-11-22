import type { SpecSheet } from "@/data/spec-sheets/types"
import { STATUS_MARK, entryFor, entryText } from "./format"

const SpecTable = ({ sheet }: { sheet: SpecSheet }) => {
  const [a, b] = sheet.variants
  return (
    <table className="ss-table">
      <thead>
        <tr>
          <th scope="col">PARAMETER</th>
          <th scope="col">{a.title}<small>Published as “{a.label}”</small></th>
          <th scope="col">{b.title}<small>Published as “{b.label}”</small></th>
        </tr>
      </thead>
      {sheet.groups.map((g) => (
        <tbody key={g.id}>
          <tr className="group">
            <th colSpan={3} scope="colgroup">{g.title}</th>
          </tr>
          {g.rows.map((r) => {
            const ea = entryFor(r.entries, a.id)
            const eb = entryFor(r.entries, b.id)
            const same = ea && eb && entryText(ea) === entryText(eb)
            const cell = (e: typeof ea, span?: number) =>
              e ? (
                <td className="v" colSpan={span} title={STATUS_MARK[e.status].label}>
                  {entryText(e)}
                  <span className="ss-mark" aria-label={STATUS_MARK[e.status].label}>{STATUS_MARK[e.status].mark}</span>
                </td>
              ) : (
                <td className="v" colSpan={span}>Not published</td>
              )
            return (
              <tr key={r.id}>
                <td className="k">{r.label}</td>
                {same ? cell(ea, 2) : (<>{cell(ea)}{cell(eb)}</>)}
              </tr>
            )
          })}
        </tbody>
      ))}
    </table>
  )
}

export default SpecTable

import type { SpecSheet } from "@/data/spec-sheets/types"
import { STATUS_MARK, columnNote, entryFor, entryText } from "./format"

/** Parameter / value table. One column for a single machine, two for distinct models or published configurations. */
const SpecTable = ({ sheet }: { sheet: SpecSheet }) => {
  const cols = sheet.variants
  const span = cols.length + 1
  return (
    <table className={`ss-table ss-cols-${cols.length}`}>
      <thead>
        <tr>
          <th scope="col">PARAMETER</th>
          {cols.map((c) => (
            <th scope="col" key={c.id}>
              {c.title}
              <small>{columnNote(c)}</small>
            </th>
          ))}
        </tr>
      </thead>
      {sheet.groups.map((g) => (
        <tbody key={g.id}>
          <tr className="group">
            <th colSpan={span} scope="colgroup">{g.title}</th>
          </tr>
          {g.rows.map((r) => {
            const es = cols.map((c) => entryFor(r.entries, c.id))
            const first = es[0]
            const same = es.length > 1 && es.every((e) => e && first && entryText(e) === entryText(first) && e.status === first.status)
            const cell = (e: (typeof es)[number], colSpan?: number, key?: string) =>
              e ? (
                <td className="v" colSpan={colSpan} key={key} title={STATUS_MARK[e.status].label}>
                  {entryText(e)}
                  <span className="ss-mark" aria-label={STATUS_MARK[e.status].label}>{STATUS_MARK[e.status].mark}</span>
                </td>
              ) : (
                <td className="v" colSpan={colSpan} key={key}>Not published</td>
              )
            return (
              <tr key={r.id}>
                <td className="k">{r.label}</td>
                {same ? cell(first, cols.length) : es.map((e, i) => cell(e, undefined, cols[i].id))}
              </tr>
            )
          })}
        </tbody>
      ))}
    </table>
  )
}

export default SpecTable

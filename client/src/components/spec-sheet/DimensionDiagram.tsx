import type { DimensionData, VariantInfo } from "@/data/spec-sheets/types"
import { fmtInt } from "./format"

/**
 * Illustrative dimension schematic drawn ONLY from the supported overall dimensions, wheelbase and
 * ground clearance. It is not a manufacturer drawing and does not show the machine's real outline,
 * axle positions or internals. Not to scale; not suitable for installation planning.
 *
 * One envelope is drawn for a single machine / shared series dimensions. Two envelopes are drawn
 * (distinct line styles, from a common origin, for comparison only) when the sources attribute
 * different dimensions to two distinct models. Equal figures are dimensioned once.
 */
const allEqual = (v: number[]) => v.every((x) => x === v[0])

const DimensionDiagram = ({ d, columns }: { d: DimensionData; columns: VariantInfo[] }) => {
  const env = d.envelopes
  const two = env.length > 1
  const Lmax = Math.max(...env.map((e) => e.lengthMm))
  const Hmax = Math.max(...env.map((e) => e.heightMm))
  const Wmax = Math.max(...env.map((e) => e.widthMm))
  const sideScale = Math.min((two ? 250 : 280) / Lmax, (two ? 150 : 175) / Hmax)
  const planScale = Math.min((two ? 225 : 250) / Lmax, 120 / Wmax)
  const sx = two ? 56 : 36
  const ground = two ? 190 : 196
  const px = two ? 350 : 372
  const py = 40
  const vbH = two ? 244 : 232
  const fs = two ? 11 : 12

  const line = { stroke: "currentColor", strokeWidth: 1, fill: "none" } as const
  const text = { fontFamily: "var(--ss-mono)", fontSize: fs, fill: "currentColor" } as const
  const accent = { stroke: "hsl(var(--accent))", strokeWidth: 2, fill: "none" } as const
  const dash = (k: number) => (k === 0 ? "6 4" : "2 3")
  const outline = (k: number) => ({ stroke: "currentColor", strokeWidth: 1.5, strokeDasharray: dash(k) }) as const

  const sw = (k: number) => env[k].lengthMm * sideScale
  const sh = (k: number) => env[k].heightMm * sideScale
  const pw = (k: number) => env[k].lengthMm * planScale
  const ph = (k: number) => env[k].widthMm * planScale
  const swMax = Lmax * sideScale
  const pwMax = Lmax * planScale
  const phMax = Wmax * planScale

  // dimension rows: one row when every envelope agrees, otherwise one row per envelope
  const rows = (pick: (e: (typeof env)[number]) => number) => {
    const vals = env.map(pick)
    return allEqual(vals)
      ? [{ k: 0, value: vals[0], who: two ? " (both)" : "" }]
      : vals.map((value, k) => ({ k, value, who: ` (${env[k].label})` }))
  }
  const lenRows = rows((e) => e.lengthMm)
  const hgtRows = rows((e) => e.heightMm)
  const widRows = rows((e) => e.widthMm)
  const wbEqual = allEqual(env.map((e) => e.wheelbaseMm))
  const wbItems = wbEqual ? [0] : env.map((_, k) => k)

  // Ground clearance is optional: a sheet that withholds a disputed clearance draws no clearance bracket.
  const gcValues = columns.map((c) => d.groundClearanceMm[c.id])
  const hasGc = gcValues.every((v) => typeof v === "number")
  const gcEqual = hasGc && allEqual(gcValues as number[])
  const gcFirst = (gcValues[0] ?? 0) as number

  return (
    <svg viewBox={`0 0 660 ${vbH}`} role="img" aria-label="Illustrative dimension schematic of overall length, width, height, wheelbase and ground clearance">
      <defs>
        <pattern id="ss-hatch" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <path d="M0 0v8" stroke="hsl(var(--primary-glow))" strokeWidth="2" opacity="0.5" />
        </pattern>
      </defs>
      <text x={sx} y="14" {...text} fontWeight="700">SIDE ELEVATION (L × H)</text>
      <text x={px} y="14" {...text} fontWeight="700">PLAN (L × W)</text>
      {two && (
        <g {...text}>
          <path d={`M${px + 96} 10H${px + 124}`} stroke="currentColor" strokeWidth="1.5" strokeDasharray={dash(0)} />
          <text x={px + 130} y="14">{env[0].label}</text>
          <path d={`M${px + 200} 10H${px + 228}`} stroke="currentColor" strokeWidth="1.5" strokeDasharray={dash(1)} />
          <text x={px + 234} y="14">{env[1].label}</text>
        </g>
      )}

      {/* side elevation: overall envelope(s), common origin */}
      {env.map((_, k) => (
        <rect key={`se${k}`} x={sx} y={ground - sh(k)} width={sw(k)} height={sh(k)} fill={k === 0 ? "url(#ss-hatch)" : "none"} {...outline(k)} />
      ))}
      {!two && (
        <text x={sx + sw(0) / 2} y={ground - sh(0) + 14} textAnchor="middle" {...text} fontSize={11}>OVERALL ENVELOPE</text>
      )}
      <path d={`M${sx - 12} ${ground}H${sx + swMax + 12}`} {...line} strokeWidth={1.5} />

      {/* wheelbase: length only; its position inside the envelope is not specified by the sources */}
      {wbItems.map((k, i) => {
        const wb = env[k].wheelbaseMm * sideScale
        const mid = sx + sw(k) / 2
        const y = ground - 34 - i * 24
        const label = wbEqual ? `Wheelbase ${fmtInt(env[k].wheelbaseMm)} mm${two ? " (both)" : ""}` : `${env[k].label} wheelbase ${fmtInt(env[k].wheelbaseMm)} mm`
        return (
          <g key={`wb${k}`}>
            <path d={`M${mid - wb / 2} ${y}H${mid + wb / 2}`} {...accent} />
            <circle cx={mid - wb / 2} cy={y} r="4" fill="hsl(var(--accent))" />
            <circle cx={mid + wb / 2} cy={y} r="4" fill="hsl(var(--accent))" />
            <text x={mid} y={y - 6} textAnchor="middle" {...text}>{label}</text>
          </g>
        )
      })}

      {/* ground clearance bracket (first column's value; all values are listed in the note) */}
      {hasGc && (
        <>
          <path d={`M${sx + swMax + 10} ${ground}V${ground - gcFirst * sideScale}M${sx + swMax + 6} ${ground - gcFirst * sideScale}h8`} {...accent} />
          <text x={sx + swMax + 18} y={ground - (gcFirst * sideScale) / 2 + 3} {...text} fontSize={11}>GC</text>
        </>
      )}

      {/* length */}
      {lenRows.map((r, i) => {
        const y = ground + 16 + i * 22
        return (
          <g key={`l${i}`}>
            <path d={`M${sx} ${y}H${sx + sw(r.k)}M${sx} ${y - 6}v12M${sx + sw(r.k)} ${y - 6}v12`} {...line} />
            <text x={sx + sw(r.k) / 2} y={y + 14} textAnchor="middle" {...text}>L = {fmtInt(r.value)} mm{r.who}</text>
          </g>
        )
      })}
      {/* height */}
      {hgtRows.map((r, i) => {
        const x = sx - 14 - i * 24
        return (
          <g key={`h${i}`}>
            <path d={`M${x} ${ground - sh(r.k)}V${ground}M${x - 6} ${ground - sh(r.k)}h12M${x - 6} ${ground}h12`} {...line} />
            <text transform={`translate(${x - 6} ${ground - sh(r.k) / 2}) rotate(-90)`} textAnchor="middle" {...text}>H = {fmtInt(r.value)} mm{r.who}</text>
          </g>
        )
      })}

      {/* plan */}
      {env.map((_, k) => (
        <rect key={`pl${k}`} x={px} y={py} width={pw(k)} height={ph(k)} fill={k === 0 ? "url(#ss-hatch)" : "none"} {...outline(k)} />
      ))}
      {!two && (
        <text x={px + pw(0) / 2} y={py + ph(0) / 2 + 3} textAnchor="middle" {...text} fontSize={11}>OVERALL ENVELOPE</text>
      )}
      {lenRows.map((r, i) => {
        const y = py + phMax + 16 + i * 22
        return (
          <g key={`pl${i}`}>
            <path d={`M${px} ${y}H${px + pw(r.k)}M${px} ${y - 6}v12M${px + pw(r.k)} ${y - 6}v12`} {...line} />
            <text x={px + pw(r.k) / 2} y={y + 14} textAnchor="middle" {...text}>L = {fmtInt(r.value)} mm{r.who}</text>
          </g>
        )
      })}
      {widRows.map((r, i) => {
        const x = px + pwMax + 14 + i * 26
        return (
          <g key={`w${i}`}>
            <path d={`M${x} ${py}V${py + ph(r.k)}M${x - 6} ${py}h12M${x - 6} ${py + ph(r.k)}h12`} {...line} />
            <text transform={`translate(${x + 16} ${py + ph(r.k) / 2}) rotate(-90)`} textAnchor="middle" {...text}>W = {fmtInt(r.value)} mm{r.who}</text>
          </g>
        )
      })}

      {/* ground clearance note */}
      {!hasGc ? null : gcEqual ? (
        <text x={px} y={vbH - 20} {...text} fontSize={11}>GC = ground clearance: {fmtInt(gcFirst)} mm</text>
      ) : (
        <>
          <text x={px} y={vbH - 32} {...text} fontSize={11}>GC = ground clearance:</text>
          <text x={px} y={vbH - 20} {...text} fontSize={11}>
            {columns.map((c, i) => `${c.short} ${fmtInt(gcValues[i])} mm`).join(" · ")}
          </text>
        </>
      )}
    </svg>
  )
}

export default DimensionDiagram

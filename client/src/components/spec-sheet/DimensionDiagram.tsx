import type { DimensionData } from "@/data/spec-sheets/types"
import { fmtInt } from "./format"

/**
 * Illustrative dimension schematic drawn ONLY from the supported overall dimensions, wheelbase and
 * ground clearance. It is not a manufacturer drawing and does not show the machine's real outline,
 * axle positions or internals. Not suitable for installation planning.
 */
const DimensionDiagram = ({ d }: { d: DimensionData }) => {
  const sideScale = 280 / d.lengthMm
  const planScale = 250 / d.lengthMm
  const sx = 36
  const ground = 196
  const sw = d.lengthMm * sideScale
  const sh = d.heightMm * sideScale
  const px = 372
  const py = 40
  const pw = d.lengthMm * planScale
  const ph = d.widthMm * planScale
  const wb = d.wheelbaseMm * sideScale
  const gc = d.groundClearanceMm.standard * sideScale
  const line = { stroke: "currentColor", strokeWidth: 1, fill: "none" } as const
  const text = { fontFamily: "var(--ss-mono)", fontSize: 12, fill: "currentColor" } as const
  const accent = { stroke: "hsl(var(--accent))", strokeWidth: 2, fill: "none" } as const
  const mid = sx + sw / 2

  return (
    <svg viewBox="0 0 660 232" role="img" aria-label="Illustrative dimension schematic of overall length, width, height, wheelbase and ground clearance">
      <defs>
        <pattern id="ss-hatch" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <path d="M0 0v8" stroke="hsl(var(--primary-glow))" strokeWidth="2" opacity="0.5" />
        </pattern>
      </defs>
      <text x={sx} y="14" {...text} fontWeight="700">SIDE ELEVATION (L × H)</text>
      <text x={px} y="14" {...text} fontWeight="700">PLAN (L × W)</text>

      {/* side elevation: overall envelope */}
      <rect x={sx} y={ground - sh} width={sw} height={sh} fill="url(#ss-hatch)" {...{ stroke: "currentColor", strokeWidth: 1.5, strokeDasharray: "6 4" }} />
      <text x={mid} y={ground - sh + 14} textAnchor="middle" {...text} fontSize={11}>OVERALL ENVELOPE</text>
      <path d={`M${sx - 12} ${ground}H${sx + sw + 12}`} {...line} strokeWidth={1.5} />
      {/* wheelbase: length only; position inside the envelope is not specified by the sources */}
      <path d={`M${mid - wb / 2} ${ground - 34}H${mid + wb / 2}`} {...accent} />
      <circle cx={mid - wb / 2} cy={ground - 34} r="4" fill="hsl(var(--accent))" />
      <circle cx={mid + wb / 2} cy={ground - 34} r="4" fill="hsl(var(--accent))" />
      <text x={mid} y={ground - 40} textAnchor="middle" {...text}>Wheelbase {fmtInt(d.wheelbaseMm)} mm</text>
      {/* ground clearance (standard) */}
      <path d={`M${sx + sw + 10} ${ground}V${ground - gc}M${sx + sw + 6} ${ground - gc}h8`} {...accent} />
      <text x={sx + sw + 18} y={ground - gc / 2 + 3} {...text} fontSize={11}>GC</text>
      {/* length */}
      <path d={`M${sx} ${ground + 16}H${sx + sw}M${sx} ${ground + 10}v12M${sx + sw} ${ground + 10}v12`} {...line} />
      <text x={mid} y={ground + 30} textAnchor="middle" {...text}>L = {fmtInt(d.lengthMm)} mm</text>
      {/* height */}
      <path d={`M${sx - 14} ${ground - sh}V${ground}M${sx - 20} ${ground - sh}h12M${sx - 20} ${ground}h12`} {...line} />
      <text transform={`translate(${sx - 20} ${ground - sh / 2}) rotate(-90)`} textAnchor="middle" {...text}>H = {fmtInt(d.heightMm)} mm</text>

      {/* plan */}
      <rect x={px} y={py} width={pw} height={ph} fill="url(#ss-hatch)" {...{ stroke: "currentColor", strokeWidth: 1.5, strokeDasharray: "6 4" }} />
      <text x={px + pw / 2} y={py + ph / 2 + 3} textAnchor="middle" {...text} fontSize={11}>OVERALL ENVELOPE</text>
      <path d={`M${px} ${py + ph + 16}H${px + pw}M${px} ${py + ph + 10}v12M${px + pw} ${py + ph + 10}v12`} {...line} />
      <text x={px + pw / 2} y={py + ph + 30} textAnchor="middle" {...text}>L = {fmtInt(d.lengthMm)} mm</text>
      <path d={`M${px + pw + 14} ${py}V${py + ph}M${px + pw + 8} ${py}h12M${px + pw + 8} ${py + ph}h12`} {...line} />
      <text transform={`translate(${px + pw + 30} ${py + ph / 2}) rotate(-90)`} textAnchor="middle" {...text}>W = {fmtInt(d.widthMm)} mm</text>

      <text x={px} y="200" {...text} fontSize={11}>GC = ground clearance: {d.groundClearanceMm.standard} mm</text>
      <text x={px} y="212" {...text} fontSize={11}>(standard); {d.groundClearanceMm.new2025} mm (2025 New)</text>
    </svg>
  )
}

export default DimensionDiagram

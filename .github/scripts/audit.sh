#!/usr/bin/env bash
# Production-dependency audit from the lockfile. Prints every advisory as an annotation (package, severity, range)
# so results are readable without log access. Exit 1 only when a high or critical advisory affects production deps.
set -uo pipefail
pkg="$1"
npm audit --omit=dev --json > audit.json 2> audit.err
node - "$pkg" <<'JS'
const fs = require("fs"); const pkg = process.argv[2]
// Registry/advisory text is third-party data: escape it before it becomes a workflow command.
const esc = (t) => String(t).replace(/%/g, "%25").replace(/\r/g, "%0D").replace(/\n/g, "%0A").replace(/::/g, ": :")
const summary = (row) => fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY || "/dev/null", row)
let j; try { j = JSON.parse(fs.readFileSync("audit.json", "utf8")) } catch (e) {
  console.log(`::error title=${pkg} audit::NOT EXECUTED - could not parse npm audit output: ${esc(fs.readFileSync("audit.err","utf8").slice(0,300))}`)
  summary(`| ${pkg} audit | NOT EXECUTED (audit error) |\n`); process.exit(1) }
if (j.error) {
  console.log(`::error title=${pkg} audit::NOT EXECUTED - ${esc(j.error.code)} ${esc(j.error.summary)}`)
  summary(`| ${pkg} audit | NOT EXECUTED (audit error: ${String(j.error.code).replace(/[|\n]/g, " ")}) |\n`); process.exit(1) }
const m = (j.metadata && j.metadata.vulnerabilities) || {}
const vulns = Object.values(j.vulnerabilities || {})
for (const v of vulns) {
  const via = (v.via || []).map((x) => typeof x === "string" ? x : `${x.title || ""} ${x.url || ""}`.trim()).join("; ").slice(0, 300)
  const level = ["high", "critical"].includes(v.severity) ? "error" : "warning"
  console.log(`::${level} title=${pkg} audit ${esc(v.severity)}::${esc(v.name)} ${esc(v.range)} direct=${v.isDirect} fix=${esc(typeof v.fixAvailable === "object" ? JSON.stringify(v.fixAvailable) : v.fixAvailable)} via: ${esc(via)}`)
}
const blocking = (m.high || 0) + (m.critical || 0)
const line = `low=${m.low||0} moderate=${m.moderate||0} high=${m.high||0} critical=${m.critical||0}`
console.log(`::notice title=${pkg} audit::${blocking ? "FAILED" : "PASSED"} ${line}`)
summary(`| ${pkg} audit (prod deps) | ${blocking ? "FAILED" : "PASSED"}: ${line} |\n`)
process.exit(blocking ? 1 : 0)
JS

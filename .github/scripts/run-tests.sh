#!/usr/bin/env bash
# Runs `npm test` for one package and reports exact counts. A package without a test script is reported as
# NOT EXECUTED (never as passed). Counts are parsed from node:test's own summary lines (TAP "# pass N" or spec "ℹ pass N").
set -uo pipefail
pkg="$1"
summary="${GITHUB_STEP_SUMMARY:-/dev/null}"
out="${GITHUB_OUTPUT:-/dev/null}"

if ! node -e "process.exit(require('./package.json').scripts && require('./package.json').scripts.test ? 0 : 1)"; then
  echo "| ${pkg} tests | NOT EXECUTED (no test script on this commit) |" >> "$summary"
  echo "::warning title=${pkg} tests::NOT EXECUTED - package.json has no test script on this commit"
  echo "verdict=NOT_EXECUTED" >> "$out"
  exit 0
fi

export PKG="$pkg"
# The parsers below read node:test's TAP output, which Node 20/22 emit when stdout is not a TTY (as in CI).
# If a future Node changes that default, the counts fall back to "?" and the verdict still follows the exit code.
npm test 2>&1 | tee test-output.txt
status=${PIPESTATUS[0]}

count() { grep -E "^(# |ℹ )$1 [0-9]+" test-output.txt | tail -n 1 | grep -Eo '[0-9]+$' || echo "?"; }
tests=$(count tests); pass=$(count pass); fail=$(count fail); skipped=$(count skipped); todo=$(count todo); cancelled=$(count cancelled)
if [ "$status" -eq 0 ]; then verdict=PASSED; else verdict=FAILED; fi
echo "verdict=${verdict}" >> "$out"

echo "| ${pkg} tests | ${verdict}: tests=${tests} pass=${pass} fail=${fail} skipped=${skipped} todo=${todo} cancelled=${cancelled} |" >> "$summary"
echo "::notice title=${pkg} tests::${verdict} tests=${tests} pass=${pass} fail=${fail} skipped=${skipped} todo=${todo} cancelled=${cancelled}"
if [ "$status" -ne 0 ]; then
  # One annotation per failing (sub)test with its TAP diagnostic block (name, error, expected/actual, location).
  node - <<'JS'
const lines = require("fs").readFileSync("test-output.txt", "utf8").split("\n")
let n = 0
for (let i = 0; i < lines.length && n < 25; i++) {
  const m = lines[i].match(/^(\s*)not ok \d+ - (.*)$/)
  if (!m) continue
  const block = []
  for (let j = i + 1; j < lines.length && j < i + 40; j++) {
    if (/^\s*\.\.\.\s*$/.test(lines[j]) || /^\s*(not )?ok \d+/.test(lines[j])) break
    if (/(error|expected|actual|operator|location|code|failureType|stack)/.test(lines[j]) || /^\s{6,}\S/.test(lines[j])) block.push(lines[j].trim())
  }
  const msg = `${m[2]} | ${block.join(" | ")}`.slice(0, 1500).replace(/%/g, "%25").replace(/\r/g, "").replace(/\n/g, "%0A")
  console.log(`::error title=${process.env.PKG || "tests"} failing (depth ${m[1].length / 4})::${msg}`)
  n++
}
JS
fi
exit "$status"

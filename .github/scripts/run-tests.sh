#!/usr/bin/env bash
# Runs `npm test` for one package and reports exact counts. A package without a test script is reported as
# NOT EXECUTED (never as passed). Counts are parsed from node:test's own summary lines (TAP "# pass N" or spec "ℹ pass N").
set -uo pipefail
pkg="$1"
summary="${GITHUB_STEP_SUMMARY:-/dev/null}"

if ! node -e "process.exit(require('./package.json').scripts && require('./package.json').scripts.test ? 0 : 1)"; then
  echo "| ${pkg} tests | NOT EXECUTED (no test script on this commit) |" >> "$summary"
  echo "::warning title=${pkg} tests::NOT EXECUTED - package.json has no test script on this commit"
  exit 0
fi

npm test 2>&1 | tee test-output.txt
status=${PIPESTATUS[0]}

count() { grep -E "^(# |ℹ )$1 [0-9]+" test-output.txt | tail -n 1 | grep -Eo '[0-9]+$' || echo "?"; }
tests=$(count tests); pass=$(count pass); fail=$(count fail); skipped=$(count skipped); todo=$(count todo); cancelled=$(count cancelled)
if [ "$status" -eq 0 ]; then verdict=PASSED; else verdict=FAILED; fi

echo "| ${pkg} tests | ${verdict}: tests=${tests} pass=${pass} fail=${fail} skipped=${skipped} todo=${todo} cancelled=${cancelled} |" >> "$summary"
echo "::notice title=${pkg} tests::${verdict} tests=${tests} pass=${pass} fail=${fail} skipped=${skipped} todo=${todo} cancelled=${cancelled}"
if [ "$status" -ne 0 ]; then
  grep -E "^not ok|✖" test-output.txt | head -n 20 | while IFS= read -r line; do echo "::error title=${pkg} failing test::${line}"; done
fi
exit "$status"

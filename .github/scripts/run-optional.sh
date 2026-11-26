#!/usr/bin/env bash
# Runs an npm script only if the package defines it; otherwise records NOT EXECUTED (never PASSED).
set -uo pipefail
pkg="$1"; script="$2"; label="$3"
summary="${GITHUB_STEP_SUMMARY:-/dev/null}"
if ! node -e "process.exit(require('./package.json').scripts && require('./package.json').scripts['$script'] ? 0 : 1)"; then
  echo "| ${label} | NOT EXECUTED (no '${script}' script on this commit) |" >> "$summary"
  echo "::notice title=${label}::NOT EXECUTED - no '${script}' script on this commit"
  exit 0
fi
npm run "$script" 2>&1 | tee optional-output.txt
status=${PIPESTATUS[0]}
if [ "$status" -eq 0 ]; then verdict=PASSED; else verdict=FAILED; fi
echo "| ${label} | ${verdict} |" >> "$summary"
echo "::notice title=${label}::${verdict}"
exit "$status"

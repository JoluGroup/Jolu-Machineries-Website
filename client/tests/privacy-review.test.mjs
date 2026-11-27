// Regression tests for the independent review of M2-PRIVACY-01 (1c3221e).
import assert from "node:assert/strict"
import fs from "node:fs"
import path from "node:path"
import test from "node:test"
import { fileURLToPath } from "node:url"

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const read = (f) => fs.readFileSync(path.join(ROOT, f), "utf8")

test("privacy UI uses only colour utilities that exist in this Tailwind config (no undefined bg-gradient-hero)", () => {
  const css = read("src/index.css") + read("tailwind.config.ts")
  for (const f of ["src/privacy/ConsentBanner.tsx", "src/components/YouTubeEmbed.tsx", "src/pages/Mud4Fun.tsx"]) {
    const src = read(f)
    assert.doesNotMatch(src, /bg-gradient-hero/, `${f} uses an undefined class`)
  }
  assert.match(read("src/privacy/ConsentBanner.tsx"), /bg-primary p-4/, "banner has a solid dark background")
  assert.match(css, /primary:\s*\{/, "primary colour token exists")
})

test("legacy _ga cookies are removed on mount whenever analytics is not allowed (incl. builds without an ID)", () => {
  const src = read("src/privacy/ConsentBanner.tsx")
  assert.match(src, /if \(!isGranted\(readConsent\(\)\) \|\| !id\) deleteGaCookies\(\{ window, document \}\)/)
  // The effect runs before the early `return null`, i.e. also when no measurement ID is configured.
  assert.ok(src.indexOf("deleteGaCookies({ window, document })") < src.indexOf("if (!analytics || !open) return null"))
})

test("reopening from Cookie settings moves keyboard focus into the bar", () => {
  const src = read("src/privacy/ConsentBanner.tsx")
  assert.match(src, /if \(focusOnOpen\) first\.current\?\.focus\(\)/)
  assert.match(src, /<Button ref=\{first\}/)
})

test("map iframe sends only the origin as referrer once loaded", () => {
  assert.match(read("src/components/MapEmbed.tsx"), /referrerPolicy="strict-origin-when-cross-origin"/)
})

test("disclosures draft records the GA enhanced-measurement prerequisite and platform/mailbox copies", () => {
  const doc = fs.readFileSync(path.join(ROOT, "..", "docs", "m2-privacy", "DISCLOSURES-DRAFT.md"), "utf8")
  assert.match(doc, /Enhanced measurement/)
  assert.match(doc, /pseudonymous personal data/)
  assert.match(doc, /Google Drive cookies/)
  assert.match(doc, /request logs/)
})

// M2-R05: the desktop nav must not appear below the width it physically needs (measured ~1120px;
// breakpoint 1140px), and the mobile menu's quote button must not unmount its own drawer.
import test from "node:test"
import assert from "node:assert/strict"
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const src = fs.readFileSync(path.join(ROOT, "src/components/Header.tsx"), "utf8")
const BP = "min-[1140px]"

test("desktop nav is hidden until the 1140px breakpoint and then shown", () => {
  assert.match(src, new RegExp(`<nav className="hidden ${BP.replace(/[[\]]/g, "\\$&")}:flex `))
})

test("mobile toggle and mobile menu use the same breakpoint (no gap, no double nav)", () => {
  const hidden = src.match(new RegExp(`${BP.replace(/[[\]]/g, "\\$&")}:hidden`, "g")) || []
  assert.equal(hidden.length, 2, "toggle button and mobile menu panel must both hide at the breakpoint")
  assert.doesNotMatch(src, /md:flex items-center space-x-6/, "old md breakpoint nav must be gone")
  assert.doesNotMatch(src, /className="md:hidden/, "old md:hidden classes must be gone")
})

test("the three breakpoint classes stay consistent", () => {
  const all = src.match(/min-\[(\d+)px\]/g) || []
  assert.equal(new Set(all).size, 1)
  assert.equal(all.length >= 3, true)
})

test("mobile quote button does not close (unmount) the menu that contains its drawer", () => {
  const i = src.indexOf("Request a Quote", src.indexOf("Mobile Menu"))
  const block = src.slice(src.lastIndexOf("<QuoteDrawer", i), i)
  assert.doesNotMatch(block, /setIsMenuOpen\(false\)/)
})

test("all navigation destinations and the mobile menu control remain", () => {
  for (const href of ['"/#home"', '"/products"', '"/spare-parts"', '"/schedule"', '"/careers"', '"/gallery"', '"/showroom-launch"', '"/mud4fun"', '"/ktn-interview"']) assert.ok(src.includes(href), href)
  assert.ok(src.includes('aria-label="Toggle menu"'))
})

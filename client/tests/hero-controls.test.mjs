// M2-R04 Lane B: owner-supplied homepage statistics and non-overlapping carousel controls.
import assert from "node:assert/strict"
import fs from "node:fs"
import path from "node:path"
import test from "node:test"
import { fileURLToPath } from "node:url"

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const hero = fs.readFileSync(path.join(ROOT, "src/components/Hero.tsx"), "utf8")

test("homepage statistics are the owner-supplied figures (500 / 5 / 480), labels unchanged, sourced from the claims registry", () => {
  // M2-CLAIMS-01 moved the figures into src/config/business.ts (claim C10, pending owner verification).
  const registry = fs.readFileSync(path.join(ROOT, "src/config/business.ts"), "utf8")
  const stats = [...registry.matchAll(/\{\s*target:\s*(\d+),\s*label:\s*"([^"]+)"/g)].map((m) => [m[2], Number(m[1])])
  assert.deepEqual(stats, [["Tractors Sold", 500], ["Years Experience", 5], ["Happy Customers", 480]])
  assert.match(hero, /visible\(stats\.homepage\)/, "Hero reads the figures through the registry")
  assert.doesNotMatch(hero, /target:\s*\d+/, "no hard-coded figures remain in Hero")
})

test("carousel controls live in normal flow, not absolutely positioned over the content", () => {
  const block = hero.slice(hero.indexOf("Carousel controls"), hero.indexOf("Floating contact stack"))
  assert.ok(block.length > 200, "controls block found")
  assert.doesNotMatch(block, /\babsolute\b|\bfixed\b|top-1\/2|-translate-/, "no overlay positioning in the controls block")
  assert.match(block, /aria-label="Previous slide"/)
  assert.match(block, /aria-label="Next slide"/)
  assert.match(block, /aria-label=\{`Go to slide \$\{index \+ 1\}`\}/)
  assert.equal((hero.match(/aria-label="Previous slide"/g) || []).length, 1, "single set of arrows")
  assert.equal((hero.match(/aria-label="Next slide"/g) || []).length, 1)
})

test("navigation behaviour is preserved: dots and arrows go through the slide navigator", () => {
  assert.match(hero, /onClick=\{\(\) => nav\.request\(index\)\}/)
  assert.match(hero, /const nextSlide = \(\) => nav\.request\(nav\.base\(currentRef\.current\) \+ 1\)/)
  assert.match(hero, /const prevSlide = \(\) => nav\.request\(nav\.base\(currentRef\.current\) - 1\)/)
  assert.match(hero, /onError=\{\(\) => markFailed\(index\)\}/, "failed-image invariant intact")
})

// Media & Events correction: only owner-verifiable YouTube destinations may appear on the Nakuru page.
// Verified source: official channel @jolugroupltd, Live tab, streamed 21 Feb 2026 (video ID Z2qy5pVIKiQ).
import test from "node:test"
import assert from "node:assert/strict"
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const src = fs.readFileSync(path.join(ROOT, "src/pages/NakuruLaunch.tsx"), "utf8")
const VERIFIED_ID = "Z2qy5pVIKiQ"

test("Watch Full Event points to the verified full-event recording", () => {
  assert.match(src, new RegExp(`const FULL_EVENT_URL = "https://www\\.youtube\\.com/watch\\?v=${VERIFIED_ID}";`))
  const anchor = src.match(/<a\s[^>]*href=\{FULL_EVENT_URL\}[^>]*>[\s\S]*?Watch Full Event[\s\S]*?<\/a>/)
  assert.ok(anchor, "Watch Full Event anchor must use FULL_EVENT_URL")
  assert.match(anchor[0], /target="_blank"/)
  assert.match(anchor[0], /rel="noopener noreferrer"/)
  assert.match(anchor[0], /aria-label="Watch Full Event on YouTube \(opens in a new tab\)"/)
  assert.doesNotMatch(anchor[0], /href="#speeches"/)
})

test("no unverified YouTube link or ID is present on the page", () => {
  const urls = src.match(/https?:\/\/(?:www\.)?(?:youtube\.com|youtu\.be)[^"'\s)]*/g) || []
  assert.deepEqual([...new Set(urls)], [`https://www.youtube.com/watch?v=${VERIFIED_ID}`])
  assert.doesNotMatch(src, /FILE_ID|drive\.google\.com/, "no placeholder or drive links")
})

test("speaker cards, titles and photographs are unchanged", () => {
  const expected = [
    ["Pastor Carol", "Opening Prayer & Sermon", "pastor-carol.jpg"],
    ["Lucy Ndung’u", "Welcome & Opening Remarks", "lucy.jpg"],
    ["Kelvin Macharia", "Jolu Group Presentation", "kelvin.jpg"],
    ["Jackson Oduor", "Farm Mechanization Talk", "jackson.jpg"],
    ["John Ndung’u", "CEO Address", "john.jpg"],
    ["Catherine", "Vote of Thanks", "catherine.jpg"],
  ]
  for (const [name, title, img] of expected) {
    assert.ok(src.includes(`name: "${name}"`), name)
    assert.ok(src.includes(`title: "${title}"`), title)
    assert.ok(src.includes(`/lovable-uploads/nakuru-launch/${img}`), img)
  }
  assert.equal((src.match(/Read Speech/g) || []).length, 1)
  assert.equal((src.match(/Watch Video/g) || []).length, 1)
})

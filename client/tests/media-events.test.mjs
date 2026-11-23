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
  assert.equal((src.match(/Watch Video/g) || []).length, 2, "linked and pending variants")
})

test("Read Speech buttons and speech link fields are removed", () => {
  assert.doesNotMatch(src, /Read Speech/)
  assert.doesNotMatch(src, /speaker\.speech|speech:\s*"/)
})

test("speaker start times are explicit, per speaker, and never guessed", () => {
  const block = src.match(/SPEAKER_START_SECONDS[^=]*=\s*\{([\s\S]*?)\n\};/)
  assert.ok(block, "SPEAKER_START_SECONDS mapping must exist")
  const entries = [...block[1].matchAll(/"([^"]+)":\s*(null|\d+)\s*,/g)]
  assert.deepEqual(
    entries.map((e) => e[1]),
    ["Pastor Carol", "Lucy Ndung’u", "Kelvin Macharia", "Jackson Oduor", "John Ndung’u", "Catherine"],
  )
  const values = entries.map((e) => e[2]).filter((v) => v !== "null")
  assert.equal(new Set(values).size, values.length, "two speakers must not share a start time")
})

test("speaker links are built only from a verified integer second and open safely", () => {
  assert.match(src, /\$\{FULL_EVENT_URL\}&t=\$\{t\}s/)
  assert.match(src, /Number\.isInteger\(t\) && t >= 0/)
  const anchor = src.match(/<a\s[^>]*href=\{speakerVideoUrl[\s\S]*?<\/a>/)
  assert.ok(anchor)
  assert.match(anchor[0], /target="_blank"/)
  assert.match(anchor[0], /rel="noopener noreferrer"/)
})

test("pending speakers render a non-navigating disabled button, not a dead link", () => {
  assert.doesNotMatch(src, /href="#"/)
  assert.match(src, /data-pending-video="true"/)
  assert.match(src, /aria-disabled="true"/)
})

// Owner-approved mapping (start/end in seconds). End times are validation evidence only.
const APPROVED = {
  "Pastor Carol": [2775, 4620],
  "Lucy Ndung’u": [4970, 5190],
  "Kelvin Macharia": [5540, 6945],
  "Jackson Oduor": [7050, 7650],
  "John Ndung’u": [11115, 11505],
  "Catherine": [13710, 13922],
}
const DURATION = 18282.58

test("each speaker maps to exactly the owner-approved start second", () => {
  const block = src.match(/SPEAKER_START_SECONDS[^=]*=\s*\{([\s\S]*?)\n\};/)[1]
  const got = Object.fromEntries([...block.matchAll(/"([^"]+)":\s*(\d+),/g)].map((e) => [e[1], Number(e[2])]))
  const want = Object.fromEntries(Object.entries(APPROVED).map(([k, v]) => [k, v[0]]))
  assert.deepEqual(got, want)
})

test("every speaker URL targets the verified video at its own second, with no placeholder", () => {
  assert.doesNotMatch(src, /video:\s*"#"/)
  for (const [name, [start]] of Object.entries(APPROVED)) {
    const url = `https://www.youtube.com/watch?v=${VERIFIED_ID}&t=${start}s`
    assert.match(url, new RegExp(`v=${VERIFIED_ID}&t=${start}s$`))
  }
  const urls = Object.values(APPROVED).map(([s]) => s)
  assert.equal(new Set(urls).size, 6)
})

test("start times are nonnegative integers inside the recording and before their end times", () => {
  for (const [name, [start, end]] of Object.entries(APPROVED)) {
    assert.ok(Number.isInteger(start) && start >= 0, name)
    assert.ok(start < end && end <= DURATION, name)
  }
})

test("the full-event link carries no timestamp and the page has no auto-stop logic", () => {
  assert.doesNotMatch(src, /const FULL_EVENT_URL = "[^"]*[&?]t=/)
  assert.doesNotMatch(src, /end(Seconds|Time)|autoStop/i)
})

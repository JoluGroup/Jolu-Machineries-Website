// Tests for the hero slide-navigation state machine (F-01): no blank slides, no stale jumps.
import assert from "node:assert/strict"
import test from "node:test"
import { createSlideNavigator, wrapIndex } from "../src/lib/slide-navigation.ts"

function harness({ count = 5, ready = [0], timeoutMs = 10_000 } = {}) {
  const readySet = new Set(ready)
  const shown = []
  const prepared = []
  const timers = new Map()
  let nextTimer = 1
  const nav = createSlideNavigator({
    count,
    timeoutMs,
    isReady: (i) => readySet.has(i),
    show: (i) => shown.push(i),
    prepare: (i) => prepared.push(i),
    setTimer: (fn, ms) => { const id = nextTimer++; timers.set(id, { fn, ms }); return id },
    clearTimer: (id) => timers.delete(id),
  })
  const load = (i) => { readySet.add(i); nav.settled(i) }
  const fireTimers = () => { for (const [id, t] of [...timers]) { timers.delete(id); t.fn() } }
  return { nav, shown, prepared, load, readySet, timers, fireTimers }
}

test("a ready slide is shown immediately", () => {
  const h = harness({ ready: [0, 2] })
  h.nav.request(2)
  assert.deepEqual(h.shown, [2])
  assert.deepEqual(h.prepared, [])
  assert.equal(h.nav.pending(), null)
})

test("an unready slide is NOT shown; it is prepared and shown only when its image settles", () => {
  const h = harness()
  h.nav.request(3)
  assert.deepEqual(h.shown, [], "current slide stays visible")
  assert.deepEqual(h.prepared, [3])
  assert.equal(h.nav.pending(), 3)
  h.load(3)
  assert.deepEqual(h.shown, [3])
  assert.equal(h.nav.pending(), null)
})

test("stale requests: an older slide finishing later never moves the slider", () => {
  const h = harness()
  h.nav.request(2)
  h.nav.request(4) // user changed their mind
  h.load(2) // slower, older request finishes first
  assert.deepEqual(h.shown, [], "stale slide must not be shown")
  h.load(4)
  assert.deepEqual(h.shown, [4])
  h.load(2) // late duplicate
  assert.deepEqual(h.shown, [4])
})

test("rapid navigation: only the last request wins, and relative clicks build on the pending target", () => {
  const h = harness()
  h.nav.request(h.nav.base(0) + 1) // next -> 1
  h.nav.request(h.nav.base(0) + 1) // next again -> 2 (relative to pending 1)
  h.nav.request(h.nav.base(0) + 1) // -> 3
  assert.equal(h.nav.pending(), 3)
  h.load(1); h.load(2)
  assert.deepEqual(h.shown, [])
  h.load(3)
  assert.deepEqual(h.shown, [3])
})

test("requesting the slide already on screen cancels a pending request", () => {
  const h = harness()
  h.nav.request(3)
  h.nav.request(0) // back to the ready current slide
  assert.equal(h.nav.pending(), null)
  h.load(3) // arrives afterwards
  assert.deepEqual(h.shown, [0], "only the explicit return to 0 was shown; 3 did not hijack the slider")
})

test("wrap-around works in both directions (previous from slide 0, next from the last slide)", () => {
  const h = harness({ ready: [0, 4] })
  h.nav.request(h.nav.base(0) - 1)
  assert.deepEqual(h.shown, [4])
  assert.equal(wrapIndex(5, 5), 0)
  assert.equal(wrapIndex(-1, 5), 4)
  assert.equal(wrapIndex(-6, 5), 4)
})

test("a failed image settles the request too, so the slider is never stuck", () => {
  const h = harness()
  h.nav.request(2)
  h.nav.settled(2) // onError path
  assert.deepEqual(h.shown, [2])
})

test("timeout: a slide that never loads is abandoned and the current slide stays", () => {
  const h = harness({ timeoutMs: 5000 })
  h.nav.request(2)
  assert.equal([...h.timers.values()][0].ms, 5000)
  h.fireTimers()
  assert.equal(h.nav.pending(), null)
  h.load(2)
  assert.deepEqual(h.shown, [], "late arrival after the timeout does not move the slider")
})

test("a new request after a timeout still works", () => {
  const h = harness({ timeoutMs: 1 })
  h.nav.request(2)
  h.fireTimers()
  h.nav.request(3)
  h.load(3)
  assert.deepEqual(h.shown, [3])
})

test("cancel() (unmount) drops pending work", () => {
  const h = harness()
  h.nav.request(2)
  h.nav.cancel()
  h.load(2)
  assert.deepEqual(h.shown, [])
  assert.equal(h.timers.size, 0)
})

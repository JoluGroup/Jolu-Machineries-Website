// Pure slide-navigation state machine for the hero slider (no React, no DOM).
//
// Rule: the slide on screen is never replaced by a slide whose image is not ready.
// A request for an unready slide asks the UI to load it ("prepare") and keeps the
// current slide visible; when that image settles (loaded or failed) the slider
// moves. Only the most recent request can move the slider, so late images from
// earlier requests (stale requests) and rapid clicking cannot cause a jump.

export interface SlideNavigatorOptions {
  /** Number of slides. */
  count: number
  /** Is the image for slide `i` loaded (or failed - nothing more to wait for)? */
  isReady: (i: number) => boolean
  /** Display slide `i` (called only for ready slides). */
  show: (i: number) => void
  /** Start loading slide `i`'s image. */
  prepare: (i: number) => void
  /** Give up waiting for a slide after this many ms and stay on the current one. */
  timeoutMs?: number
  setTimer?: (fn: () => void, ms: number) => unknown
  clearTimer?: (handle: unknown) => void
}

export interface SlideNavigator {
  /** User navigation (dot, previous, next). */
  request: (target: number) => void
  /** Call when the image of slide `i` has loaded or failed. */
  settled: (i: number) => void
  /** Slide a "next/previous" click should be relative to: the pending target, else `current`. */
  base: (current: number) => number
  /** Slide currently being waited for, or null. */
  pending: () => number | null
  /** Abandon any pending request (e.g. on unmount). */
  cancel: () => void
}

export const wrapIndex = (i: number, count: number) => ((i % count) + count) % count

export function createSlideNavigator(opts: SlideNavigatorOptions): SlideNavigator {
  const { count, isReady, show, prepare, timeoutMs = 10_000 } = opts
  const setTimer = opts.setTimer ?? ((fn, ms) => setTimeout(fn, ms))
  const clearTimer = opts.clearTimer ?? ((h) => clearTimeout(h as ReturnType<typeof setTimeout>))
  let pending: number | null = null
  let token = 0
  let timer: unknown = null

  const clear = () => {
    if (timer !== null) clearTimer(timer)
    timer = null
  }

  return {
    request(target) {
      const i = wrapIndex(target, count)
      token += 1
      clear()
      if (isReady(i)) {
        pending = null
        show(i)
        return
      }
      pending = i
      prepare(i)
      const mine = token
      timer = setTimer(() => {
        if (token === mine) pending = null // give up; the current slide simply stays
        timer = null
      }, timeoutMs)
    },
    settled(i) {
      if (pending !== i) return // stale: an older request, or nobody is waiting
      pending = null
      clear()
      show(i)
    },
    base: (current) => (pending === null ? current : pending),
    pending: () => pending,
    cancel() {
      token += 1
      pending = null
      clear()
    },
  }
}

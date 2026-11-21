# M2-R release-gate notes (PR #12)

## Package manager authority (R-02)
- npm is authoritative: README says `npm i`; `client/package-lock.json` (v3) pins `sharp@0.35.5` exactly and is
  consistent with `client/package.json`; a clean `npm ci` from only those two files installs it.
- Which lockfile Vercel selects when both exist is **not stated in Vercel's documentation**. A 2023 build-utils commit
  (vercel/vercel 45b73c7) documents the priority yarn > pnpm > npm > bun, which would make npm win, but that is unconfirmed for
  current Vercel versions. `client/bun.lockb` (stale, no sharp) was left untouched (lockfile removal is out of scope).
  **Confirm in the preview/production install log** (expect "Detected `package-lock.json`" / `npm install`). If the log shows
  bun, the options are to remove `client/bun.lockb` or pin an install command, both owner decisions.
- Also unverified: the Vercel project's Root Directory (dashboard). `client/vercel.json` and `client/package-lock.json` apply only if it is `client`.
- Use `npm ci` / `npm install` in `client/`. Do not run `bun install` for this project.

## Missing generated images (R-01) and error-response caching (M2-R03)
Live preview (owner-verified): an existing `/_img/*.webp` returned 200 `image/webp` with the immutable header (correct), and a missing
one returned Vercel's native 404 (not SPA HTML, correct) **but with `Cache-Control: public, max-age=31536000, immutable`** (defect).
Cause: a vercel.json `headers` rule runs before the filesystem phase and matches the request path only, so it also stamps 404s; `has`/`missing`
cannot test file existence or response status. Narrowing the path alone cannot fix a missing *hashed* file (e.g. an open tab after a redeploy).
Correction: `client/vercel.json` now uses `routes` only: `filesystem` phase -> SPA catch-all that excludes `/_img/`;
`hit` phase -> immutable header on content-hashed `/_img/*.webp` names with `continue: true`. Rules after `hit` apply only to requests that
resolved to an existing file. The `hit` phase semantics are not spelled out in Vercel's docs, so **the corrected preview must be verified**:
`curl -I` an existing `/_img/<file>` (200, image/webp, immutable), a missing `/_img/<name>.<16hex>.webp` and `/_img/nope.webp` (404, no immutable,
repeat twice for `x-vercel-cache`), plus `/`, `/products`, `/products/zoomlion-rn904`, `/gallery`, `/news`, an unknown route (index.html).
The `hit`-phase rule was confirmed live by the owner (see R-01 status).

### R-01 status: CLOSED (functional acceptance), evidence by source
**Owner-verified on the live Vercel preview of PR #13 (commit 453d4d3), browser cache disabled:**
| Check | Observed |
|---|---|
| Existing generated WebP | 200, `image/webp`, `cache-control: public, max-age=31536000, immutable`, `x-vercel-cache: MISS`, image renders |
| Missing ordinary WebP | 404, `text/plain; charset=utf-8`, `x-vercel-error: NOT_FOUND`, `cache-control: public, max-age=0, must-revalidate`, no immutable |
| Missing content-hashed WebP | 404, same headers as above, no immutable |
| SPA routing (Test D) | passed, confirmed by the owner |

**Claude-reported engineering checks (not independent live evidence):** 59/59 tests, production build, TypeScript (5 existing ScheduleVisit errors), ESLint (7 errors / 7 warnings),
generated images byte-identical, originals unchanged, `dist` byte-identical to the previous candidate.

**Offline automated verification:** `client/tests/vercel-routing.test.mjs` models the documented phases and the six invariants. It does not prove Vercel's behaviour; the owner evidence above does.

**Not independently established:** CDN-level negative caching. Neither missing-image response exposed an `x-vercel-cache` header, so no HIT/MISS was observed or is claimed.
The 404 responses carried `max-age=0, must-revalidate`, so browsers must revalidate them.

## Generator cleanup safety (R-03)
`scripts/optimize-images.mjs` now refuses (before creating or deleting anything) an output directory that is a filesystem root,
the project root or a parent of it, a source image tree or anything inside/containing one, or overlaps the cache directory, and
a manifest path inside a source tree or the output directory. Paths are symlink-resolved first. Pruning is restricted to regular
files named `<slug>-<w>.<16 hex>.webp`; symlinks, directories and other files are never touched.

## Production deployment relationship (R-05)
GitHub deployment records show every push to `main` produced a Vercel **Production** deployment by `vercel[bot]` within about 1-2 minutes
(e.g. merge commit 6244d87), and PR branches produce **Preview** deployments. No GitHub Actions or branch protection exist.
**Merging PR #12 into main should therefore be treated as a production deployment.** Not verifiable from here: Vercel project settings,
manual-approval/"Instant Rollback" availability, attached domains.

## Owner visual acceptance checklist (not yet approved)
Screenshots in `docs/m2-integration/screenshots/` (desktop = `-desktop`, mobile = `-mobile`):
1. `home-hero-*`: hero readable; the two low-resolution hero photos are a known pre-existing limitation.
2. `catalogue-top-*`, `catalogue-tractors|harvesters|implements-*`: 18 products, three groups, header/footer present.
3. `product-detail-*`: product image detail acceptable.
4. `gallery-*`, `news-*`, `nakuru-event-*`: images sharp, layout unchanged.
5. `nav-desktop.png`, `nav-mobile.jpg` (menu open): "Catalogue" item present, other labels unchanged.

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

## Owner visual acceptance checklist (original M2 items; superseded in part by the M2-R04 acceptance below)
Screenshots in `docs/m2-integration/screenshots/` (desktop = `-desktop`, mobile = `-mobile`):
1. `home-hero-*`: hero readable; the two low-resolution hero photos are a known pre-existing limitation.
2. `catalogue-top-*`, `catalogue-tractors|harvesters|implements-*`: 18 products, three groups, header/footer present.
3. `product-detail-*`: product image detail acceptable.
4. `gallery-*`, `news-*`, `nakuru-event-*`: images sharp, layout unchanged.
5. `nav-desktop.png`, `nav-mobile.jpg` (menu open): "Catalogue" item present, other labels unchanged.

## M2-R04 integration (final code state)
Integrated in order: PR #14 (catalogue, merge 85b0ba1), then PR #15 (homepage, merge dedb01b). **Final integrated code commit: `dedb01b8d3e5eb9396e0d0a1b3d59bfe0c324bce`** (docs-only commits may follow it).
Combined preview (Vercel build for dedb01b, success): https://jolu-machineries-website-ny0vxphze-jolu-group.vercel.app

### Visual acceptance (kept separate from factual confirmation)
- **Owner desktop visual acceptance: GRANTED** for the catalogue refinement (PR #14) and the homepage refinement (PR #15), after reviewing both live previews.
- Mobile and tablet visual acceptance: **not yet given** by the owner (measured and screenshotted by Claude only).
- **Commercial statistics: NOT factually confirmed.** Tractors Sold 500, Years Experience 5, Happy Customers 480 are owner-supplied figures. Visual acceptance of the layout is not confirmation that the numbers are true. Factual confirmation remains a production publication gate.

### Regression results on dedb01b (Claude-run, offline/local builds)
- `npm test`: 68/68 pass (59 + 6 catalogue + 3 hero controls).
- Production build succeeds. TypeScript: 5 errors, all pre-existing in `ScheduleVisit.tsx`. ESLint: 7 errors / 7 warnings (unchanged baseline).
- Originals: 0 diffs in `src/assets` and `public/lovable-uploads` against main (6244d87). `vercel.json` unchanged since 5880cf6 (R-01 routing and cache isolation configuration intact; not re-verified live in this step).
- Generated images: 385 files, set hash `3b58fe06` identical to the pre-R04 tree.
- Catalogue (412 / 820 / 1366 px): 18 cards, 18 images decoded, `object-fit: contain`, equal-height rows, links `/products/<slug>`, header and footer present, CLS 0, no non-200 image responses.
- Homepage: counters read 500 / 5 / 480 at all 8 viewports; 0 overlaps with hero content except the floating-contact item below; no horizontal scroll caused by the hero; 0 page errors. Throttled-mobile CLS: 0.0008 (pre-R04 0.0004; both far below 0.1). Home transfer unchanged (1.12 MB total, 0.83 MB images).
- Hero stress suite: 12 scenarios, 0 blank frames, 0 errors.
- Mobile/tablet image transfer on /products is unchanged under throttled mobile; desktop catalogue image transfer is lower.

### Evaluated known issues (reported, deliberately not fixed)
1. **Tablet header navigation overflow (pre-existing, outside R04).** Between about 768 and 893 px wide the header nav is wider than the viewport (right edge 894 px). The "Request a Quote" button is pushed off-screen and the page scrolls horizontally by 74 px at 820 px (126 px at 768 px). It is gone by 900 px. Verdict: **moderate**: it hides the primary header call to action on portrait tablets; other contact routes remain available. Recommend a fix before or soon after launch (separate, authorized change).
2. **Floating contact stack over hero controls (360x640 only).** The fixed WhatsApp/call buttons covered the "Next slide" arrow at one scroll position (about 500 px); dots and Previous stayed tappable, and the controls were unobstructed at 412 px and wider. Verdict: **minor / not materially obstructive**, transient while scrolling.

### Outstanding technical debt
Header nav overflow at 768-893 px; floating contact stack vs. controls at 360 px; 5 TS errors and 7 ESLint errors in existing files; `diskHarrow18` source is 224x224 (soft when enlarged); two low-resolution hero photos; Vercel project settings, domains and rollback features unverifiable from here.

### Remaining publication and production gates
1. Owner mobile/tablet visual acceptance.
2. Factual confirmation of 500 / 5 / 480.
3. Explicit owner authorization to merge PR #12 into `main` (this triggers a Production deployment, see R-05).
4. Decision on the two evaluated issues above.
5. Post-deploy live check of R-01 on the production domain (existing WebP 200 immutable; missing WebP 404 without immutable; SPA deep links).
6. Resend/DNS and email cutover remain separate and untouched.

### Production rollback checklist (existing production commit `6244d87c7610318b16c28cc15b24c0dd2efc4c3f`)
1. Before merging, note the current Production deployment in the Vercel dashboard (it was built from 6244d87).
2. If a problem appears after promotion, first choose Vercel "Instant Rollback" (or Promote) of that 6244d87 deployment; this needs no code change. Availability depends on project settings that Claude cannot verify.
3. If a code rollback is needed: `git revert -m 1 <PR #12 merge commit>` on a branch, open a PR, merge (triggers a Production deploy), or redeploy 6244d87.
4. After rollback verify: home loads, `/products` loads, one deep link, one `/_img/` WebP returns 200, and a missing `/_img/` file returns 404 without `immutable`.
5. Note: generated images are produced at build time and are not in git; a rollback to 6244d87 restores the pre-M2 image set.

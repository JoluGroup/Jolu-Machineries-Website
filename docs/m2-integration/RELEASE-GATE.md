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

## Missing generated images (R-01)
Static files take precedence over rewrites. Previously a missing `/_img/*` URL matched the `/(.*)` rewrite and returned
`index.html` with 200 under the immutable `/_img/` header. The rewrite source is now `/((?!_img/).*)`, so missing `/_img/*`
paths match no rewrite and return Vercel's 404, while every other path (SPA routes, `/products/<slug>`, unknown routes) still gets `index.html`.
Matching was verified with `path-to-regexp@6`; behaviour on a live deployment is still to be confirmed (see D-03).

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

# M2 — Image optimization: results

Measured on a local static server serving `vite build` output of `main` (before) and this branch (after).
Mobile profile: 412×823 @2x, 1.6 Mbps down / 150 ms RTT, 4× CPU slowdown, cold cache, median of 3 runs.
Scripts and raw JSON are in `measurement/`. Production has not been touched.

## Image bytes and page transfer (page loaded, then scrolled top to bottom, network idle)

| Page | Images before | Images after | Total transfer before | Total transfer after |
|---|---|---|---|---|
| Home | 2,759 KB | 833 KB | 3,033 KB | 1,119 KB |
| Gallery | 28,803 KB | 1,505 KB | 29,057 KB | 1,771 KB |
| News | 65,476 KB | 1,156 KB | 65,697 KB | 1,390 KB |
| Product detail (RN904) | 508 KB | 129 KB | 734 KB | 367 KB |
| Event (Nakuru launch) | 28,287 KB | 1,692 KB | 28,506 KB | 1,923 KB |
| Product list | 0 KB | 0 KB | 202 KB | 213 KB |

Targets: home < 1.5 MB (1.1 MB), gallery < 4 MB (1.8 MB). Both met.
`/products` renders no product cards in either build (pre-existing: `ProductList.tsx` filters on a `category` field the data does not have, which also shows as 3 existing TypeScript errors). It is unchanged by M2 and left for a later milestone; product cards are exercised through the home page product section instead.

## LCP and CLS (page loaded, network idle, no scrolling)

| Page | LCP before | LCP after | CLS before | CLS after |
|---|---|---|---|---|
| Home | 9.3 s | 3.8 s | 0.009 | 0.001 |
| Gallery | n/a* | 4.3 s | 0.002 | 0 |
| News | n/a* | 3.8 s | 0.099 | 0.002 |
| Product list | 1.3 s | 1.4 s | 0 | 0 |
| Product detail | 4.2 s | 2.4 s | 0.192 | 0.002 |
| Event (Nakuru) | 69 s | 4.0 s | 0 | 0 |

\* Before, the gallery and news images (28 MB / 65 MB) had not finished within the 120 s observation window, so the
reported LCP was a text element (1.9 s / 1.6 s) and is a lower bound, not a comparable figure.

CLS is under 0.1 everywhere (news and product detail were 0.099 and 0.19 before). **The LCP < 2.5 s target is met only on
product detail.** On home, gallery, news and the event page the remaining time is the SPA waterfall
(HTML → JS → route chunk → image) under 4× CPU throttling, not image weight. Fixing it needs prerendering/preloading,
which belongs to M3.

## Visual comparison

`screenshots/` holds before (left) / after (right) pairs for desktop and mobile. Full-page heights are identical
(two mobile pages differ by 1 px from rounding). Mean absolute pixel difference is 0.0–3.3 on a 0–255 scale, from WebP
resampling. Owner visual approval is still required.

## Known limitations

- `hero-tractor.jpg` and `tractor3.jpg` are only 700 px wide and are not upscaled, so they stay soft on large screens.
- On a 412 px phone the home hero fetches the 1200 px variant (the 800 px one is slightly short at 2×); that is the main
  cost on the home LCP.
- Originals stay in the repository and in the deployed output (`dist` is larger than before: originals plus `_img/`).
  Deleting unused originals later would shrink the deploy, but was out of scope.
- Image generation adds about 97 s to a cold build on this 2-CPU machine (1 s when nothing changed). Vercel build
  time will rise by a similar amount. Derivatives are git-ignored and regenerated on every build.
- Logos, favicons, the social-sharing image, PDFs and the YouTube thumbnail are intentionally untouched.

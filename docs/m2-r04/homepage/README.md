# M2-R04 Lane B: homepage statistics and carousel controls

- Statistics (owner-supplied business data; factual confirmation is a production publication gate): Tractors Sold 500 (was 150), Years Experience 5 (unchanged), Happy Customers 480 (was 100). The count-up targets in `Hero.tsx` are the displayed values.
- Cause of the overlap: the slide dots were absolutely positioned at the bottom of the content container while the stats block (stacked 3 high on phones) grew into that space; the side arrows floated over text/buttons.
- Fix: dots and arrows are one in-flow control row below the stats (own layout space, no overlay positioning).
- `measurements-before.json` / `measurements-after.json`: bounding-box overlap test at 8 viewports (360x640, 412x823, 390x844, 844x390, 820x1180, 1024x768, 1366x900, 1920x1080). Before: dots overlapped a stat at every viewport; arrows overlapped text/buttons at 6. After: 0 overlaps with hero content.
- Known limitation: the site-wide floating WhatsApp/contact stack is `position: fixed` (bottom-right) and can cover the right end of the controls at some scroll positions on very narrow phones. It is not part of the hero and was not changed.

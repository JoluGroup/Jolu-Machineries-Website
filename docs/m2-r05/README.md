# M2-R05: responsive header navigation

**Root cause.** The desktop nav was shown from Tailwind `md` (768px), but it needs about 1120px: eight items plus the Request a Quote button measure 786px, and the brand needs 205px. Below that the brand is squeezed (the "JOLU" wordmark collides with "Home", visible at 820px and 1024px in `screenshots/before-*`), and below ~900px the button is pushed past the viewport edge (right edge 894px), causing sideways page scroll of up to 126px (768px) and 74px (820px).

**Selected breakpoint: 1140px** (`min-[1140px]` on the desktop nav, the mobile toggle and the mobile panel). Measured: at 1120px the gap between brand and nav is 4px, at 1140px it is 24px. Between 768 and 1139px the existing mobile menu is used. At 1140px and wider the header is pixel-identical to before (checked at 1440px; the nav, spacing and styling are untouched).

**Related defect fixed (found during verification).** In the mobile menu, "Request a Quote" closed the menu on click, which unmounted the quote drawer it controls, so the quote form never opened on any phone (reproduced on the pre-R05 build at 412px). Removed that one `onClick`; the drawer now opens (the menu stays open behind it). Without this the move to the mobile menu would have sent tablets to a broken button.

**Files.** `client/src/components/Header.tsx` (breakpoint classes, one comment block, the one `onClick`), `client/tests/responsive-nav.test.mjs` (5 tests), this folder (`verify-nav.mjs`, `verification-before.json`, `verification-after.json`, `screenshots/`, `HARDENING-QUEUE.md`). No change to `vercel.json`, dependencies, images or other components.

**Verification** (`node verify-nav.mjs <dist> <out.json>`): 15 widths (360, 390, 412, 640, 767, 768, 820, 834, 893, 900, 1024, 1139, 1140, 1280, 1440) x 5 pages (home, catalogue, product detail, gallery, news) = 75 rows. After: 74 clean rows; the one flagged row is `/` at 360px (10px sideways scroll), which comes from `ProductsSection.tsx` and also exists before this change (see the hardening queue). Before: the desktop nav overflowed at 768-893px on every page and the quote button was off-screen.
Checked per row: horizontal overflow, desktop nav (all 8 labels, button inside the viewport, brand not squeezed) or mobile menu (all 8 labels and all 7 dropdown links reachable, button fits, quote drawer opens, toggle closes the menu, keyboard Tab from the toggle reaches the first link), page errors.

Not changed (pre-existing, recorded in the queue): no Escape-to-close, no focus trap and no `aria-expanded` on the mobile menu.

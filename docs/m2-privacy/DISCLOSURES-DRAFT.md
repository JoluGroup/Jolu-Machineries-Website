# M2-PRIVACY-01: Data handling audit and DRAFT privacy and cookie disclosures

Status: **DRAFT FOR OWNER AND LEGAL REVIEW. NOT PUBLISHED.** Nothing in this file is rendered on the website.
Every item marked **[OWNER]** or **[LEGAL]** needs a decision before any text goes live. No retention periods, controller
details, lawful bases or legal assurances have been invented. This draft describes the processing that the code actually
performs on branch `feat/m2-privacy-consent`. That branch is based on `release/m2-rc1`, which contains backend commits
457c24e, 241ea68 and 7ce624a.

## 1. Current production vs the M2 candidate

| Item | Production today (`6244d87`) | M2 candidate (this lane) | Evidence type |
|---|---|---|---|
| Google Analytics 4 (`G-R80L7FBXQS`) | Loaded unconditionally from `client/index.html` on every page. No consent step. | Removed from `index.html`. Analytics loads only when **both** `VITE_GA_MEASUREMENT_ID` is configured **and** the visitor clicks "Accept analytics". The ID is not configured by default, so the candidate makes no analytics requests and sets no analytics cookies. | Production: **source-inferred**. The deployment record shows 6244d87, but cookies and network calls were not observed at runtime. Candidate: automated tests. |
| YouTube | `youtube.com/embed` iframes load on page view (KTN interview). The Mud4Fun page loads `img.youtube.com` thumbnails on page view. | Click-to-load facade. Nothing is fetched from YouTube until the visitor clicks. The player then loads from `youtube-nocookie.com`. The Mud4Fun thumbnail is a local placeholder. | Source + tests |
| Google Maps | Three `google.com/maps/embed` iframes load on the contact section. | Click-to-load facade with the location label, a "Show map" button and a plain "Open in Google Maps" link. | Source + tests |
| Google Drive testimonial videos (News page) | Iframe is mounted only after the visitor opens the dialog. | Unchanged; it was already interaction-gated. | Source |
| Advertising pixels / trackers | None found | None | Source |
| First-party storage | None found | `localStorage["jolu-consent-v1"]` holds only the analytics choice (`{v, analytics, ts}`), and only after the visitor makes a choice while analytics is configured. | Source + tests |
| Cookie code in `components/ui/sidebar.tsx` | Present, component not rendered | Unchanged, not rendered | Source |

Runtime confirmation is still required on production and on the deployed candidate (owner, about 5 minutes).

How to check:
1. Open the site in a fresh browser profile.
2. In DevTools, check Application → Cookies for `_ga*`.
3. In the Network panel, filter for `google|youtube|gstatic|doubleclick`.

What to expect:
- **Before any click:** zero requests and no `_ga*` cookies.
- **After the visitor clicks Accept, when an ID is configured:** only `googletagmanager.com/gtag/js?id=<configured ID>` and GA collect calls.

## 2. What the website collects (from `server/app.js`, `messages.js`, `notifier.js`, `indexes.js`)

| Form / endpoint | Fields collected | Stored in (MongoDB collection) | Also stored | Emailed to staff via Resend |
|---|---|---|---|---|
| Get a quote / quote drawer `POST /api/quotes` | name, email, phone, county, area, product interest (optional), message | `quotes` | `createdAt`, de-duplication fingerprint, notification status fields (`emailStatus`, `emailAcceptedAt`, provider message id, lease fields) | Yes: all fields in the email body to `EMAIL_TO` |
| Contact section `POST /api/contact` | name, email, phone, county, area, product interest (optional), message | `contacts` | `createdAt`, notification status fields | Yes: all fields |
| Schedule a visit `POST /api/schedule` | name, email, phone, preferred date, preferred time, product, notes (optional) | `schedules` | `createdAt`, notification status fields | Yes: all fields |
| Footer newsletter `POST /api/subscribe` | email | `subscribers` (`{email, createdAt}`) | — | A "new subscriber" notice containing the email address (new subscribers only) |

Other processing:
- **IP addresses:** the rate limiter (`express-rate-limit`, default in-memory store) keys on the client IP address for a 60-second window and keeps it in process memory only. The application writes no IP addresses to the database or to its own logs. The hosting platforms (Render for the API, Vercel for the website) very likely record client IP addresses in their own request logs; retention is set by those providers. **[OWNER]** confirm.
- **De-duplication fingerprint:** quotes store a SHA-256 hash of email, phone, name and message to detect resubmissions. This is pseudonymous personal data (it can be recomputed from the same details), not anonymous data.
- **Staff mailbox and email provider copies:** every quote, contact and schedule request is emailed in full to the staff address(es) in `EMAIL_TO`, so copies also live in those mailboxes and in Resend's sending logs. These copies need their own retention rule. **[OWNER][LEGAL]**
- **Logs:** structured logs contain request IDs, route names and sanitised error categories. Form field values, connection strings and error messages are not logged. Render log retention is not documented here. **[OWNER]**
- **Retention:** none implemented. Quotes, contacts, schedules and subscribers are kept indefinitely. **[OWNER][LEGAL]** decide periods.
- **Deletion:** no deletion routine and no data-subject request process implemented. **[OWNER][LEGAL]**
- **Unsubscribe:** **none.** There is no unsubscribe endpoint, no unsubscribe link and no record of the consent wording shown at sign-up. The footer subscribe form shows no consent or marketing notice today.
- **Processors / hosting** (from the handover; to be confirmed **[OWNER]**):
  - MongoDB Atlas, AWS Frankfurt (EU), database
  - Render, Frankfurt, API hosting
  - Resend, email delivery (US company)
  - Vercel, website hosting and CDN
  - Google, analytics, only if approved and consented
  - YouTube / Google Maps, only after the visitor clicks
- **Cross-border transfer:** personal data entered in Kenya is stored and processed outside Kenya: EU (Atlas, Render) and the US provider (Resend). **[LEGAL]** must confirm the transfer basis and safeguards under the Kenya Data Protection Act, 2019 and its regulations.

## 3. Recommended unsubscribe design (NOT implemented; needs owner approval and a new server secret)

1. Store `consentText`, `consentVersion` and `source` with each subscriber at sign-up. Show a short consent line under the footer form; the wording is **[OWNER][LEGAL]**.
2. Generate an unsubscribe link per subscriber: `https://<api>/api/unsubscribe?e=<email>&t=<HMAC-SHA256(email, UNSUBSCRIBE_SECRET)>`. This needs a new environment secret, `UNSUBSCRIBE_SECRET`, on Render **[OWNER]**.
3. `GET` shows a confirmation page and `POST` performs the action. This protects against link-prefetching scanners.
4. On unsubscribe, either delete the record, or keep a suppression entry (hashed email) so the address is not re-added. Which one is a **[LEGAL]** decision.
5. Every newsletter email must carry the link. No newsletter sending exists in code today; only staff notices are sent.

## 4. DRAFT privacy notice (structure and factual content only)

> Bracketed items are placeholders for owner/legal input and must not be published as-is.

**Who we are.**
- Controller: [legal name — registry C1 pending].
- Contact for privacy matters: [email — registry C5 pending].
- [Postal address — registry C7 pending].
- [ODPC registration number, if registration applies — LEGAL].

**What we collect and why.**
- When you request a quote, contact us or book a visit, we collect your name, email address, phone number and the details you type (county, area, product interest, message or preferred date and time). We use them to respond to your enquiry. [Lawful basis — LEGAL]
- When you subscribe, we collect your email address to send you [describe content — OWNER]. [Lawful basis / consent — LEGAL]

**Who receives it.**
- Our staff receive your enquiry by email.
- We use service providers for hosting and email: MongoDB Atlas, Render, Resend and Vercel. [Confirm list — OWNER]

**Where it is stored.** Outside Kenya, in the EU and the US. [Safeguards — LEGAL]

**How long we keep it.** [Periods per data type — OWNER/LEGAL]

**Your rights.** [Rights under the Kenya Data Protection Act, 2019 and how to exercise them — LEGAL]

**Cookies and similar technologies.** See below.

## 5. DRAFT cookie disclosure (matches the candidate's actual behaviour)

| Name | Set by | Purpose | When | Duration |
|---|---|---|---|---|
| `jolu-consent-v1` (localStorage, not a cookie) | This website | Remembers your analytics choice | Only after you choose, and only when analytics is enabled on the site | Until you clear site data |
| `_ga`, `_ga_<ID>` | Google Analytics (first-party cookie) | Distinguish visitors and sessions for usage statistics | **Only after you click "Accept analytics"**; removed when you withdraw | Set by Google (currently up to 2 years per Google's documentation; verify at publication) |
| YouTube / Google Maps cookies | Google (third party) | Video playback / map display | Only after you click to play a video or show a map | Set by Google |
| Google Drive cookies | Google (third party) | Plays the customer testimonial and event videos on the News page (Drive player) | Only after you open a video dialog | Set by Google |

If analytics is enabled, Google Analytics receives the page path (no query string or fragment), page title, device and
browser information and the visitor's IP address (used by Google for approximate location).

The website uses no advertising cookies. Advertising storage, ad personalisation and Google signals are switched off in
the analytics configuration. You can change your analytics choice at any time with "Cookie settings" in the footer. That
control appears only when analytics is enabled.

## 6. Matters requiring owner or legal decision (no assurances given)

1. Whether the GA4 property `G-R80L7FBXQS` is owned and controlled by JOLU, and whether to use it (O-4). Until then `VITE_GA_MEASUREMENT_ID` stays unset.
   **Prerequisite before setting the ID [OWNER]:** in GA Admin → Data streams → Enhanced measurement, turn off "Page changes based on browser history events", "Site search" and "Form interactions" (and review "Outbound clicks"). Enhanced measurement runs inside gtag.js independently of this site's code and can send the full page URL, query terms and link URLs, which would bypass the site's URL clean-up. Google signals and ads personalisation must also stay off in the property.
2. Lawful basis for each processing purpose, including analytics consent and newsletter direct-marketing consent.
3. Whether JOLU must register with the Office of the Data Protection Commissioner as controller and/or processor.
4. Cross-border transfer basis and safeguards (EU, US).
5. Retention periods, deletion routine and data-subject request handling.
6. Controller identity, privacy contact and address (registry items C1, C5, C7).
7. Newsletter consent wording and the unsubscribe design (section 3).
8. Whether the customer-testimonial videos on the News page (Google Drive) have recorded consent. Related: one entry uses the placeholder `FILE_ID_CAROLINE_VIDEO`. This belongs to the claims lane.

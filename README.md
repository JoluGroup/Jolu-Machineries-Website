# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/d51df4e8-9cf2-48a4-871e-367dacc1a4a7

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/d51df4e8-9cf2-48a4-871e-367dacc1a4a7) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

### Backend Setup

The backend server requires environment variables to run correctly.

1.  Navigate to the `server` directory:
    ```sh
    cd server
    ```
2.  Create a `.env` file by copying the example file:
    ```sh
    cp .env.example .env
    ```
3.  Open the `.env` file and fill in the required values for MongoDB, Resend and the allowed origins (see `.env.example`).


**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

This project is configured for deployment on Render.

### Render Deployment (API only)

The website is hosted on Vercel. Render hosts **only** the Express API in `server/` (Node 20).
The `render.yaml` Blueprint defines that single web service; it contains no secrets.

1.  Settings: root directory `server`, build `npm ci`, start `npm start`, health check `/api/health` (readiness: `/api/ready`).
2.  Set these environment variables in the Render dashboard (names only here):
    *   `MONGO_URI`, `MONGO_DB_NAME` (MongoDB Atlas)
    *   `RESEND_API_KEY`, `EMAIL_FROM` (an address on a Resend-verified domain), `EMAIL_TO`
    *   `ALLOWED_ORIGINS` (comma-separated exact origins that may call the API; `*` matches one DNS label)
    *   `NODE_ENV=production`
3.  In production the server refuses to start and prints which variable names are missing.
4.  Point the website at the API by setting `VITE_API_BASE` (absolute `https://` URL, no trailing slash) in the Vercel project, then redeploy.

### Reliability behavior (what is and is not guaranteed)

*   **Records first.** Every enquiry is stored before any email is attempted. If email fails the record is kept and the customer gets an honest error (502), never a success message.
*   **Notification claim.** A record is claimed for sending with one atomic database update that also takes a 60-second lease, so concurrent requests, retries, restarts and multiple processes cannot send for the same record at the same time.
*   **Provider idempotency.** Every send carries a stable Resend `Idempotency-Key` (`<collection>-<record id>`) with an identical payload. A retry after a timeout or network error therefore does not create a second email **while Resend honors the key (24 hours at the time of writing)**. This is **not** an exactly-once guarantee: "accepted by Resend" is also not "delivered to the inbox".
*   **Statuses.** `sent` (Resend accepted), `failed` (Resend definitively refused: 4xx), `unknown` (timeout / network error / 5xx / 429: may have been accepted), `sending` (leased).
*   **Recovery sweep.** Every 5 minutes (first run 30 s after boot) the API re-claims records that are `failed`, `unknown` or stranded in `sending` after a crash or redeploy. It is bounded: at most 5 per collection per run, exponential backoff (1 min doubling to 1 h), at most 6 attempts, and only records younger than 24 h. Anything beyond those limits stays stored and is logged as `notification.needs_manual_review` (a count, no customer data). Safe with several processes because of the lease. While the free Render instance is asleep nothing runs; recovery resumes when it wakes.
*   **Quotation deduplication.** An identical enquiry (email, phone digits, name, county, area, product interest, message) repeated within 10 minutes of the moment its email was **accepted** returns the existing record (`200`, `duplicate: true`) instead of creating another; after that the same enquiry is a new quote. An unsent record is always reused by an identical retry, whatever its age. Different county, area or message is a different enquiry. This is enforced by a unique partial index (`quotes_active_fingerprint`), not by timing. **Quotes are refused with 503 while that index does not exist** (for example for the first seconds after boot, or if index creation keeps failing), so duplicate protection can never be silently missing. Contact and schedule submissions have no deduplication: a double submit creates two records.
*   **Known limits.** (1) Customer retries are not capped by the sweep's attempt/age limits (they are bounded only by the rate limiter); a customer retry more than 24 h after the first attempt can send a second email if the first had actually been accepted, because Resend's key has expired. (2) Leases use each process's own clock; clock skew or a send still in flight when its 60 s lease expires could allow a second claim, which only the provider's idempotency key then prevents. (3) The provider call is not aborted on timeout. (4) Records that hit the attempt or age cap are only logged (`notification.needs_manual_review`), there is no alert yet. (5) If an earlier build (commit `3a58e14`) was ever started against a database, it created a unique index `fingerprint_1_windowKey_1` on `quotes`; drop it manually (`db.quotes.dropIndex("fingerprint_1_windowKey_1")`) before running this version, because it would reject a second identical enquiry after the window.
*   **Readiness.** `/api/ready` checks valid configuration, a MongoDB `ping` (cached 10 s), the required quotes index, and that the email provider is *configured*. It does **not** call Resend: key validity, reachability and sender-domain verification are only discovered by an actual send.
*   **Startup.** The API keeps retrying the database connection (capped backoff) instead of crash-looping, and an index failure never stops it: it is logged and reported by `/api/ready`.
*   **Subscribers index.** The unique `email` index on `subscribers` is best effort. If legacy data contains exact duplicate emails it cannot be built; the API still works. To inspect the data read-only, run `MONGO_URI=... MONGO_DB_NAME=... node scripts/audit-subscribers.js` from `server/` (prints duplicate groups, changes nothing; the output contains addresses, keep it private). Resolve duplicates deliberately (keep the oldest record, remove or merge the others after review) and restart; the API retries index creation for about 10 minutes after boot.
*   **Shutdown.** SIGTERM stops new connections, lets in-flight requests (including an email send) finish, closes the database client, then exits (10 s hard deadline).
*   **Tests.** `cd server && npm test` (mocked database and mailer; no network, no real email).

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)

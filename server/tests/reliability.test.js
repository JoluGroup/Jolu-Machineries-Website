// Reliability tests for the independent review findings H1-H4 and the supporting corrections.
// Isolated: fake database, fake mailer, controllable clock. No network, no real email.
const test = require("node:test");
const assert = require("node:assert/strict");
const http = require("node:http");
const { DEDUPE_WINDOW_MS, fingerprintOf } = require("../app");
const { LEASE_MS, MAX_ATTEMPTS, MAX_AGE_MS } = require("../notifier");
const { ensureIndexes, auditSubscribers } = require("../indexes");
const { createShutdown } = require("../shutdown");
const { oneLine } = require("../messages");
const { FORM, fakeDb, fakeMailer, makeClock, recordingLogger, silent, start } = require("./helpers");

const MIN = 60 * 1000;
const ok = (r) => r.status === 201;

// ---------------------------------------------------------------- H1: duplicate email prevention
test("H1: concurrent retries after a failed send claim the record atomically - exactly ONE email", async () => {
  const mailer = fakeMailer("rejected"); const s = await start({ mailer });
  assert.equal((await s.post("/api/quotes", FORM)).status, 502);
  mailer.behaviour = "ok"; mailer.delayMs = 40; // keep the first claimant's send in flight while the others arrive
  const before = mailer.sent.length;
  const rs = await Promise.all([1, 2, 3, 4].map(() => s.post("/api/quotes", FORM)));
  const statuses = rs.map((r) => r.status).sort();
  assert.deepEqual(statuses, [201, 409, 409, 409], "one winner, the rest told it is in progress");
  assert.equal(mailer.sent.length - before, 1, "exactly one additional email");
  assert.equal(s.db.store.quotes.rows.length, 1); assert.equal(s.db.store.quotes.rows[0].emailStatus, "sent");
  s.close();
});

test("H1: concurrent identical FRESH submissions create one record and one email", async () => {
  const mailer = fakeMailer("ok", { delayMs: 40 }); const s = await start({ mailer });
  const rs = await Promise.all([1, 2, 3, 4, 5].map(() => s.post("/api/quotes", FORM)));
  assert.equal(rs.filter(ok).length, 1); assert.equal(rs.filter((r) => r.status === 409).length, 4);
  assert.equal(mailer.sent.length, 1); assert.equal(s.db.store.quotes.rows.length, 1);
  s.close();
});

test("H1: an AMBIGUOUS timeout is recorded as 'unknown' (not 'failed') and the retry reuses the same idempotency key and payload", async () => {
  const mailer = fakeMailer("timeout"); const s = await start({ mailer });
  assert.equal((await s.post("/api/quotes", FORM)).status, 502);
  const row = s.db.store.quotes.rows[0];
  assert.equal(row.emailStatus, "unknown"); assert.equal(row.emailFailureKind, "timeout");
  mailer.behaviour = "ok";
  assert.equal((await s.post("/api/quotes", FORM)).status, 201);
  assert.equal(mailer.sent.length, 2);
  assert.equal(mailer.sent[0].idempotencyKey, mailer.sent[1].idempotencyKey, "same logical notification, same key");
  assert.equal(mailer.sent[0].idempotencyKey, `quotes-${row._id}`);
  assert.equal(mailer.sent[0].subject, mailer.sent[1].subject); assert.equal(mailer.sent[0].text, mailer.sent[1].text);
  s.close();
});

test("H1: a DEFINITIVE rejection is recorded as 'failed'", async () => {
  const s = await start({ mailer: fakeMailer("rejected") });
  await s.post("/api/quotes", FORM);
  assert.equal(s.db.store.quotes.rows[0].emailStatus, "failed"); s.close();
});

// ---------------------------------------------------------------- H2: stranded quotations
test("H2: a record stranded 'sending' (process died mid-send) is recovered once the lease expires, exactly once", async () => {
  const clock = makeClock(); const mailer = fakeMailer("ok");
  const created = new Date(clock.t - 5 * MIN);
  const db = fakeDb({ quotes: [{ ...FORM, fingerprint: "x", dedupeActive: true, createdAt: created, emailStatus: "sending", emailAttempts: 1, leaseOwner: "dead", leaseUntil: new Date(clock.t + LEASE_MS) }] });
  const s = await start({ db, mailer, clock });
  assert.deepEqual(await s.app.recover(), { claimed: 0, sent: 0, failed: 0 }, "live lease: not touched");
  assert.equal(mailer.sent.length, 0);
  clock.advance(LEASE_MS + 1000);
  const summary = await s.app.recover();
  assert.equal(summary.sent, 1); assert.equal(mailer.sent.length, 1);
  assert.equal(db.store.quotes.rows[0].emailStatus, "sent");
  assert.deepEqual(await s.app.recover(), { claimed: 0, sent: 0, failed: 0 }, "nothing left to do");
  assert.equal(mailer.sent.length, 1);
  s.close();
});

test("H2: several recovery workers (processes) racing for the same stranded record send once", async () => {
  const clock = makeClock(); const mailer = fakeMailer("ok", { delayMs: 30 });
  const db = fakeDb({ quotes: [{ ...FORM, fingerprint: "x", dedupeActive: true, createdAt: new Date(clock.t - MIN), emailStatus: "sending", emailAttempts: 1, leaseOwner: "dead", leaseUntil: new Date(clock.t - 1000) }] });
  const s = await start({ db, mailer, clock });
  await Promise.all([s.app.recover(), s.app.recover(), s.app.recover()]);
  assert.equal(mailer.sent.length, 1); s.close();
});

test("H2: when the email WAS accepted but recording it failed, recovery re-sends with the SAME idempotency key", async () => {
  const clock = makeClock(); const mailer = fakeMailer("ok"); const db = fakeDb();
  const s = await start({ db, mailer, clock });
  db.flags.failUpdateOnce = true; // the post-send status update fails once
  assert.equal((await s.post("/api/quotes", FORM)).status, 201, "the email was accepted, the customer is told so");
  assert.equal(db.store.quotes.rows[0].emailStatus, "sending", "status could not be recorded");
  clock.advance(LEASE_MS + 1000);
  await s.app.recover();
  assert.equal(mailer.sent.length, 2); assert.equal(mailer.sent[0].idempotencyKey, mailer.sent[1].idempotencyKey);
  assert.equal(db.store.quotes.rows[0].emailStatus, "sent");
  s.close();
});

test("H2: a live lease returns 409 and sends nothing (the old orphan case now recovers instead of stranding)", async () => {
  const clock = makeClock(); const mailer = fakeMailer("ok");
  const db = fakeDb();
  const s = await start({ db, mailer, clock });
  const { fingerprintOf: fp } = require("../app");
  db.store.quotes ||= { rows: [], indexes: [] };
  db.store.quotes.rows.push({ _id: 99, ...FORM, fingerprint: fp(FORM), dedupeActive: true, createdAt: new Date(clock.t), emailStatus: "sending", emailAttempts: 1, leaseOwner: "w", leaseUntil: new Date(clock.t + LEASE_MS) });
  assert.equal((await s.post("/api/quotes", FORM)).status, 409); assert.equal(mailer.sent.length, 0);
  clock.advance(LEASE_MS + 1000); // the worker never finished
  assert.equal((await s.post("/api/quotes", FORM)).status, 201, "the customer's retry takes over the stranded record");
  assert.equal(db.store.quotes.rows.length, 1); s.close();
});

test("H2: the sweep is bounded - backoff, attempt cap, age cap, per-run limit; capped records are reported, never looped", async () => {
  const clock = makeClock(); const mailer = fakeMailer("rejected"); const log = recordingLogger();
  const base = (extra) => ({ ...FORM, fingerprint: String(Math.random()), dedupeActive: true, createdAt: new Date(clock.t - MIN), emailStatus: "failed", emailAttempts: 1, leaseUntil: new Date(0), ...extra });
  const db = fakeDb({ quotes: [
    base({}),                                                                   // eligible
    base({ nextAttemptAt: new Date(clock.t + 30 * MIN) }),                      // still backing off
    base({ emailAttempts: MAX_ATTEMPTS }),                                      // attempt cap
    base({ createdAt: new Date(clock.t - MAX_AGE_MS - MIN) }),                  // too old for the idempotency window
  ] });
  const s = await start({ db, mailer, clock, logger: log });
  const first = await s.app.recover();
  assert.equal(first.claimed, 1); assert.equal(mailer.sent.length, 1);
  assert.equal(await s.app.recover().then((r) => r.claimed), 0, "the failed record is now backing off");
  assert.ok(log.events.some((e) => e.event === "notification.needs_manual_review" && e.count >= 2), "capped records are surfaced");
  // per-run limit
  const many = fakeDb({ quotes: Array.from({ length: 12 }, (_, i) => base({ fingerprint: `f${i}` })) });
  const s2 = await start({ db: many, mailer: fakeMailer("ok"), clock });
  assert.equal((await s2.app.recover({ limit: 5 })).claimed, 5, "no notification storm: at most 5 per collection per run");
  s.close(); s2.close();
});

test("H2: contact and schedule records are recovered too", async () => {
  const clock = makeClock(); const mailer = fakeMailer("ok");
  const db = fakeDb({
    contacts: [{ ...FORM, createdAt: new Date(clock.t - MIN), emailStatus: "unknown", emailAttempts: 1, leaseUntil: new Date(0) }],
    schedules: [{ name: "Test Buyer", email: "b@example.test", phone: "0700000000", preferredDate: "2026-12-01", preferredTime: "10:00", product: "Tractor", createdAt: new Date(clock.t - MIN), emailStatus: "failed", emailAttempts: 1, leaseUntil: new Date(0) }],
  });
  const s = await start({ db, mailer, clock });
  assert.equal((await s.app.recover()).sent, 2);
  assert.deepEqual(mailer.sent.map((m) => m.idempotencyKey).sort(), ["contacts-1", "schedules-2"]); s.close();
});

// ---------------------------------------------------------------- H3: deduplication correctness
test("H3: requests either side of the OLD bucket boundary are still duplicates (rolling window)", async () => {
  const clock = makeClock(Math.ceil(Date.UTC(2026, 0, 1, 12, 0, 0) / DEDUPE_WINDOW_MS) * DEDUPE_WINDOW_MS - 1000); // 1 s before a bucket edge
  const s = await start({ clock });
  assert.equal((await s.post("/api/quotes", FORM)).status, 201);
  clock.advance(2000); // crosses the edge
  const second = await s.post("/api/quotes", FORM);
  assert.equal(second.status, 200); assert.equal(second.json.duplicate, true);
  assert.equal(s.mailer.sent.length, 1); assert.equal(s.db.store.quotes.rows.length, 1);
  s.close();
});

test("H3: the window is a true 10 minutes from the accepted enquiry; after it the same enquiry is accepted again", async () => {
  const clock = makeClock(); const s = await start({ clock });
  assert.equal((await s.post("/api/quotes", FORM)).status, 201);
  clock.advance(DEDUPE_WINDOW_MS - 1000);
  assert.equal((await s.post("/api/quotes", FORM)).status, 200, "9m59s: duplicate");
  clock.advance(2000);
  assert.equal((await s.post("/api/quotes", FORM)).status, 201, "10m01s: a genuinely new enquiry");
  assert.equal(s.mailer.sent.length, 2); assert.equal(s.db.store.quotes.rows.length, 2);
  assert.equal(s.db.store.quotes.rows.filter((r) => r.dedupeActive).length, 1, "only the newest stays active");
  s.close();
});

test("H3: county and area are part of the fingerprint - a different location is NOT discarded", async () => {
  assert.notEqual(fingerprintOf(FORM), fingerprintOf({ ...FORM, county: "Kiambu" }));
  assert.notEqual(fingerprintOf(FORM), fingerprintOf({ ...FORM, area: "Molo" }));
  assert.equal(fingerprintOf(FORM), fingerprintOf({ ...FORM, name: "  TEST BUYER ", email: "BUYER@example.test", phone: "0700 000 000" }), "cosmetic differences do not defeat deduplication");
  const s = await start();
  assert.equal((await s.post("/api/quotes", FORM)).status, 201);
  assert.equal((await s.post("/api/quotes", { ...FORM, county: "Kiambu", area: "Ruiru" })).status, 201);
  assert.equal(s.mailer.sent.length, 2); assert.equal(s.db.store.quotes.rows.length, 2); s.close();
});

test("H3: legitimately distinct quotations are all kept", async () => {
  const s = await start();
  for (const m of ["Need a harvester quote for 40 acres", "Need a tractor quote for 40 acres", "Another buyer comment entirely"]) assert.equal((await s.post("/api/quotes", { ...FORM, message: m })).status, 201);
  assert.equal(s.db.store.quotes.rows.length, 3); s.close();
});

test("H3: after a FAILED notification, a retry reuses the unsent record even after the window - nothing is duplicated or lost", async () => {
  const clock = makeClock(); const mailer = fakeMailer("rejected"); const s = await start({ clock, mailer });
  assert.equal((await s.post("/api/quotes", FORM)).status, 502);
  clock.advance(DEDUPE_WINDOW_MS * 3);
  mailer.behaviour = "ok";
  assert.equal((await s.post("/api/quotes", FORM)).status, 201);
  assert.equal(s.db.store.quotes.rows.length, 1, "same record"); assert.equal(mailer.sent[0].idempotencyKey, mailer.sent[1].idempotencyKey);
  s.close();
});

// ---------------------------------------------------------------- H4: subscriber index safety
const legacySubscribers = [
  { email: "dup@example.test", createdAt: new Date(1) }, { email: "dup@example.test", createdAt: new Date(2) },
  { email: "Case@Example.test", createdAt: new Date(3) }, { email: "case@example.test", createdAt: new Date(4) },
  { email: "unique@example.test", createdAt: new Date(5) },
];

test("H4: exact duplicate legacy subscribers make the subscribers index fail - without throwing, and the quotes index is still built", async () => {
  const db = fakeDb({ subscribers: legacySubscribers.map((r) => ({ ...r })) }); const log = recordingLogger();
  const state = await ensureIndexes(db, log);
  assert.deepEqual(state, { quotes: true, subscribers: false });
  const ev = log.events.find((e) => e.event === "index.failed" && e.kind === "subscribers");
  assert.ok(ev); assert.equal(ev.count, 2, "two duplicate groups reported by count only");
  assert.doesNotMatch(JSON.stringify(log.events), /dup@example|case@example/, "no addresses in logs");
});

test("H4: the quotation API keeps working and stays ready while the subscribers index is broken", async () => {
  const db = fakeDb({ subscribers: legacySubscribers.map((r) => ({ ...r })) });
  const state = await ensureIndexes(db, silent);
  const s = await start({ db, skipIndexes: true, indexState: () => state });
  assert.equal((await s.post("/api/quotes", FORM)).status, 201);
  assert.equal((await s.get("/api/ready")).status, 200);
  s.close();
});

test("H4: a failed QUOTES index is reported by readiness (503) but does not crash anything", async () => {
  const db = fakeDb(); db.flags.failIndex.quotes = true;
  const state = await ensureIndexes(db, silent);
  assert.equal(state.quotes, false);
  const s = await start({ db, skipIndexes: true, indexState: () => state });
  const r = await s.get("/api/ready"); assert.equal(r.status, 503); assert.equal((await r.json()).checks.indexes, false);
  s.close();
});

test("H4: the audit is READ-ONLY - nothing is deleted, merged or overwritten - and finds exact and case-variant duplicates", async () => {
  const db = fakeDb({ subscribers: legacySubscribers.map((r) => ({ ...r })) });
  const snapshot = JSON.stringify(db.store.subscribers.rows);
  const report = await auditSubscribers(db.collection("subscribers"));
  assert.equal(report.total, 5); assert.equal(report.duplicateGroups, 2);
  const exact = report.duplicates.find((d) => d.email === "dup@example.test"); const variant = report.duplicates.find((d) => d.email === "case@example.test");
  assert.equal(exact.exactDuplicate, true); assert.equal(variant.exactDuplicate, false); assert.deepEqual(variant.caseVariants.sort(), ["Case@Example.test", "case@example.test"]);
  assert.equal(JSON.stringify(db.store.subscribers.rows), snapshot, "data untouched");
});

test("H4: case variants alone do NOT block the (case-sensitive) unique index; a clean collection indexes fine", async () => {
  const onlyVariants = fakeDb({ subscribers: [{ email: "A@x.test" }, { email: "a@x.test" }] });
  assert.equal((await ensureIndexes(onlyVariants, silent)).subscribers, true);
  assert.deepEqual(await ensureIndexes(fakeDb(), silent), { quotes: true, subscribers: true });
});

test("H4: subscribing keeps working with a legacy duplicate list (no crash, lowercase upsert)", async () => {
  const db = fakeDb({ subscribers: legacySubscribers.map((r) => ({ ...r })) });
  const state = await ensureIndexes(db, silent);
  const s = await start({ db, skipIndexes: true, indexState: () => state });
  assert.equal((await s.post("/api/subscribe", { email: "New@Example.test" })).status, 201);
  assert.equal((await s.post("/api/subscribe", { email: "unique@example.test" })).status, 200);
  s.close();
});

// ---------------------------------------------------------------- supporting corrections
test("readiness pings MongoDB, caches the result briefly, and reports a dead database", async () => {
  const clock = makeClock(); const db = fakeDb(); const s = await start({ db, clock });
  assert.equal((await s.get("/api/ready")).status, 200); assert.equal((await s.get("/api/ready")).status, 200);
  assert.equal(db.flags.pings, 1, "second probe served from the cache");
  db.flags.failPing = true;
  assert.equal((await s.get("/api/ready")).status, 200, "still cached");
  clock.advance(11 * 1000);
  const dead = await s.get("/api/ready"); assert.equal(dead.status, 503); assert.equal((await dead.json()).checks.database, false);
  assert.equal(db.flags.pings, 2);
  assert.equal((await s.get("/api/health")).status, 200, "liveness is independent of the database");
  db.flags.failPing = false; clock.advance(11 * 1000);
  assert.equal((await s.get("/api/ready")).status, 200, "recovers");
  s.close();
});

test("readiness does not hang when the database ping hangs", async () => {
  const db = fakeDb(); db.flags.hangPing = true; const s = await start({ db });
  const t0 = Date.now(); const r = await s.get("/api/ready");
  assert.equal(r.status, 503); assert.ok(Date.now() - t0 < 5000); s.close();
});

test("readiness reports configuration, database, indexes and email separately (email = configured, not probed)", async () => {
  const bad = await start({ env: { NODE_ENV: "production" }, db: null, mailer: { configured: false } });
  const r = await bad.get("/api/ready"); assert.equal(r.status, 503);
  assert.deepEqual((await r.json()).checks, { config: false, database: false, indexes: true, email: false }); bad.close();
});

test("centralized async error handling: a synchronous throw inside a handler is a safe 500 and the server keeps serving", async () => {
  const db = fakeDb(); const realCollection = db.collection.bind(db); let boom = true;
  db.collection = (n) => { if (boom) { boom = false; throw new TypeError("kaboom with secret detail"); } return realCollection(n); };
  const s = await start({ db, skipIndexes: true });
  const r = await s.post("/api/contact", FORM);
  assert.equal(r.status, 500); assert.equal(r.json.code, "server_error"); assert.doesNotMatch(JSON.stringify(r.json), /kaboom|secret/);
  assert.equal((await s.get("/api/health")).status, 200);
  s.close();
});

test("input limits: oversized fields are rejected with 400, normal long enquiries pass", async () => {
  const s = await start();
  for (const bad of [{ ...FORM, name: "x".repeat(101) }, { ...FORM, email: `${"a".repeat(250)}@example.test` }, { ...FORM, message: "m".repeat(5001) }, { ...FORM, phone: "1".repeat(31) }, { ...FORM, county: "c".repeat(101) }, { ...FORM, productInterest: "p".repeat(201) }]) assert.equal((await s.post("/api/quotes", bad)).status, 400);
  assert.equal((await s.post("/api/quotes", { ...FORM, message: "m".repeat(5000) })).status, 201);
  s.close();
});

test("control characters never reach an email subject (CRLF header-injection attempt)", async () => {
  const s = await start();
  const r = await s.post("/api/quotes", { ...FORM, name: "Bob\r\nBcc: evil@example.test", productInterest: "Tractors\u0000\u2028x" });
  assert.equal(r.status, 201);
  const subject = s.mailer.sent[0].subject;
  assert.doesNotMatch(subject, /[\u0000-\u001F\u007F\u2028\u2029]/); assert.match(subject, /Bob Bcc: evil@example\.test/);
  assert.equal(oneLine("a\r\nb\tc"), "a b c");
  const c = await s.post("/api/contact", { ...FORM, name: "Eve\nSubject: spoof" }); assert.equal(c.status, 201);
  assert.doesNotMatch(s.mailer.sent[1].subject, /[\r\n]/);
  s.close();
});

test("graceful shutdown: stops accepting connections, runs closers, exits 0, and only once", async () => {
  const server = http.createServer((_q, res) => res.end("ok")); await new Promise((r) => server.listen(0, "127.0.0.1", r));
  const calls = []; let exitCode;
  const done = new Promise((r) => { exitCode = r; });
  const shutdown = createShutdown({ server, logger: silent, closers: [() => calls.push("timers"), async () => calls.push("mongo")], exit: (c) => exitCode(c) });
  await shutdown("SIGTERM"); await shutdown("SIGTERM");
  assert.equal(await done, 0); assert.deepEqual(calls, ["timers", "mongo"]); assert.equal(server.listening, false);
});

test("graceful shutdown: a throwing closer does not block the others", async () => {
  const server = http.createServer(); await new Promise((r) => server.listen(0, "127.0.0.1", r));
  const calls = []; const done = new Promise((resolve) => {
    createShutdown({ server, logger: silent, closers: [() => { throw new Error("x"); }, () => calls.push("second")], exit: resolve })("SIGINT");
  });
  assert.equal(await done, 0); assert.deepEqual(calls, ["second"]);
});

test("obsolete files are gone and nothing references them", () => {
  const fs = require("node:fs"); const path = require("node:path");
  const root = path.join(__dirname, "..");
  assert.equal(fs.existsSync(path.join(root, "testMango.js")), false); assert.equal(fs.existsSync(path.join(root, "data")), false);
  for (const f of ["app.js", "index.js", "config.js", "mailer.js", "notifier.js", "indexes.js"]) assert.doesNotMatch(fs.readFileSync(path.join(root, f), "utf8"), /testMango|data\/(contacts|schedules)\.json/);
});

// ---------------------------------------------------------------- follow-up to the independent review (findings A, B, I)
test("review A: the window runs from ACCEPTANCE - a late-sent record still protects against an immediate resubmit", async () => {
  const clock = makeClock(); const mailer = fakeMailer("timeout"); const s = await start({ clock, mailer });
  assert.equal((await s.post("/api/quotes", FORM)).status, 502);
  clock.advance(12 * MIN); mailer.behaviour = "ok";
  assert.equal((await s.post("/api/quotes", FORM)).status, 201, "the customer's retry sends the same record");
  assert.equal((await s.post("/api/quotes", FORM)).status, 200, "an immediate resubmit is a duplicate, not a new quote");
  assert.equal(s.db.store.quotes.rows.length, 1); assert.equal(mailer.sent.length, 2); assert.equal(mailer.sent[0].idempotencyKey, mailer.sent[1].idempotencyKey);
  clock.advance(DEDUPE_WINDOW_MS + 1000);
  assert.equal((await s.post("/api/quotes", FORM)).status, 201, "ten minutes after acceptance it is a new enquiry again");
  s.close();
});

test("review A: a quote swept long after creation is also protected from an immediate resubmit", async () => {
  const clock = makeClock(); const mailer = fakeMailer("exception"); const s = await start({ clock, mailer });
  assert.equal((await s.post("/api/quotes", FORM)).status, 502);
  clock.advance(3 * 60 * MIN); mailer.behaviour = "ok";
  assert.equal((await s.app.recover()).sent, 1, "a 3 hour old record is within the 24 h sweep age cap");
  assert.equal((await s.post("/api/quotes", FORM)).status, 200); assert.equal(s.db.store.quotes.rows.length, 1);
  s.close();
});

test("review B: quotes are refused (503) while the quotes unique index is missing, so duplicates cannot slip through", async () => {
  const db = fakeDb(); db.flags.failIndex.quotes = true;
  const state = await ensureIndexes(db, silent); assert.equal(state.quotes, false);
  const s = await start({ db, skipIndexes: true, indexState: () => state });
  const rs = await Promise.all([1, 2, 3].map(() => s.post("/api/quotes", FORM)));
  assert.deepEqual(rs.map((r) => r.status), [503, 503, 503]); assert.equal(s.mailer.sent.length, 0); assert.equal((s.db.store.quotes || { rows: [] }).rows.length, 0);
  assert.equal((await s.post("/api/contact", FORM)).status, 201, "unrelated routes are not affected");
  state.quotes = true; // index built later (retry): accepted again
  assert.equal((await s.post("/api/quotes", FORM)).status, 201);
  s.close();
});

test("review I: a worker whose lease was taken over cannot overwrite the new owner's state on FAILURE, but a confirmed SENT always wins", async () => {
  const { createNotifier } = require("../notifier");
  const { builders } = require("../messages");
  const clock = makeClock();
  const mk = (behaviour) => { const db = fakeDb({ quotes: [{ ...FORM, createdAt: new Date(clock.t), emailStatus: "sending", emailAttempts: 2, leaseOwner: "B", leaseUntil: new Date(clock.t + LEASE_MS) }] }); const mailer = fakeMailer(behaviour); const n = createNotifier({ getDb: () => db, mailer, logger: silent, now: clock.now, builders }); return { db, n }; };
  const stale = (db) => ({ ...db.store.quotes.rows[0], leaseOwner: "A" }); // worker A thinks it still owns the record
  const f = mk("rejected"); await f.n.attempt(f.db.collection("quotes"), "quotes", stale(f.db), { requestId: "t", route: "t" });
  assert.equal(f.db.store.quotes.rows[0].emailStatus, "sending", "B's lease and state are untouched by A's failure");
  assert.equal(f.db.store.quotes.rows[0].leaseOwner, "B");
  const g = mk("ok"); await g.n.attempt(g.db.collection("quotes"), "quotes", stale(g.db), { requestId: "t", route: "t" });
  assert.equal(g.db.store.quotes.rows[0].emailStatus, "sent", "an accepted email is recorded even by a previous owner");
});

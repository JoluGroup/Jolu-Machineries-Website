// Express application factory. All external dependencies (database, mailer, config, logger) are injected,
// so the same code runs in production and in isolated tests with mocks.
const crypto = require("crypto");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const { z } = require("zod");
const { isOriginAllowed } = require("./config");
const { builders } = require("./messages");
const { createNotifier } = require("./notifier");

// --- Input validation: length limits, and control characters removed so nothing can break a subject line. ---
const stripLine = (s) => s.replace(/[\u0000-\u001F\u007F\u2028\u2029]+/g, " ");
const stripBlock = (s) => s.replace(/\r\n?/g, "\n").replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F\u2028\u2029]/g, "");
const line = (min, max) => z.string().transform(stripLine).pipe(z.string().trim().min(min).max(max));
const block = (min, max) => z.string().transform(stripBlock).pipe(z.string().trim().min(min).max(max));
const emailField = z.string().trim().max(254).email();

const contactSchema = z.object({
  name: line(2, 100), email: emailField, phone: line(7, 30), county: line(2, 100), area: line(2, 100),
  productInterest: line(0, 200).optional().nullable(), message: block(10, 5000),
});
const quoteSchema = contactSchema;
const scheduleSchema = z.object({
  name: line(2, 100), email: emailField, phone: line(7, 30), preferredDate: line(4, 40), preferredTime: line(2, 40),
  product: line(2, 200), notes: block(0, 2000).optional().nullable(),
});
const subscribeSchema = z.object({ email: emailField });

// Deduplication: an identical enquiry (same contact details, county, area, product and message) submitted again while the
// previous one is ACTIVE returns that record instead of creating another. A record stays active until it has been
// notified AND is older than the window, so a retry after a failed notification always reuses the unsent record.
const DEDUPE_WINDOW_MS = 10 * 60 * 1000;
const PING_TTL_MS = 10 * 1000;
const PING_TIMEOUT_MS = 3000;

const norm = (s) => String(s || "").trim().toLowerCase();
const fingerprintOf = (p) =>
  crypto.createHash("sha256").update(JSON.stringify([
    norm(p.email), String(p.phone || "").replace(/\D/g, ""), norm(p.name), norm(p.county), norm(p.area), String(p.message || "").trim(), norm(p.productInterest),
  ])).digest("hex");

function createApp({
  config, getDb, mailer, logger, now = () => Date.now(), submitLimit = { windowMs: 60 * 1000, max: 10 },
  getIndexState = () => ({ quotes: true, subscribers: true }),
}) {
  const app = express();
  app.set("trust proxy", 1);
  app.disable("x-powered-by");
  app.use(helmet());

  // --- CORS: explicit allowlist (ALLOWED_ORIGINS). CORS is a browser rule only, not authentication. ---
  app.use(cors({
    origin: (origin, cb) => cb(null, isOriginAllowed(config, origin)),
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
    credentials: false,
    maxAge: 600,
  }));
  // Server-side enforcement so a disallowed browser origin cannot trigger a state-changing request at all.
  app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (req.method !== "GET" && req.method !== "HEAD" && req.method !== "OPTIONS" && !isOriginAllowed(config, origin)) {
      logger.warn("origin.rejected", { route: req.path });
      return res.status(403).json({ ok: false, code: "origin_not_allowed", message: "This origin is not allowed." });
    }
    next();
  });

  app.use(express.json({ limit: "100kb" }));
  app.use(rateLimit({ windowMs: 60 * 1000, max: 60, standardHeaders: true, legacyHeaders: false }));
  const submitLimiter = rateLimit({ windowMs: submitLimit.windowMs, max: submitLimit.max, standardHeaders: true, legacyHeaders: false, message: { ok: false, code: "rate_limited", message: "Too many requests. Please wait a minute and try again." } });

  // Centralized async error handling: a rejected handler becomes a safe 500, never a dead process.
  const wrap = (fn) => (req, res, next) => Promise.resolve().then(() => fn(req, res, next)).catch(next);

  const notifier = createNotifier({ getDb, mailer, logger, now, builders });
  app.recover = (opts) => notifier.sweep(opts); // bounded recovery sweep, driven by the process entry point

  // --- Liveness and readiness ---
  // Readiness checks: configuration is valid, MongoDB answers a ping (cached briefly so probes cannot hammer it),
  // required indexes exist, and the email provider is CONFIGURED. Resend reachability, key validity and sender-domain
  // verification are deliberately not probed here (a probe would send traffic to the provider on every check).
  let ping = { at: -Infinity, ok: false };
  async function databaseAnswers() {
    const db = getDb();
    if (!db) return false;
    if (now() - ping.at < PING_TTL_MS) return ping.ok;
    let timer; let ok = false;
    try {
      await Promise.race([db.command({ ping: 1 }), new Promise((_, rej) => { timer = setTimeout(() => rej(new Error("ping timeout")), PING_TIMEOUT_MS); })]);
      ok = true;
    } catch { ok = false; } finally { clearTimeout(timer); }
    ping = { at: now(), ok };
    return ok;
  }
  async function readiness() {
    const checks = {
      config: !!config.valid,
      database: await databaseAnswers(),
      indexes: !!getIndexState().quotes,
      email: !!(mailer && mailer.configured),
    };
    return { ok: Object.values(checks).every(Boolean), checks };
  }
  app.get("/api/health", (_req, res) => res.json({ ok: true, timestamp: new Date().toISOString() }));
  app.get("/api/ready", wrap(async (_req, res) => { const r = await readiness(); res.status(r.ok ? 200 : 503).json(r); }));

  const unavailable = (res) => res.status(503).json({ ok: false, code: "service_unavailable", message: "The service is temporarily unavailable. Please try again shortly or contact us directly." });
  const validation = (res, err) => res.status(400).json({ ok: false, errors: err.flatten() });
  const requestId = () => crypto.randomUUID();
  const usable = (db) => !!(db && mailer && mailer.configured);
  const storageFailed = (res, rid) => res.status(503).json({ ok: false, code: "storage_failed", requestId: rid, message: "We could not save your request. Nothing was submitted, so it is safe to try again." });
  const inProgress = (res) => res.status(409).json({ ok: false, code: "in_progress", message: "This request is already being processed. Please wait a moment." });
  const emailFailed = (res, rid) => res.status(502).json({
    ok: false, code: "notification_failed", requestId: rid,
    message: "We saved your request but could not notify our team. Please try again in a few minutes or contact us directly.",
  });

  // --- Quotes ---
  // 1. Store (or find the active identical record) atomically: a unique partial index on the active fingerprint lets exactly
  //    one concurrent request create the record; the others receive it. 2. Only the request that holds the notification
  //    lease sends. Retries after a failed or ambiguous send claim the SAME record and reuse the same provider idempotency key.
  async function storeQuote(coll, p) {
    const fingerprint = fingerprintOf(p);
    for (let i = 0; i < 3; i++) {
      // Retire sent records whose window has passed so an identical new enquiry can be accepted again.
      await coll.updateMany({ fingerprint, dedupeActive: true, emailStatus: "sent", createdAt: { $lte: new Date(now() - DEDUPE_WINDOW_MS) } }, { $set: { dedupeActive: false } });
      const doc = { ...p, fingerprint, dedupeActive: true, createdAt: new Date(now()), ...notifier.initialClaim() };
      try {
        const r = await coll.insertOne(doc);
        return { doc: { ...doc, _id: r.insertedId }, isNew: true };
      } catch (e) {
        if (!(e && e.code === 11000)) throw e;
        const existing = await coll.findOne({ fingerprint, dedupeActive: true });
        if (existing) return { doc: existing, isNew: false };
        // The active record was retired between our insert and read: loop and try again.
      }
    }
    throw new Error("dedupe_contention");
  }

  app.post("/api/quotes", submitLimiter, wrap(async (req, res) => {
    const rid = requestId();
    const parsed = quoteSchema.safeParse(req.body);
    if (!parsed.success) return validation(res, parsed.error);
    const db = getDb();
    if (!usable(db)) return unavailable(res);
    const coll = db.collection("quotes");
    let stored;
    try { stored = await storeQuote(coll, parsed.data); }
    catch { logger.error("quote.store_failed", { requestId: rid, route: "/api/quotes" }); return storageFailed(res, rid); }

    let doc = stored.doc;
    if (!stored.isNew) {
      if (doc.emailStatus === "sent") return res.status(200).json({ ok: true, duplicate: true, message: "Your request has already been received." });
      let claimed;
      try { claimed = await notifier.claimById(coll, doc._id); }
      catch { logger.error("quote.claim_failed", { requestId: rid, route: "/api/quotes" }); return storageFailed(res, rid); }
      if (!claimed) {
        // Another request or process holds the notification lease (or just finished it).
        let current = null;
        try { current = await coll.findOne({ _id: doc._id }); } catch { /* answer conservatively below */ }
        if (current && current.emailStatus === "sent") return res.status(200).json({ ok: true, duplicate: true, message: "Your request has already been received." });
        return inProgress(res);
      }
      doc = claimed;
    }
    const result = await notifier.attempt(coll, "quotes", doc, { requestId: rid, route: "/api/quotes" });
    if (!result.ok) return emailFailed(res, rid);
    return res.status(201).json({ ok: true, message: "Quote request received." });
  }));

  // --- Contact and schedule: stored with a notification lease, then notified; failures are reported honestly and the
  // record is picked up by the recovery sweep. ---
  const simpleRoute = (path, schema, collection) => app.post(path, submitLimiter, wrap(async (req, res) => {
    const rid = requestId();
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return validation(res, parsed.error);
    const db = getDb();
    if (!usable(db)) return unavailable(res);
    const coll = db.collection(collection);
    let doc;
    try {
      doc = { ...parsed.data, createdAt: new Date(now()), ...notifier.initialClaim() };
      const r = await coll.insertOne(doc);
      doc = { ...doc, _id: r.insertedId };
    } catch {
      logger.error("record.store_failed", { requestId: rid, route: path });
      return storageFailed(res, rid);
    }
    const result = await notifier.attempt(coll, collection, doc, { requestId: rid, route: path });
    if (!result.ok) return emailFailed(res, rid);
    return res.status(201).json({ ok: true, message: "Request received." });
  }));
  simpleRoute("/api/contact", contactSchema, "contacts");
  simpleRoute("/api/schedule", scheduleSchema, "schedules");

  // --- Subscribe: the subscription is the product. A staff notice is sent only for NEW subscribers and never delays the
  // response; its failure is logged. ---
  app.post("/api/subscribe", submitLimiter, wrap(async (req, res) => {
    const rid = requestId();
    const parsed = subscribeSchema.safeParse(req.body);
    if (!parsed.success) return validation(res, parsed.error);
    const db = getDb();
    if (!db) return unavailable(res);
    const email = parsed.data.email.toLowerCase();
    try {
      const r = await db.collection("subscribers").updateOne({ email }, { $setOnInsert: { email, createdAt: new Date(now()) } }, { upsert: true });
      const already = r.upsertedCount === 0;
      if (!already && mailer && mailer.configured) {
        Promise.resolve(mailer.send({ subject: `New newsletter subscriber: ${email}`, text: `A new subscriber signed up.\nEmail: ${email}` }))
          .then((result) => { if (!result.ok) logger.warn("subscribe.notice_not_accepted", { requestId: rid, kind: result.kind, name: result.name, status: result.status }); })
          .catch(() => logger.warn("subscribe.notice_failed", { requestId: rid }));
      }
      return res.status(already ? 200 : 201).json({ ok: true, status: already ? "already_subscribed" : "subscribed" });
    } catch (err) {
      if (err && err.code === 11000) return res.status(200).json({ ok: true, status: "already_subscribed" });
      logger.error("subscribe.failed", { requestId: rid, route: "/api/subscribe" });
      return res.status(500).json({ ok: false, code: "server_error", message: "Server error" });
    }
  }));

  app.get("/", (_req, res) => res.type("text").send("JOLU Machinery API. Health: /api/health, readiness: /api/ready"));

  // JSON parse errors and anything unexpected: safe, generic responses (no stack traces, no input echoed).
  app.use((err, _req, res, _next) => {
    if (err && err.type === "entity.parse.failed") return res.status(400).json({ ok: false, code: "invalid_json", message: "Invalid request body." });
    if (err && err.type === "entity.too.large") return res.status(413).json({ ok: false, code: "payload_too_large", message: "Request is too large." });
    logger.error("unhandled", { code: err && err.code ? String(err.code) : undefined });
    res.status(500).json({ ok: false, code: "server_error", message: "Server error" });
  });

  return app;
}

module.exports = { createApp, quoteSchema, contactSchema, scheduleSchema, subscribeSchema, fingerprintOf, DEDUPE_WINDOW_MS };

// Express application factory. All external dependencies (database, mailer, config, logger) are injected,
// so the same code runs in production and in isolated tests with mocks.
const crypto = require("crypto");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const { z } = require("zod");
const { isOriginAllowed } = require("./config");

const t = (min) => z.string().trim().min(min);
const contactSchema = z.object({
  name: t(2), email: z.string().trim().email(), phone: t(7), county: t(2), area: t(2),
  productInterest: z.string().trim().optional().nullable(), message: t(10),
});
const quoteSchema = contactSchema;
const scheduleSchema = z.object({
  name: t(2), email: z.string().trim().email(), phone: t(7), preferredDate: t(4), preferredTime: t(2),
  product: t(2), notes: z.string().trim().optional().nullable(),
});
const subscribeSchema = z.object({ email: z.string().trim().email() });

const DEDUPE_WINDOW_MS = 10 * 60 * 1000;

const fingerprintOf = (p) =>
  crypto.createHash("sha256").update(JSON.stringify([
    p.email.toLowerCase(), p.phone.replace(/\D/g, ""), p.name.toLowerCase(), p.message, (p.productInterest || "").toLowerCase(),
  ])).digest("hex");

function createApp({ config, getDb, mailer, logger, now = () => Date.now(), submitLimit = { windowMs: 60 * 1000, max: 10 } }) {
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

  const ready = () => ({ config: config.valid, database: !!getDb(), email: !!(mailer && mailer.configured) });
  const isReady = () => Object.values(ready()).every(Boolean);

  // --- Health (liveness, always 200 while the process is up) and readiness (503 until dependencies are usable) ---
  app.get("/api/health", (_req, res) => res.json({ ok: true, ready: isReady(), checks: ready(), timestamp: new Date().toISOString() }));
  app.get("/api/ready", (_req, res) => res.status(isReady() ? 200 : 503).json({ ok: isReady(), checks: ready() }));

  const unavailable = (res) => res.status(503).json({ ok: false, code: "service_unavailable", message: "The service is temporarily unavailable. Please try again shortly or contact us directly." });
  const validation = (res, err) => res.status(400).json({ ok: false, errors: err.flatten() });
  const requestId = () => crypto.randomUUID();

  async function notify(coll, id, rid, route, message) {
    const result = await mailer.send(message);
    const set = result.ok
      ? { emailStatus: "sent", emailAcceptedAt: new Date(now()), emailProviderId: result.id }
      : { emailStatus: "failed", emailFailedAt: new Date(now()), emailFailureKind: result.kind };
    try { await coll.updateOne({ _id: id }, { $set: set, $inc: { emailAttempts: 1 } }); }
    catch { logger.error("record.update_failed", { requestId: rid, route }); }
    if (!result.ok) logger.error("email.not_accepted", { requestId: rid, route, kind: result.kind, name: result.name, status: result.status });
    return result;
  }

  const emailFailed = (res, rid) => res.status(502).json({
    ok: false, code: "notification_failed", requestId: rid,
    message: "We saved your request but could not notify our team. Please try again in a few minutes or contact us directly.",
  });

  // --- Quotes: idempotent within a 10-minute window; the record is kept if email fails; retries never duplicate. ---
  app.post("/api/quotes", submitLimiter, async (req, res) => {
    const rid = requestId();
    const parsed = quoteSchema.safeParse(req.body);
    if (!parsed.success) return validation(res, parsed.error);
    const db = getDb();
    if (!db || !mailer || !mailer.configured) return unavailable(res);
    const p = parsed.data;
    const coll = db.collection("quotes");
    const filter = { fingerprint: fingerprintOf(p), windowKey: Math.floor(now() / DEDUPE_WINDOW_MS) };
    const doc = { ...p, ...filter, createdAt: new Date(now()), emailStatus: "pending", emailAttempts: 0 };
    let r;
    try {
      const upsert = () => coll.findOneAndUpdate(filter, { $setOnInsert: doc }, { upsert: true, returnDocument: "after", includeResultMetadata: true });
      try { r = await upsert(); } catch (e) { if (e && e.code === 11000) r = await upsert(); else throw e; }
    } catch {
      logger.error("quote.store_failed", { requestId: rid, route: "/api/quotes" });
      return res.status(503).json({ ok: false, code: "storage_failed", requestId: rid, message: "We could not save your request. Nothing was submitted, so it is safe to try again." });
    }
    const saved = r.value;
    const isNew = !!(r.lastErrorObject && r.lastErrorObject.upserted);
    if (!isNew && saved.emailStatus === "sent") return res.status(200).json({ ok: true, duplicate: true, message: "Your request has already been received." });
    if (!isNew && saved.emailStatus === "pending") return res.status(409).json({ ok: false, code: "in_progress", message: "This request is already being processed. Please wait a moment." });
    const result = await notify(coll, saved._id, rid, "/api/quotes", {
      subject: `New Quote Request: ${p.name} (${p.productInterest || "General"})`,
      text: `Name: ${p.name}\nEmail: ${p.email}\nPhone: ${p.phone}\nCounty: ${p.county}\nArea: ${p.area}\nInterest: ${p.productInterest || "N/A"}\n\nMessage:\n${p.message}`,
    });
    if (!result.ok) return emailFailed(res, rid);
    return res.status(201).json({ ok: true, message: "Quote request received." });
  });

  // --- Contact and schedule: stored, then notified; email failure is reported honestly. ---
  const simpleRoute = (path, schema, collection, build) => app.post(path, submitLimiter, async (req, res) => {
    const rid = requestId();
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return validation(res, parsed.error);
    const db = getDb();
    if (!db || !mailer || !mailer.configured) return unavailable(res);
    const coll = db.collection(collection);
    let inserted;
    try { inserted = await coll.insertOne({ ...parsed.data, createdAt: new Date(now()), emailStatus: "pending", emailAttempts: 0 }); }
    catch {
      logger.error("record.store_failed", { requestId: rid, route: path });
      return res.status(503).json({ ok: false, code: "storage_failed", requestId: rid, message: "We could not save your request. Nothing was submitted, so it is safe to try again." });
    }
    const result = await notify(coll, inserted.insertedId, rid, path, build(parsed.data));
    if (!result.ok) return emailFailed(res, rid);
    return res.status(201).json({ ok: true, message: "Request received." });
  });
  simpleRoute("/api/contact", contactSchema, "contacts", (p) => ({
    subject: `New Contact: ${p.name} (${p.productInterest || "General"})`,
    text: `Name: ${p.name}\nEmail: ${p.email}\nPhone: ${p.phone}\nCounty: ${p.county}\nArea: ${p.area}\nInterest: ${p.productInterest || "N/A"}\nMessage:\n${p.message}`,
  }));
  simpleRoute("/api/schedule", scheduleSchema, "schedules", (p) => ({
    subject: `Demo Request: ${p.name} — ${p.product}`,
    text: `Name: ${p.name}\nEmail: ${p.email}\nPhone: ${p.phone}\nPreferred Date: ${p.preferredDate}\nPreferred Time: ${p.preferredTime}\nProduct: ${p.product}\nNotes:\n${p.notes || "N/A"}`,
  }));

  // --- Subscribe: the subscription is the product; the staff notification is best-effort and logged on failure. ---
  app.post("/api/subscribe", submitLimiter, async (req, res) => {
    const rid = requestId();
    const parsed = subscribeSchema.safeParse(req.body);
    if (!parsed.success) return validation(res, parsed.error);
    const db = getDb();
    if (!db) return unavailable(res);
    const email = parsed.data.email.toLowerCase();
    try {
      const r = await db.collection("subscribers").updateOne({ email }, { $setOnInsert: { email, createdAt: new Date(now()) } }, { upsert: true });
      const already = r.upsertedCount === 0;
      if (mailer && mailer.configured) {
        const result = await mailer.send({
          subject: already ? `Existing subscriber tried again: ${email}` : `New newsletter subscriber: ${email}`,
          text: already ? `The email ${email} attempted to subscribe again, but is already on the list.` : `A new subscriber signed up.\nEmail: ${email}`,
        });
        if (!result.ok) logger.warn("subscribe.notice_not_accepted", { requestId: rid, kind: result.kind, name: result.name, status: result.status });
      }
      return res.status(already ? 200 : 201).json({ ok: true, status: already ? "already_subscribed" : "subscribed" });
    } catch (err) {
      if (err && err.code === 11000) return res.status(200).json({ ok: true, status: "already_subscribed" });
      logger.error("subscribe.failed", { requestId: rid, route: "/api/subscribe" });
      return res.status(500).json({ ok: false, code: "server_error", message: "Server error" });
    }
  });

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

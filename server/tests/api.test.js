// Isolated backend tests: mocked database and mailer, no network, no real email, no real database.
const test = require("node:test");
const assert = require("node:assert/strict");
const { loadConfig, isOriginAllowed } = require("../config");
const { createApp } = require("../app");
const { createResendMailer, classify } = require("../mailer");
const { createLogger } = require("../logger");

const ENV = { NODE_ENV: "production", MONGO_URI: "mongodb://user:SECRETPASS@example.invalid/db", MONGO_DB_NAME: "jolu", RESEND_API_KEY: "re_SECRETKEY123", EMAIL_FROM: "noreply@example.test", EMAIL_TO: "sales@example.test", ALLOWED_ORIGINS: "https://www.jolumachineries.com,https://jolumachineries.com,https://jolu-machineries-website-*-jolu-group.vercel.app" };
const FORM = { name: "Test Buyer", email: "buyer@example.test", phone: "0700000000", county: "Nakuru", area: "Njoro", productInterest: "Tractors (100-150 HP)", message: "[Product: Zoomlion RN904/1104 Wheeled Tractor] mock test" };

// --- in-memory fake of the MongoDB calls the app uses ---
function fakeDb({ failStore = false, raceOnce = false } = {}) {
  const store = {}; let seq = 0; let raced = raceOnce;
  const coll = (name) => (store[name] ||= { rows: [] });
  return {
    store,
    collection(name) {
      const c = coll(name);
      return {
        async insertOne(d) { if (failStore) throw new Error("db down"); const _id = ++seq; c.rows.push({ _id, ...d }); return { insertedId: _id }; },
        async findOneAndUpdate(filter, update, opts) {
          if (failStore) throw new Error("db down");
          if (raced) { raced = false; const e = new Error("dup"); e.code = 11000; throw e; }
          let row = c.rows.find((r) => Object.entries(filter).every(([k, v]) => r[k] === v));
          let upserted = false;
          if (!row) { row = { _id: ++seq, ...update.$setOnInsert }; c.rows.push(row); upserted = true; }
          return { value: { ...row }, lastErrorObject: { upserted: upserted ? row._id : undefined } };
        },
        async updateOne(filter, update) {
          const row = c.rows.find((r) => Object.entries(filter).every(([k, v]) => r[k] === v));
          if (!row) { if (update.$setOnInsert) { c.rows.push({ _id: ++seq, ...update.$setOnInsert }); return { upsertedCount: 1 }; } return { upsertedCount: 0 }; }
          if (update.$set) Object.assign(row, update.$set);
          if (update.$inc) for (const [k, v] of Object.entries(update.$inc)) row[k] = (row[k] || 0) + v;
          return { upsertedCount: 0 };
        },
      };
    },
  };
}
const fakeMailer = (behaviour = "ok") => { const sent = []; return { configured: true, sent, async send(m) { sent.push(m); if (behaviour === "ok") return { ok: true, id: "msg_1" }; if (behaviour === "rejected") return { ok: false, kind: "rejected", name: "validation_error", status: 403 }; return { ok: false, kind: "exception", name: "TypeError" }; } }; };
const silent = { info() {}, warn() {}, error() {}, fatal() {} };

async function start({ env = ENV, db = fakeDb(), mailer = fakeMailer(), logger = silent, submitLimit } = {}) {
  const config = loadConfig(env);
  const app = createApp({ config, getDb: () => db, mailer, logger, submitLimit });
  const server = await new Promise((r) => { const s = app.listen(0, "127.0.0.1", () => r(s)); });
  const base = `http://127.0.0.1:${server.address().port}`;
  const post = async (path, body, origin) => { const r = await fetch(base + path, { method: "POST", headers: { "content-type": "application/json", ...(origin ? { origin } : {}) }, body: typeof body === "string" ? body : JSON.stringify(body) }); return { status: r.status, json: await r.json().catch(() => ({})), acao: r.headers.get("access-control-allow-origin") }; };
  return { base, post, db, mailer, close: () => server.close(), get: (p, h) => fetch(base + p, { headers: h }) };
}
const OK_ORIGIN = "https://www.jolumachineries.com";

test("valid quotation: stored, emailed with product context, 201 'received' (not 'delivered')", async () => {
  const s = await start();
  const r = await s.post("/api/quotes", FORM, OK_ORIGIN);
  assert.equal(r.status, 201); assert.equal(r.json.ok, true); assert.doesNotMatch(r.json.message, /deliver/i);
  assert.equal(s.mailer.sent.length, 1); assert.match(s.mailer.sent[0].subject, /Tractors \(100-150 HP\)/); assert.match(s.mailer.sent[0].text, /\[Product: Zoomlion RN904\/1104/);
  const row = s.db.store.quotes.rows[0]; assert.equal(row.emailStatus, "sent"); assert.equal(row.emailProviderId, "msg_1"); assert.equal(row.emailAttempts, 1);
  s.close();
});

test("invalid submissions return 400 with field names and store/send nothing", async () => {
  const s = await start();
  for (const bad of [{ ...FORM, email: "nope" }, { ...FORM, phone: "1" }, { ...FORM, message: "short" }, {}]) { const r = await s.post("/api/quotes", bad, OK_ORIGIN); assert.equal(r.status, 400); assert.ok(r.json.errors); }
  assert.equal(s.mailer.sent.length, 0); assert.equal((s.db.store.quotes || { rows: [] }).rows.length, 0);
  assert.equal((await s.post("/api/quotes", "{not json", OK_ORIGIN)).status, 400);
  s.close();
});

test("Resend RETURNED error: no success claim, record preserved, 502 with safe message", async () => {
  const s = await start({ mailer: fakeMailer("rejected") });
  const r = await s.post("/api/quotes", FORM, OK_ORIGIN);
  assert.equal(r.status, 502); assert.equal(r.json.ok, false); assert.equal(r.json.code, "notification_failed"); assert.doesNotMatch(JSON.stringify(r.json), /validation_error|403|resend/i);
  assert.equal(s.db.store.quotes.rows.length, 1); assert.equal(s.db.store.quotes.rows[0].emailStatus, "failed");
  s.close();
});

test("Resend THROWN exception (through the real mailer wrapper): same honest failure", async () => {
  const throwing = createResendMailer({ client: { emails: { send: async () => { throw new TypeError("network down"); } } }, from: "a@example.test", to: ["b@example.test"] });
  const s = await start({ mailer: throwing });
  const r = await s.post("/api/quotes", FORM, OK_ORIGIN);
  assert.equal(r.status, 502); assert.equal(s.db.store.quotes.rows[0].emailFailureKind, "exception");
  s.close();
});

test("mailer inspects the real Resend shapes: {error}, missing id, timeout", async () => {
  assert.deepEqual(classify({ data: { id: "x" }, error: null }), { ok: true, id: "x" });
  assert.equal(classify({ data: null, error: { name: "validation_error", statusCode: 403 } }).kind, "rejected");
  assert.equal(classify({ data: {}, error: null }).ok, false);
  assert.equal(classify(undefined).ok, false);
  const slow = createResendMailer({ client: { emails: { send: () => new Promise(() => {}) } }, from: "a@example.test", to: ["b@example.test"], timeoutMs: 20 });
  assert.equal((await slow.send({ subject: "s", text: "t" })).kind, "timeout");
});

test("retry after email failure re-sends on the SAME record (no duplicate); retry after success is a no-op", async () => {
  const mailer = fakeMailer("rejected"); const s = await start({ mailer });
  assert.equal((await s.post("/api/quotes", FORM, OK_ORIGIN)).status, 502);
  mailer.send = async (m) => { mailer.sent.push(m); return { ok: true, id: "msg_2" }; };
  const retry = await s.post("/api/quotes", FORM, OK_ORIGIN);
  assert.equal(retry.status, 201); assert.equal(s.db.store.quotes.rows.length, 1, "one record only"); assert.equal(s.db.store.quotes.rows[0].emailStatus, "sent"); assert.equal(s.db.store.quotes.rows[0].emailAttempts, 2);
  const again = await s.post("/api/quotes", FORM, OK_ORIGIN);
  assert.equal(again.status, 200); assert.equal(again.json.duplicate, true); assert.equal(mailer.sent.length, 2, "no third email");
  assert.equal(s.db.store.quotes.rows.length, 1);
  s.close();
});

test("a different enquiry is stored separately; a unique-index race is retried safely", async () => {
  const s = await start({ db: fakeDb({ raceOnce: true }) });
  assert.equal((await s.post("/api/quotes", FORM, OK_ORIGIN)).status, 201);
  assert.equal((await s.post("/api/quotes", { ...FORM, message: "A different enquiry about a harvester" }, OK_ORIGIN)).status, 201);
  assert.equal(s.db.store.quotes.rows.length, 2);
  s.close();
});

test("database failure: 503, nothing emailed, safe to retry", async () => {
  const s = await start({ db: fakeDb({ failStore: true }) });
  const r = await s.post("/api/quotes", FORM, OK_ORIGIN);
  assert.equal(r.status, 503); assert.equal(r.json.code, "storage_failed"); assert.equal(s.mailer.sent.length, 0);
  assert.equal((await s.post("/api/contact", { ...FORM }, OK_ORIGIN)).status, 503);
  s.close();
});

test("no database / no mailer configured: submissions get 503, never a fake success", async () => {
  const noDb = await start({ db: null }); assert.equal((await noDb.post("/api/quotes", FORM, OK_ORIGIN)).status, 503); noDb.close();
  const noMail = await start({ mailer: { configured: false, send: async () => ({ ok: false }) } }); assert.equal((await noMail.post("/api/quotes", FORM, OK_ORIGIN)).status, 503); noMail.close();
});

test("configuration validation: names only, never values; production requires all variables and an origin allowlist", () => {
  const empty = loadConfig({ NODE_ENV: "production" });
  assert.equal(empty.valid, false); assert.deepEqual(empty.missing, ["MONGO_URI", "MONGO_DB_NAME", "RESEND_API_KEY", "EMAIL_FROM", "EMAIL_TO"]); assert.ok(empty.problems.some((p) => /ALLOWED_ORIGINS/.test(p)));
  const noKey = loadConfig({ ...ENV, RESEND_API_KEY: "" }); assert.deepEqual(noKey.missing, ["RESEND_API_KEY"]);
  const bad = loadConfig({ ...ENV, EMAIL_FROM: "not-an-address", ALLOWED_ORIGINS: "https://ok.example, https://bad.example/path" });
  assert.equal(bad.valid, false);
  const text = JSON.stringify([empty, noKey, bad].map((c) => [c.missing, c.problems]));
  assert.doesNotMatch(text, /SECRETPASS|SECRETKEY|mongodb:\/\//);
  assert.equal(loadConfig(ENV).valid, true);
});

test("logger writes only whitelisted fields (no secrets, no customer data)", () => {
  const lines = []; const log = createLogger({ log: (l) => lines.push(l), warn: (l) => lines.push(l), error: (l) => lines.push(l) });
  log.error("x", { code: "E1", email: "buyer@example.test", body: { phone: "0700" }, apiKey: "re_SECRETKEY123", variables: ["RESEND_API_KEY"] });
  assert.doesNotMatch(lines.join(""), /buyer@|0700|SECRETKEY/); assert.match(lines[0], /RESEND_API_KEY/);
});

test("failure logs carry no customer details or secrets", async () => {
  const lines = []; const log = createLogger({ log: (l) => lines.push(l), warn: (l) => lines.push(l), error: (l) => lines.push(l) });
  const s = await start({ mailer: fakeMailer("rejected"), logger: log });
  await s.post("/api/quotes", FORM, OK_ORIGIN);
  assert.ok(lines.length > 0); assert.doesNotMatch(lines.join("\n"), /buyer@example|0700000000|Njoro|SECRET/);
  s.close();
});

test("CORS: configured production + preview origins pass; others get no CORS header and a 403 on writes", async () => {
  const s = await start();
  for (const o of [OK_ORIGIN, "https://jolumachineries.com", "https://jolu-machineries-website-8nih6qlfo-jolu-group.vercel.app"]) { const r = await s.post("/api/quotes", { ...FORM, message: `origin test ${o}` }, o); assert.equal(r.status, 201, o); assert.equal(r.acao, o); }
  for (const o of ["https://evil.example", "http://www.jolumachineries.com", "https://jolumachineries.com.evil.example", "https://jolu-machineries-website-x.y-jolu-group.vercel.app", "http://localhost:5173"]) { const r = await s.post("/api/quotes", FORM, o); assert.equal(r.status, 403, o); assert.equal(r.acao, null, o); }
  const pre = await fetch(s.base + "/api/quotes", { method: "OPTIONS", headers: { origin: "https://evil.example", "access-control-request-method": "POST" } });
  assert.equal(pre.headers.get("access-control-allow-origin"), null);
  const okPre = await fetch(s.base + "/api/quotes", { method: "OPTIONS", headers: { origin: OK_ORIGIN, "access-control-request-method": "POST", "access-control-request-headers": "content-type" } });
  assert.equal(okPre.headers.get("access-control-allow-origin"), OK_ORIGIN);
  assert.equal((await s.post("/api/quotes", { ...FORM, message: "no origin header (server to server)" })).status, 201);
  s.close();
});

test("CORS matcher details: localhost only outside production; wildcard matches one label only", () => {
  const prod = loadConfig(ENV), dev = loadConfig({ ...ENV, NODE_ENV: "development" });
  assert.equal(isOriginAllowed(prod, "http://localhost:5173"), false); assert.equal(isOriginAllowed(dev, "http://localhost:5173"), true);
  assert.equal(isOriginAllowed(prod, "https://jolu-machineries-website-abc123-jolu-group.vercel.app"), true);
  assert.equal(isOriginAllowed(prod, "https://jolu-machineries-website-a.b-jolu-group.vercel.app"), false);
});

test("health is liveness; readiness reflects configuration, database and email", async () => {
  const ok = await start(); const h = await (await ok.get("/api/health")).json(); assert.equal(h.ok, true); assert.equal(h.ready, true);
  assert.equal((await ok.get("/api/ready")).status, 200); ok.close();
  const bad = await start({ env: { NODE_ENV: "production" }, db: null, mailer: { configured: false } });
  const bh = await bad.get("/api/health"); assert.equal(bh.status, 200); const bj = await bh.json(); assert.equal(bj.ready, false); assert.deepEqual(bj.checks, { config: false, database: false, email: false });
  assert.equal((await bad.get("/api/ready")).status, 503); bad.close();
});

test("abuse protection: submission endpoints are rate limited", async () => {
  const s = await start({ submitLimit: { windowMs: 60000, max: 3 } });
  const codes = []; for (let i = 0; i < 5; i++) codes.push((await s.post("/api/quotes", { ...FORM, message: `rate limit probe number ${i}` }, OK_ORIGIN)).status);
  assert.deepEqual(codes, [201, 201, 201, 429, 429]); s.close();
});

test("contact and schedule report email failure honestly; subscribe succeeds even if the staff notice fails", async () => {
  const s = await start({ mailer: fakeMailer("rejected") });
  assert.equal((await s.post("/api/contact", FORM, OK_ORIGIN)).status, 502);
  assert.equal((await s.post("/api/schedule", { name: "Test Buyer", email: "buyer@example.test", phone: "0700000000", preferredDate: "2026-12-01", preferredTime: "10:00", product: "Tractor", notes: null }, OK_ORIGIN)).status, 502);
  const sub = await s.post("/api/subscribe", { email: "Reader@Example.test" }, OK_ORIGIN); assert.equal(sub.status, 201); assert.equal(sub.json.status, "subscribed");
  s.close();
});

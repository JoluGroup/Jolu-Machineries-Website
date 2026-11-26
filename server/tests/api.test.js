// Isolated backend tests: mocked database and mailer, no network, no real email, no real database.
const test = require("node:test");
const assert = require("node:assert/strict");
const { loadConfig, isOriginAllowed } = require("../config");
const { createResendMailer, classify } = require("../mailer");
const { createLogger } = require("../logger");
const { ENV, FORM, OK_ORIGIN, fakeDb, fakeMailer, start } = require("./helpers");

test("valid quotation: stored, emailed with product context, 201 'received' (not 'delivered')", async () => {
  const s = await start();
  const r = await s.post("/api/quotes", FORM);
  assert.equal(r.status, 201); assert.equal(r.json.ok, true); assert.doesNotMatch(r.json.message, /deliver/i);
  assert.equal(s.mailer.sent.length, 1); assert.match(s.mailer.sent[0].subject, /Tractors \(100-150 HP\)/); assert.match(s.mailer.sent[0].text, /\[Product: Zoomlion RN904\/1104/);
  const row = s.db.store.quotes.rows[0]; assert.equal(row.emailStatus, "sent"); assert.equal(row.emailProviderId, "msg_1"); assert.equal(row.emailAttempts, 1);
  s.close();
});

test("invalid submissions return 400 with field names and store/send nothing", async () => {
  const s = await start();
  for (const bad of [{ ...FORM, email: "nope" }, { ...FORM, phone: "1" }, { ...FORM, message: "short" }, {}]) { const r = await s.post("/api/quotes", bad); assert.equal(r.status, 400); assert.ok(r.json.errors); }
  assert.equal(s.mailer.sent.length, 0); assert.equal((s.db.store.quotes || { rows: [] }).rows.length, 0);
  assert.equal((await s.post("/api/quotes", "{not json")).status, 400);
  s.close();
});

test("Resend RETURNED error: no success claim, record preserved, 502 with safe message", async () => {
  const s = await start({ mailer: fakeMailer("rejected") });
  const r = await s.post("/api/quotes", FORM);
  assert.equal(r.status, 502); assert.equal(r.json.ok, false); assert.equal(r.json.code, "notification_failed");
  // requestId is a random UUID and may legitimately contain "403"; check it separately, then ensure no provider
  // detail (error name, status code, provider name) leaks anywhere else in the body.
  const { requestId, ...rest } = r.json;
  assert.match(requestId, /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
  assert.doesNotMatch(JSON.stringify(rest), /validation_error|403|resend/i);
  assert.equal(s.db.store.quotes.rows.length, 1); assert.equal(s.db.store.quotes.rows[0].emailStatus, "failed");
  s.close();
});

test("Resend THROWN exception (through the real mailer wrapper): honest failure, recorded as ambiguous 'unknown'", async () => {
  const throwing = createResendMailer({ client: { emails: { send: async () => { throw new TypeError("network down"); } } }, from: "a@example.test", to: ["b@example.test"] });
  const s = await start({ mailer: throwing });
  const r = await s.post("/api/quotes", FORM);
  assert.equal(r.status, 502); assert.equal(s.db.store.quotes.rows[0].emailFailureKind, "exception"); assert.equal(s.db.store.quotes.rows[0].emailStatus, "unknown");
  s.close();
});

test("mailer inspects real Resend shapes and separates definitive rejection from ambiguity", async () => {
  assert.deepEqual(classify({ data: { id: "x" }, error: null }), { ok: true, id: "x" });
  assert.equal(classify({ data: null, error: { name: "validation_error", statusCode: 403 } }).ambiguous, false);
  assert.equal(classify({ data: null, error: { name: "invalid_from_address", statusCode: 422 } }).ambiguous, false);
  for (const status of [409, 429, 500, 503, undefined]) assert.equal(classify({ data: null, error: { name: "x", statusCode: status } }).ambiguous, true, String(status));
  assert.equal(classify({ data: {}, error: null }).ok, false); assert.equal(classify({ data: {}, error: null }).ambiguous, true);
  assert.equal(classify(undefined).ok, false);
  const slow = createResendMailer({ client: { emails: { send: () => new Promise(() => {}) } }, from: "a@example.test", to: ["b@example.test"], timeoutMs: 20 });
  const t = await slow.send({ subject: "s", text: "t" });
  assert.equal(t.kind, "timeout"); assert.equal(t.ambiguous, true);
});

test("the Resend SDK installed here accepts an idempotency key, and the mailer passes it as the second argument", async () => {
  const calls = [];
  const m = createResendMailer({ client: { emails: { send: async (payload, options) => { calls.push({ payload, options }); return { data: { id: "id1" }, error: null }; } } }, from: "a@example.test", to: ["b@example.test"] });
  await m.send({ subject: "s", text: "t", idempotencyKey: "quotes-42" });
  assert.deepEqual(calls[0].options, { idempotencyKey: "quotes-42" });
  assert.deepEqual(Object.keys(calls[0].payload).sort(), ["from", "subject", "text", "to"]);
  const sdk = require("resend"); const src = require("fs").readFileSync(require.resolve("resend"), "utf8");
  assert.ok(typeof sdk.Resend === "function"); assert.match(src, /Idempotency-Key/);
});

test("retry after email failure re-sends on the SAME record (no duplicate); retry after success is a no-op", async () => {
  const mailer = fakeMailer("rejected"); const s = await start({ mailer });
  assert.equal((await s.post("/api/quotes", FORM)).status, 502);
  mailer.behaviour = "ok";
  const retry = await s.post("/api/quotes", FORM);
  assert.equal(retry.status, 201); assert.equal(s.db.store.quotes.rows.length, 1, "one record only"); assert.equal(s.db.store.quotes.rows[0].emailStatus, "sent"); assert.equal(s.db.store.quotes.rows[0].emailAttempts, 2);
  const again = await s.post("/api/quotes", FORM);
  assert.equal(again.status, 200); assert.equal(again.json.duplicate, true); assert.equal(mailer.sent.length, 2, "no third email");
  assert.equal(s.db.store.quotes.rows.length, 1);
  s.close();
});

test("a different enquiry is stored separately; a unique-index race is retried safely", async () => {
  const db = fakeDb(); db.flags.raceOnce = true;
  const s = await start({ db });
  assert.equal((await s.post("/api/quotes", FORM)).status, 201);
  assert.equal((await s.post("/api/quotes", { ...FORM, message: "A different enquiry about a harvester" })).status, 201);
  assert.equal(s.db.store.quotes.rows.length, 2);
  s.close();
});

test("database failure: 503, nothing emailed, safe to retry", async () => {
  const db = fakeDb(); db.flags.failStore = true;
  const s = await start({ db });
  const r = await s.post("/api/quotes", FORM);
  assert.equal(r.status, 503); assert.equal(r.json.code, "storage_failed"); assert.equal(s.mailer.sent.length, 0);
  assert.equal((await s.post("/api/contact", { ...FORM })).status, 503);
  s.close();
});

test("no database / no mailer configured: submissions get 503, never a fake success", async () => {
  const noDb = await start({ db: null }); assert.equal((await noDb.post("/api/quotes", FORM)).status, 503); noDb.close();
  const noMail = await start({ mailer: { configured: false, send: async () => ({ ok: false }) } }); assert.equal((await noMail.post("/api/quotes", FORM)).status, 503); noMail.close();
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
  await s.post("/api/quotes", FORM);
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
  assert.equal((await s.post("/api/quotes", { ...FORM, message: "no origin header (server to server)" }, null)).status, 201);
  s.close();
});

test("CORS matcher details: localhost only outside production; wildcard matches one label only", () => {
  const prod = loadConfig(ENV), dev = loadConfig({ ...ENV, NODE_ENV: "development" });
  assert.equal(isOriginAllowed(prod, "http://localhost:5173"), false); assert.equal(isOriginAllowed(dev, "http://localhost:5173"), true);
  assert.equal(isOriginAllowed(prod, "https://jolu-machineries-website-abc123-jolu-group.vercel.app"), true);
  assert.equal(isOriginAllowed(prod, "https://jolu-machineries-website-a.b-jolu-group.vercel.app"), false);
});

test("abuse protection: submission endpoints are rate limited", async () => {
  const s = await start({ submitLimit: { windowMs: 60000, max: 3 } });
  const codes = []; for (let i = 0; i < 5; i++) codes.push((await s.post("/api/quotes", { ...FORM, message: `rate limit probe number ${i}` })).status);
  assert.deepEqual(codes, [201, 201, 201, 429, 429]); s.close();
});

test("contact and schedule report email failure honestly; subscribe succeeds even if the staff notice fails", async () => {
  const s = await start({ mailer: fakeMailer("rejected") });
  assert.equal((await s.post("/api/contact", FORM)).status, 502);
  assert.equal((await s.post("/api/schedule", { name: "Test Buyer", email: "buyer@example.test", phone: "0700000000", preferredDate: "2026-12-01", preferredTime: "10:00", product: "Tractor", notes: null })).status, 502);
  const sub = await s.post("/api/subscribe", { email: "Reader@Example.test" }); assert.equal(sub.status, 201); assert.equal(sub.json.status, "subscribed");
  s.close();
});

test("subscribe: staff is notified for NEW subscribers only, repeats are quiet", async () => {
  const s = await start();
  assert.equal((await s.post("/api/subscribe", { email: "Reader@Example.test" })).status, 201);
  const again = await s.post("/api/subscribe", { email: "reader@example.test" });
  assert.equal(again.status, 200); assert.equal(again.json.status, "already_subscribed");
  assert.equal(s.mailer.sent.length, 1); assert.equal(s.db.store.subscribers.rows.length, 1);
  s.close();
});

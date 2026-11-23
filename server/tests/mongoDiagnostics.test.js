// MongoDB error diagnostics: classification is correct, network failures stay distinguishable, and nothing sensitive
// (message text, cause chain, URI, user name, password) can reach the logs. Real driver error classes are used where
// possible so the tests exercise the actual error shapes. No network except one local refused connection.
const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const { spawn } = require("node:child_process");
const { MongoServerError, MongoNetworkError, MongoServerSelectionError, MongoParseError, MongoAPIError } = require("mongodb");
const { classifyMongoError, CATEGORIES } = require("../mongoDiagnostics");
const { createLogger } = require("../logger");
const { ensureIndexes } = require("../indexes");
const { start } = require("./helpers");

const PASSWORD = "S3cretPassw0rd";
const USER = "jolu_machineries_app";
const URI = `mongodb+srv://${USER}:${PASSWORD}@jolu-websites.kjwfoym.mongodb.net/jolu_machineries?retryWrites=true`;
const LEAKS = [PASSWORD, USER, "jolu-websites", "kjwfoym", "mongodb+srv", "mongodb://"];

const capture = () => { const lines = []; const sink = { log: (l) => lines.push(l), warn: (l) => lines.push(l), error: (l) => lines.push(l) }; return { lines, logger: createLogger(sink) }; };
const assertClean = (text) => { for (const s of LEAKS) assert.ok(!String(text).includes(s), `output must not contain "${s}"`); };

// ------------------------------------------------------------------ 1. authentication errors are classified
test("authentication failure (code 18) is classified as authentication", () => {
  const err = new MongoServerError({ message: `bad auth : authentication failed for ${USER}`, code: 18, codeName: "AuthenticationFailed" });
  assert.deepEqual(classifyMongoError(err), { name: "MongoServerError", category: "authentication", code: 18, codeName: "AuthenticationFailed" });
});

test("Atlas 'bad auth' (code 8000 AtlasError) is classified as atlas_rejected", () => {
  const err = new MongoServerError({ message: "bad auth : authentication failed", code: 8000, codeName: "AtlasError" });
  assert.deepEqual(classifyMongoError(err), { name: "MongoServerError", category: "atlas_rejected", code: 8000, codeName: "AtlasError" });
});

test("authorization (13) and Stable API (323) rejections are distinguished from authentication", () => {
  assert.equal(classifyMongoError(new MongoServerError({ message: "x", code: 13, codeName: "Unauthorized" })).category, "authorization");
  assert.equal(classifyMongoError(new MongoServerError({ message: "x", code: 323, codeName: "APIStrictError" })).category, "api_version");
  assert.equal(classifyMongoError(new MongoServerError({ message: "x", code: 9999, codeName: "Whatever" })).category, "server_error");
});

// ------------------------------------------------------------------ 2. network errors stay distinguishable
test("network, server-selection and URI errors are distinct from authentication", () => {
  const net = classifyMongoError(new MongoNetworkError(`connect ECONNREFUSED 10.0.0.1:27017 ${URI}`));
  const sel = classifyMongoError(new MongoServerSelectionError(`Server selection timed out ${URI}`, new Map()));
  const parse = classifyMongoError(new MongoParseError(`Invalid connection string ${URI}`));
  const api = classifyMongoError(new MongoAPIError(`bad option ${URI}`));
  assert.equal(net.category, "network"); assert.equal(net.name, "MongoNetworkError");
  assert.equal(sel.category, "server_selection"); assert.equal(sel.name, "MongoServerSelectionError");
  assert.equal(parse.category, "uri_or_options");
  assert.equal(api.category, "uri_or_options");
  assert.equal(new Set([net.category, sel.category, parse.category, "authentication"]).size, 4, "four different categories");
  for (const c of [net, sel, parse, api]) assert.ok(CATEGORIES.includes(c.category));
});

// ------------------------------------------------------------------ 3. nothing sensitive can reach the logs
test("only allowlisted fields are returned, whatever the error contains", () => {
  const err = new MongoServerError({ message: `bad auth for ${USER}:${PASSWORD} at ${URI}`, code: 18, codeName: "AuthenticationFailed" });
  err.cause = new Error(`inner ${URI}`); err.connectionString = URI; err.stack = `stack with ${PASSWORD}`; err.errorResponse = { errmsg: PASSWORD };
  const out = classifyMongoError(err);
  assert.deepEqual(Object.keys(out).sort(), ["category", "code", "codeName", "name"]);
  assertClean(JSON.stringify(out));
});

test("hostile or malformed values are dropped, never copied", () => {
  const spoofName = Object.assign(new Error("x"), { name: `${URI}`, code: `ECONNREFUSED ${PASSWORD}`, codeName: `${USER}:${PASSWORD}` });
  const out = classifyMongoError(spoofName);
  assert.deepEqual(out, { name: "Other", category: "unknown" }, "unknown name, string code and non-letter codeName are all dropped");
  const longName = classifyMongoError(Object.assign(new Error("x"), { codeName: "A".repeat(41), code: 1.5 }));
  assert.equal(longName.codeName, undefined); assert.equal(longName.code, undefined);
  assert.equal(classifyMongoError(Object.assign(new Error("x"), { code: Infinity })).code, undefined);
});

test("DNS failures are categorised from a fixed code set without copying the string; subclasses keep server_error", () => {
  const dns = Object.assign(new Error(`querySrv ENOTFOUND _mongodb._tcp.jolu-websites.kjwfoym.mongodb.net ${PASSWORD}`), { code: "ENOTFOUND", hostname: "jolu-websites.kjwfoym.mongodb.net" });
  assert.deepEqual(classifyMongoError(dns), { name: "Other", category: "dns" });
  assertClean(JSON.stringify(classifyMongoError(dns)));
  assert.equal(classifyMongoError(Object.assign(new Error("x"), { code: "SOMETHING_ELSE" })).category, "unknown");
  class MongoWriteConcernError extends Error { get name() { return "MongoWriteConcernError"; } }
  assert.equal(classifyMongoError(Object.assign(new MongoWriteConcernError("x"), { code: 64 })).category, "server_error");
});

test("throwing getters and non-error inputs cannot break or leak", () => {
  const trap = {}; for (const k of ["name", "code", "codeName"]) Object.defineProperty(trap, k, { get() { throw new Error(PASSWORD); } });
  assert.deepEqual(classifyMongoError(trap), { name: "Other", category: "unknown" });
  for (const v of [null, undefined, "plain string " + PASSWORD, 42, {}, [], () => {}]) {
    const out = classifyMongoError(v); assert.equal(out.category, "unknown"); assertClean(JSON.stringify(out));
  }
});

test("the logger writes only the allowlisted structured fields for a connect failure", () => {
  const { lines, logger } = capture();
  const err = new MongoServerError({ message: `bad auth ${USER}:${PASSWORD}`, code: 18, codeName: "AuthenticationFailed" });
  err.cause = new Error(URI);
  logger.error("mongo.connect_failed", { attempt: 3, ...classifyMongoError(err), message: err.message, stack: err.stack, uri: URI, cause: err.cause });
  const rec = JSON.parse(lines[0]);
  assert.deepEqual(Object.keys(rec).sort(), ["attempt", "category", "code", "codeName", "event", "level", "name", "time"]);
  assert.equal(rec.category, "authentication"); assert.equal(rec.code, 18); assert.equal(rec.codeName, "AuthenticationFailed");
  assertClean(lines.join("\n"));
});

test("index-creation failures log the classification, not the message", async () => {
  const { lines, logger } = capture();
  const boom = () => Object.assign(new MongoServerError({ message: `E11000 ${URI} ${PASSWORD}`, code: 11000, codeName: "DuplicateKey" }), { cause: new Error(URI) });
  const db = { collection: () => ({ createIndex: async () => { throw boom(); }, find: () => ({ toArray: async () => { throw boom(); } }) }) };
  const state = await ensureIndexes(db, logger);
  assert.deepEqual(state, { quotes: false, subscribers: false });
  const events = lines.map((l) => JSON.parse(l)).filter((e) => e.event === "index.failed");
  assert.equal(events.length, 2);
  for (const e of events) { assert.equal(e.name, "MongoServerError"); assert.equal(e.code, 11000); assert.equal(e.codeName, "DuplicateKey"); assert.equal(e.category, "server_error"); }
  assertClean(lines.join("\n"));
});

// ------------------------------------------------------------------ 4. readiness behaviour is unchanged
test("/api/ready still reports 503 with the same body shape while the database is not connected", async () => {
  const s = await start({ db: null });
  const r = await s.get("/api/ready"); const body = await r.json();
  assert.equal(r.status, 503);
  assert.deepEqual(Object.keys(body).sort(), ["checks", "ok"]);
  assert.deepEqual(Object.keys(body.checks).sort(), ["config", "database", "email", "indexes"]);
  assert.equal(body.ok, false); assert.equal(body.checks.database, false);
  s.close();
});

// ------------------------------------------------------------------ end to end: the real process, real driver, real log lines
function runServer(uri, waitForEvent, timeoutMs) {
  return new Promise((resolve) => {
    const child = spawn(process.execPath, ["index.js"], {
      cwd: path.join(__dirname, ".."),
      env: { PATH: process.env.PATH, NODE_ENV: "production", PORT: "0", MONGO_URI: uri, MONGO_DB_NAME: "jolu_machineries", RESEND_API_KEY: "re_test_key_not_real",
        EMAIL_FROM: "quotes@notify.example.com", EMAIL_TO: "staff@example.com", ALLOWED_ORIGINS: "https://example.com" },
    });
    let out = ""; let done = false;
    const finish = () => { if (done) return; done = true; clearTimeout(timer); child.kill("SIGKILL"); resolve(out); };
    const timer = setTimeout(finish, timeoutMs);
    const onData = (d) => { out += d; if (out.includes(waitForEvent)) setTimeout(finish, 200); };
    child.stdout.on("data", onData); child.stderr.on("data", onData);
  });
}

test("end to end: a malformed URI is reported as uri_or_options without echoing the URI", async () => {
  const out = await runServer(`postgres://${USER}:${PASSWORD}@badhost.example/jolu_machineries`, "mongo.connect_failed", 8000);
  const rec = out.split("\n").filter(Boolean).map((l) => { try { return JSON.parse(l); } catch { return null; } }).find((e) => e && e.event === "mongo.connect_failed");
  assert.ok(rec, "a connect_failed line was logged");
  assert.equal(rec.category, "uri_or_options"); assert.equal(rec.attempt, 1);
  assertClean(out); assert.ok(!out.includes("badhost"), "host text is not echoed either");
});

test("end to end: an unreachable server is reported as server_selection without echoing the URI", { timeout: 25000 }, async () => {
  const out = await runServer(`mongodb://${USER}:${PASSWORD}@127.0.0.1:1/jolu_machineries?authSource=admin`, "mongo.connect_failed", 20000);
  const rec = out.split("\n").filter(Boolean).map((l) => { try { return JSON.parse(l); } catch { return null; } }).find((e) => e && e.event === "mongo.connect_failed");
  assert.ok(rec, "a connect_failed line was logged");
  assert.equal(rec.category, "server_selection"); assert.equal(rec.name, "MongoServerSelectionError");
  assertClean(out); assert.ok(!out.includes("127.0.0.1"), "address is not echoed");
});

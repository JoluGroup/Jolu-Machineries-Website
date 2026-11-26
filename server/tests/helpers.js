// Shared test helpers: an in-memory fake of the MongoDB calls the app uses (with unique + partial index enforcement,
// atomic single-document operations like the real server), a scriptable mailer and a controllable clock.
// No network, no real database, no real email.
const { loadConfig } = require("../config");
const { createApp } = require("../app");
const { ensureIndexes } = require("../indexes");

const ENV = { NODE_ENV: "production", MONGO_URI: "mongodb://user:SECRETPASS@example.invalid/db", MONGO_DB_NAME: "jolu", RESEND_API_KEY: "re_SECRETKEY123", EMAIL_FROM: "noreply@example.test", EMAIL_TO: "sales@example.test", ALLOWED_ORIGINS: "https://www.jolumachineries.com,https://jolumachineries.com,https://jolu-machineries-website-*-jolu-group.vercel.app" };
const FORM = { name: "Test Buyer", email: "buyer@example.test", phone: "0700000000", county: "Nakuru", area: "Njoro", productInterest: "Tractors (100-150 HP)", message: "[Product: Zoomlion RN904/1104 Wheeled Tractor] mock test" };
const OK_ORIGIN = "https://www.jolumachineries.com";
const silent = { info() {}, warn() {}, error() {}, fatal() {} };
const recordingLogger = () => { const events = []; const mk = (level) => (event, fields) => events.push({ level, event, ...fields }); return { events, info: mk("info"), warn: mk("warn"), error: mk("error"), fatal: mk("fatal") }; };

const cmp = (v) => (v instanceof Date ? +v : v);
function match(row, filter) {
  return Object.entries(filter).every(([k, v]) => {
    if (k === "$or") return v.some((f) => match(row, f));
    if (k === "$and") return v.every((f) => match(row, f));
    const val = row[k];
    if (v && typeof v === "object" && !(v instanceof Date) && Object.keys(v).some((x) => x.startsWith("$"))) {
      return Object.entries(v).every(([op, arg]) => {
        const has = val !== undefined && val !== null;
        switch (op) {
          case "$lte": return has && cmp(val) <= cmp(arg);
          case "$lt": return has && cmp(val) < cmp(arg);
          case "$gte": return has && cmp(val) >= cmp(arg);
          case "$gt": return has && cmp(val) > cmp(arg);
          case "$in": return arg.includes(val);
          case "$ne": return val !== arg;
          case "$exists": return (val !== undefined) === arg;
          default: throw new Error(`fake db: unsupported operator ${op}`);
        }
      });
    }
    return cmp(val) === cmp(v);
  });
}
function applyUpdate(row, update) {
  if (update.$set) Object.assign(row, update.$set);
  if (update.$inc) for (const [k, v] of Object.entries(update.$inc)) row[k] = (row[k] || 0) + v;
}

function fakeDb(initial = {}) {
  const store = {}; let seq = 0;
  const flags = { failStore: false, failPing: false, raceOnce: false, failUpdateOnce: false, failIndex: {}, pings: 0, hangPing: false };
  const coll = (name) => (store[name] ||= { rows: [], indexes: [] });
  for (const [name, rows] of Object.entries(initial)) for (const r of rows) coll(name).rows.push({ _id: ++seq, ...r });
  const violates = (c, row, ignoreRow) => c.indexes.some((ix) => ix.unique
    && (!ix.partial || match(row, ix.partial))
    && c.rows.some((o) => o !== ignoreRow && (!ix.partial || match(o, ix.partial)) && ix.keys.every((k) => cmp(o[k]) === cmp(row[k]) && o[k] !== undefined)));
  const dup = () => Object.assign(new Error("E11000 duplicate key"), { code: 11000 });
  return {
    store, flags,
    async command() { flags.pings++; if (flags.hangPing) return new Promise(() => {}); if (flags.failPing) throw new Error("down"); return { ok: 1 }; },
    collection(name) {
      const c = coll(name);
      return {
        async insertOne(d) {
          if (flags.failStore) throw new Error("db down");
          if (flags.raceOnce && name === "quotes") { flags.raceOnce = false; throw dup(); }
          const row = { _id: ++seq, ...d };
          if (violates(c, row)) throw dup();
          c.rows.push(row); return { insertedId: row._id };
        },
        async findOne(f) { if (flags.failStore) throw new Error("db down"); const r = c.rows.find((x) => match(x, f)); return r ? { ...r } : null; },
        find(f) { return { toArray: async () => c.rows.filter((x) => match(x, f)).map((x) => ({ ...x })) }; },
        async countDocuments(f) { return c.rows.filter((x) => match(x, f)).length; },
        async updateOne(f, update, opts = {}) {
          if (flags.failStore) throw new Error("db down");
          if (flags.failUpdateOnce) { flags.failUpdateOnce = false; throw new Error("transient update failure"); }
          const row = c.rows.find((x) => match(x, f));
          if (!row) {
            if (opts.upsert) {
              const n = { _id: ++seq, ...Object.fromEntries(Object.entries(f).filter(([k]) => !k.startsWith("$"))), ...(update.$setOnInsert || {}) };
              if (violates(c, n)) throw dup();
              c.rows.push(n); return { upsertedCount: 1, matchedCount: 0, modifiedCount: 0 };
            }
            return { upsertedCount: 0, matchedCount: 0, modifiedCount: 0 };
          }
          applyUpdate(row, update); return { upsertedCount: 0, matchedCount: 1, modifiedCount: 1 };
        },
        async updateMany(f, update) { if (flags.failStore) throw new Error("db down"); const rows = c.rows.filter((x) => match(x, f)); rows.forEach((r) => applyUpdate(r, update)); return { matchedCount: rows.length }; },
        async findOneAndUpdate(f, update) {
          if (flags.failStore) throw new Error("db down");
          const row = c.rows.find((x) => match(x, f)); if (!row) return null;
          applyUpdate(row, update); return { ...row };
        },
        async createIndex(keys, opts = {}) {
          if (flags.failIndex[name]) throw Object.assign(new Error("index build failed"), { code: 85, name: "MongoServerError" });
          const ix = { keys: Object.keys(keys), unique: !!opts.unique, partial: opts.partialFilterExpression };
          if (ix.unique) for (const r of c.rows) if (violates({ ...c, rows: c.rows.filter((o) => o !== r), indexes: [ix] }, r)) throw Object.assign(new Error("E11000 duplicate key building index"), { code: 11000, name: "MongoServerError" });
          c.indexes.push(ix); return opts.name || "idx";
        },
      };
    },
  };
}

// Mailer double. behaviour: "ok" | "rejected" (definitive 4xx) | "timeout" | "exception" (both ambiguous).
function fakeMailer(behaviour = "ok", { delayMs = 0 } = {}) {
  const m = { configured: true, sent: [], behaviour, delayMs };
  m.send = async (msg) => {
    m.sent.push(msg);
    if (m.delayMs) await new Promise((r) => setTimeout(r, m.delayMs));
    if (m.behaviour === "ok") return { ok: true, id: `msg_${m.sent.length}` };
    if (m.behaviour === "rejected") return { ok: false, kind: "rejected", name: "validation_error", status: 403, ambiguous: false };
    if (m.behaviour === "timeout") return { ok: false, kind: "timeout", name: "timeout", ambiguous: true };
    return { ok: false, kind: "exception", name: "TypeError", ambiguous: true };
  };
  return m;
}

function makeClock(t = Date.UTC(2026, 0, 1, 12, 0, 0)) { const c = { t, now: () => c.t, advance(ms) { c.t += ms; } }; return c; }

async function start({ env = ENV, db = fakeDb(), mailer = fakeMailer(), logger = silent, submitLimit, clock: c, indexState, skipIndexes = false } = {}) {
  const clock = c || makeClock();
  const config = loadConfig(env);
  if (db && !skipIndexes) await ensureIndexes(db, silent); // same indexes the real entry point creates
  const app = createApp({ config, getDb: () => db, mailer, logger, submitLimit, now: clock.now, getIndexState: indexState });
  const server = await new Promise((r) => { const s = app.listen(0, "127.0.0.1", () => r(s)); s.unref(); });
  const base = `http://127.0.0.1:${server.address().port}`;
  const post = async (path, body, origin = OK_ORIGIN) => {
    const r = await fetch(base + path, { method: "POST", headers: { "content-type": "application/json", ...(origin ? { origin } : {}) }, body: typeof body === "string" ? body : JSON.stringify(body) });
    return { status: r.status, json: await r.json().catch(() => ({})), acao: r.headers.get("access-control-allow-origin") };
  };
  return { app, base, post, db, mailer, clock, close: () => { server.close(); if (server.closeAllConnections) server.closeAllConnections(); }, get: (p, h) => fetch(base + p, { headers: h }) };
}

module.exports = { ENV, FORM, OK_ORIGIN, silent, recordingLogger, fakeDb, fakeMailer, makeClock, start };

// Tests for the read-only unsent-notification report. Fake database only: no network, no real data, no email.
const test = require("node:test");
const assert = require("node:assert/strict");
const { fakeDb, makeClock } = require("./helpers");
const { buildReport, run, parseArgs } = require("../unsent");
const { MAX_ATTEMPTS, MAX_AGE_MS } = require("../notifier");

const PII = { name: "Wanjiru Secretname", email: "secret.person@example.test", phone: "0711999888", message: "private message body", county: "Nakuru", area: "Njoro" };
const SECRET_URI = "mongodb+srv://appuser:TOPSECRETPW@cluster0.example.invalid/jolu";
const clock = makeClock();
const ago = (ms) => new Date(clock.now() - ms);

function seed() {
  return fakeDb({
    quotes: [
      { ...PII, emailStatus: "sent", createdAt: ago(1000), emailAttempts: 1 },
      { ...PII, emailStatus: "pending", createdAt: ago(60000), emailAttempts: 0 },
      { ...PII, emailStatus: "sending", createdAt: ago(30000), emailAttempts: 1 },
      { ...PII, emailStatus: "failed", createdAt: ago(120000), emailAttempts: 2, emailFailureKind: "rejected", nextAttemptAt: ago(-60000) },
      { ...PII, emailStatus: "unknown", createdAt: ago(90000), emailAttempts: MAX_ATTEMPTS, emailFailureKind: "timeout" },
      { ...PII, emailStatus: "failed", createdAt: ago(MAX_AGE_MS + 5000), emailAttempts: 2, emailFailureKind: "rejected" },
      { ...PII, createdAt: ago(5000) },
    ],
    contacts: [{ ...PII, emailStatus: "failed", createdAt: ago(1000), emailAttempts: 1 }, { ...PII, emailStatus: "sent", createdAt: ago(1000) }],
    schedules: [],
  });
}
const report = (db, o = {}) => buildReport(db, { now: clock.now, ...o });

test("excludes sent records and counts each state", async () => {
  const r = await report(seed());
  const q = r.collections.quotes;
  assert.equal(q.total, 6);
  assert.deepEqual({ ...q.counts }, { pending: 1, sending: 1, failed: 2, unknown: 1, other: 1, exhausted: 2 });
  assert.ok(q.records.every((x) => x.emailStatus !== "sent"));
  assert.equal(r.collections.contacts.total, 1);
  assert.equal(r.collections.schedules.total, 0);
});

test("flags exhausted by attempts or by age, and nothing else", async () => {
  const q = (await report(seed())).collections.quotes;
  const ex = q.records.filter((x) => x.exhausted);
  assert.equal(ex.length, 2);
  assert.ok(ex.some((x) => x.attempts >= MAX_ATTEMPTS));
  assert.ok(ex.some((x) => x.createdAt === ago(MAX_AGE_MS + 5000).toISOString()));
  assert.equal(q.records.find((x) => x.emailStatus === "pending").exhausted, false);
  assert.equal(q.records.find((x) => x.emailStatus === "unrecorded").exhausted, false);
});

test("output never contains customer details or credentials (object and text and json)", async () => {
  const r = await report(seed());
  const { formatText } = require("../unsent");
  for (const blob of [JSON.stringify(r), formatText(r)]) {
    for (const s of ["Secretname", "secret.person", "0711999888", "private message", "Njoro", "Nakuru"]) assert.ok(!blob.includes(s), `leaked ${s}`);
  }
  assert.deepEqual(Object.keys(r.collections.quotes.records[0]).sort(), ["attempts", "createdAt", "emailFailureKind", "emailStatus", "exhausted", "id", "nextAttemptAt"]);
});

test("is strictly read-only: any write call throws and none is attempted", async () => {
  const db = seed();
  const calls = [];
  const guarded = { collection: (n) => new Proxy(db.collection(n), { get(t, p) {
    calls.push(String(p));
    if (/^(insert|update|delete|replace|findOneAnd|bulkWrite|drop|create|rename)/i.test(String(p))) throw new Error(`WRITE ATTEMPTED: ${String(p)}`);
    return t[p];
  } }) };
  await report(guarded);
  assert.ok(calls.length > 0);
  assert.ok(calls.every((c) => ["countDocuments", "find"].includes(c)), `unexpected calls: ${[...new Set(calls)]}`);
});

test("--limit caps the listed records but counts stay complete", async () => {
  const q = (await report(seed(), { limit: 2 })).collections.quotes;
  assert.equal(q.records.length, 2);
  assert.equal(q.shown, 2);
  assert.equal(q.truncated, true);
  assert.equal(q.total, 6);
  assert.ok(q.records[0].createdAt <= q.records[1].createdAt, "oldest first");
});

test("argument parsing", () => {
  assert.deepEqual(parseArgs(["--json", "--limit", "5"]), { json: true, limit: 5, help: false });
  assert.equal(parseArgs(["--limit=7"]).limit, 7);
  for (const bad of [["--limit", "0"], ["--limit", "abc"], ["--limit", "5000"], ["--nope"]]) assert.throws(() => parseArgs(bad));
});

const harness = () => { const o = { out: [], err: [] }; return { o, io: { out: (s) => o.out.push(s), err: (s) => o.err.push(s), now: clock.now } }; };

test("run: missing configuration exits 2 and never connects", async () => {
  const { o, io } = harness(); let connected = false;
  const code = await run([], { MONGO_URI: SECRET_URI }, { ...io, connect: async () => { connected = true; } });
  assert.equal(code, 2); assert.equal(connected, false); assert.match(o.err.join(), /MONGO_URI and MONGO_DB_NAME/);
  assert.ok(!o.err.join().includes("TOPSECRETPW"));
});

test("run: database failure exits 1 with a clear message and no URI, password or raw driver text", async () => {
  const { o, io } = harness(); let closed = false;
  const code = await run([], { MONGO_URI: SECRET_URI, MONGO_DB_NAME: "jolu" }, { ...io, connect: async (uri) => { throw Object.assign(new Error(`connect failed for ${uri}`), { name: "MongoServerSelectionError" }); } });
  assert.equal(code, 1);
  const all = o.err.join("\n") + o.out.join("\n");
  assert.match(all, /could not read the database \(MongoServerSelectionError\)/);
  for (const s of ["TOPSECRETPW", "appuser", "cluster0", "mongodb+srv"]) assert.ok(!all.includes(s), `leaked ${s}`);
  assert.equal(closed, false);
});

test("run: failure while reading still closes the client and hides details", async () => {
  const { o, io } = harness(); let closed = false;
  const client = { db: () => ({ collection: () => { throw new Error(`boom ${SECRET_URI}`); } }), close: async () => { closed = true; } };
  const code = await run(["--json"], { MONGO_URI: SECRET_URI, MONGO_DB_NAME: "jolu" }, { ...io, connect: async () => client });
  assert.equal(code, 1); assert.equal(closed, true);
  assert.ok(!(o.err.join() + o.out.join()).includes("TOPSECRETPW"));
});

test("run: --json prints parseable JSON and exits 0; default prints text", async () => {
  for (const json of [true, false]) {
    const { o, io } = harness(); const db = seed();
    const code = await run(json ? ["--json"] : [], { MONGO_URI: SECRET_URI, MONGO_DB_NAME: "jolu" }, { ...io, connect: async () => ({ db: () => db, close: async () => {} }) });
    assert.equal(code, 0);
    const text = o.out.join("\n");
    if (json) assert.equal(JSON.parse(text).collections.quotes.total, 6); else assert.match(text, /quotes: 6 not sent/);
    assert.ok(!text.includes("TOPSECRETPW"));
  }
});

test("a database read error surfaces as exit 1 (fake store down)", async () => {
  const { io, o } = harness();
  const bad = { collection: () => ({ countDocuments: async () => { throw new Error("db down"); } }) };
  const code = await run([], { MONGO_URI: SECRET_URI, MONGO_DB_NAME: "jolu" }, { ...io, connect: async () => ({ db: () => bad, close: async () => {} }) });
  assert.equal(code, 1); assert.match(o.err.join(), /could not read the database/);
});

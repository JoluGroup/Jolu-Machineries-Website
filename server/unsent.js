// READ-ONLY report of customer enquiries whose staff notification email is not "sent".
// Reads only: countDocuments + find (projection). Never writes, never imports the mailer, never outputs
// names, emails, phone numbers or message text. Record ids are the only way back to a customer record.
const { MAX_ATTEMPTS, MAX_AGE_MS, RETRYABLE } = require("./notifier");

const COLLECTIONS = ["quotes", "contacts", "schedules"];
const PROJECTION = { _id: 1, createdAt: 1, emailStatus: 1, emailAttempts: 1, emailFailureKind: 1, nextAttemptAt: 1 };
const iso = (d) => (d instanceof Date && !Number.isNaN(+d) ? d.toISOString() : d ? String(d) : null);

async function buildReport(db, { now = Date.now, limit = 50, collections = COLLECTIONS } = {}) {
  const cutoff = new Date(now() - MAX_AGE_MS);
  const report = { generatedAt: new Date(now()).toISOString(), limit, maxAttempts: MAX_ATTEMPTS, maxAgeHours: MAX_AGE_MS / 3600000, collections: {} };
  for (const name of collections) {
    const coll = db.collection(name);
    const counts = {};
    let listed = 0;
    for (const s of RETRYABLE) { counts[s] = await coll.countDocuments({ emailStatus: s }); listed += counts[s]; }
    const total = await coll.countDocuments({ emailStatus: { $ne: "sent" } });
    counts.other = Math.max(0, total - listed);
    counts.exhausted = await coll.countDocuments({
      emailStatus: { $in: RETRYABLE }, $or: [{ createdAt: { $lt: cutoff } }, { emailAttempts: { $gte: MAX_ATTEMPTS } }],
    });
    const rows = await coll.find({ emailStatus: { $ne: "sent" } }, { projection: PROJECTION }).sort({ createdAt: 1 }).limit(limit).toArray();
    const records = rows.map((r) => {
      const state = r.emailStatus || "unrecorded";
      const attempts = r.emailAttempts || 0;
      const exhausted = RETRYABLE.includes(r.emailStatus) && (attempts >= MAX_ATTEMPTS || (r.createdAt instanceof Date && r.createdAt < cutoff));
      return { id: String(r._id), createdAt: iso(r.createdAt), emailStatus: state, attempts, emailFailureKind: r.emailFailureKind || null, nextAttemptAt: iso(r.nextAttemptAt), exhausted };
    });
    report.collections[name] = { total, counts, shown: records.length, truncated: total > records.length, records };
  }
  return report;
}

function formatText(report) {
  const lines = [`Unsent notification report ${report.generatedAt} (read-only; exhausted = ${report.maxAttempts} attempts or older than ${report.maxAgeHours}h)`];
  for (const [name, c] of Object.entries(report.collections)) {
    const k = c.counts;
    lines.push("", `${name}: ${c.total} not sent (pending ${k.pending}, sending ${k.sending}, failed ${k.failed}, unknown ${k.unknown}, other ${k.other}; exhausted ${k.exhausted})`);
    for (const r of c.records) lines.push(`  ${r.id}  ${r.createdAt}  ${r.emailStatus}  attempts=${r.attempts}  kind=${r.emailFailureKind || "-"}  next=${r.nextAttemptAt || "-"}${r.exhausted ? "  EXHAUSTED" : ""}`);
    if (c.truncated) lines.push(`  ... ${c.total - c.shown} more not shown (raise --limit)`);
  }
  return lines.join("\n");
}

function parseArgs(argv) {
  const o = { json: false, limit: 50, help: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--json") o.json = true;
    else if (a === "--help" || a === "-h") o.help = true;
    else if (a === "--limit" || a.startsWith("--limit=")) {
      const v = a === "--limit" ? argv[++i] : a.slice(8);
      const n = Number(v);
      if (!Number.isInteger(n) || n < 1 || n > 1000) throw new Error("--limit must be an integer from 1 to 1000");
      o.limit = n;
    } else throw new Error(`unknown option: ${a}`);
  }
  return o;
}

// Returns an exit code. Never prints the connection string or raw driver messages (they can embed the URI).
async function run(argv, env, { connect, out = console.log, err = console.error, now = Date.now } = {}) {
  let opts;
  try { opts = parseArgs(argv); } catch (e) { err(`${e.message}. Usage: npm run unsent -- [--json] [--limit N]`); return 2; }
  if (opts.help) { out("Usage: npm run unsent -- [--json] [--limit N]\nRead-only. Needs MONGO_URI and MONGO_DB_NAME in the environment."); return 0; }
  if (!env.MONGO_URI || !env.MONGO_DB_NAME) { err("Set MONGO_URI and MONGO_DB_NAME."); return 2; }
  let client;
  try {
    client = await connect(env.MONGO_URI);
    const report = await buildReport(client.db(env.MONGO_DB_NAME), { now, limit: opts.limit });
    out(opts.json ? JSON.stringify(report, null, 2) : formatText(report));
    return 0;
  } catch (e) {
    err(`unsent report failed: could not read the database (${(e && e.name) || "Error"}). Check connectivity and the Atlas network access list.`);
    return 1;
  } finally {
    if (client) { try { await client.close(); } catch { /* ignore */ } }
  }
}

module.exports = { buildReport, formatText, parseArgs, run, COLLECTIONS };

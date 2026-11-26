// Index management. Index creation must never take the API down: each index is attempted on its own, a failure is
// logged (names and counts only) and reported through readiness, and creation is retried by the caller.
//
// quotes      unique partial index on the ACTIVE deduplication fingerprint (required: duplicate protection).
// subscribers unique index on email (best effort: legacy data may contain duplicates; see auditSubscribers).

const QUOTES_INDEX = [{ fingerprint: 1 }, { unique: true, partialFilterExpression: { dedupeActive: true }, name: "quotes_active_fingerprint" }];
const SUBSCRIBERS_INDEX = [{ email: 1 }, { unique: true, name: "subscribers_email_unique" }];

// READ-ONLY. Groups subscriber records by lower-cased, trimmed email and reports the groups with more than one record.
// It never updates or deletes anything. Exact duplicates are what block the unique index; case variants (A@x.com vs
// a@x.com) do not block it but are the same person, so they are reported as well.
async function auditSubscribers(coll) {
  const rows = await coll.find({}).toArray();
  const groups = new Map();
  for (const r of rows) {
    const key = String(r.email == null ? "" : r.email).trim().toLowerCase();
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(r);
  }
  const duplicates = [];
  for (const [email, list] of groups) {
    if (list.length < 2) continue;
    const exact = new Set(list.map((r) => r.email)).size < list.length;
    duplicates.push({ email, count: list.length, ids: list.map((r) => String(r._id)), exactDuplicate: exact, caseVariants: [...new Set(list.map((r) => r.email))] });
  }
  return { total: rows.length, duplicateGroups: duplicates.length, duplicates };
}

async function ensureIndexes(db, logger) {
  const state = { quotes: false, subscribers: false };
  try { await db.collection("quotes").createIndex(...QUOTES_INDEX); state.quotes = true; }
  catch (err) { logger.error("index.failed", { kind: "quotes", name: err && err.name ? String(err.name) : undefined, code: err && err.code ? String(err.code) : undefined }); }
  try { await db.collection("subscribers").createIndex(...SUBSCRIBERS_INDEX); state.subscribers = true; }
  catch (err) {
    let count;
    try { count = (await auditSubscribers(db.collection("subscribers"))).duplicateGroups; } catch { /* audit is optional */ }
    logger.error("index.failed", { kind: "subscribers", name: err && err.name ? String(err.name) : undefined, code: err && err.code ? String(err.code) : undefined, count });
  }
  return state;
}

module.exports = { ensureIndexes, auditSubscribers, QUOTES_INDEX, SUBSCRIBERS_INDEX };

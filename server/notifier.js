// Notification state machine shared by the request handlers and the recovery sweep.
//
// emailStatus:  "sending"  a worker holds a lease (leaseUntil in the future) and is calling the provider
//               "sent"     the provider ACCEPTED the message (not proof of inbox delivery)
//               "failed"   the provider definitively refused it (4xx); safe to retry once the cause is fixed
//               "unknown"  ambiguous (timeout / network error / 5xx / 429): the provider MAY have accepted it
//
// Safety rules:
//  * A record is claimed with ONE atomic findOneAndUpdate that also takes a lease, so concurrent requests,
//    retries, restarts and several processes cannot send for the same record at the same time.
//  * Every send for a record carries the same idempotency key (`<collection>-<_id>`) and an identical payload,
//    so retrying an ambiguous failure cannot create a second email while the provider honors the key.
//  * A worker that dies mid-send leaves a lease that expires; the sweep (or the customer's retry) then re-claims it.
//  * The sweep is bounded: few records per run, exponential backoff, an attempt cap and an age cap. Records beyond
//    the caps are left stored and are only counted/logged for manual review.
const crypto = require("crypto");

const LEASE_MS = 60 * 1000;                 // longer than the mailer timeout (10 s) with a wide margin
const MAX_ATTEMPTS = 6;
const MAX_AGE_MS = 24 * 60 * 60 * 1000;     // matches the provider's idempotency-key retention
const RETRYABLE = ["sending", "pending", "failed", "unknown"];
const backoffMs = (attempts) => Math.min(60 * 1000 * 2 ** Math.max(0, attempts - 1), 60 * 60 * 1000);

function createNotifier({ getDb, mailer, logger, now, builders }) {
  const leaseFree = (d) => ({ $or: [{ leaseUntil: { $exists: false } }, { leaseUntil: { $lte: d } }] });
  const claimUpdate = () => ({
    $set: { emailStatus: "sending", leaseOwner: crypto.randomUUID(), leaseUntil: new Date(now() + LEASE_MS), lastAttemptAt: new Date(now()) },
    $inc: { emailAttempts: 1 },
  });
  // Fields for a brand-new record that the creating request already holds the lease for.
  const initialClaim = () => ({
    emailStatus: "sending", leaseOwner: crypto.randomUUID(), leaseUntil: new Date(now() + LEASE_MS),
    lastAttemptAt: new Date(now()), emailAttempts: 1,
  });

  const claimById = (coll, id) =>
    coll.findOneAndUpdate({ _id: id, emailStatus: { $in: RETRYABLE }, ...leaseFree(new Date(now())) }, claimUpdate(), { returnDocument: "after" });

  async function attempt(coll, collName, doc, ctx) {
    let result;
    try {
      result = await mailer.send({ ...builders[collName](doc), idempotencyKey: `${collName}-${doc._id}` });
    } catch {
      result = { ok: false, kind: "exception", name: "mailer_threw", ambiguous: true };
    }
    const at = new Date(now());
    try {
      if (result.ok) {
        // "sent" always wins, even if our lease was taken over meanwhile.
        await coll.updateOne({ _id: doc._id }, { $set: { emailStatus: "sent", emailAcceptedAt: at, emailProviderId: result.id, leaseUntil: new Date(0) } });
      } else {
        await coll.updateOne({ _id: doc._id, leaseOwner: doc.leaseOwner, emailStatus: "sending" }, {
          $set: {
            emailStatus: result.ambiguous ? "unknown" : "failed", emailFailedAt: at, emailFailureKind: result.kind,
            leaseUntil: new Date(0), nextAttemptAt: new Date(now() + backoffMs(doc.emailAttempts || 1)),
          },
        });
      }
    } catch {
      // The email outcome could not be recorded. The row keeps its lease and is re-claimed when it expires;
      // the stable idempotency key stops that retry from producing a second email.
      logger.error("record.update_failed", { requestId: ctx.requestId, route: ctx.route });
    }
    if (!result.ok) logger.error("email.not_accepted", { requestId: ctx.requestId, route: ctx.route, kind: result.kind, name: result.name, status: result.status });
    return result;
  }

  async function sweep({ limit = 5 } = {}) {
    const db = getDb();
    if (!db || !mailer || !mailer.configured) return { skipped: true };
    const summary = { claimed: 0, sent: 0, failed: 0 };
    for (const name of Object.keys(builders)) {
      const coll = db.collection(name);
      for (let i = 0; i < limit; i++) {
        const nowD = new Date(now());
        const doc = await coll.findOneAndUpdate({
          emailStatus: { $in: RETRYABLE }, createdAt: { $gte: new Date(now() - MAX_AGE_MS) }, emailAttempts: { $lt: MAX_ATTEMPTS },
          $and: [leaseFree(nowD), { $or: [{ nextAttemptAt: { $exists: false } }, { nextAttemptAt: { $lte: nowD } }] }],
        }, claimUpdate(), { returnDocument: "after" });
        if (!doc) break;
        summary.claimed++;
        const r = await attempt(coll, name, doc, { requestId: "sweep", route: `sweep:${name}` });
        if (r.ok) summary.sent++; else summary.failed++;
      }
      const review = await coll.countDocuments({
        emailStatus: { $in: RETRYABLE }, $or: [{ createdAt: { $lt: new Date(now() - MAX_AGE_MS) } }, { emailAttempts: { $gte: MAX_ATTEMPTS } }],
      });
      if (review > 0) logger.warn("notification.needs_manual_review", { route: name, count: review });
    }
    return summary;
  }

  return { attempt, claimById, claimUpdate, initialClaim, sweep };
}

module.exports = { createNotifier, LEASE_MS, MAX_ATTEMPTS, MAX_AGE_MS, RETRYABLE, backoffMs };

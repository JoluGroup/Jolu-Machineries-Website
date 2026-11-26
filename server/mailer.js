// Email delivery through Resend, with the response actually inspected.
// The Resend SDK RESOLVES with { data, error } for API failures (it does not throw), so a plain
// `await resend.emails.send()` can look successful when the message was rejected.
//
// Result shape:   { ok: true, id }                                   Resend ACCEPTED the message for delivery
//                 { ok: false, kind, name, status, ambiguous }       kind: "rejected" | "exception" | "timeout"
// "ok" means accepted by Resend, NOT confirmed delivery to the recipient's inbox.
//
// ambiguous=false: Resend definitively refused the request (a 4xx such as validation or an unverified domain).
// ambiguous=true : we cannot tell whether Resend accepted it (timeout, network error, 5xx, 429, 409, no id).
// Retrying an ambiguous failure is only safe because every send carries a stable Idempotency-Key, which
// Resend honors for a limited period (24 hours at the time of writing). It is NOT an exactly-once guarantee.

const DEFINITIVE_REJECTION = (status) => status >= 400 && status < 500 && status !== 408 && status !== 409 && status !== 429;

function classify(result) {
  if (result && result.error) {
    const e = result.error;
    const status = Number(e.statusCode || e.status) || undefined;
    return { ok: false, kind: "rejected", name: String(e.name || "error"), status, ambiguous: !DEFINITIVE_REJECTION(status) };
  }
  const id = result && result.data && result.data.id;
  if (id) return { ok: true, id: String(id) };
  return { ok: false, kind: "rejected", name: "no_message_id", status: undefined, ambiguous: true };
}

function createResendMailer({ apiKey, from, to, timeoutMs = 10000, client }) {
  const resend = client || new (require("resend").Resend)(apiKey);
  return {
    configured: true,
    async send({ subject, text, idempotencyKey }) {
      let timer;
      try {
        const result = await Promise.race([
          resend.emails.send({ from, to, subject, text }, idempotencyKey ? { idempotencyKey } : undefined),
          new Promise((_, reject) => { timer = setTimeout(() => reject(Object.assign(new Error("timeout"), { code: "ETIMEDOUT_RESEND" })), timeoutMs); }),
        ]);
        return classify(result);
      } catch (err) {
        return err && err.code === "ETIMEDOUT_RESEND"
          ? { ok: false, kind: "timeout", name: "timeout", ambiguous: true }
          : { ok: false, kind: "exception", name: String((err && err.name) || "Error"), ambiguous: true };
      } finally {
        clearTimeout(timer);
      }
    },
  };
}

module.exports = { createResendMailer, classify };

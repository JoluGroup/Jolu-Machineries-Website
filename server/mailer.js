// Email delivery through Resend, with the response actually inspected.
// The Resend SDK RESOLVES with { data, error } for API failures (it does not throw), so a plain
// `await resend.emails.send()` can look successful when the message was rejected.
//
// Result shape:   { ok: true, id }                         Resend ACCEPTED the message for delivery
//                 { ok: false, kind, name, status }        kind: "rejected" | "exception" | "timeout"
// "ok" means accepted by Resend, NOT confirmed delivery to the recipient's inbox.

function classify(result) {
  if (result && result.error) {
    const e = result.error;
    return { ok: false, kind: "rejected", name: String(e.name || "error"), status: Number(e.statusCode || e.status) || undefined };
  }
  const id = result && result.data && result.data.id;
  if (id) return { ok: true, id: String(id) };
  return { ok: false, kind: "rejected", name: "no_message_id", status: undefined };
}

function createResendMailer({ apiKey, from, to, timeoutMs = 10000, client }) {
  const resend = client || new (require("resend").Resend)(apiKey);
  return {
    configured: true,
    async send({ subject, text }) {
      let timer;
      try {
        const result = await Promise.race([
          resend.emails.send({ from, to, subject, text }),
          new Promise((_, reject) => { timer = setTimeout(() => reject(Object.assign(new Error("timeout"), { code: "ETIMEDOUT_RESEND" })), timeoutMs); }),
        ]);
        return classify(result);
      } catch (err) {
        return err && err.code === "ETIMEDOUT_RESEND"
          ? { ok: false, kind: "timeout", name: "timeout" }
          : { ok: false, kind: "exception", name: String((err && err.name) || "Error") };
      } finally {
        clearTimeout(timer);
      }
    },
  };
}

module.exports = { createResendMailer, classify };

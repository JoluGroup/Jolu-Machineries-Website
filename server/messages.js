// Staff notification email content for each stored record type. Built from the STORED record so that a retry
// or a recovery run sends exactly the same payload (required for provider idempotency keys to match).

// Anything that ends up in a subject line is forced onto one line: CR/LF and other control characters removed.
const oneLine = (s, max = 120) => String(s == null ? "" : s).replace(/[\u0000-\u001F\u007F\u2028\u2029]+/g, " ").replace(/\s+/g, " ").trim().slice(0, max);

const builders = {
  quotes: (p) => ({
    subject: `New Quote Request: ${oneLine(p.name)} (${oneLine(p.productInterest || "General")})`,
    text: `Name: ${p.name}\nEmail: ${p.email}\nPhone: ${p.phone}\nCounty: ${p.county}\nArea: ${p.area}\nInterest: ${p.productInterest || "N/A"}\n\nMessage:\n${p.message}`,
  }),
  contacts: (p) => ({
    subject: `New Contact: ${oneLine(p.name)} (${oneLine(p.productInterest || "General")})`,
    text: `Name: ${p.name}\nEmail: ${p.email}\nPhone: ${p.phone}\nCounty: ${p.county}\nArea: ${p.area}\nInterest: ${p.productInterest || "N/A"}\nMessage:\n${p.message}`,
  }),
  schedules: (p) => ({
    subject: `Demo Request: ${oneLine(p.name)} — ${oneLine(p.product)}`,
    text: `Name: ${p.name}\nEmail: ${p.email}\nPhone: ${p.phone}\nPreferred Date: ${p.preferredDate}\nPreferred Time: ${p.preferredTime}\nProduct: ${p.product}\nNotes:\n${p.notes || "N/A"}`,
  }),
};

module.exports = { builders, oneLine };

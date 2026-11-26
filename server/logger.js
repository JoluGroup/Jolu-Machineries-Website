// Structured, secret-safe logging. Only whitelisted primitive fields are written; request bodies,
// customer details, API keys and connection strings are never passed in here.
const SAFE = new Set(["code", "status", "kind", "name", "requestId", "route", "attempt", "reason", "count", "origin", "variables", "problems"]);

function createLogger(sink = console) {
  const write = (level, event, fields = {}) => {
    const clean = {};
    for (const [k, v] of Object.entries(fields)) {
      if (!SAFE.has(k)) continue;
      clean[k] = Array.isArray(v) ? v.map(String) : typeof v === "object" ? undefined : v;
    }
    const line = JSON.stringify({ level, event, time: new Date().toISOString(), ...clean });
    (level === "error" || level === "fatal" ? sink.error : level === "warn" ? sink.warn : sink.log).call(sink, line);
  };
  return { info: (e, f) => write("info", e, f), warn: (e, f) => write("warn", e, f), error: (e, f) => write("error", e, f), fatal: (e, f) => write("fatal", e, f) };
}

module.exports = { createLogger };

// Startup configuration. Reads and validates environment variables.
// It reports variable NAMES only; values (keys, connection strings) are never returned in messages or logs.

const REQUIRED = ["MONGO_URI", "MONGO_DB_NAME", "RESEND_API_KEY", "EMAIL_FROM", "EMAIL_TO"];
const ORIGIN_RE = /^https?:\/\/[^\s/*]+(?::\d+)?$/i; // exact origin: scheme + host[:port], no path
const PATTERN_RE = /^https?:\/\/[a-z0-9.*-]+$/i; // host may contain * (one DNS label), nothing else

function splitList(raw) {
  return String(raw || "").split(",").map((s) => s.trim()).filter(Boolean);
}

/** "https://app-*-team.vercel.app" -> matches exactly one DNS label in place of each "*". */
function patternToRegExp(pattern) {
  const body = pattern.replace(/[.+?^${}()|[\]\\]/g, "\\$&").replace(/\*/g, "[a-z0-9-]+");
  return new RegExp(`^${body}$`, "i");
}

function parseOrigins(raw) {
  const exact = new Set();
  const patterns = [];
  const invalid = [];
  for (const entry of splitList(raw)) {
    const value = entry.replace(/\/+$/, "");
    if (value.includes("*")) {
      if (PATTERN_RE.test(value) && value.split("*").length <= 3) patterns.push(patternToRegExp(value));
      else invalid.push(entry);
    } else if (ORIGIN_RE.test(value)) exact.add(value.toLowerCase());
    else invalid.push(entry);
  }
  return { exact, patterns, invalid };
}

function loadConfig(env = process.env) {
  const production = env.NODE_ENV === "production";
  const missing = REQUIRED.filter((k) => !String(env[k] || "").trim());
  const origins = parseOrigins(env.ALLOWED_ORIGINS);
  const problems = [];
  if (production && origins.exact.size + origins.patterns.length === 0) problems.push("ALLOWED_ORIGINS is required in production");
  if (origins.invalid.length) problems.push(`ALLOWED_ORIGINS has ${origins.invalid.length} invalid entr${origins.invalid.length === 1 ? "y" : "ies"} (use scheme://host[:port], no path)`);
  if (env.EMAIL_FROM && !/^[^<>@\s]+@[^<>@\s]+\.[^<>@\s]+$|^[^<>]+<[^<>@\s]+@[^<>@\s]+\.[^<>@\s]+>$/.test(String(env.EMAIL_FROM).trim()))
    problems.push("EMAIL_FROM must be an address on a Resend-verified domain, e.g. noreply@example.com");
  const port = Number(env.PORT || 5000);
  if (!Number.isInteger(port) || port < 0 || port > 65535) problems.push("PORT must be a valid port number");
  return {
    production,
    port,
    mongoUri: env.MONGO_URI,
    mongoDbName: env.MONGO_DB_NAME,
    resendApiKey: env.RESEND_API_KEY,
    emailFrom: env.EMAIL_FROM && String(env.EMAIL_FROM).trim(),
    emailTo: splitList(env.EMAIL_TO),
    origins,
    missing,
    problems,
    valid: missing.length === 0 && problems.length === 0,
  };
}

function isOriginAllowed(config, origin, { allowLocalhost = !config.production } = {}) {
  if (!origin) return true; // not a browser cross-origin request (curl, health checks, server-to-server)
  const o = String(origin).replace(/\/+$/, "").toLowerCase();
  if (config.origins.exact.has(o)) return true;
  if (config.origins.patterns.some((re) => re.test(o))) return true;
  if (allowLocalhost && /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(o)) return true;
  return false;
}

module.exports = { REQUIRED, loadConfig, isOriginAllowed, parseOrigins };

// Secret-safe classification of MongoDB driver errors.
//
// The driver's error objects can carry the server's free-text message, a `cause` chain, connection details
// and (for parse errors) fragments of the connection string. NONE of that is ever read here. We extract only
// four allowlisted facts, each validated so that no input can smuggle text through:
//   name      - one of a fixed list of known driver error class names, otherwise "Other"
//   code      - an integer (string codes such as "ECONNREFUSED" are dropped)
//   codeName  - letters only, max 40 characters
//   category  - one of the predefined CATEGORIES below
// Every property access is guarded: a hostile or odd error object can never throw out of this module.

const KNOWN_NAMES = new Set([
  "MongoServerError", "MongoNetworkError", "MongoNetworkTimeoutError", "MongoServerSelectionError",
  "MongoParseError", "MongoAPIError", "MongoInvalidArgumentError", "MongoRuntimeError", "MongoTopologyClosedError",
  "MongoError", "MongoDriverError", "MongoCompatibilityError", "MongoMissingCredentialsError", "MongoMissingDependencyError",
]);

const CATEGORIES = Object.freeze([
  "authentication", "atlas_rejected", "authorization", "api_version", "network", "server_selection",
  "uri_or_options", "server_error", "unknown",
]);

// Numeric server codes (https://github.com/mongodb/mongo/blob/master/src/mongo/base/error_codes.yml).
const CODE_AUTHENTICATION_FAILED = 18;
const CODE_UNAUTHORIZED = 13;
const CODE_ATLAS_ERROR = 8000; // Atlas reports "bad auth : authentication failed" with this code
const API_VERSION_CODES = new Set([322, 323, 328]); // APIVersionError, APIStrictError, APIDeprecationError

function safeGet(obj, key) {
  try { return obj == null ? undefined : obj[key]; } catch { return undefined; }
}

function pickName(err) {
  const n = safeGet(err, "name");
  return typeof n === "string" && KNOWN_NAMES.has(n) ? n : "Other";
}

function pickCode(err) {
  const c = safeGet(err, "code");
  return typeof c === "number" && Number.isSafeInteger(c) ? c : undefined;
}

function pickCodeName(err) {
  const c = safeGet(err, "codeName");
  return typeof c === "string" && /^[A-Za-z]{1,40}$/.test(c) ? c : undefined;
}

function categorize(name, code) {
  if (name === "MongoServerError") {
    if (code === CODE_AUTHENTICATION_FAILED) return "authentication";
    if (code === CODE_ATLAS_ERROR) return "atlas_rejected";
    if (code === CODE_UNAUTHORIZED) return "authorization";
    if (code !== undefined && API_VERSION_CODES.has(code)) return "api_version";
    return "server_error";
  }
  if (name === "MongoNetworkError" || name === "MongoNetworkTimeoutError") return "network";
  if (name === "MongoServerSelectionError") return "server_selection";
  if (name === "MongoParseError" || name === "MongoAPIError" || name === "MongoInvalidArgumentError" || name === "MongoMissingCredentialsError") return "uri_or_options";
  return "unknown";
}

// Returns a plain object containing only allowlisted, validated primitives. Safe to pass to the logger.
function classifyMongoError(err) {
  const name = pickName(err);
  const code = pickCode(err);
  const codeName = pickCodeName(err);
  const out = { name, category: categorize(name, code) };
  if (code !== undefined) out.code = code;
  if (codeName !== undefined) out.codeName = codeName;
  return out;
}

module.exports = { classifyMongoError, CATEGORIES };

// Process entry point: loads configuration, connects to MongoDB (with retry), wires Resend, starts the HTTP server,
// runs the bounded notification-recovery sweep, and shuts down gracefully on SIGTERM/SIGINT.
require("dotenv").config();
const { MongoClient, ServerApiVersion } = require("mongodb");
const { loadConfig } = require("./config");
const { createLogger } = require("./logger");
const { createResendMailer } = require("./mailer");
const { createApp } = require("./app");
const { ensureIndexes } = require("./indexes");
const { createShutdown } = require("./shutdown");

const logger = createLogger();
const config = loadConfig(process.env);

if (!config.valid) {
  const fields = { variables: config.missing, problems: config.problems };
  if (config.production) {
    // Fail fast with a readable message (names only, never values) instead of a later opaque crash.
    logger.fatal("config.invalid", fields);
    process.exit(1);
  }
  logger.warn("config.invalid_non_production", fields); // dev only: the API starts but /api/ready reports 503 and submissions return 503
}

const SWEEP_FIRST_MS = 30 * 1000;
const SWEEP_EVERY_MS = 5 * 60 * 1000;
const INDEX_RETRY_MS = 60 * 1000;
const INDEX_RETRY_MAX = 10;

let db = null;
let client = null;
let stopping = false;
let indexState = { quotes: false, subscribers: false };
const timers = new Set();
const later = (fn, ms) => { const t = setTimeout(() => { timers.delete(t); fn(); }, ms); if (t.unref) t.unref(); timers.add(t); return t; };
const sleep = (ms) => new Promise((resolve) => later(resolve, ms));

let mailer = null;
if (config.resendApiKey && config.emailFrom && config.emailTo.length) {
  mailer = createResendMailer({ apiKey: config.resendApiKey, from: config.emailFrom, to: config.emailTo });
}

const app = createApp({ config, getDb: () => db, mailer, logger, getIndexState: () => indexState });

// A transient Atlas outage must not crash-loop the service: keep retrying with capped backoff while /api/ready reports 503.
async function connectToMongo() {
  if (!config.mongoUri || !config.mongoDbName) return;
  let delay = 2000;
  while (!stopping) {
    const candidate = new MongoClient(config.mongoUri, {
      serverApi: { version: ServerApiVersion.v1, strict: true, deprecationErrors: true },
      serverSelectionTimeoutMS: 10000,
    });
    try {
      await candidate.connect();
      client = candidate;
      db = candidate.db(config.mongoDbName);
      logger.info("mongo.connected");
      break;
    } catch (err) {
      logger.error("mongo.connect_failed", { name: err && err.name ? String(err.name) : undefined });
      try { await candidate.close(); } catch { /* ignore */ }
      await sleep(delay);
      delay = Math.min(delay * 2, 60 * 1000);
    }
  }
  if (!db || stopping) return;
  // Index failures never stop the API; they are retried a limited number of times and surfaced via /api/ready.
  const tryIndexes = async (attempt) => {
    if (stopping) return;
    indexState = await ensureIndexes(db, logger);
    if ((!indexState.quotes || !indexState.subscribers) && attempt < INDEX_RETRY_MAX) later(() => tryIndexes(attempt + 1), INDEX_RETRY_MS);
  };
  await tryIndexes(1);
  startSweep();
}

let sweeping = false;
function startSweep() {
  if (!mailer) return;
  const run = async () => {
    if (stopping) return;
    if (!sweeping) {
      sweeping = true;
      try {
        const s = await app.recover({ limit: 5 });
        if (s && s.claimed) logger.info("notification.sweep", { count: s.claimed });
      } catch { logger.error("notification.sweep_failed"); } finally { sweeping = false; }
    }
    later(run, SWEEP_EVERY_MS);
  };
  later(run, SWEEP_FIRST_MS);
}

const server = app.listen(config.port, () => logger.info("server.listening", { count: config.port }));
connectToMongo();

const shutdown = createShutdown({
  server, logger,
  closers: [() => { for (const t of timers) clearTimeout(t); timers.clear(); stopping = true; }, () => (client ? client.close() : undefined)],
});
process.on("SIGTERM", () => { stopping = true; shutdown("SIGTERM"); });
process.on("SIGINT", () => { stopping = true; shutdown("SIGINT"); });
process.on("unhandledRejection", () => logger.error("process.unhandled_rejection"));
process.on("uncaughtException", () => { logger.fatal("process.uncaught_exception"); process.exit(1); });

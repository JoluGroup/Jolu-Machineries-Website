// Process entry point: loads configuration, connects to MongoDB, wires Resend, starts the HTTP server.
require("dotenv").config();
const { MongoClient, ServerApiVersion } = require("mongodb");
const { loadConfig } = require("./config");
const { createLogger } = require("./logger");
const { createResendMailer } = require("./mailer");
const { createApp } = require("./app");

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

let db = null;
let mailer = null;
if (config.resendApiKey && config.emailFrom && config.emailTo.length) {
  mailer = createResendMailer({ apiKey: config.resendApiKey, from: config.emailFrom, to: config.emailTo });
}

async function connectToMongo() {
  if (!config.mongoUri || !config.mongoDbName) return;
  const client = new MongoClient(config.mongoUri, {
    serverApi: { version: ServerApiVersion.v1, strict: true, deprecationErrors: true },
    serverSelectionTimeoutMS: 10000,
  });
  try {
    await client.connect();
    const database = client.db(config.mongoDbName);
    await database.collection("subscribers").createIndex({ email: 1 }, { unique: true });
    await database.collection("quotes").createIndex({ fingerprint: 1, windowKey: 1 }, { unique: true });
    db = database;
    logger.info("mongo.connected");
  } catch (err) {
    logger.error("mongo.connect_failed", { name: err && err.name ? String(err.name) : undefined });
    if (config.production) process.exit(1); // Render restarts the service; /api/ready stays 503 until it connects
  }
}

const app = createApp({ config, getDb: () => db, mailer, logger });
connectToMongo();
app.listen(config.port, () => logger.info("server.listening", { count: config.port }));

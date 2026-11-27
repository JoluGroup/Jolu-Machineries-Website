// READ-ONLY report of duplicate / case-variant subscriber emails. Changes nothing.
// Usage (from server/):  MONGO_URI=... MONGO_DB_NAME=... node scripts/audit-subscribers.js
// Output contains email addresses: keep it private. Remediate manually (see README) before relying on the unique index.
require("dotenv").config();
const { MongoClient, ServerApiVersion } = require("mongodb");
const { auditSubscribers } = require("../indexes");

(async () => {
  const { MONGO_URI, MONGO_DB_NAME } = process.env;
  if (!MONGO_URI || !MONGO_DB_NAME) { console.error("Set MONGO_URI and MONGO_DB_NAME."); process.exit(2); }
  const client = new MongoClient(MONGO_URI, { serverApi: { version: ServerApiVersion.v1, strict: true } });
  try {
    await client.connect();
    const report = await auditSubscribers(client.db(MONGO_DB_NAME).collection("subscribers"));
    console.log(JSON.stringify(report, null, 2));
  } finally { await client.close(); }
})().catch((e) => { console.error("audit failed:", e && e.name); process.exit(1); });

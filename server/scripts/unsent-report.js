// READ-ONLY: lists quotes/contacts/schedules whose notification email is not "sent". Changes and sends nothing.
// Usage (from server/):  npm run unsent -- [--json] [--limit N]   (needs MONGO_URI and MONGO_DB_NAME)
// Output has record ids, dates, states and counts only. No customer details.
require("dotenv").config();
const { MongoClient, ServerApiVersion } = require("mongodb");
const { run } = require("../unsent");

run(process.argv.slice(2), process.env, {
  connect: async (uri) => {
    const c = new MongoClient(uri, { serverApi: { version: ServerApiVersion.v1, strict: true }, serverSelectionTimeoutMS: 10000 });
    await c.connect();
    return c;
  },
}).then((code) => { process.exitCode = code; });

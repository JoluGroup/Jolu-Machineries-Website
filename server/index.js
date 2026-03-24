// server/index.js
require("dotenv").config();
const { MongoClient, ServerApiVersion } = require("mongodb");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const { Resend } = require("resend"); // <— ADDED
const { z } = require("zod");
const path = require("path");

const app = express();

app.set("trust proxy", 1);

// --- Security & middleware ---
app.use(helmet());
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

// --- CORS setup ---
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (origin.includes("localhost")) return callback(null, true);
      if (process.env.NODE_ENV === "production") return callback(null, true);
      return callback(new Error(`CORS policy: origin ${origin} not allowed`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  })
);

// Handle preflight requests globally
app.options("*", cors());

// --- Rate limiter ---
const limiter = rateLimit({ windowMs: 60 * 1000, max: 60 });
app.use(limiter);

// --- MongoDB connection ---
const uri = process.env.MONGO_URI;
const client = new MongoClient(uri, {
  serverApi: { version: ServerApiVersion.v1, strict: true, deprecationErrors: true },
});

let db;
async function connectToMongo() {
  try {
    await client.connect();
    db = client.db(process.env.MONGO_DB_NAME);
    console.log("✅ Connected to MongoDB Atlas");
  } catch (err) {
    console.error("❌ Failed to connect to MongoDB", err);
    process.exit(1);
  }
}

// Ensure unique indexes
async function ensureIndexes() {
  try {
    await db.collection("subscribers").createIndex({ email: 1 }, { unique: true });
    console.log("✅ subscribers.email unique index ensured");
  } catch (e) {
    console.error("Index creation notice:", e.message);
  }
}

connectToMongo().then(() => ensureIndexes());

// --- Email via RESEND ---
const resend = new Resend(process.env.RESEND_API_KEY);

// --- Validation schemas ---
const t = (min) => z.string().trim().min(min);

const contactSchema = z.object({
  name: t(2),
  email: z.string().trim().email(),
  phone: t(7),
  county: t(2),
  area: t(2),
  productInterest: z.string().trim().optional().nullable(),
  message: t(10),
});

const quoteSchema = contactSchema;

const scheduleSchema = z.object({
  name: t(2),
  email: z.string().trim().email(),
  phone: t(7),
  preferredDate: t(4),
  preferredTime: t(2),
  product: t(2),
  notes: z.string().trim().optional().nullable(),
});

const subscribeSchema = z.object({
  email: z.string().trim().email(),
});

// --- Exports for routes ---
module.exports = {
  db: () => db,
  resend: () => resend, // <— UPDATED
  contactSchema,
  quoteSchema,
  scheduleSchema,
  z,
};

// --- Routes ---
app.get("/api/health", async (_req, res) => {
  res.json({ ok: true, timestamp: new Date().toISOString() });
});

// Contact Route
app.post("/api/contact", async (req, res) => {
  try {
    const payload = contactSchema.parse(req.body);
    await db.collection("contacts").insertOne({ ...payload, createdAt: new Date() });

    await resend.emails.send({
      from: process.env.EMAIL_FROM,
      to: process.env.EMAIL_TO,
      subject: `New Contact: ${payload.name} (${payload.productInterest || "General"})`,
      text: `Name: ${payload.name}
Email: ${payload.email}
Phone: ${payload.phone}
County: ${payload.county}
Area: ${payload.area}
Interest: ${payload.productInterest || "N/A"}
Message:
${payload.message}`,
    });

    res.status(201).json({ ok: true, message: "Contact saved & email sent" });
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ ok: false, errors: err.flatten() });
    console.error("Contact form error:", err);
    res.status(500).json({ ok: false, message: "Server error" });
  }
});

// Schedule Route
app.post("/api/schedule", async (req, res) => {
  try {
    const payload = scheduleSchema.parse(req.body);
    await db.collection("schedules").insertOne({ ...payload, createdAt: new Date() });

    await resend.emails.send({
      from: process.env.EMAIL_FROM,
      to: process.env.EMAIL_TO,
      subject: `Demo Request: ${payload.name} — ${payload.product}`,
      text: `Name: ${payload.name}
Email: ${payload.email}
Phone: ${payload.phone}
Preferred Date: ${payload.preferredDate}
Preferred Time: ${payload.preferredTime}
Product: ${payload.product}
Notes:
${payload.notes || "N/A"}`,
    });

    res.status(201).json({ ok: true, message: "Schedule saved & email sent" });
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ ok: false, errors: err.flatten() });
    console.error("Schedule form error:", err);
    res.status(500).json({ ok: false, message: "Server error" });
  }
});

// Quotes Route
const quoteRoutes = require("./routes/quoteRoutes");
app.use("/api/quotes", quoteRoutes);

// Subscribe Route
app.post("/api/subscribe", async (req, res) => {
  try {
    const { email } = subscribeSchema.parse(req.body);
    const normalized = email.toLowerCase();
    const now = new Date();

    const result = await db.collection("subscribers").updateOne(
      { email: normalized },
      { $setOnInsert: { email: normalized, createdAt: now } },
      { upsert: true }
    );

    const already = result.upsertedCount === 0;

    await resend.emails.send({
      from: process.env.EMAIL_FROM,
      to: process.env.EMAIL_TO,
      subject: already
        ? `⚠️ Existing subscriber tried again: ${normalized}`
        : `✅ New newsletter subscriber: ${normalized}`,
      text: already
        ? `The email ${normalized} attempted to subscribe again on ${now.toISOString()}, but is already in the list.`
        : `A new subscriber signed up at ${now.toISOString()}.\nEmail: ${normalized}`,
    });

    return res
      .status(already ? 200 : 201)
      .json({ ok: true, status: already ? "already_subscribed" : "subscribed" });
  } catch (err) {
    if (err instanceof z.ZodError)
      return res.status(400).json({ ok: false, errors: err.flatten() });

    if (err && err.code === 11000)
      return res.status(200).json({ ok: true, status: "already_subscribed" });

    console.error("Subscribe error:", err);
    return res.status(500).json({ ok: false, message: "Server error" });
  }
});

// Root
app.get("/", (req, res) => {
  res.send("🚀 Jolu Machinery API is live! Visit /api/health to check status.");
});

// Start Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 API running on http://localhost:${PORT}`);
});

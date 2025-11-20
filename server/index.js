// server/index.js
require("dotenv").config();
const { MongoClient, ServerApiVersion } = require("mongodb");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const nodemailer = require("nodemailer");
const { z } = require("zod");
const path = require("path");

const app = express();

// --- Security & middleware ---
app.use(helmet());
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

// --- CORS setup ---
// Allow localhost in dev, any origin in production
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true); // Postman, curl
      if (origin.includes("localhost")) return callback(null, true); // all localhost ports
      if (process.env.NODE_ENV === "production") return callback(null, true); // production frontend
      return callback(new Error(`CORS policy: origin ${origin} not allowed`));
    }, // <-- COMMA HERE

    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
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

// Ensure unique indexes used by this API
async function ensureIndexes() {
  try {
    await db.collection("subscribers").createIndex({ email: 1 }, { unique: true });
    console.log("✅ subscribers.email unique index ensured");
  } catch (e) {
    // If it already exists, this will usually be a no-op or a harmless message
    console.error("Index creation notice:", e.message);
  }
}

connectToMongo().then(() => ensureIndexes());

// --- Email transporter ---
let transporter = null;
if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 465),
    secure: Number(process.env.SMTP_PORT || 465) === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });

  transporter.verify((error, success) => {
    if (error) console.error("SMTP connection error:", error);
    else console.log("✅ SMTP server is ready to take messages");
  });
}

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

// ✅ New: subscribe schema
const subscribeSchema = z.object({
  email: z.string().trim().email(),
});

// --- Exports for routes ---
module.exports = {
  db: () => db,
  transporter: () => transporter,
  contactSchema,
  quoteSchema,
  scheduleSchema,
  z,
};

// --- Routes ---
app.get("/api/health", async (_req, res) => {
  res.json({ ok: true, timestamp: new Date().toISOString() });
});

// ✅ Contact Route
app.post("/api/contact", async (req, res) => {
  try {
    const payload = contactSchema.parse(req.body);
    await db.collection("contacts").insertOne({ ...payload, createdAt: new Date() });

    if (transporter) {
      await transporter.sendMail({
        to: process.env.EMAIL_TO,
        from: process.env.EMAIL_FROM || "noreply@example.com",
        subject: `New Contact: ${payload.name} (${payload.productInterest || "General"})`,
        text: `Name: ${payload.name}\nEmail: ${payload.email}\nPhone: ${payload.phone}\nCounty: ${payload.county}\nArea: ${payload.area}\nInterest: ${payload.productInterest || "N/A"}\nMessage:\n${payload.message}`,
      });
    }

    res.status(201).json({ ok: true, message: "Contact saved & email sent" });
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ ok: false, errors: err.flatten() });
    console.error("Contact form error:", err);
    res.status(500).json({ ok: false, message: "Server error" });
  }
});

// ✅ Schedule Route
app.post("/api/schedule", async (req, res) => {
  try {
    const payload = scheduleSchema.parse(req.body);
    await db.collection("schedules").insertOne({ ...payload, createdAt: new Date() });

    if (transporter) {
      await transporter.sendMail({
        to: process.env.EMAIL_TO,
        from: process.env.EMAIL_FROM || "noreply@example.com",
        subject: `Demo Request: ${payload.name} — ${payload.product}`,
        text: `Name: ${payload.name}\nEmail: ${payload.email}\nPhone: ${payload.phone}\nPreferred Date: ${payload.preferredDate}\nPreferred Time: ${payload.preferredTime}\nProduct: ${payload.product}\nNotes:\n${payload.notes || "N/A"}`,
      });
    }

    res.status(201).json({ ok: true, message: "Schedule saved & email sent" });
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ ok: false, errors: err.flatten() });
    console.error("Schedule form error:", err);
    res.status(500).json({ ok: false, message: "Server error" });
  }
});

// ✅ Quotes Route
const quoteRoutes = require("./routes/quoteRoutes");
app.use("/api/quotes", quoteRoutes);

// ✅ NEW: Subscribe Route
app.post("/api/subscribe", async (req, res) => {
  try {
    const { email } = subscribeSchema.parse(req.body);
    const normalized = email.toLowerCase();
    const now = new Date();

    // Upsert (no duplicates)
    const result = await db.collection("subscribers").updateOne(
      { email: normalized },
      { $setOnInsert: { email: normalized, createdAt: now } },
      { upsert: true }
    );

    const already = result.upsertedCount === 0;

    // ✅ Send different emails for new vs existing subscriber
    if (transporter && process.env.EMAIL_TO) {
      if (already) {
        await transporter.sendMail({
          to: process.env.EMAIL_TO,
          from: process.env.EMAIL_FROM || "noreply@example.com",
          subject: `⚠️ Existing subscriber tried again: ${normalized}`,
          text: `The email ${normalized} attempted to subscribe again on ${now.toISOString()}, but is already in the subscribers list.`,
        });
      } else {
        await transporter.sendMail({
          to: process.env.EMAIL_TO,
          from: process.env.EMAIL_FROM || "noreply@example.com",
          subject: `✅ New newsletter subscriber: ${normalized}`,
          text: `A new subscriber signed up at ${now.toISOString()}.\nEmail: ${normalized}`,
        });
      }
    }

    return res
      .status(already ? 200 : 201)
      .json({ ok: true, status: already ? "already_subscribed" : "subscribed" });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ ok: false, errors: err.flatten() });
    }
    // Handle duplicate key edge case (race conditions)
    if (err && err.code === 11000) {
      return res.status(200).json({ ok: true, status: "already_subscribed" });
    }
    console.error("Subscribe error:", err);
    return res.status(500).json({ ok: false, message: "Server error" });
  }
});

// --- Root route ---
app.get("/", (req, res) => {
  res.send("🚀 Jolu Machinery API is live! Visit /api/health to check status.");
});

// --- Server start ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 API running on http://localhost:${PORT}`);
});

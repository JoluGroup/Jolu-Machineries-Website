// server/index.js
require("dotenv").config();
const { MongoClient, ServerApiVersion } = require("mongodb");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const nodemailer = require("nodemailer");
const { z } = require("zod");

const app = express();

// --- Security & middleware ---
app.use(helmet());
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

// ✅ MongoDB connection
const uri = process.env.MONGO_URI;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
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
connectToMongo();

// ✅ CORS setup
const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:8080",
  "http://127.0.0.1:8080",
  process.env.CLIENT_ORIGIN || ""
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

// --- Basic rate limiter ---
const limiter = rateLimit({ windowMs: 60 * 1000, max: 60 });
app.use(limiter);

// --- Email transporter ---
let transporter = null;
if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 465),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  transporter.verify((error, success) => {
    if (error) {
      console.error("SMTP connection error:", error);
    } else {
      console.log("✅ SMTP server is ready to take messages");
    }
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

const scheduleSchema = z.object({
  name: t(2),
  email: z.string().trim().email(),
  phone: t(7),
  preferredDate: t(4),
  product: t(2),
  notes: z.string().trim().optional().nullable(),
});

// --- Routes ---
app.get("/api/health", async (_req, res) => {
  res.json({ ok: true, timestamp: new Date().toISOString() });
});

// ✅ Contact Route
app.post("/api/contact", async (req, res) => {
  try {
    const payload = contactSchema.parse(req.body);

    // Save to MongoDB
    await db.collection("contacts").insertOne({
      ...payload,
      createdAt: new Date(),
    });

    // Send email
    if (transporter) {
      await transporter.sendMail({
        to: process.env.EMAIL_TO, // multiple recipients supported
        from: process.env.EMAIL_FROM || "noreply@example.com",
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
    }

    res.status(201).json({ ok: true, message: "Contact saved & email sent" });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ ok: false, errors: err.flatten() });
    }
    console.error("Contact form error:", err);
    res.status(500).json({ ok: false, message: "Server error" });
  }
});

// ✅ Schedule Route
app.post("/api/schedule", async (req, res) => {
  try {
    const payload = scheduleSchema.parse(req.body);

    // Save to MongoDB
    await db.collection("schedules").insertOne({
      ...payload,
      createdAt: new Date(),
    });

    // Send email
    if (transporter) {
      await transporter.sendMail({
        to: process.env.EMAIL_TO, // multiple recipients supported
        from: process.env.EMAIL_FROM || "noreply@example.com",
        subject: `Demo Request: ${payload.name} — ${payload.product}`,
        text: `Name: ${payload.name}
Email: ${payload.email}
Phone: ${payload.phone}
Preferred Date: ${payload.preferredDate}
Product: ${payload.product}
Notes:
${payload.notes || "N/A"}`,
      });
    }

    res.status(201).json({ ok: true, message: "Schedule saved & email sent" });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ ok: false, errors: err.flatten() });
    }
    console.error("Schedule form error:", err);
    res.status(500).json({ ok: false, message: "Server error" });
  }
});

// ✅ Quotes route placeholder
const quoteRouter = require("express").Router();
quoteRouter.get("/", (_req, res) => res.json({ message: "This is the quote route" }));
app.use("/api/quotes", quoteRouter);


// --- Root route ---
app.get("/", (req, res) => {
  res.send("🚀 Jolu Machinery API is live! Visit /api/health to check status.");
});

// --- Server start ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 API running on http://localhost:${PORT}`);
});

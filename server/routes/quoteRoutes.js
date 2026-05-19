const router = require("express").Router();
const { db, transporter, quoteSchema, z } = require("../index.js");

router.post("/", async (req, res) => {
  try {
    const payload = quoteSchema.parse(req.body);
    const dbClient = db();
    if (!dbClient) {
      return res.status(500).json({ ok: false, message: "DB not connected" });
    }

    // Save to MongoDB
    await dbClient.collection("quotes").insertOne({
      ...payload,
      createdAt: new Date(),
    });

    // Send email
    const mailTransporter = transporter();
    if (mailTransporter) {
      await mailTransporter.sendMail({
        to: process.env.EMAIL_TO,
        from: process.env.EMAIL_FROM || "noreply@example.com",
        subject: `New Quote Request: ${payload.name} (${
          payload.productInterest || "General"
        })`,
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

    res.status(201).json({ ok: true, message: "Quote request saved & email sent" });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ ok: false, errors: err.flatten() });
    }
    console.error("Quote form error:", err);
    res.status(500).json({ ok: false, message: "Server error" });
  }
});

module.exports = router;

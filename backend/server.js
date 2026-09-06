require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

// Fail fast at boot if a secret the whole API depends on is missing, rather
// than 500-ing on the first login or DB query in production. Skipped under
// tests, which set only what each case needs.
if (process.env.NODE_ENV !== "test") {
  const required = ["DATABASE_URL", "JWT_SECRET"];
  const missing = required.filter((name) => !process.env[name]);
  if (missing.length) {
    console.error(`Cannot start: missing required env var(s): ${missing.join(", ")}`);
    process.exit(1);
  }
}

const authRoutes = require("./routes/auth");
const leadsRoutes = require("./routes/leads");
const customersRoutes = require("./routes/customers");
const followupsRoutes = require("./routes/followups");
const quotationsRoutes = require("./routes/quotations");
const projectsRoutes = require("./routes/projects");
const employeesRoutes = require("./routes/employees");
const reviewsRoutes = require("./routes/reviews");
const receiptsRoutes = require("./routes/receipts");

const app = express();

// Render (and most PaaS hosts) sit behind a reverse proxy, so every request
// arrives with an X-Forwarded-For header. Without this, express-rate-limit
// can't trust that header and refuses to start, and req.ip would resolve to
// the proxy's address for every request instead of the real client's.
app.set("trust proxy", 1);

app.use(helmet());
app.use(
  cors({
    origin: (process.env.CORS_ORIGIN || "http://localhost:5173").split(","),
  }),
);
app.use(express.json());

const publicLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20 });
app.use("/api/enquiries", publicLimiter);
// Every marketing page load hits /api/reviews/public, so it needs a far more
// generous ceiling than the enquiry form — but still a ceiling, since it is
// unauthenticated and reachable by anyone.
app.use("/api/reviews/public", rateLimit({ windowMs: 15 * 60 * 1000, max: 600 }));
app.use("/api/auth/login", rateLimit({ windowMs: 15 * 60 * 1000, max: 20 }));

app.use("/api/auth", authRoutes);
app.use("/api", leadsRoutes);
app.use("/api/customers", customersRoutes);
app.use("/api/followups", followupsRoutes);
app.use("/api/quotations", quotationsRoutes);
app.use("/api/projects", projectsRoutes);
app.use("/api/employees", employeesRoutes);
app.use("/api/reviews", reviewsRoutes);
app.use("/api/receipts", receiptsRoutes);

app.get("/api/health", (req, res) => res.json({ ok: true }));

// Body too large / malformed JSON — thrown by express.json() before any route
// runs. A client error, not a server fault, so answer 400 not 500.
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  if (err.type === "entity.parse.failed" || err.type === "entity.too.large") {
    return res.status(400).json({ error: "The request body could not be read." });
  }
  if (err.code === "23503") {
    return res.status(409).json({ error: "This record is linked to other data and can't be deleted. Remove or reassign the linked records first." });
  }
  if (err.code === "23505") {
    return res.status(409).json({ error: "That value is already in use." });
  }
  if (err.code === "23502" || err.code === "23514") {
    // NOT NULL / CHECK constraint — the payload passed Joi but the DB rejected it.
    return res.status(400).json({ error: "Some of the supplied values are not valid." });
  }
  if (["22P02", "22003", "22007", "22008", "22001"].includes(err.code)) {
    // Bad type/format/range in a URL param or body value (e.g. a non-numeric
    // :id, an out-of-range number, an unparseable date). Client error.
    return res.status(400).json({ error: "A value in the request is malformed." });
  }
  console.error(err);
  res.status(500).json({ error: "Something went wrong." });
});

const port = process.env.PORT || 3001;
if (require.main === module) {
  const server = app.listen(port, () => console.log(`Avaya Udyog CRM API listening on port ${port}`));

  // Last line of defence. A bug that throws outside a request handler (or an
  // async rejection nothing awaited) would otherwise take the process down
  // silently. Log it; for an uncaught exception the process state may be
  // unsound, so exit cleanly and let the host restart a fresh instance.
  process.on("unhandledRejection", (reason) => {
    console.error("Unhandled promise rejection:", reason);
  });
  process.on("uncaughtException", (err) => {
    console.error("Uncaught exception:", err);
    server.close(() => process.exit(1));
    // Don't wait forever for in-flight connections to drain.
    setTimeout(() => process.exit(1), 5000).unref();
  });
}

module.exports = app;

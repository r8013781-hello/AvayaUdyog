require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const authRoutes = require("./routes/auth");
const leadsRoutes = require("./routes/leads");
const customersRoutes = require("./routes/customers");
const followupsRoutes = require("./routes/followups");
const quotationsRoutes = require("./routes/quotations");
const projectsRoutes = require("./routes/projects");
const employeesRoutes = require("./routes/employees");
const reviewsRoutes = require("./routes/reviews");

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

app.get("/api/health", (req, res) => res.json({ ok: true }));

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  if (err.code === "23503") {
    return res.status(409).json({ error: "This record is linked to other data and can't be deleted. Remove or reassign the linked records first." });
  }
  if (err.code === "23505") {
    return res.status(409).json({ error: "That value is already in use." });
  }
  console.error(err);
  res.status(500).json({ error: "Something went wrong." });
});

const port = process.env.PORT || 3001;
if (require.main === module) {
  app.listen(port, () => console.log(`Avaya Udyog CRM API listening on port ${port}`));
}

module.exports = app;

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

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: (process.env.CORS_ORIGIN || "http://localhost:5173").split(","),
  }),
);
app.use(express.json());

const publicLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20 });
app.use("/api/enquiries", publicLimiter);
app.use("/api/auth/login", rateLimit({ windowMs: 15 * 60 * 1000, max: 20 }));

app.use("/api/auth", authRoutes);
app.use("/api", leadsRoutes);
app.use("/api/customers", customersRoutes);
app.use("/api/followups", followupsRoutes);
app.use("/api/quotations", quotationsRoutes);
app.use("/api/projects", projectsRoutes);

app.get("/api/health", (req, res) => res.json({ ok: true }));

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Something went wrong." });
});

const port = process.env.PORT || 3001;
if (require.main === module) {
  app.listen(port, () => console.log(`Avaya Udyog CRM API listening on port ${port}`));
}

module.exports = app;

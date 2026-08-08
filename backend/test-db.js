require("dotenv").config();
const { query } = require("./lib/db");

async function check() {
  try {
    const res = await query("SELECT * FROM project_payments");
    console.log("Payments:", res.recordset);
  } catch (err) {
    console.error("DB Error:", err);
  }
  process.exit();
}
check();

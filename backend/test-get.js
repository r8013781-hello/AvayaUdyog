require("dotenv").config();
const { query } = require("./lib/db");
async function test() {
  try {
    const res = await query(`
      SELECT p.id, p.project_code AS [projectCode], p.name,
             (SELECT ISNULL(SUM(amount), 0) FROM project_payments WHERE project_id = p.id) AS totalPaid
      FROM projects p 
    `);
    console.log("Projects:", res.recordset);
  } catch(e) {
    console.error("Error:", e);
  }
  process.exit();
}
test();

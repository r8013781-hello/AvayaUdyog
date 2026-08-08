require("dotenv").config();
const { query } = require("./lib/db");
async function test() {
  try {
    const res = await query(
      "INSERT INTO project_payments (project_id, amount, payment_date, payment_mode, reference_no, notes, created_by) OUTPUT INSERTED.* VALUES (@projectId, @amount, @paymentDate, @paymentMode, @referenceNo, @notes, @createdBy)",
      { projectId: 1, amount: 1000, paymentDate: new Date(), paymentMode: 'Cash', referenceNo: '', notes: '', createdBy: 1 }
    );
    console.log("Success:", res.recordset);
  } catch(e) {
    console.error("Error:", e);
  }
  process.exit();
}
test();

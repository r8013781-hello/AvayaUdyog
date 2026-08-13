const jwt = require("jsonwebtoken");
const { query } = require("../lib/db");

const RESOURCES = ["leads", "customers", "followups", "quotations", "projects"];
const ACTIONS = ["create", "read", "update", "delete"];

// Employee/permission state is re-read from the database on every request (not trusted
// from the JWT) so that revoking rights or disabling an account takes effect immediately,
// not just after the token expires.
async function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) return res.status(401).json({ error: "Authentication required." });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const result = await query(
      `SELECT id, employee_code, name, role, is_super_admin, permissions, status
       FROM employees WHERE id = $1`,
      [payload.id],
    );
    const employee = result.rows[0];
    if (!employee) return res.status(401).json({ error: "Session is no longer valid." });
    if (employee.status !== "Active") return res.status(403).json({ error: "This account has been disabled." });

    req.employee = {
      id: employee.id,
      employeeCode: employee.employee_code,
      name: employee.name,
      role: employee.role,
      isSuperAdmin: employee.is_super_admin,
      permissions: employee.permissions || {},
      status: employee.status,
    };
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired session." });
  }
}

function requireSuperAdmin(req, res, next) {
  if (!req.employee?.isSuperAdmin) return res.status(403).json({ error: "Super admin access required." });
  next();
}

function requirePermission(resource, action) {
  return (req, res, next) => {
    if (req.employee?.isSuperAdmin) return next();
    const granted = req.employee?.permissions?.[resource] || [];
    if (!granted.includes(action)) {
      return res.status(403).json({ error: "You don't have permission to do that." });
    }
    next();
  };
}

module.exports = { requireAuth, requireSuperAdmin, requirePermission, RESOURCES, ACTIONS };

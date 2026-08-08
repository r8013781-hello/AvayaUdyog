"use strict";
/**
 * smoke-test.js — Full endpoint smoke test against a running local server.
 *
 * Usage:
 *   1. Start the backend:  npm run dev
 *   2. In a second terminal: node scripts/smoke-test.js
 *
 * Safe to run multiple times — all test data is suffixed with a timestamp
 * so there are no unique-constraint collisions on repeat runs.
 */

require("dotenv").config();

const BASE = `http://localhost:${process.env.PORT || 3001}/api`;
const EMPLOYEE_CODE = process.env.ADMIN_EMPLOYEE_CODE || "RAHUL";
const EMPLOYEE_PASS = process.env.ADMIN_PASSWORD || "change-before-deploying";

// Unique suffix so the script can be run multiple times without conflicts.
const RUN_ID = Date.now();

let token = "";
const results = [];
let createdCustomerId, createdProjectId;

// ── Helpers ────────────────────────────────────────────────────────────────

async function req(method, path, body) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  let json;
  try { json = await res.json(); } catch { json = null; }
  return { status: res.status, json };
}

function pass(label) {
  console.log(`  ✅  PASS  ${label}`);
  results.push({ label, ok: true });
}

function fail(label, detail) {
  console.error(`  ❌  FAIL  ${label}  —  ${detail}`);
  results.push({ label, ok: false, detail });
}

function assert(label, condition, detail = "") {
  condition ? pass(label) : fail(label, detail);
  return condition;
}

// ── Test sections ──────────────────────────────────────────────────────────

async function testHealth() {
  console.log("\n── Health ──────────────────────────────────────────────────");
  const { status, json } = await req("GET", "/health");
  assert("GET /health → 200", status === 200, `got ${status}`);
  assert("GET /health → ok:true", json?.ok === true, JSON.stringify(json));
}

async function testAuth() {
  console.log("\n── Authentication ──────────────────────────────────────────");
  const { status, json } = await req("POST", "/auth/login", {
    employeeCode: EMPLOYEE_CODE,
    password: EMPLOYEE_PASS,
  });
  if (!assert("POST /auth/login → 200", status === 200, `got ${status} — ${JSON.stringify(json)}`)) {
    throw new Error("Authentication failed — cannot continue without a token.");
  }
  assert("POST /auth/login → token present", typeof json?.token === "string", JSON.stringify(json));
  token = json.token;
}

async function testLeads() {
  console.log("\n── Leads ───────────────────────────────────────────────────");
  const get = await req("GET", "/leads");
  assert("GET /leads → 200", get.status === 200, `got ${get.status}`);
  assert("GET /leads → array", Array.isArray(get.json), typeof get.json);

  const post = await req("POST", "/leads", {
    name: `Smoke Lead ${RUN_ID}`,
    phone: `90${String(RUN_ID).slice(-8)}`,  // unique per run
    project: "Smoke Test Interior",
    source: "Website",
    value: 100000,
    nextActionDate: new Date().toISOString().slice(0, 10),
  });
  const ok = assert("POST /leads → 201", post.status === 201, `got ${post.status} — ${JSON.stringify(post.json)}`);
  if (ok) assert("POST /leads → id returned", !!post.json?.id, JSON.stringify(post.json));
}

async function testCustomers() {
  console.log("\n── Customers ───────────────────────────────────────────────");
  const get = await req("GET", "/customers");
  assert("GET /customers → 200", get.status === 200, `got ${get.status}`);
  assert("GET /customers → array", Array.isArray(get.json), typeof get.json);

  const post = await req("POST", "/customers", {
    name: `Smoke Customer ${RUN_ID}`,
    phone: `91${String(RUN_ID).slice(-8)}`,  // unique per run
    email: `smoke+${RUN_ID}@avayaudyog.test`,
    city: "Kolkata",
    companyName: "",
    address: "123 Smoke Street",
    gstin: "",
  });
  const ok = assert("POST /customers → 201", post.status === 201, `got ${post.status} — ${JSON.stringify(post.json)}`);
  if (ok) {
    createdCustomerId = post.json?.id;
    assert("POST /customers → id returned", !!createdCustomerId, JSON.stringify(post.json));
  }
}

async function testFollowups() {
  console.log("\n── Follow-ups ──────────────────────────────────────────────");
  const get = await req("GET", "/followups");
  assert("GET /followups → 200", get.status === 200, `got ${get.status}`);
  assert("GET /followups → array", Array.isArray(get.json), typeof get.json);

  const post = await req("POST", "/followups", {
    contact: `Smoke Contact ${RUN_ID}`,
    type: "Call",
    dueDate: new Date().toISOString().slice(0, 10),
    dueTime: "10:00",
    note: "Automated smoke test follow-up",
  });
  assert("POST /followups → 201", post.status === 201, `got ${post.status} — ${JSON.stringify(post.json)}`);
}

async function testProjects() {
  console.log("\n── Projects ────────────────────────────────────────────────");
  const get = await req("GET", "/projects");
  assert("GET /projects → 200", get.status === 200, `got ${get.status}`);
  assert("GET /projects → array", Array.isArray(get.json), typeof get.json);

  if (!createdCustomerId) {
    fail("POST /projects — skipped (POST /customers did not return an id)");
    return;
  }
  const post = await req("POST", "/projects", {
    customerId: createdCustomerId,
    name: `Smoke Project ${RUN_ID}`,
    projectType: "Residential",
    siteAddress: "42 Smoke Lane, Kolkata",
    city: "Kolkata",
    areaSqft: 800,
    budget: 500000,
    targetDate: null,
  });
  const ok = assert("POST /projects → 201", post.status === 201, `got ${post.status} — ${JSON.stringify(post.json)}`);
  if (ok) {
    createdProjectId = post.json?.id;
    assert("POST /projects → id returned", !!createdProjectId, JSON.stringify(post.json));
  }
}

async function testPayments() {
  console.log("\n── Payments ────────────────────────────────────────────────");
  if (!createdProjectId) {
    fail("POST /projects/:id/payments — skipped (no project id)");
    return;
  }
  const post = await req("POST", `/projects/${createdProjectId}/payments`, {
    amount: 50000,
    paymentDate: new Date().toISOString().slice(0, 10),
    paymentMode: "UPI",
    referenceNo: `SMOKE-${RUN_ID}`,
    notes: "Automated smoke test payment",
  });
  assert("POST /projects/:id/payments → 201", post.status === 201, `got ${post.status} — ${JSON.stringify(post.json)}`);

  // Verify the payment is reflected in GET /projects (totalPaid column)
  const get = await req("GET", "/projects");
  const proj = get.json?.find((p) => p.id === createdProjectId);
  assert(
    "GET /projects → totalPaid reflects new payment",
    proj && Number(proj.totalPaid) > 0,
    `totalPaid=${proj?.totalPaid}, projectId=${createdProjectId}`
  );
}

async function testQuotations() {
  console.log("\n── Quotations ──────────────────────────────────────────────");
  const get = await req("GET", "/quotations");
  assert("GET /quotations → 200", get.status === 200, `got ${get.status}`);
  assert("GET /quotations → array", Array.isArray(get.json), typeof get.json);

  const post = await req("POST", "/quotations", {
    customerId: createdCustomerId || null,
    projectId:  createdProjectId  || null,
    customerName:   `Smoke Customer ${RUN_ID}`,
    projectName:    `Smoke Project ${RUN_ID}`,
    projectAddress: "42 Smoke Lane, Kolkata",
    validUntil: null,
    discount: 0,
    taxRate: 18,
    notes: "Smoke test — Master Bedroom",
    items: [
      { itemName: "Wardrobe 3×8.5 Sqft", description: "Master Bedroom", quantity: 1,   unit: "Nos",   unitPrice: 45000 },
      { itemName: "False Ceiling",        description: "Master Bedroom", quantity: 120, unit: "Sq ft", unitPrice: 85   },
    ],
  });
  const ok = assert("POST /quotations → 201", post.status === 201, `got ${post.status} — ${JSON.stringify(post.json)}`);
  if (ok) {
    assert("POST /quotations → id returned",       !!post.json?.id,                       JSON.stringify(post.json));
    assert("POST /quotations → grandTotal > 0",    Number(post.json?.grandTotal) > 0,     `grandTotal=${post.json?.grandTotal}`);
    assert("POST /quotations → quotationNo present", !!post.json?.quotationNo,            JSON.stringify(post.json));
  }
}

// ── Runner ─────────────────────────────────────────────────────────────────

async function main() {
  console.log("=================================================================");
  console.log(" Avaya Udyog CRM — Full Endpoint Smoke Test");
  console.log(`=================================================================`);
  console.log(` Target : ${BASE}`);
  console.log(` Run ID : ${RUN_ID}  (test data is unique per run)`);
  console.log("=================================================================");

  try {
    await testHealth();
    await testAuth();
    await testLeads();
    await testCustomers();
    await testFollowups();
    await testProjects();
    await testPayments();
    await testQuotations();
  } catch (err) {
    console.error("\nFATAL:", err.message);
  }

  const passed = results.filter((r) => r.ok).length;
  const failed  = results.filter((r) => !r.ok).length;

  console.log("\n=================================================================");
  console.log(` RESULTS: ${passed} passed, ${failed} failed`);
  console.log("=================================================================");

  if (failed > 0) {
    console.log("\nFailed tests:");
    results.filter((r) => !r.ok).forEach((r) =>
      console.log(`  ❌  ${r.label}${r.detail ? ": " + r.detail : ""}`)
    );
    process.exit(1);
  } else {
    console.log("\n All tests passed — Node → Tedious → Azure SQL is confirmed working.");
    process.exit(0);
  }
}

main();

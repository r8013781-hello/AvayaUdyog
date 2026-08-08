const http = require("http");

const data = JSON.stringify({
  amount: 5000,
  paymentDate: "2026-08-08",
  paymentMode: "Cash",
  referenceNo: "",
  notes: ""
});

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/projects/1/payments',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, (res) => {
  let body = "";
  res.on("data", (chunk) => body += chunk);
  res.on("end", () => console.log(res.statusCode, body));
});

req.on("error", (e) => console.error(e));
req.write(data);
req.end();

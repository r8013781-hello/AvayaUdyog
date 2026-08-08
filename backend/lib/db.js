const sql = require("mssql/msnodesqlv8");

function buildConnectionString(database) {
  const driver = process.env.DB_ODBC_DRIVER || "ODBC Driver 17 for SQL Server";
  const server = process.env.DB_SERVER || "localhost";
  const db = database || process.env.DB_NAME;

  if ((process.env.DB_AUTH || "windows") === "windows") {
    return `Driver={${driver}};Server=${server};Database=${db};Trusted_Connection=Yes;`;
  }

  return `Driver={${driver}};Server=${server};Database=${db};UID=${process.env.DB_USER};PWD=${process.env.DB_PASSWORD};`;
}

let poolPromise;

function getPool() {
  if (!poolPromise) {
    poolPromise = new sql.ConnectionPool({ connectionString: buildConnectionString() }).connect();
  }
  return poolPromise;
}

async function query(text, params = {}) {
  const pool = await getPool();
  const request = pool.request();
  for (const [name, value] of Object.entries(params)) {
    request.input(name, value);
  }
  return request.query(text);
}

module.exports = { sql, getPool, query, buildConnectionString };

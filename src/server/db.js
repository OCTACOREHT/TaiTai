const { Pool } = require("pg");

const globalForDb = globalThis;
const rawDatabaseUrl = process.env.DATABASE_URL || "";
const normalizedDatabaseUrl = rawDatabaseUrl.replace(
  /^postgres(?:ql)?:\/\/postgresql:\/\//i,
  "postgresql://",
);

const pool =
  globalForDb.__cmsPool ||
  new Pool(
    normalizedDatabaseUrl
      ? {
          connectionString: normalizedDatabaseUrl,
          ssl: { rejectUnauthorized: false },
          max: 20,
          idleTimeoutMillis: 30000,
          connectionTimeoutMillis: 15000,
          query_timeout: 30000,
          statement_timeout: 30000,
          keepAlive: true,
          allowExitOnIdle: true,
        }
      : {
          host: process.env.DB_HOST || "localhost",
          port: parseInt(process.env.DB_PORT || "5432", 10),
          database: process.env.DB_NAME || "fctoro",
          user: process.env.DB_USER || "postgres",
          password: process.env.DB_PASSWORD || "",
          max: 20,
          idleTimeoutMillis: 30000,
          connectionTimeoutMillis: 15000,
          query_timeout: 30000,
          statement_timeout: 30000,
          keepAlive: true,
          allowExitOnIdle: true,
        },
  );

if (!globalForDb.__cmsPool) {
  pool.on("error", (err) => {
    console.error("[DB] Erreur inattendue sur le pool:", err);
  });

  globalForDb.__cmsPool = pool;
}

module.exports = pool;

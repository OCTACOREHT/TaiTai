const fs = require("fs");
const { Pool } = require("pg");

function readDatabaseUrl() {
  const env = fs.readFileSync(".env.local", "utf8");
  const match = env.match(/^DATABASE_URL=(.*)$/m);
  if (!match) {
    throw new Error("DATABASE_URL manquant dans .env.local");
  }

  return match[1].trim().replace(/^["']|["']$/g, "");
}

async function main() {
  const pool = new Pool({
    connectionString: readDatabaseUrl(),
    ssl: { rejectUnauthorized: false },
  });

  try {
    const { rows } = await pool.query(
      `select table_name, column_name
       from information_schema.columns
       where table_schema = 'public'
         and table_name in ('commandes', 'clients')
       order by table_name, ordinal_position`,
    );

    console.log(JSON.stringify(rows, null, 2));
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});

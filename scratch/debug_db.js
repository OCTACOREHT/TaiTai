const db = require('./src/server/db');

async function debug() {
  try {
    console.log("--- DB Debug ---");
    const { rows } = await db.query("SELECT table_name, table_schema FROM information_schema.tables WHERE table_schema NOT IN ('information_schema', 'pg_catalog') ORDER BY table_schema, table_name");
    console.log("Tables discovered:");
    rows.forEach(r => console.log(`- ${r.table_schema}.${r.table_name}`));
    process.exit(0);
  } catch (err) {
    console.error("Error:", err.message);
    process.exit(1);
  }
}

debug();

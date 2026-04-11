
const { Pool } = require("pg");
const dotenv = require("dotenv");
dotenv.config({ path: ".env.local" });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function migrate() {
  const client = await pool.connect();
  try {
    console.log("Starting migration...");
    
    // 1. Add youtube_url column if not exists
    await client.query(`
      ALTER TABLE club_events 
      ADD COLUMN IF NOT EXISTS youtube_url TEXT;
    `);
    console.log("Column youtube_url checked/added.");

    // 2. Add new values to enum
    // We do this individually because ADD VALUE cannot run in a transaction (unless it's the same transaction that created the type)
    const newTypes = ['live_diffusion', 'vertieres_cup', 'flag_day', 'intrasquad', 'international'];
    
    // Check existing values to avoid duplicates error
    const { rows: existingEnums } = await client.query(`
      SELECT enumlabel FROM pg_enum JOIN pg_type ON pg_enum.enumtypid = pg_type.oid WHERE pg_type.typname = 'club_event_type'
    `);
    const existingLabels = existingEnums.map(r => r.enumlabel);

    for (const type of newTypes) {
      if (!existingLabels.includes(type)) {
        await client.query(`ALTER TYPE club_event_type ADD VALUE '${type}'`);
        console.log(`Added '${type}' to club_event_type enum.`);
      } else {
        console.log(`'${type}' already exists in enum.`);
      }
    }

    console.log("Migration completed successfully.");
  } catch (err) {
    console.error("Migration failed:", err.message);
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();

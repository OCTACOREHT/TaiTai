
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
    console.log("Migrating club_events to include team references...");
    
    // Add columns
    await client.query(`
      ALTER TABLE club_events 
      ADD COLUMN IF NOT EXISTS home_team_id UUID REFERENCES flagday_teams(id),
      ADD COLUMN IF NOT EXISTS away_team_id UUID REFERENCES flagday_teams(id)
    `);

    console.log("Migration successful.");
  } catch (err) {
    console.error("Migration failed:", err.message);
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();

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
    console.log("Migrating club_staff to include photo_url...");
    
    // Add column
    await client.query(`
      ALTER TABLE club_staff 
      ADD COLUMN IF NOT EXISTS photo_url text NOT NULL DEFAULT '/images/user/user-01.jpg'
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

const { Pool } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function migrate() {
  try {
    console.log("Adding status column to site_messages...");
    await pool.query("ALTER TABLE site_messages ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'pending'");
    console.log("Columm added successfully.");
  } catch (err) {
    console.error("Migration failed:", err.message);
  } finally {
    await pool.end();
  }
}

migrate();

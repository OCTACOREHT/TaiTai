const { Pool } = require("pg");
require("dotenv").config({ path: ".env.local" });

const run = async () => {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log("Checking cms_user_role enum...");
    const { rows } = await pool.query(`
      SELECT enumlabel FROM pg_enum 
      JOIN pg_type ON pg_enum.enumtypid = pg_type.oid 
      WHERE pg_type.typname = 'cms_user_role';
    `);

    console.log("Roles in cms_user_role:");
    rows.forEach(row => {
      console.log(`- ${row.enumlabel}`);
    });

  } catch (err) {
    console.error("Error:", err);
  } finally {
    await pool.end();
  }
};

run();

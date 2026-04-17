const { Pool } = require("pg");
const bcrypt = require("bcrypt");
require("dotenv").config({ path: ".env.local" });

const run = async () => {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log("Testing INSERT into admin_users...");
    const hash = await bcrypt.hash("password123", 10);
    const { rows } = await pool.query(
      `INSERT INTO admin_users
       (name, email, password_hash, role, title, avatar, bio, active)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
       RETURNING *`,
      [
        "Test User",
        "test@example.com",
        hash,
        "moderator",
        "Tester",
        "/images/user/owner.jpg",
        "I am a test",
        true
      ]
    );

    console.log("Success! Inserted:", rows[0]);

  } catch (err) {
    console.error("FAILED to insert:", err);
  } finally {
    await pool.end();
  }
};

run();

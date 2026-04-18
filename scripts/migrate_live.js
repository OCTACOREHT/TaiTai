const { Pool } = require("pg");
require("dotenv").config({ path: ".env.local" });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function migrate() {
  const client = await pool.connect();
  try {
    console.log("Migration pour le Match en Direct (Live)...");

    // Ajouter la valeur à l'ENUM (elle peut déjà exister d'où le try-catch ou IF NOT EXISTS)
    await client.query(`ALTER TYPE club_event_type ADD VALUE IF NOT EXISTS 'live_diffusion'`);

    // Ajouter les nouvelles colonnes
    await client.query(`
      ALTER TABLE club_events 
      ADD COLUMN IF NOT EXISTS youtube_url TEXT,
      ADD COLUMN IF NOT EXISTS home_score INTEGER,
      ADD COLUMN IF NOT EXISTS away_score INTEGER
    `);

    console.log("Migration réussie avec succès.");
  } catch (err) {
    console.error("Migration échouée:", err.message);
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();

const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres.yuriotdtjubnbumeisdk:Taitai@2026@aws-1-us-east-1.pooler.supabase.com:6543/postgres',
  ssl: { rejectUnauthorized: false }
});

async function run() {
  try {
    await pool.query(`
      ALTER TABLE public.clients
      ADD COLUMN IF NOT EXISTS email text;
    `);
    console.log('✅ Colonne email ajoutée à la table clients avec succès');
  } catch (e) {
    console.error('❌ Erreur:', e.message);
  } finally {
    await pool.end();
  }
}

run();

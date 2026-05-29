const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres.yuriotdtjubnbumeisdk:Taitai@2026@aws-1-us-east-1.pooler.supabase.com:6543/postgres',
  ssl: { rejectUnauthorized: false }
});

async function run() {
  try {
    // Add column if it doesn't exist
    await pool.query(`
      ALTER TABLE public.commandes
      ADD COLUMN IF NOT EXISTS client_user_id uuid REFERENCES public.clients(id) ON DELETE SET NULL;
    `);
    
    // Reload PostgREST schema cache to ensure the API sees the new column immediately
    await pool.query(`NOTIFY pgrst, 'reload schema';`);
    
    console.log('✅ Colonne client_user_id ajoutée à commandes et cache de Supabase rafraîchi.');
  } catch (e) {
    console.error('❌ Erreur:', e.message);
  } finally {
    await pool.end();
  }
}

run();

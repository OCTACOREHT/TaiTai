const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres.yuriotdtjubnbumeisdk:Taitai@2026@aws-1-us-east-1.pooler.supabase.com:6543/postgres',
  ssl: { rejectUnauthorized: false }
});

async function run() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS public.clients (
        id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
        nom         text NOT NULL,
        telephone   text NOT NULL UNIQUE,
        email       text,
        mot_de_passe_hash text NOT NULL,
        last_login_at timestamptz,
        created_at  timestamptz DEFAULT now()
      );
    `);
    console.log('✅ Table clients créée avec succès');

    // RLS
    await pool.query(`ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;`);
    await pool.query(`
      DROP POLICY IF EXISTS "clients_select" ON public.clients;
      CREATE POLICY "clients_select" ON public.clients FOR SELECT USING (true);
    `);
    await pool.query(`
      DROP POLICY IF EXISTS "clients_insert" ON public.clients;
      CREATE POLICY "clients_insert" ON public.clients FOR INSERT WITH CHECK (true);
    `);
    await pool.query(`
      DROP POLICY IF EXISTS "clients_update" ON public.clients;
      CREATE POLICY "clients_update" ON public.clients FOR UPDATE USING (true) WITH CHECK (true);
    `);
    console.log('✅ RLS configuré');
  } catch (e) {
    console.error('❌ Erreur:', e.message);
  } finally {
    await pool.end();
  }
}

run();

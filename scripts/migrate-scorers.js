const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function migrate() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    console.log('Connected to database');

    // Créer la table des buteurs par match
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.flagday_match_scorers (
        id uuid NOT NULL DEFAULT gen_random_uuid(),
        match_id uuid NOT NULL REFERENCES public.flagday_matches(id) ON DELETE CASCADE,
        player_name character varying NOT NULL,
        team_name character varying NOT NULL,
        goals integer NOT NULL DEFAULT 1,
        created_at timestamp with time zone NOT NULL DEFAULT now(),
        CONSTRAINT flagday_match_scorers_pkey PRIMARY KEY (id)
      );
    `);

    console.log('Successfully created flagday_match_scorers table');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    await client.end();
  }
}

migrate();

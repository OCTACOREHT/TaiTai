const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function migrate() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    console.log('Connected to database');

    await client.query(`
      ALTER TABLE public.flagday_competition_teams 
      ADD COLUMN IF NOT EXISTS category character varying NOT NULL DEFAULT 'U9';
    `);

    console.log('Successfully added category column to flagday_competition_teams');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    await client.end();
  }
}

migrate();

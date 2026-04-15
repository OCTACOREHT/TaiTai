require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

async function run() {
  const p = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    const query = `
      CREATE TABLE IF NOT EXISTS club_elite_players (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        number VARCHAR(10),
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        position VARCHAR(100),
        club VARCHAR(100),
        weight VARCHAR(50),
        height VARCHAR(50),
        photo_url TEXT,
        video_url TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;
    await p.query(query);
    console.log('Table club_elite_players created successfully!');
  } catch (err) {
    if (err.message && err.message.includes('gen_random_uuid() does not exist')) {
        try {
           await p.query('CREATE EXTENSION IF NOT EXISTS "pgcrypto";');
           const query2 = `
            CREATE TABLE IF NOT EXISTS club_elite_players (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                number VARCHAR(10),
                first_name VARCHAR(100) NOT NULL,
                last_name VARCHAR(100) NOT NULL,
                position VARCHAR(100),
                club VARCHAR(100),
                weight VARCHAR(50),
                height VARCHAR(50),
                photo_url TEXT,
                video_url TEXT,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
          `;
          await p.query(query2);
          console.log('Table club_elite_players created successfully with extension!');
        } catch (e2) {
           console.error('Second attempt failed', e2);
        }
    } else {
        console.error('Error:', err);
    }
  } finally {
    p.end();
  }
}

run();

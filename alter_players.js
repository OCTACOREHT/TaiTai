require('dotenv').config({ path: '.env.local' });
const db = require('./src/server/db');

async function alterTable() {
  try {
    await db.query(`
      ALTER TABLE club_players 
      ALTER COLUMN first_name DROP NOT NULL,
      ALTER COLUMN last_name DROP NOT NULL,
      ALTER COLUMN position DROP NOT NULL,
      ALTER COLUMN category DROP NOT NULL,
      ALTER COLUMN birth_date DROP NOT NULL,
      ALTER COLUMN phone DROP NOT NULL,
      ALTER COLUMN email DROP NOT NULL,
      ALTER COLUMN address DROP NOT NULL,
      ALTER COLUMN photo_url DROP NOT NULL;
    `);
    console.log("Table 'club_players' altered successfully.");
  } catch(e) {
    console.error("SQL Error:", e);
  } finally {
    process.exit(0);
  }
}
alterTable();

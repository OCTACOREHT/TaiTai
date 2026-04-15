require('dotenv').config({ path: '.env.local' });
const db = require('./src/server/db');

async function alterTable() {
  try {
    await db.query(`
      ALTER TABLE club_players 
      ALTER COLUMN membership_amount DROP NOT NULL,
      ALTER COLUMN membership_status DROP NOT NULL;
    `);
    console.log("Table 'club_players' altered successfully for membership fields.");
  } catch(e) {
    console.error("SQL Error:", e);
  } finally {
    process.exit(0);
  }
}
alterTable();

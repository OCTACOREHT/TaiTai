require('dotenv').config({ path: '.env.local' });
const db = require('./src/server/db');

async function test() {
  try {
    const { rows } = await db.query(`
      SELECT column_name, is_nullable, column_default 
      FROM information_schema.columns 
      WHERE table_name='club_players'
    `);
    console.log(rows);
  } catch(e) {
    console.error(e);
  } finally {
    process.exit(0);
  }
}
test();

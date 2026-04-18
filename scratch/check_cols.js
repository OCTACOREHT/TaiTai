require('dotenv').config({ path: '.env.local' });
console.log('DATABASE_URL loaded:', !!process.env.DATABASE_URL);
const db = require('../src/server/db');

async function checkColumns() {
  try {
    const res = await db.query("SELECT * FROM site_messages LIMIT 1");
    if (res.rows.length > 0) {
      console.log(Object.keys(res.rows[0]));
    } else {
      const columns = await db.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'site_messages'");
      console.log(columns.rows.map(r => r.column_name));
    }
  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
}

checkColumns();

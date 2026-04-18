const db = require('../src/server/db');
async function q() {
  try {
    const r = await db.query("SELECT id, email, created_at, payload FROM site_messages WHERE email = 'pitonrodjy@gmail.com'");
    console.log('Msgs:', r.rows);
    const reg = await db.query("SELECT id, guardian_email, created_at FROM player_registrations WHERE guardian_email = 'pitonrodjy@gmail.com'");
    console.log('Regs:', reg.rows);
    process.exit(0);
  } catch(e) {
    console.error(e);
    process.exit(1);
  }
}
q();

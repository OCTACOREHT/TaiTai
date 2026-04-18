const db = require('../src/server/db');

async function check() {
  try {
    const msg = await db.query('SELECT payload, email, created_at FROM site_messages WHERE id = 7');
    if (!msg.rows[0]) {
      console.log('No message with ID 7');
      return;
    }
    const { email } = msg.rows[0];
    const reg = await db.query('SELECT id, guardian_email, created_at FROM player_registrations WHERE guardian_email = $1', [email]);
    console.log('Msg 7 created_at:', msg.rows[0].created_at, 'type:', typeof msg.rows[0].created_at);
    console.log('Regs found for email:', reg.rows);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

check();

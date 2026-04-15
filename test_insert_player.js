require('dotenv').config({ path: '.env.local' });
const db = require('./src/server/db');

async function test() {
  try {
    const { rows } = await db.query(`
      INSERT INTO club_players
        (id, last_name, first_name, photo_url, position, category, status, phone, email, registration_date, birth_date, address, membership_amount, membership_status, last_payment_date)
        VALUES ('123e4567-e89b-12d3-a456-426614174000', null, null, 'photo', null, null, 'actif', null, null, CURRENT_DATE, null, null, 0, 'pending', null)
        RETURNING *
    `);
    console.log("Insert success:", rows[0]);
    await db.query("DELETE FROM club_players WHERE id = '123e4567-e89b-12d3-a456-426614174000'");
  } catch(e) {
    console.error(e);
  } finally {
    process.exit(0);
  }
}
test();

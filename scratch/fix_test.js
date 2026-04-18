const db = require('../src/server/db');

async function fix() {
  try {
    const p = await db.query('SELECT * FROM player_registrations WHERE id = 1');
    const player = p.rows[0];
    const payload = {
      program: player.program,
      child_first_name: player.child_first_name,
      child_last_name: player.child_last_name,
      child_birth_date: player.child_birth_date,
      child_gender: player.child_gender,
      child_address: player.child_address,
      child_school: player.child_school,
      child_soccer_experience: player.child_soccer_experience,
      guardian_name: player.guardian_name,
      guardian_email: player.guardian_email,
      guardian_phone: player.guardian_phone,
      emergency_name: player.emergency_name,
      emergency_relation: player.emergency_relation,
      emergency_phone: player.emergency_phone,
      uniform_top_size: player.uniform_top_size,
      uniform_short_size: player.uniform_short_size,
      payment_plan: player.payment_plan,
      payment_method: player.payment_method,
      consents: player.consents,
      _backfilled: true
    };
    
    // Check if it already exists
    const check = await db.query("SELECT id FROM site_messages WHERE type = 'joueur' AND email = $1 AND created_at = $2", [player.guardian_email, player.created_at]);
    
    if (check.rows.length === 0) {
      await db.query(
        "INSERT INTO site_messages (type, name, email, phone, message, payload, created_at, is_read) VALUES ($1, $2, $3, $4, $5, $6, $7, false)",
        ['joueur', player.guardian_name, player.guardian_email, player.guardian_phone, 'Ceci est l inscription de test avec images (id=1)', JSON.stringify(payload), player.created_at]
      );
      console.log('Message created');
    } else {
      console.log('Message already exists with ID:', check.rows[0].id);
    }
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
fix();

const db = require('../src/server/db');
async function q() {
  try {
    const r = await db.query("SELECT id, email, created_at, payload FROM site_messages WHERE type='joueur'");
    console.log('Joueur msgs:', r.rows);
    process.exit(0);
  } catch(e) {
    console.error(e);
    process.exit(1);
  }
}
q();

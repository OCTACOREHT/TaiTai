const db = require('../src/server/db');

async function diagnostic() {
  try {
    console.log("--- Diagnostic Linkage ---");
    const { rows: msgs } = await db.query("SELECT id, type, payload FROM site_messages WHERE type = 'joueur' LIMIT 5");
    console.log("Samples from site_messages:");
    msgs.forEach(m => {
        let p = m.payload;
        if (typeof p === 'string') p = JSON.parse(p);
        console.log(`- ID: ${m.id}, Registration ID in payload: ${p?.registration_id || 'null'}`);
    });

    const { rows: regs } = await db.query("SELECT id, child_first_name FROM player_registrations LIMIT 5");
    console.log("\nSamples from player_registrations:");
    regs.forEach(r => console.log(`- ID: ${r.id}, Name: ${r.child_first_name}`));

    const { rows: docs } = await db.query("SELECT registration_id, doc_key, path, length(data) as dlen FROM player_registration_documents LIMIT 5");
    console.log("\nSamples from player_registration_documents:");
    docs.forEach(d => console.log(`- Link ID: ${d.registration_id}, Key: ${d.doc_key}, Path: ${d.path}, Data Len: ${d.dlen}`));

    process.exit(0);
  } catch (err) {
    console.error("Error:", err.message);
    process.exit(1);
  }
}

diagnostic();

const db = require('../src/server/db');
const fs = require('fs');
const path = require('path');

async function testPDFGenerationVariables() {
  try {
    // Mimic the query for site_message 7
    const msg = await db.query('SELECT email, created_at FROM site_messages WHERE id = 7');
    if (!msg.rows[0]) throw new Error("Message not found.");

    const { email, created_at } = msg.rows[0];
    const { rows: regRows } = await db.query(
      `SELECT id FROM player_registrations 
       WHERE guardian_email = $1 
       ORDER BY ABS(EXTRACT(EPOCH FROM created_at) - EXTRACT(EPOCH FROM $2::timestamptz)) ASC 
       LIMIT 1`, [email, created_at]
    );

    const registrationId = regRows[0].id;
    console.log("Matched Registration ID:", registrationId);

    const { rows: docRows } = await db.query(
      "SELECT id, doc_key, path, content_type, length(data) as datalen FROM player_registration_documents WHERE registration_id = $1",
      [registrationId]
    );

    console.log("Documents Found:", docRows.length);
    for (const doc of docRows) {
      console.log(`\nDoc Key: ${doc.doc_key}, path: ${doc.path}, Content Type: ${doc.content_type}, Data Len: ${doc.datalen}`);
      if (doc.path) {
        const fullPath = path.join(process.cwd(), "public", doc.path);
        const exists = fs.existsSync(fullPath);
        console.log(`- Path exists on disk? ${exists} [${fullPath}]`);
      }
    }
  } catch (err) {
    console.error(err);
  }
  process.exit(0);
}
testPDFGenerationVariables();

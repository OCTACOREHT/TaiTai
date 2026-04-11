
const { Pool } = require("pg");
const dotenv = require("dotenv");
dotenv.config({ path: ".env.local" });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function verify() {
  const client = await pool.connect();
  try {
    const testId = crypto.randomUUID();
    const eventData = {
      id: testId,
      titre: "Test Live Sync",
      date: new Date().toISOString(),
      lieu: "Stade Virtuel",
      type: "live_diffusion",
      youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      participants: []
    };

    console.log("Testing POST simulation logic...");
    
    // Simulate the logic in route.js
    await client.query(
      "INSERT INTO club_events (id, title, event_date, location, type, youtube_url) VALUES ($1,$2,$3,$4,$5,$6)",
      [eventData.id, eventData.titre, eventData.date, eventData.lieu, eventData.type, eventData.youtubeUrl],
    );

    console.log("Event inserted successfully.");

    const { rows } = await client.query("SELECT * FROM club_events WHERE id = $1", [testId]);
    console.log("Inserted row:", rows[0]);

    if (rows[0].youtube_url === eventData.youtubeUrl) {
      console.log("VÉRIFICATION RÉUSSIE : youtube_url est bien en DB !");
    } else {
      console.log("ÉCHEC : youtube_url non trouvé.");
    }

    // Cleanup
    await client.query("DELETE FROM club_events WHERE id = $1", [testId]);

  } catch (err) {
    console.error("Verification failed:", err.message);
  } finally {
    client.release();
    await pool.end();
  }
}

verify();

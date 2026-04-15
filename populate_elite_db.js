require('dotenv').config({ path: '.env.local' });
const db = require('./src/server/db');

const players = [
  { no: "1", nom: "Pierre", prenom: "Wendy", poste: "GK", poids: "58KG", hauteur: "1M5" },
  { no: "2", nom: "Traine", prenom: "Johnlove", poste: "Ailier", poids: "63kg", hauteur: "1M45" },
  { no: "3", nom: "LAURE", prenom: "Angelo", poste: "Aillier Attaquant", poids: "1M40", hauteur: "1M45" },
  { no: "4", nom: "Meranvil", prenom: "Bill", poste: "Milieu Defensif", poids: "59KG", hauteur: "1M30" },
  { no: "5", nom: "Paul", prenom: "Jefferson", poste: "Lateral Gauche", poids: "62KG", hauteur: "1M50" },
  { no: "6", nom: "Andre", prenom: "Ralpholdy", poste: "Lateral Droit", poids: "62KG", hauteur: "1M69" },
  { no: "7", nom: "Joseph", prenom: "Jean Wood", poste: "Defenseur Central", poids: "65KG", hauteur: "1M50" },
  { no: "8", nom: "Orelus", prenom: "Andy", poste: "Milieu", poids: "66KG", hauteur: "1M48" }
];

async function run() {
  try {
    await db.query("DELETE FROM club_elite_players");
    for (const row of players) {
       await db.query(
          `INSERT INTO club_elite_players 
            (number, first_name, last_name, position, weight, height, photo_url, video_url) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
           [
              row.no,
              row.prenom, 
              row.nom, 
              row.poste,
              row.poids,
              row.hauteur,
              '',
              ''
            ]
        );
    }
    console.log("Database updated successfully");
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}
run();

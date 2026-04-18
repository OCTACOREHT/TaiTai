require("dotenv").config({ path: ".env.local" });
const { Pool } = require("pg");

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("DATABASE_URL est manquant !");
  process.exit(1);
}

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
});

async function main() {
  console.log("Démarrage de la récupération des anciennes demandes...");

  try {
    // 1. BACKFILL JOUEURS
    const { rows: players } = await pool.query(`SELECT * FROM player_registrations ORDER BY created_at ASC`);
    let addedPlayers = 0;

    for (const player of players) {
      // Vérifier si cette demande existe déjà (pour ne pas dupliquer)
      const { rows: existing } = await pool.query(
        `SELECT id FROM site_messages WHERE type = 'joueur' AND email = $1 AND created_at = $2`,
        [player.guardian_email, player.created_at]
      );

      if (existing.length === 0) {
        // Formatter le payload pour que ça ressemble à une soumission de formulaire
        const payload = {
          program: player.program,
          child_first_name: player.child_first_name,
          child_last_name: player.child_last_name,
          child_birth_date: player.child_birth_date ? new Date(player.child_birth_date).toISOString().split('T')[0] : null,
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
          _backfilled: true // Marqueur pour infos futures
        };

        await pool.query(
          `
            INSERT INTO site_messages (type, name, email, phone, message, payload, created_at, is_read)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          `,
          [
            "joueur",
            `${player.guardian_name} (Enfant: ${player.child_first_name} ${player.child_last_name})`,
            player.guardian_email,
            player.guardian_phone,
            `Nouvelle inscription Joueur confirmée pour le programme ${player.program}.`,
            JSON.stringify(payload),
            player.created_at,
            false // Mettre à "non lu" par défaut pour que Ruben puisse les voir
          ]
        );
        addedPlayers++;
      }
    }
    console.log(`✅ ${addedPlayers} anciennes inscriptions de Joueurs ajoutées.`);

    // 2. BACKFILL FANS
    const { rows: fans } = await pool.query(`SELECT * FROM fan_registrations ORDER BY created_at ASC`);
    let addedFans = 0;

    for (const fan of fans) {
      // Vérifier si la demande fan existe déjà pour éviter doublons (email + date)
      const { rows: existing } = await pool.query(
        `SELECT id FROM site_messages WHERE type = 'fan' AND email = $1 AND created_at = $2`,
        [fan.email, fan.created_at]
      );

      if (existing.length === 0) {
        const payload = {
          first_name: fan.first_name,
          last_name: fan.last_name,
          phone: fan.phone,
          email: fan.email,
          department: fan.department,
          address: fan.address,
          consent_contact: fan.consent_contact,
          _backfilled: true
        };

        await pool.query(
          `
            INSERT INTO site_messages (type, name, email, phone, message, payload, created_at, is_read, status)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
          `,
          [
            "fan",
            `${fan.first_name} ${fan.last_name}`,
            fan.email,
            fan.phone,
            `Nouvelle inscription de Fan de ${fan.department}.`,
            JSON.stringify(payload),
            fan.created_at,
            false,
            "pending"
          ]
        );
        addedFans++;
      }
    }

    console.log(`✅ ${addedFans} anciennes inscriptions de Fans ajoutées.`);

    console.log("Terminé avec succès ! 🎉");
  } catch (error) {
    console.error("Erreur lors du backfill :", error);
  } finally {
    pool.end();
  }
}

main();

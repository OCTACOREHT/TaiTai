const db = require("./db");

async function logConnexion({ userId, emailUtilise, emailUsed, ip, userAgent, succes, success }) {
  try {
    await db.query(
      `INSERT INTO connexion_logs (user_id, email_used, ip_address, user_agent, success)
       VALUES ($1, $2, $3, $4, $5)`,
      [userId || null, emailUsed || emailUtilise, ip, userAgent || null, success ?? succes],
    );
  } catch (err) {
    console.error("[Logger] Erreur lors de l'enregistrement du log:", err.message);
  }
}

function logAction({ user, method, route }) {
  const actor = user ? `[${user.role}] ${user.email}` : "anonyme";
  console.log(`[ADMIN ACTION] ${new Date().toISOString()} | ${actor} | ${method} ${route}`);
}

module.exports = { logConnexion, logAction };

import { NextResponse } from "next/server";
const db = require("@/server/db");
export const runtime = "nodejs";

export async function GET() {
  const { rows } = await db.query(`
    SELECT
      id,
      last_name AS "nom",
      first_name AS "prenom",
      photo_url AS "photoUrl",
      position AS "poste",
      category AS "categorie",
      status AS "statut",
      phone AS "telephone",
      email,
      registration_date AS "dateInscription",
      birth_date AS "dateNaissance",
      address AS "adresse",
      membership_amount AS "cotisationMontant",
      membership_status AS "cotisationStatut",
      last_payment_date AS "dernierPaiement"
    FROM club_players
    ORDER BY registration_date DESC, last_name ASC
  `);
  return NextResponse.json({ data: rows });
}

export async function POST(request) {
  try {
    const body = await request.json();
    const row = body.data || body;
    const { rows } = await db.query(
      `INSERT INTO club_players
      (id, last_name, first_name, photo_url, position, category, status, phone, email, registration_date, birth_date, address, membership_amount, membership_status, last_payment_date)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
      RETURNING *`,
      [
        row.id,
        row.nom || row.lastName,
        row.prenom || row.firstName,
        row.photoUrl || row.photo_url,
        row.poste || row.position,
        row.categorie || row.category,
        row.statut || row.status || 'actif',
        row.telephone || row.phone,
        row.email,
        row.dateInscription || row.registration_date,
        row.dateNaissance || row.birth_date,
        row.adresse || row.address,
        row.cotisationMontant || row.membership_amount,
        row.cotisationStatut || row.membership_status,
        row.dernierPaiement || row.last_payment_date || null
      ],
    );
    return NextResponse.json({ data: rows[0] }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/club/players]", err.message);
    return NextResponse.json({ error: "Erreur creation joueur." }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const rows = Array.isArray(body.data) ? body.data : [];
    await db.query("DELETE FROM club_players");
    for (const row of rows) {
      await db.query(
        `INSERT INTO club_players
        (id, last_name, first_name, photo_url, position, category, status, phone, email, registration_date, birth_date, address, membership_amount, membership_status, last_payment_date)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)`,
        [
          row.id,
          row.nom || row.lastName,
          row.prenom || row.firstName,
          row.photoUrl || row.photo_url,
          row.poste || row.position,
          row.categorie || row.category,
          row.statut || row.status || 'actif',
          row.telephone || row.phone,
          row.email,
          row.dateInscription || row.registration_date,
          row.dateNaissance || row.birth_date,
          row.adresse || row.address,
          row.cotisationMontant || row.membership_amount,
          row.cotisationStatut || row.membership_status,
          row.dernierPaiement || row.last_payment_date || null
        ],
      );
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[PUT /api/club/players]", err.message);
    return NextResponse.json({ error: "Erreur sauvegarde joueurs." }, { status: 500 });
  }
}

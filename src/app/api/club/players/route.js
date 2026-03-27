import { NextResponse } from "next/server";
const db = require("@/server/db");
export const runtime = "nodejs";

export async function GET() {
  const { rows } = await db.query("SELECT * FROM club_players ORDER BY date_inscription DESC, nom ASC");
  return NextResponse.json({ data: rows });
}

export async function POST(request) {
  try {
    const body = await request.json();
    const row = body.data || body;
    const { rows } = await db.query(
      `INSERT INTO club_players
      (id, nom, prenom, photo_url, poste, categorie, statut, telephone, email, date_inscription, date_naissance, adresse, cotisation_montant, cotisation_statut, dernier_paiement)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
      RETURNING *`,
      [row.id, row.nom, row.prenom, row.photoUrl, row.poste, row.categorie, row.statut, row.telephone, row.email, row.dateInscription, row.dateNaissance, row.adresse, row.cotisationMontant, row.cotisationStatut, row.dernierPaiement || null],
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
        (id, nom, prenom, photo_url, poste, categorie, statut, telephone, email, date_inscription, date_naissance, adresse, cotisation_montant, cotisation_statut, dernier_paiement)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)`,
        [row.id, row.nom, row.prenom, row.photoUrl, row.poste, row.categorie, row.statut, row.telephone, row.email, row.dateInscription, row.dateNaissance, row.adresse, row.cotisationMontant, row.cotisationStatut, row.dernierPaiement || null],
      );
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[PUT /api/club/players]", err.message);
    return NextResponse.json({ error: "Erreur sauvegarde joueurs." }, { status: 500 });
  }
}

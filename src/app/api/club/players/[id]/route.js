import { NextResponse } from "next/server";
const db = require("@/server/db");
export const runtime = "nodejs";

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const row = body.data || body;
    const { rows } = await db.query(
      `UPDATE club_players
       SET nom=$2, prenom=$3, photo_url=$4, poste=$5, categorie=$6, statut=$7, telephone=$8, email=$9, date_naissance=$10, adresse=$11, cotisation_montant=$12, cotisation_statut=$13, dernier_paiement=$14
       WHERE id=$1
       RETURNING *`,
      [id, row.nom, row.prenom, row.photoUrl, row.poste, row.categorie, row.statut, row.telephone, row.email, row.dateNaissance, row.adresse, row.cotisationMontant, row.cotisationStatut, row.dernierPaiement || null],
    );
    return NextResponse.json({ data: rows[0] });
  } catch (err) {
    console.error("[PUT /api/club/players/[id]]", err.message);
    return NextResponse.json({ error: "Erreur mise a jour joueur." }, { status: 500 });
  }
}

export async function DELETE(_request, { params }) {
  try {
    const { id } = await params;
    await db.query("DELETE FROM club_players WHERE id = $1", [id]);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[DELETE /api/club/players/[id]]", err.message);
    return NextResponse.json({ error: "Erreur suppression joueur." }, { status: 500 });
  }
}

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
       SET last_name=$2, first_name=$3, photo_url=$4, position=$5, category=$6, status=$7, phone=$8, email=$9, birth_date=$10, address=$11, membership_amount=$12, membership_status=$13, last_payment_date=$14
       WHERE id=$1
       RETURNING *`,
      [
        id,
        row.nom || row.lastName || row.last_name,
        row.prenom || row.firstName || row.first_name,
        row.photoUrl || row.photo_url,
        row.poste || row.position,
        row.categorie || row.category,
        row.statut || row.status,
        row.telephone || row.phone,
        row.email,
        row.dateNaissance || row.birth_date,
        row.adresse || row.address,
        row.cotisationMontant || row.membership_amount,
        row.cotisationStatut || row.membership_status,
        row.dernierPaiement || row.last_payment_date || null
      ],
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

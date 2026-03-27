import { NextResponse } from "next/server";
const db = require("@/server/db");
export const runtime = "nodejs";

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const row = body.data || body;
    const { rows } = await db.query(
      `UPDATE club_alumni
       SET nom=$2, annee_entree=$3, annee_sortie=$4, poste=$5, situation_actuelle=$6
       WHERE id=$1
       RETURNING *`,
      [id, row.nom, row.anneeEntree, row.anneeSortie, row.poste, row.situationActuelle],
    );
    return NextResponse.json({ data: rows[0] });
  } catch (err) {
    console.error("[PUT /api/club/alumni/[id]]", err.message);
    return NextResponse.json({ error: "Erreur mise a jour alumni." }, { status: 500 });
  }
}

export async function DELETE(_request, { params }) {
  try {
    const { id } = await params;
    await db.query("DELETE FROM club_alumni WHERE id = $1", [id]);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[DELETE /api/club/alumni/[id]]", err.message);
    return NextResponse.json({ error: "Erreur suppression alumni." }, { status: 500 });
  }
}

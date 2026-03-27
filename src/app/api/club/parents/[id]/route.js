import { NextResponse } from "next/server";
const db = require("@/server/db");
export const runtime = "nodejs";

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const row = body.data || body;
    const { rows } = await db.query(
      `UPDATE club_parents
       SET nom=$2, prenom=$3, telephone=$4, email=$5, lien=$6, player_id=$7
       WHERE id=$1
       RETURNING *`,
      [id, row.nom, row.prenom, row.telephone, row.email, row.lien, row.playerId],
    );
    return NextResponse.json({ data: rows[0] });
  } catch (err) {
    console.error("[PUT /api/club/parents/[id]]", err.message);
    return NextResponse.json({ error: "Erreur mise a jour parent." }, { status: 500 });
  }
}

export async function DELETE(_request, { params }) {
  try {
    const { id } = await params;
    await db.query("DELETE FROM club_parents WHERE id = $1", [id]);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[DELETE /api/club/parents/[id]]", err.message);
    return NextResponse.json({ error: "Erreur suppression parent." }, { status: 500 });
  }
}

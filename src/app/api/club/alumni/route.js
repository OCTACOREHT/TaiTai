import { NextResponse } from "next/server";
const db = require("@/server/db");
export const runtime = "nodejs";
export async function GET() {
  const { rows } = await db.query("SELECT * FROM club_alumni ORDER BY annee_sortie DESC");
  return NextResponse.json({ data: rows });
}
export async function POST(request) {
  try {
    const body = await request.json();
    const row = body.data || body;
    const { rows } = await db.query(
      "INSERT INTO club_alumni (id, nom, annee_entree, annee_sortie, poste, situation_actuelle) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *",
      [row.id, row.nom, row.anneeEntree, row.anneeSortie, row.poste, row.situationActuelle],
    );
    return NextResponse.json({ data: rows[0] }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/club/alumni]", err.message);
    return NextResponse.json({ error: "Erreur creation alumni." }, { status: 500 });
  }
}
export async function PUT(request) {
  try {
    const body = await request.json();
    const rows = Array.isArray(body.data) ? body.data : [];
    await db.query("DELETE FROM club_alumni");
    for (const row of rows) {
      await db.query(
        "INSERT INTO club_alumni (id, nom, annee_entree, annee_sortie, poste, situation_actuelle) VALUES ($1,$2,$3,$4,$5,$6)",
        [row.id, row.nom, row.anneeEntree, row.anneeSortie, row.poste, row.situationActuelle],
      );
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[PUT /api/club/alumni]", err.message);
    return NextResponse.json({ error: "Erreur sauvegarde alumni." }, { status: 500 });
  }
}

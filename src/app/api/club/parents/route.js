import { NextResponse } from "next/server";
const db = require("@/server/db");
export const runtime = "nodejs";
export async function GET() {
  const { rows } = await db.query("SELECT * FROM club_parents ORDER BY nom ASC");
  return NextResponse.json({ data: rows });
}
export async function POST(request) {
  try {
    const body = await request.json();
    const row = body.data || body;
    const { rows } = await db.query(
      "INSERT INTO club_parents (id, nom, prenom, telephone, email, lien, player_id) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *",
      [row.id, row.nom, row.prenom, row.telephone, row.email, row.lien, row.playerId],
    );
    return NextResponse.json({ data: rows[0] }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/club/parents]", err.message);
    return NextResponse.json({ error: "Erreur creation parent." }, { status: 500 });
  }
}
export async function PUT(request) {
  try {
    const body = await request.json();
    const rows = Array.isArray(body.data) ? body.data : [];
    await db.query("DELETE FROM club_parents");
    for (const row of rows) {
      await db.query(
        "INSERT INTO club_parents (id, nom, prenom, telephone, email, lien, player_id) VALUES ($1,$2,$3,$4,$5,$6,$7)",
        [row.id, row.nom, row.prenom, row.telephone, row.email, row.lien, row.playerId],
      );
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[PUT /api/club/parents]", err.message);
    return NextResponse.json({ error: "Erreur sauvegarde parents." }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
const db = require("@/server/db");
export const runtime = "nodejs";
export async function GET() {
  const { rows } = await db.query("SELECT * FROM club_staff ORDER BY start_date DESC");
  return NextResponse.json({ data: rows });
}
export async function POST(request) {
  try {
    const body = await request.json();
    const row = body.data || body;
    const { rows } = await db.query(
      "INSERT INTO club_staff (id, name, role, phone, email, start_date, photo_url) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *",
      [row.id, row.nom || row.name, row.role, row.telephone || row.phone, row.email, row.dateDebut || row.start_date || row.startDate, row.photoUrl || row.photo_url || '/images/user/user-01.jpg'],
    );
    return NextResponse.json({ data: rows[0] }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/club/staff]", err.message);
    return NextResponse.json({ error: "Erreur creation staff." }, { status: 500 });
  }
}
export async function PUT(request) {
  try {
    const body = await request.json();
    const rows = Array.isArray(body.data) ? body.data : [];
    await db.query("DELETE FROM club_staff");
    for (const row of rows) {
      await db.query(
        "INSERT INTO club_staff (id, name, role, phone, email, start_date, photo_url) VALUES ($1,$2,$3,$4,$5,$6,$7)",
        [row.id, row.nom || row.name, row.role, row.telephone || row.phone, row.email, row.dateDebut || row.start_date || row.startDate, row.photoUrl || row.photo_url || '/images/user/user-01.jpg'],
      );
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[PUT /api/club/staff]", err.message);
    return NextResponse.json({ error: "Erreur sauvegarde staff." }, { status: 500 });
  }
}

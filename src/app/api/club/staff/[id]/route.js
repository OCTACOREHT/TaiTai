import { NextResponse } from "next/server";
const db = require("@/server/db");
export const runtime = "nodejs";

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const row = body.data || body;
    const { rows } = await db.query(
      `UPDATE club_staff
       SET name=$2, role=$3
       WHERE id=$1
       RETURNING *`,
      [id, row.nom, row.role],
    );
    return NextResponse.json({ data: rows[0] });
  } catch (err) {
    console.error("[PUT /api/club/staff/[id]]", err.message);
    return NextResponse.json({ error: "Erreur mise a jour staff." }, { status: 500 });
  }
}

export async function DELETE(_request, { params }) {
  try {
    const { id } = await params;
    await db.query("DELETE FROM club_staff WHERE id = $1", [id]);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[DELETE /api/club/staff/[id]]", err.message);
    return NextResponse.json({ error: "Erreur suppression staff." }, { status: 500 });
  }
}

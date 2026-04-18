import { NextResponse } from "next/server";
const db = require("@/server/db");
export const runtime = "nodejs";

export async function GET() {
  const { rows } = await db.query("SELECT * FROM site_messages ORDER BY created_at DESC");
  return NextResponse.json({ data: rows });
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const id = body.id;
    const is_read = body.is_read;
    const status = body.status;

    if (!id) {
      return NextResponse.json({ error: "ID manquant." }, { status: 400 });
    }

    let query = "UPDATE site_messages SET is_read = $1";
    let params = [is_read];

    if (status !== undefined) {
      query += ", status = $2 WHERE id = $3 RETURNING *";
      params.push(status, id);
    } else {
      query += " WHERE id = $2 RETURNING *";
      params.push(id);
    }

    const { rows } = await db.query(query, params);

    return NextResponse.json({ data: rows[0] });
  } catch (err) {
    console.error("[PUT /api/demandes]", err.message);
    return NextResponse.json({ error: "Erreur mise à jour demande." }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: "ID manquant." }, { status: 400 });
    }

    await db.query(
      "DELETE FROM site_messages WHERE id = $1",
      [id]
    );

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[DELETE /api/demandes]", err.message);
    return NextResponse.json({ error: "Erreur suppression demande." }, { status: 500 });
  }
}

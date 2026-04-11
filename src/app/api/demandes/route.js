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

    if (!id) {
      return NextResponse.json({ error: "ID manquant." }, { status: 400 });
    }

    const { rows } = await db.query(
      "UPDATE site_messages SET is_read = $1 WHERE id = $2 RETURNING *",
      [is_read, id]
    );

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

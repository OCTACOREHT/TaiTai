import { NextResponse } from "next/server";
const db = require("@/server/db");
export const runtime = "nodejs";

export async function GET() {
  // Added a LIMIT to prevent PostgreSQL timeout issues when fetching many rows with large JSON payloads
  const { rows } = await db.query("SELECT * FROM site_messages ORDER BY created_at DESC LIMIT 200");
  return NextResponse.json({ data: rows });
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const id = body.id;
    const is_read = body.is_read;
    const status = body.status;
    const payload = body.payload;

    if (!id) {
      return NextResponse.json({ error: "ID manquant." }, { status: 400 });
    }

    let queryParts = [];
    let params = [];
    let paramIndex = 1;

    if (is_read !== undefined) {
      queryParts.push(`is_read = $${paramIndex++}`);
      params.push(is_read);
    }

    if (status !== undefined) {
      queryParts.push(`status = $${paramIndex++}`);
      params.push(status);
    }

    if (payload !== undefined) {
      queryParts.push(`payload = $${paramIndex++}`);
      params.push(typeof payload === 'string' ? payload : JSON.stringify(payload));
    }

    if (queryParts.length === 0) {
      return NextResponse.json({ error: "Rien à mettre à jour." }, { status: 400 });
    }

    let query = `UPDATE site_messages SET ${queryParts.join(", ")} WHERE id = $${paramIndex} RETURNING *`;
    params.push(id);

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

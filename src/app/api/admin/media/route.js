import { NextResponse } from "next/server";

const db = require("@/server/db");
const { requireAuth } = require("@/server/auth");

export const runtime = "nodejs";

export async function GET(request) {
  const auth = requireAuth(request);
  if (auth.error) {
    return auth.error;
  }

  try {
    const { rows } = await db.query(
      `SELECT m.*, u.name AS uploaded_by_name
       FROM media m
       LEFT JOIN admin_users u ON m.uploaded_by = u.id
       ORDER BY m.uploaded_at DESC`,
    );

    return NextResponse.json({ data: rows });
  } catch (err) {
    console.error("[GET /api/admin/media]", err.message);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}

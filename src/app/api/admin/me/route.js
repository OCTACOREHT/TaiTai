import { NextResponse } from "next/server";

const db = require("@/server/db");
const { requireAuth } = require("@/server/auth");

export const runtime = "nodejs";

export async function GET(request) {
  const auth = requireAuth(request);
  if (auth.error) return auth.error;

  try {
    const { rows } = await db.query(
      "SELECT * FROM admin_users WHERE id = $1 AND actif = TRUE LIMIT 1",
      [auth.user.id],
    );

    if (!rows[0]) {
      return NextResponse.json({ error: "Utilisateur introuvable." }, { status: 401 });
    }

    return NextResponse.json({ data: rows[0] });
  } catch (err) {
    console.error("[GET /api/admin/me]", err.message);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}

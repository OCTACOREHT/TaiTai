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
    const { rows } = await db.query("SELECT * FROM dashboard_preferences WHERE id = true");
    return NextResponse.json({ data: rows[0] || null });
  } catch (err) {
    console.error("[GET /api/admin/dashboard-config]", err.message);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}

export async function PUT(request) {
  const auth = requireAuth(request);
  if (auth.error) {
    return auth.error;
  }

  try {
    const body = await request.json();

    await db.query(
      `INSERT INTO dashboard_preferences (id, widgets, player_columns, updated_at)
       VALUES (true, $1, $2, NOW())
       ON CONFLICT (id) DO UPDATE SET
         widgets = EXCLUDED.widgets,
         player_columns = EXCLUDED.player_columns,
         updated_at = NOW()`,
      [JSON.stringify(body.widgets || []), JSON.stringify(body.playerColumns || [])],
    );

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[PUT /api/admin/dashboard-config]", err.message);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}

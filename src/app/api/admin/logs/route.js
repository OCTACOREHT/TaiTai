import { NextResponse } from "next/server";

const db = require("@/server/db");
const { requireAuth, requireSuperAdmin } = require("@/server/auth");

export const runtime = "nodejs";

export async function GET(request) {
  const auth = requireAuth(request);
  if (auth.error) {
    return auth.error;
  }

  const forbidden = requireSuperAdmin(auth.user);
  if (forbidden) {
    return forbidden;
  }

  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(200, parseInt(searchParams.get("limit") || "50", 10));
    const offset = (page - 1) * limit;

    const { rows } = await db.query(
      `SELECT
         cl.id, cl.email_used, cl.ip_address, cl.user_agent,
         cl.occurred_at, cl.success, u.name AS user_name
       FROM connexion_logs cl
       LEFT JOIN admin_users u ON cl.user_id = u.id
       ORDER BY cl.occurred_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset],
    );

    const { rows: countRows } = await db.query("SELECT COUNT(*) FROM connexion_logs");

    return NextResponse.json({
      data: rows,
      pagination: {
        page,
        limit,
        total: parseInt(countRows[0].count, 10),
      },
    });
  } catch (err) {
    console.error("[GET /api/admin/logs]", err.message);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}

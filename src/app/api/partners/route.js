import { NextResponse } from "next/server";

const db = require("@/server/db");

export const runtime = "nodejs";

export async function GET() {
  try {
    const { rows } = await db.query(
      "SELECT * FROM partners ORDER BY CASE WHEN tier = 'principal' THEN 0 WHEN tier = 'gold' THEN 1 WHEN tier = 'silver' THEN 2 ELSE 3 END ASC, name ASC",
    );

    return NextResponse.json({ data: rows });
  } catch (err) {
    console.error("[GET /api/partners]", err.message);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}

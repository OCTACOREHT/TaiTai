import { NextResponse } from "next/server";

const db = require("@/server/db");

export const runtime = "nodejs";

export async function GET() {
  try {
    const { rows } = await db.query(
      `SELECT *
       FROM stages
       WHERE status = 'published'
         AND (published_at IS NULL OR published_at <= NOW())
       ORDER BY COALESCE(published_at, created_at) DESC`,
    );

    return NextResponse.json({ data: rows });
  } catch (err) {
    console.error("[GET /api/stages]", err.message);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}

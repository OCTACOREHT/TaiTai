import { NextResponse } from "next/server";

const db = require("@/server/db");

export const runtime = "nodejs";

export async function GET(request, { params }) {
  try {
    const { slug } = await params;
    const { rows } = await db.query(
      `SELECT * FROM articles
       WHERE slug = $1 AND statut = 'published'`,
      [slug],
    );

    if (rows.length === 0) {
      return NextResponse.json({ error: "Article non trouve." }, { status: 404 });
    }

    return NextResponse.json({ data: rows[0] });
  } catch (err) {
    console.error("[GET /api/articles/:slug]", err.message);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}

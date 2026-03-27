import { NextResponse } from "next/server";

const db = require("@/server/db");

export const runtime = "nodejs";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(50, parseInt(searchParams.get("limit") || "10", 10));
    const offset = (page - 1) * limit;

    const { rows } = await db.query(
      `SELECT
         id, slug, auteur, date_publication, statut,
         titre_fr, titre_en, photo_couverture, categorie, tags, seo_title, seo_description,
         contenu_fr,
         LEFT(contenu_fr, 300) AS extrait_fr,
         LEFT(contenu_en, 300) AS extrait_en
       FROM articles
       WHERE statut = 'published'
         AND date_publication <= NOW()
       ORDER BY date_publication DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset],
    );

    const { rows: countRows } = await db.query(
      `SELECT COUNT(*) FROM articles WHERE statut = 'published' AND date_publication <= NOW()`,
    );

    const total = parseInt(countRows[0].count, 10);

    return NextResponse.json({
      data: rows,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error("[GET /api/articles]", err.message);
    return NextResponse.json(
      {
        error: "Erreur serveur.",
        details: process.env.NODE_ENV !== "production" ? err.message : undefined,
      },
      { status: 500 },
    );
  }
}

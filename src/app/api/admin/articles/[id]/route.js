import { NextResponse } from "next/server";

const db = require("@/server/db");
const { requireAuth, requireSuperAdmin } = require("@/server/auth");
const { logAction } = require("@/server/logger");

export const runtime = "nodejs";

function normalizeStatus(value) {
  if (value === "published" || value === "review" || value === "archived" || value === "draft") {
    return value;
  }

  if (value === "publie") return "published";
  if (value === "revision") return "review";
  if (value === "archive") return "archived";
  return value;
}

export async function PUT(request, { params }) {
  const auth = requireAuth(request);
  if (auth.error) {
    return auth.error;
  }
  const { id } = await params;

  const body = await request.json();
  const {
    titre_fr,
    titre_en,
    contenu_fr,
    contenu_en,
    photo_couverture,
    date_publication,
    statut,
  } = body;

  try {
    logAction({
      user: auth.user,
      method: "PUT",
      route: `/api/admin/articles/${id}`,
    });

    const { rows } = await db.query(
      `UPDATE articles SET
         titre_fr = COALESCE($1, titre_fr),
         titre_en = COALESCE($2, titre_en),
         contenu_fr = COALESCE($3, contenu_fr),
         contenu_en = COALESCE($4, contenu_en),
         extrait_fr = COALESCE($5, extrait_fr),
         extrait_en = COALESCE($6, extrait_en),
         photo_couverture = COALESCE($7, photo_couverture),
         categorie = COALESCE($8, categorie),
         tags = COALESCE($9, tags),
         featured = COALESCE($10, featured),
         seo_title = COALESCE($11, seo_title),
         seo_description = COALESCE($12, seo_description),
         date_publication = COALESCE($13, date_publication),
         statut = COALESCE($14, statut),
         date_modification = NOW()
       WHERE id = $15
       RETURNING *`,
      [
        titre_fr,
        titre_en,
        contenu_fr,
        contenu_en,
        body.extrait_fr,
        body.extrait_en,
        photo_couverture,
        body.categorie,
        Array.isArray(body.tags) ? body.tags : undefined,
        typeof body.featured === "boolean" ? body.featured : undefined,
        body.seo_title,
        body.seo_description,
        date_publication,
        statut ? normalizeStatus(statut) : undefined,
        id,
      ],
    );

    if (rows.length === 0) {
      return NextResponse.json({ error: "Article non trouve." }, { status: 404 });
    }

    return NextResponse.json({ data: rows[0] });
  } catch (err) {
    console.error("[PUT /api/admin/articles/:id]", err.message);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}

export async function GET(request, { params }) {
  const auth = requireAuth(request);
  if (auth.error) {
    return auth.error;
  }

  try {
    const { id } = await params;
    const { rows } = await db.query("SELECT * FROM articles WHERE id = $1", [id]);

    if (rows.length === 0) {
      return NextResponse.json({ error: "Article non trouve." }, { status: 404 });
    }

    return NextResponse.json({ data: rows[0] });
  } catch (err) {
    console.error("[GET /api/admin/articles/:id]", err.message);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const auth = requireAuth(request);
  if (auth.error) {
    return auth.error;
  }
  const { id } = await params;

  const forbidden = requireSuperAdmin(auth.user);
  if (forbidden) {
    return forbidden;
  }

  try {
    logAction({
      user: auth.user,
      method: "DELETE",
      route: `/api/admin/articles/${id}`,
    });

    const { rowCount } = await db.query("DELETE FROM articles WHERE id = $1", [
      id,
    ]);

    if (rowCount === 0) {
      return NextResponse.json({ error: "Article non trouve." }, { status: 404 });
    }

    return NextResponse.json({ message: "Article supprime." });
  } catch (err) {
    console.error("[DELETE /api/admin/articles/:id]", err.message);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}

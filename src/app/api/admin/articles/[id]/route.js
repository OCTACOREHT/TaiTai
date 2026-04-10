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
    title_fr,
    titre_en,
    title_en,
    contenu_fr,
    content_fr,
    contenu_en,
    content_en,
    photo_couverture,
    cover_image,
    date_publication,
    published_at,
    statut,
    status,
  } = body;

  try {
    logAction({
      user: auth.user,
      method: "PUT",
      route: `/api/admin/articles/${id}`,
    });

    const { rows } = await db.query(
      `UPDATE articles SET
         title_fr = COALESCE($1, title_fr),
         title_en = COALESCE($2, title_en),
         content_fr = COALESCE($3, content_fr),
         content_en = COALESCE($4, content_en),
         excerpt_fr = COALESCE($5, excerpt_fr),
         excerpt_en = COALESCE($6, excerpt_en),
         cover_image = COALESCE($7, cover_image),
         category = COALESCE($8, category),
         tags = COALESCE($9, tags),
         featured = COALESCE($10, featured),
         seo_title = COALESCE($11, seo_title),
         seo_description = COALESCE($12, seo_description),
         published_at = COALESCE($13, published_at),
         status = COALESCE($14, status),
         updated_at = NOW()
       WHERE id = $15
       RETURNING *`,
      [
        title_fr || titre_fr,
        title_en || titre_en,
        content_fr || contenu_fr,
        content_en || contenu_en,
        body.excerpt_fr || body.extrait_fr,
        body.excerpt_en || body.extrait_en,
        cover_image || photo_couverture,
        body.category || body.categorie,
        Array.isArray(body.tags) ? body.tags : undefined,
        typeof body.featured === "boolean" ? body.featured : undefined,
        body.seo_title || body.seoTitle,
        body.seo_description || body.seoDescription,
        published_at || date_publication,
        (status || statut) ? normalizeStatus(status || statut) : undefined,
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

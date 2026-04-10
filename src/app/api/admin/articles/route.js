import { NextResponse } from "next/server";

const db = require("@/server/db");
const { requireAuth } = require("@/server/auth");
const { logAction } = require("@/server/logger");

export const runtime = "nodejs";

function slugify(text) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function normalizeStatus(value) {
  if (value === "published" || value === "review" || value === "archived" || value === "draft") {
    return value;
  }

  if (value === "publie") return "published";
  if (value === "revision") return "review";
  if (value === "archive") return "archived";
  return "draft";
}

function defaultCoverImage(value) {
  return value || "/images/grid-image/image-01.png";
}

export async function GET(request) {
  const auth = requireAuth(request);
  if (auth.error) {
    return auth.error;
  }

  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, parseInt(searchParams.get("limit") || "20", 10));
    const offset = (page - 1) * limit;
    const statut = searchParams.get("status") || searchParams.get("statut");

    let query =
      "SELECT id, slug, title_fr, title_en, author_name, published_at, status, created_at, updated_at FROM articles";
    const args = [];

    if (statut) {
      args.push(statut);
      query += ` WHERE status = $${args.length}`;
    }

    query += ` ORDER BY created_at DESC LIMIT $${args.length + 1} OFFSET $${args.length + 2}`;
    args.push(limit, offset);

    const { rows } = await db.query(query, args);
    return NextResponse.json({ data: rows });
  } catch (err) {
    console.error("[GET /api/admin/articles]", err.message);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}

export async function POST(request) {
  const auth = requireAuth(request);
  if (auth.error) {
    return auth.error;
  }

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

  const final_title_fr = title_fr || titre_fr;
  const final_content_fr = content_fr || contenu_fr;

  if (!final_title_fr || !final_content_fr) {
    return NextResponse.json(
      { error: "Le titre et le contenu en français sont obligatoires." },
      { status: 400 },
    );
  }

  try {
    logAction({
      user: auth.user,
      method: "POST",
      route: "/api/admin/articles",
    });

    let slug = slugify(final_title_fr);
    const { rows: existing } = await db.query(
      "SELECT id FROM articles WHERE slug LIKE $1",
      [`${slug}%`],
    );

    if (existing.length > 0) {
      slug = `${slug}-${Date.now()}`;
    }

    const { rows } = await db.query(
      `INSERT INTO articles
         (title_fr, title_en, content_fr, content_en, excerpt_fr, excerpt_en, cover_image,
          category, tags, author_id, author_name, featured, seo_title, seo_description, published_at, status, slug)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)
       RETURNING *`,
      [
        final_title_fr,
        title_en || titre_en || null,
        final_content_fr,
        content_en || contenu_en || null,
        body.excerpt_fr || body.extrait_fr || "",
        body.excerpt_en || body.extrait_en || null,
        defaultCoverImage(cover_image || photo_couverture),
        body.category || body.categorie || "Actualites",
        Array.isArray(body.tags) ? body.tags : [],
        auth.user.id,
        auth.user.email,
        Boolean(body.featured),
        body.seo_title || body.seoTitle || "",
        body.seo_description || body.seoDescription || "",
        published_at || date_publication || null,
        normalizeStatus(status || statut),
        slug,
      ],
    );

    return NextResponse.json({ data: rows[0] }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/admin/articles]", err.message);
    return NextResponse.json(
      {
        error: process.env.NODE_ENV === "development" ? err.message : "Erreur serveur.",
      },
      { status: 500 },
    );
  }
}

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
    const statut = searchParams.get("statut");

    let query =
      "SELECT id, slug, titre_fr, titre_en, auteur, date_publication, statut, date_creation, date_modification FROM articles";
    const args = [];

    if (statut) {
      args.push(statut);
      query += ` WHERE statut = $${args.length}`;
    }

    query += ` ORDER BY date_creation DESC LIMIT $${args.length + 1} OFFSET $${args.length + 2}`;
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
    titre_en,
    contenu_fr,
    contenu_en,
    photo_couverture,
    date_publication,
    statut,
  } = body;

  if (!titre_fr || !contenu_fr) {
    return NextResponse.json(
      { error: "titre_fr et contenu_fr sont obligatoires." },
      { status: 400 },
    );
  }

  try {
    logAction({
      user: auth.user,
      method: "POST",
      route: "/api/admin/articles",
    });

    let slug = slugify(titre_fr);
    const { rows: existing } = await db.query(
      "SELECT id FROM articles WHERE slug LIKE $1",
      [`${slug}%`],
    );

    if (existing.length > 0) {
      slug = `${slug}-${Date.now()}`;
    }

    const { rows } = await db.query(
      `INSERT INTO articles
         (titre_fr, titre_en, contenu_fr, contenu_en, extrait_fr, extrait_en, photo_couverture,
          categorie, tags, auteur_id, auteur, featured, seo_title, seo_description, date_publication, statut, slug)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)
       RETURNING *`,
      [
        titre_fr,
        titre_en || null,
        contenu_fr,
        contenu_en || null,
        body.extrait_fr || "",
        body.extrait_en || null,
        defaultCoverImage(photo_couverture),
        body.categorie || "Actualites",
        Array.isArray(body.tags) ? body.tags : [],
        auth.user.id,
        auth.user.email,
        Boolean(body.featured),
        body.seo_title || "",
        body.seo_description || "",
        date_publication || null,
        normalizeStatus(statut),
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

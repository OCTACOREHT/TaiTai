import { NextResponse } from "next/server";

const db = require("@/server/db");
const { requireAuth } = require("@/server/auth");

export const runtime = "nodejs";

function slugify(text) {
  return String(text || "")
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

function mapStageInput(body) {
  return {
    titre: body.titre,
    extrait: body.extrait || "",
    contenu: body.contenu,
    photo_couverture: body.photo_couverture || "/images/grid-image/image-01.png",
    departement: body.departement || "Communication",
    location: body.location || "",
    work_mode: body.work_mode || "hybrid",
    duration: body.duration || "",
    contact_email: body.contact_email || "",
    close_date: body.close_date || null,
    featured: Boolean(body.featured),
    statut: normalizeStatus(body.statut),
    slug: body.slug || slugify(body.titre),
    date_publication: body.date_publication || null,
  };
}

export async function GET(request) {
  const auth = requireAuth(request);
  if (auth.error) return auth.error;

  try {
    const { rows } = await db.query("SELECT * FROM stages ORDER BY date_creation DESC");
    return NextResponse.json({ data: rows });
  } catch (err) {
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}

export async function POST(request) {
  const auth = requireAuth(request);
  if (auth.error) return auth.error;
  const body = mapStageInput(await request.json());

  try {
    const { rows } = await db.query(
      `INSERT INTO stages
       (titre, extrait, contenu, photo_couverture, departement, location, work_mode, duration,
        contact_email, close_date, featured, statut, slug, date_publication)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
       RETURNING *`,
      [
        body.titre,
        body.extrait,
        body.contenu,
        body.photo_couverture,
        body.departement,
        body.location,
        body.work_mode,
        body.duration,
        body.contact_email,
        body.close_date,
        body.featured,
        body.statut,
        body.slug,
        body.date_publication,
      ],
    );
    return NextResponse.json({ data: rows[0] }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      {
        error: process.env.NODE_ENV === "development" ? err.message : "Erreur serveur.",
      },
      { status: 500 },
    );
  }
}

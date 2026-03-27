import { NextResponse } from "next/server";

const db = require("@/server/db");
const { requireAuth } = require("@/server/auth");

export const runtime = "nodejs";

export async function PUT(request, { params }) {
  const auth = requireAuth(request);
  if (auth.error) return auth.error;
  const { id } = await params;
  const body = await request.json();

  try {
    const { rows } = await db.query(
      `UPDATE stages SET
       titre = COALESCE($1, titre),
       extrait = COALESCE($2, extrait),
       contenu = COALESCE($3, contenu),
       photo_couverture = COALESCE($4, photo_couverture),
       departement = COALESCE($5, departement),
       location = COALESCE($6, location),
       work_mode = COALESCE($7, work_mode),
       duration = COALESCE($8, duration),
       contact_email = COALESCE($9, contact_email),
       close_date = COALESCE($10, close_date),
       featured = COALESCE($11, featured),
       statut = COALESCE($12, statut),
       slug = COALESCE($13, slug),
       date_publication = COALESCE($14, date_publication),
       date_modification = NOW()
       WHERE id = $15
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
        typeof body.featured === "boolean" ? body.featured : undefined,
        body.statut,
        body.slug,
        body.date_publication,
        id,
      ],
    );
    if (!rows.length) return NextResponse.json({ error: "Stage introuvable." }, { status: 404 });
    return NextResponse.json({ data: rows[0] });
  } catch (err) {
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const auth = requireAuth(request);
  if (auth.error) return auth.error;

  try {
    const { id } = await params;
    const { rowCount } = await db.query("DELETE FROM stages WHERE id = $1", [id]);
    if (!rowCount) return NextResponse.json({ error: "Stage introuvable." }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}

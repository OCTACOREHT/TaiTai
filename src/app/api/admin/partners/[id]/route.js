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
      `UPDATE partners SET
       name = COALESCE($1, name),
       website = COALESCE($2, website),
       logo = COALESCE($3, logo),
       category = COALESCE($4, category),
       tier = COALESCE($5, tier),
       description = COALESCE($6, description),
       featured = COALESCE($7, featured),
       updated_at = NOW()
       WHERE id = $8
       RETURNING *`,
      [
        body.name || body.nom,
        body.website,
        body.logo,
        body.category || body.categorie,
        body.tier,
        body.description,
        typeof body.featured === "boolean" ? body.featured : undefined,
        id,
      ],
    );
    if (!rows.length) return NextResponse.json({ error: "Partenaire introuvable." }, { status: 404 });
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
    const { rowCount } = await db.query("DELETE FROM partners WHERE id = $1", [id]);
    if (!rowCount) return NextResponse.json({ error: "Partenaire introuvable." }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}

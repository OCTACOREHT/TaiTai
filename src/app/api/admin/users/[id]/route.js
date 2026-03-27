import { NextResponse } from "next/server";

const bcrypt = require("bcrypt");
const db = require("@/server/db");
const { requireAuth } = require("@/server/auth");

export const runtime = "nodejs";

export async function PUT(request, { params }) {
  const auth = requireAuth(request);
  if (auth.error) return auth.error;
  const { id } = await params;
  const body = await request.json();
  try {
    let passwordHash;
    if (body.password) {
      passwordHash = await bcrypt.hash(body.password, 10);
    }
    const { rows } = await db.query(
      `UPDATE admin_users SET
       nom = COALESCE($1, nom),
       email = COALESCE($2, email),
       mot_de_passe_hash = COALESCE($3, mot_de_passe_hash),
       role = COALESCE($4, role),
       title = COALESCE($5, title),
       avatar = COALESCE($6, avatar),
       bio = COALESCE($7, bio),
       actif = COALESCE($8, actif),
       date_modification = NOW()
       WHERE id = $9
       RETURNING *`,
      [
        body.nom,
        body.email,
        passwordHash,
        body.role,
        body.title,
        body.avatar,
        body.bio,
        typeof body.actif === "boolean" ? body.actif : undefined,
        id,
      ],
    );
    if (!rows.length) return NextResponse.json({ error: "Compte introuvable." }, { status: 404 });
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
    const { rowCount } = await db.query("DELETE FROM admin_users WHERE id = $1", [id]);
    if (!rowCount) return NextResponse.json({ error: "Compte introuvable." }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}

import { NextResponse } from "next/server";

const bcrypt = require("bcrypt");
const db = require("@/server/db");
const { requireAuth, requireSuperAdmin } = require("@/server/auth");

export const runtime = "nodejs";

export async function GET(request) {
  const auth = requireAuth(request);
  if (auth.error) return auth.error;
  try {
    const { rows } = await db.query("SELECT * FROM admin_users ORDER BY created_at DESC");
    return NextResponse.json({ data: rows });
  } catch (err) {
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}

export async function POST(request) {
  const auth = requireAuth(request);
  if (auth.error) return auth.error;
  const forbidden = requireSuperAdmin(auth.user);
  if (forbidden) return forbidden;
  const body = await request.json();
  try {
    const hash = await bcrypt.hash(body.password, 10);
    const { rows } = await db.query(
      `INSERT INTO admin_users
       (name, email, password_hash, role, title, avatar, bio, active)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
       RETURNING *`,
      [
        body.nom || body.name,
        body.email,
        hash,
        body.role || "editor",
        body.title || "",
        body.avatar || "/images/user/owner.jpg",
        body.bio || "",
        body.actif ?? body.active ?? true,
      ],
    );
    return NextResponse.json({ data: rows[0] }, { status: 201 });
  } catch (err) {
    console.error("[API Users POST] Error:", err);
    return NextResponse.json({ error: err.message || "Erreur serveur." }, { status: 500 });
  }
}

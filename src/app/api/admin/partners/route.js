import { NextResponse } from "next/server";

const db = require("@/server/db");
const { requireAuth } = require("@/server/auth");

export const runtime = "nodejs";

export async function GET(request) {
  const auth = requireAuth(request);
  if (auth.error) return auth.error;
  try {
    const { rows } = await db.query("SELECT * FROM partners ORDER BY created_at DESC");
    return NextResponse.json({ data: rows });
  } catch (err) {
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}

export async function POST(request) {
  const auth = requireAuth(request);
  if (auth.error) return auth.error;
  const body = await request.json();
  try {
    const { rows } = await db.query(
      `INSERT INTO partners
       (name, website, logo, category, tier, description, featured)
       VALUES ($1,$2,$3,$4,$5,$6,$7)
       RETURNING *`,
      [
        body.nom || body.name,
        body.website,
        body.logo || "",
        body.categorie || body.category || "Media",
        body.tier || "silver",
        body.description || "",
        Boolean(body.featured),
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

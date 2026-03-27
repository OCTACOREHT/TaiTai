import { NextResponse } from "next/server";

const db = require("@/server/db");
const { requireAuth } = require("@/server/auth");
const { logAction } = require("@/server/logger");
const { saveUploadedFile } = require("@/server/uploads");

export const runtime = "nodejs";

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
];

export async function POST(request) {
  const auth = requireAuth(request);
  if (auth.error) {
    return auth.error;
  }

  try {
    const formData = await request.formData();
    const file = formData.get("fichier");

    if (!file || typeof file === "string") {
      return NextResponse.json({ error: "Aucun fichier recu." }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Type de fichier non autorise." },
        { status: 400 },
      );
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "Fichier trop volumineux." }, { status: 400 });
    }

    logAction({
      user: auth.user,
      method: "POST",
      route: "/api/admin/media/upload",
    });

    const saved = await saveUploadedFile(file);
    const baseUrl = process.env.BASE_URL || "http://localhost:3000";
    const url = `${baseUrl}${saved.publicUrl}`;

    const { rows } = await db.query(
      `INSERT INTO media (nom_fichier, url, type, uploade_par)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [file.name, url, file.type, auth.user.id],
    );

    return NextResponse.json({ data: rows[0] }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/admin/media/upload]", err.message);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}

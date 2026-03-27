import { NextResponse } from "next/server";

const db = require("@/server/db");
const { requireAuth } = require("@/server/auth");
const { logAction } = require("@/server/logger");

export const runtime = "nodejs";

export async function PUT(request, { params }) {
  const auth = requireAuth(request);
  if (auth.error) {
    return auth.error;
  }
  const { slug } = await params;

  const body = await request.json();
  const { sections } = body;

  if (!sections || !Array.isArray(sections)) {
    return NextResponse.json(
      { error: "sections (tableau) est requis." },
      { status: 400 },
    );
  }

  try {
    logAction({
      user: auth.user,
      method: "PUT",
      route: `/api/admin/pages/${slug}`,
    });

    const updated = [];

    for (const section of sections) {
      const { rows } = await db.query(
        `INSERT INTO pages_content (page_slug, section_key, contenu_fr, contenu_en)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (page_slug, section_key)
         DO UPDATE SET contenu_fr = $3, contenu_en = $4, derniere_modification = NOW()
         RETURNING *`,
        [
          slug,
          section.section_key,
          section.contenu_fr || null,
          section.contenu_en || null,
        ],
      );

      updated.push(rows[0]);
    }

    return NextResponse.json({ data: updated });
  } catch (err) {
    console.error("[PUT /api/admin/pages/:slug]", err.message);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}

import { NextResponse } from "next/server";

const db = require("@/server/db");

export const runtime = "nodejs";

export async function GET(request, { params }) {
  try {
    const { slug } = await params;
    const { rows } = await db.query(
      `SELECT section_key, contenu_fr, contenu_en, derniere_modification
       FROM pages_content
       WHERE page_slug = $1`,
      [slug],
    );

    if (rows.length === 0) {
      return NextResponse.json({ error: "Page non trouvee." }, { status: 404 });
    }

    const sections = {};
    rows.forEach((row) => {
      sections[row.section_key] = {
        fr: row.contenu_fr,
        en: row.contenu_en,
        derniere_modification: row.derniere_modification,
      };
    });

    return NextResponse.json({ page_slug: slug, sections });
  } catch (err) {
    console.error("[GET /api/pages/:slug]", err.message);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}

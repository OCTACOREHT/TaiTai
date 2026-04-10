import { NextResponse } from "next/server";

const db = require("@/server/db");

export const runtime = "nodejs";

const TRACKABLE_FIELDS = {
  article_view: {
    query: "UPDATE articles SET views = COALESCE(views, 0) + 1 WHERE id = $1 RETURNING views",
  },
  article_link: {
    query: "UPDATE articles SET link_clicks = COALESCE(link_clicks, 0) + 1 WHERE id = $1 RETURNING link_clicks",
  },
  stage_view: {
    query: "UPDATE stages SET views = COALESCE(views, 0) + 1 WHERE id = $1 RETURNING views",
  },
  stage_application: {
    query: "UPDATE stages SET applications = COALESCE(applications, 0) + 1 WHERE id = $1 RETURNING applications",
  },
  stage_contact: {
    query: "UPDATE stages SET contact_clicks = COALESCE(contact_clicks, 0) + 1 WHERE id = $1 RETURNING contact_clicks",
  },
  partner_click: {
    query: "UPDATE partners SET clicks = COALESCE(clicks, 0) + 1 WHERE id = $1 RETURNING clicks",
  },
  home_visit: {
    query: "UPDATE home_page_settings SET visits = COALESCE(visits, 0) + 1 WHERE id = true RETURNING visits",
    needsId: false,
  },
  home_cta: {
    query: "UPDATE home_page_settings SET cta_clicks = COALESCE(cta_clicks, 0) + 1 WHERE id = true RETURNING cta_clicks",
    needsId: false,
  },
};

export async function POST(request) {
  try {
    const body = await request.json();
    const action = body?.action;
    const id = body?.id;
    const config = TRACKABLE_FIELDS[action];

    if (!config) {
      return NextResponse.json({ error: "Action de tracking invalide." }, { status: 400 });
    }

    if (config.needsId !== false && !id) {
      return NextResponse.json({ error: "Identifiant manquant." }, { status: 400 });
    }

    const { rowCount } = await db.query(config.query, config.needsId === false ? [] : [id]);

    if (!rowCount) {
      return NextResponse.json({ error: "Ressource introuvable." }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[POST /api/track]", err.message);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}

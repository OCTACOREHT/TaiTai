import { NextResponse } from "next/server";

const db = require("@/server/db");

export const runtime = "nodejs";

export async function GET() {
  try {
    const [{ rows: siteRows }, { rows: homeRows }, { rows: metricRows }] = await Promise.all([
      db.query("SELECT * FROM site_settings WHERE id = true"),
      db.query("SELECT * FROM home_page_settings WHERE id = true"),
      db.query("SELECT * FROM home_hero_metrics ORDER BY sort_order ASC"),
    ]);

    return NextResponse.json({
      site: siteRows[0] || null,
      home: homeRows[0] || null,
      metrics: metricRows,
    });
  } catch (err) {
    console.error("[GET /api/site]", err.message);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}

import { NextResponse } from "next/server";

const db = require("@/server/db");
const { requireAuth } = require("@/server/auth");

export const runtime = "nodejs";

export async function GET(request) {
  const auth = requireAuth(request);
  if (auth.error) return auth.error;
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
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}

export async function PUT(request) {
  const auth = requireAuth(request);
  if (auth.error) return auth.error;
  const body = await request.json();
  try {
    if (body.site) {
      await db.query(
        `UPDATE site_settings SET
         site_name=$1, public_tagline=$2, primary_email=$3, phone=$4, address=$5, footer_text=$6,
         partner_page_title=$7, partner_page_intro=$8, article_page_title=$9, article_page_intro=$10,
         stage_page_title=$11, stage_page_intro=$12, date_modification=NOW()
         WHERE id = true`,
        [
          body.site.site_name,
          body.site.public_tagline,
          body.site.primary_email,
          body.site.phone,
          body.site.address,
          body.site.footer_text,
          body.site.partner_page_title,
          body.site.partner_page_intro,
          body.site.article_page_title,
          body.site.article_page_intro,
          body.site.stage_page_title,
          body.site.stage_page_intro,
        ],
      );
    }
    if (body.home) {
      await db.query(
        `UPDATE home_page_settings SET
         hero_badge=$1, hero_title=$2, hero_subtitle=$3, hero_primary_cta_label=$4, hero_primary_cta_url=$5,
         hero_secondary_cta_label=$6, hero_secondary_cta_url=$7, hero_background_image=$8, about_title=$9,
         about_body=$10, article_section_title=$11, article_section_intro=$12, stage_section_title=$13,
         stage_section_intro=$14, partner_section_title=$15, partner_section_intro=$16,
         featured_article_ids=$17, featured_stage_ids=$18, visits=$19, cta_clicks=$20, date_modification=NOW()
         WHERE id = true`,
        [
          body.home.hero_badge,
          body.home.hero_title,
          body.home.hero_subtitle,
          body.home.hero_primary_cta_label,
          body.home.hero_primary_cta_url,
          body.home.hero_secondary_cta_label,
          body.home.hero_secondary_cta_url,
          body.home.hero_background_image,
          body.home.about_title,
          body.home.about_body,
          body.home.article_section_title,
          body.home.article_section_intro,
          body.home.stage_section_title,
          body.home.stage_section_intro,
          body.home.partner_section_title,
          body.home.partner_section_intro,
          body.home.featured_article_ids || [],
          body.home.featured_stage_ids || [],
          body.home.visits || 0,
          body.home.cta_clicks || 0,
        ],
      );
    }
    if (Array.isArray(body.metrics)) {
      await db.query("DELETE FROM home_hero_metrics");
      for (let i = 0; i < body.metrics.length; i += 1) {
        const metric = body.metrics[i];
        await db.query(
          "INSERT INTO home_hero_metrics (label, value, note, sort_order) VALUES ($1,$2,$3,$4)",
          [metric.label, metric.value, metric.note || null, i],
        );
      }
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}

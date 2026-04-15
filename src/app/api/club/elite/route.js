import { NextResponse } from "next/server";
const db = require("@/server/db");
export const runtime = "nodejs";

export async function GET() {
  try {
    const { rows } = await db.query("SELECT * FROM club_elite_players ORDER BY number ASC");
    return NextResponse.json({ data: rows });
  } catch (err) {
    console.error("[GET /api/club/elite]", err.message);
    return NextResponse.json({ error: "Erreur lecture elite: " + err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { rows: countRows } = await db.query("SELECT COUNT(*) as exact_count FROM club_elite_players");
    if (parseInt(countRows[0].exact_count, 10) >= 10) {
      return NextResponse.json({ error: "Limite de 10 joueurs Élite atteinte." }, { status: 400 });
    }

    const body = await request.json();
    const row = body.data || body;
    const { rows } = await db.query(
      `INSERT INTO club_elite_players 
        (number, first_name, last_name, position, club, weight, height, photo_url, video_url) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [
        row.number || row.no || '',
        row.first_name || row.prenom || '', 
        row.last_name || row.nom || '', 
        row.position || row.poste || '',
        row.club || '',
        row.weight || row.poids || '',
        row.height || row.hauteur || '',
        row.photoUrl || row.photo_url || '',
        row.videoUrl || row.video_url || ''
      ]
    );
    return NextResponse.json({ data: rows[0] }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/club/elite]", err.message);
    return NextResponse.json({ error: "Erreur creation elite: " + err.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const rows = Array.isArray(body.data) ? body.data : [];
    
    if (rows.length > 10) {
      return NextResponse.json({ error: "Limite de 10 joueurs maximale atteinte." }, { status: 400 });
    }
    
    await db.query("DELETE FROM club_elite_players");
    for (const row of rows) {
      await db.query(
        `INSERT INTO club_elite_players 
          (number, first_name, last_name, position, club, weight, height, photo_url, video_url) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
         [
            row.number || row.no || '',
            row.first_name || row.prenom || '', 
            row.last_name || row.nom || '', 
            row.position || row.poste || '',
            row.club || '',
            row.weight || row.poids || '',
            row.height || row.hauteur || '',
            row.photoUrl || row.photo_url || '',
            row.videoUrl || row.video_url || ''
          ]
      );
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[PUT /api/club/elite]", err.message);
    return NextResponse.json({ error: "Erreur sauvegarde elite." }, { status: 500 });
  }
}

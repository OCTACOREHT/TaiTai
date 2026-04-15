import { NextResponse } from "next/server";
const db = require("@/server/db");
export const runtime = "nodejs";

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const row = body.data || body;

    const { rows } = await db.query(
      `UPDATE club_elite_players SET 
        number = $1, 
        first_name = $2, 
        last_name = $3, 
        position = $4, 
        club = $5, 
        weight = $6, 
        height = $7, 
        photo_url = $8, 
        video_url = $9
       WHERE id = $10 RETURNING *`,
       [
        row.number || row.no || '',
        row.first_name || row.prenom || '', 
        row.last_name || row.nom || '', 
        row.position || row.poste || '',
        row.club || '',
        row.weight || row.poids || '',
        row.height || row.hauteur || '',
        row.photo_url || row.photoUrl || '',
        row.video_url || row.videoUrl || '',
        id
      ]
    );

    if (rows.length === 0) {
      return NextResponse.json({ error: "Joueur non trouvé." }, { status: 404 });
    }

    return NextResponse.json({ data: rows[0] });
  } catch (err) {
    console.error("[PUT /api/club/elite/:id]", err.message);
    return NextResponse.json({ error: "Erreur mise à jour elite." }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const { rows } = await db.query("DELETE FROM club_elite_players WHERE id = $1 RETURNING *", [id]);
    
    if (rows.length === 0) {
      return NextResponse.json({ error: "Joueur non trouvé." }, { status: 404 });
    }
    
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[DELETE /api/club/elite/:id]", err.message);
    return NextResponse.json({ error: "Erreur suppression elite." }, { status: 500 });
  }
}

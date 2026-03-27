import { NextResponse } from "next/server";
const db = require("@/server/db");
export const runtime = "nodejs";
export async function GET() {
  try {
    const { rows } = await db.query("SELECT * FROM club_payments ORDER BY periode DESC");
    return NextResponse.json({ data: rows });
  } catch (err) {
    console.error("[GET /api/club/payments]", err.message);
    return NextResponse.json({ data: [], error: "Erreur chargement paiements." }, { status: 500 });
  }
}
export async function PUT(request) {
  try {
    const body = await request.json();
    const rows = Array.isArray(body.data) ? body.data : [];
    await db.query("DELETE FROM club_payments");
    for (const row of rows) {
      await db.query(
        "INSERT INTO club_payments (id, player_id, montant, statut, periode, methode, date_paiement) VALUES ($1,$2,$3,$4,$5,$6,$7)",
        [row.id, row.playerId, row.montant, row.statut, row.periode, row.methode, row.datePaiement || null],
      );
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[PUT /api/club/payments]", err.message);
    return NextResponse.json({ error: "Erreur sauvegarde paiements." }, { status: 500 });
  }
}

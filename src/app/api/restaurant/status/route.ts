import { NextResponse } from "next/server";

const db = require("@/server/db");

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { rows } = await db.query(
      "SELECT id, commandes_ouvertes, message_fermeture, updated_at FROM public.restaurant_settings WHERE id = 'general' LIMIT 1"
    );

    if (rows.length === 0) {
      // Fallback si pas encore inséré
      return NextResponse.json({
        id: "general",
        commandes_ouvertes: true,
        message_fermeture: "Kòmann sou sit la fèmen pou kounye a. Nou ap retounen talè !",
      });
    }

    return NextResponse.json(rows[0]);
  } catch (err: any) {
    console.error("[GET /api/restaurant/status]", err?.message);
    return NextResponse.json({ error: "Erreur serveur lors de la récupération du statut." }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { commandes_ouvertes, message_fermeture } = body;

    if (typeof commandes_ouvertes !== "boolean" && typeof message_fermeture !== "string") {
      return NextResponse.json({ error: "Données invalides." }, { status: 400 });
    }

    let query = `
      INSERT INTO public.restaurant_settings (id, commandes_ouvertes, message_fermeture, updated_at)
      VALUES ('general', COALESCE($1, true), COALESCE($2, 'Kòmann sou sit la fèmen pou kounye a. Nou ap retounen talè !'), NOW())
      ON CONFLICT (id) DO UPDATE SET
        updated_at = NOW()
    `;

    const params: any[] = [
      commandes_ouvertes !== undefined ? commandes_ouvertes : null,
      message_fermeture !== undefined ? message_fermeture : null,
    ];

    if (commandes_ouvertes !== undefined) {
      query += `, commandes_ouvertes = $1`;
    }
    if (message_fermeture !== undefined) {
      query += `, message_fermeture = $2`;
    }

    query += ` RETURNING id, commandes_ouvertes, message_fermeture, updated_at;`;

    const { rows } = await db.query(query, params);

    return NextResponse.json({
      success: true,
      settings: rows[0],
    });
  } catch (err: any) {
    console.error("[PATCH /api/restaurant/status]", err?.message);
    return NextResponse.json({ error: "Erreur lors de la mise à jour du statut." }, { status: 500 });
  }
}

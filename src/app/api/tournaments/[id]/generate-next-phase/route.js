import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase-client";
import { generateNextPhase } from "@/lib/tournament-utils";

export async function POST(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { currentPhase } = body;

    // TODO: Récupérer les groupes et matchs actuels
    // Utiliser generateNextPhase pour créer les prochains matchs
    // Insérer dans flagday_matches

    return NextResponse.json({
      data: [],
      success: true,
    });
  } catch (error) {
    console.error("Erreur:", error);
    return NextResponse.json(
      { error: "Erreur lors de la génération de la phase suivante" },
      { status: 500 }
    );
  }
}

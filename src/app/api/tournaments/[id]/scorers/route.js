import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase-client";

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    
    // 1. Récupérer les buteurs pour ce championnat
    // On sélectionne tous les buteurs dont le match appartient à la compétition
    const { data: scorers, error } = await supabase
      .from("flagday_match_scorers")
      .select(`
        player_name,
        team_name,
        goals,
        flagday_matches!inner(competition_id)
      `)
      .eq("flagday_matches.competition_id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // 2. Agréger les données par joueur et par categorie si possible
    // (Dans le CMS actuel on pourra filtrer côté frontend par le nom de l'équipe ou le round du match)
    
    return NextResponse.json({ data: scorers || [], success: true });
  } catch (error) {
    console.error("Erreur:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des buteurs" },
      { status: 500 }
    );
  }
}

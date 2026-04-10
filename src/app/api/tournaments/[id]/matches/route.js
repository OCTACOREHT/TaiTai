import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase-client";

export async function POST(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { matchId, homeScore, awayScore, scorers } = body;

    // 1. Mettre à jour le score du match
    const { data: matchData, error: matchError } = await supabase
      .from("flagday_matches")
      .update({
        home_score: homeScore,
        away_score: awayScore,
        status: "finished",
      })
      .eq("id", matchId)
      .select()
      .single();

    if (matchError) {
      return NextResponse.json({ error: matchError.message }, { status: 500 });
    }

    // 2. Enregistrer les buteurs (on nettoie les anciens buteurs de ce match d'abord)
    if (scorers && Array.isArray(scorers)) {
      await supabase.from("flagday_match_scorers").delete().eq("match_id", matchId);

      if (scorers.length > 0) {
        const scorersData = scorers.map((s) => ({
          match_id: matchId,
          player_name: s.playerName,
          team_name: s.teamName,
          goals: s.goals || 1,
        }));

        const { error: scorerError } = await supabase
          .from("flagday_match_scorers")
          .insert(scorersData);

        if (scorerError) {
          console.error("Erreur enregistrement buteurs:", scorerError.message);
        }
      }
    }

    return NextResponse.json({ data: matchData, success: true });

    return NextResponse.json({ data, success: true });
  } catch (error) {
    console.error("Erreur:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour du match" },
      { status: 500 }
    );
  }
}

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const { data, error } = await supabase
      .from("flagday_matches")
      .select(`
        *,
        home_team:home_team_id(id, name, logo, color),
        away_team:away_team_id(id, name, logo, color)
      `)
      .eq("competition", id)
      .order("kickoff", { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: data || [], success: true });
  } catch (error) {
    console.error("Erreur:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des matchs" },
      { status: 500 }
    );
  }
}

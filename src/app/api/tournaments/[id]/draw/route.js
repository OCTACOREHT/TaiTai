import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase-client";

export async function POST(request, { params }) {
  try {
    const { id } = await params;

    // 1. Récupérer les infos du tournoi (catégorie d'âge)
    const { data: tournament, error: tourError } = await supabase
      .from("flagday_competitions")
      .select("age_category")
      .eq("id", id)
      .single();

    if (tourError || !tournament) {
      return NextResponse.json({ error: "Tournoi non trouvé" }, { status: 404 });
    }

    const { age_category: category } = tournament;

    if (!category) {
      return NextResponse.json({ error: "Aucune catégorie configurée pour ce tournoi" }, { status: 400 });
    }

    // 2. Récupérer l'ID de la catégorie
    const { data: catData, error: catError } = await supabase
      .from("flagday_categories")
      .select("id")
      .eq("competition_id", id)
      .eq("name", category)
      .single();

    if (catError || !catData) {
      return NextResponse.json({ error: `La catégorie ${category} n'est pas initialisée` }, { status: 404 });
    }

    // 3. Récupérer les équipes inscrites
    const { data: compTeams, error: teamsError } = await supabase
      .from("flagday_competition_teams")
      .select("team_id")
      .eq("competition_id", id);

    if (teamsError) throw teamsError;

    if (!compTeams || compTeams.length < 8) {
      return NextResponse.json({ 
        error: `Il faut exactement 8 équipes pour générer les poules (Actuel: ${compTeams?.length || 0})` 
      }, { status: 400 });
    }

    // Limiter à 8 si plus (on prend les 8 premières inscrites)
    const teamsToDraw = compTeams.slice(0, 8);

    // 4. Mélanger et diviser en 2 groupes de 4
    const shuffledTeams = [...teamsToDraw].sort(() => Math.random() - 0.5);
    const groupA = shuffledTeams.slice(0, 4);
    const groupB = shuffledTeams.slice(4, 8);

    // Nettoyage des anciens tirages/matchs
    await supabase.from("flagday_standings").delete().eq("category_id", catData.id);
    await supabase.from("flagday_matches").delete().eq("competition_id", id).filter("round", "ilike", `${category}%`);

    // 5. Insérer dans flagday_standings
    const standingsData = [
      ...groupA.map(t => ({ category_id: catData.id, team_id: t.team_id, group_name: 'A' })),
      ...groupB.map(t => ({ category_id: catData.id, team_id: t.team_id, group_name: 'B' }))
    ];

    const { error: standingsErr } = await supabase
      .from("flagday_standings")
      .insert(standingsData);

    if (standingsErr) throw standingsErr;

    // 6. Générer les matchs de poule (Round Robin)
    const matches = [];
    const generateMatchesForGroup = (group, groupName) => {
      for (let i = 0; i < group.length; i++) {
        for (let j = i + 1; j < group.length; j++) {
          matches.push({
            competition_id: id,
            round: `${category} - Groupe ${groupName}`,
            home_team_id: group[i].team_id,
            away_team_id: group[j].team_id,
            status: 'scheduled',
            kickoff: new Date().toISOString(),
            venue: 'Terrain Principal'
          });
        }
      }
    };

    generateMatchesForGroup(groupA, 'A');
    generateMatchesForGroup(groupB, 'B');

    const { error: matchesErr } = await supabase
      .from("flagday_matches")
      .insert(matches);

    if (matchesErr) throw matchesErr;

    // 7. Mettre à jour le statut du tournoi
    await supabase.from("flagday_competitions").update({ status: 'in_progress' }).eq("id", id);

    return NextResponse.json({
      success: true,
      data: {
        message: `Tirage terminé pour ${category}. 2 groupes de 4 créés.`,
      }
    });
  } catch (error) {
    console.error("Erreur Tirage:", error);
    return NextResponse.json({ error: error.message || "Erreur lors du tirage au sort" }, { status: 500 });
  }
}

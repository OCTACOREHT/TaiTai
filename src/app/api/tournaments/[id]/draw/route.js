import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase-client";

export async function POST(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { category } = body;

    if (!category) {
      return NextResponse.json({ error: "Catégorie requise" }, { status: 400 });
    }

    // 1. Récupérer les catégories du championnat pour avoir le category_id
    const { data: categories, error: catError } = await supabase
      .from("flagday_categories")
      .select("id, name")
      .eq("competition_id", id);

    if (catError) throw catError;
    
    const targetCategory = categories.find(c => c.name === category);
    if (!targetCategory) {
      return NextResponse.json({ error: `Catégorie ${category} non trouvée pour ce tournoi` }, { status: 404 });
    }

    // 2. Récupérer les équipes du championnat pour cette catégorie
    const { data: compTeams, error: teamsError } = await supabase
      .from("flagday_competition_teams")
      .select("team_id, flagday_teams(id, name, logo_url)")
      .eq("competition_id", id)
      .eq("category", category);

    if (teamsError) throw teamsError;

    if (!compTeams || compTeams.length < 8) {
      return NextResponse.json({ 
        error: `Il faut au moins 8 équipes en ${category} pour générer les poules (Actuel: ${compTeams?.length || 0})` 
      }, { status: 400 });
    }

    // 3. Mélanger et diviser en 2 groupes de 4
    const shuffledTeams = [...compTeams].sort(() => Math.random() - 0.5);
    const groupA = shuffledTeams.slice(0, 4);
    const groupB = shuffledTeams.slice(4, 8);

    // netoyage des anciens tirages pour cette catégorie
    await supabase.from("flagday_standings").delete().eq("category_id", targetCategory.id);

    // 4. Insérer dans flagday_standings
    const standingsData = [
      ...groupA.map(t => ({ category_id: targetCategory.id, team_id: t.team_id, group_name: 'A', points: 0 })),
      ...groupB.map(t => ({ category_id: targetCategory.id, team_id: t.team_id, group_name: 'B', points: 0 }))
    ];

    const { error: standingsErr } = await supabase
      .from("flagday_standings")
      .insert(standingsData);

    if (standingsErr) throw standingsErr;

    // 5. Générer les matchs de poule (Round Robin)
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
            kickoff: new Date().toISOString(), // À ajuster par l'utilisateur plus tard
            venue: 'À définir'
          });
        }
      }
    };

    generateMatchesForGroup(groupA, 'A');
    generateMatchesForGroup(groupB, 'B');

    // Nettoyage des anciens matchs pour ce groupe
    await supabase.from("flagday_matches").delete()
      .eq("competition_id", id)
      .filter("round", "ilike", `${category}%`);

    const { error: matchesErr } = await supabase
      .from("flagday_matches")
      .insert(matches);

    if (matchesErr) throw matchesErr;

    return NextResponse.json({
      success: true,
      data: {
        message: `Tirage terminé pour ${category}. 2 groupes de 4 créés et ${matches.length} matchs générés.`,
        groups: { A: groupA, B: groupB }
      }
    });
  } catch (error) {
    console.error("Erreur Tirage:", error);
    return NextResponse.json({ error: error.message || "Erreur lors du tirage au sort" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase-client";

export async function POST(request, { params }) {
  try {
    const { id: competitionId } = await params;
    const body = await request.json();
    const { matchId, homeScore, awayScore, scorers } = body;

    // 1. Mettre à jour le score du match
    const { data: currentMatch, error: matchError } = await supabase
      .from("flagday_matches")
      .update({
        home_score: homeScore,
        away_score: awayScore,
        status: "finished",
      })
      .eq("id", matchId)
      .select()
      .single();

    if (matchError) throw matchError;

    // 2. Enregistrer les buteurs
    if (scorers && Array.isArray(scorers)) {
      await supabase.from("flagday_match_scorers").delete().eq("match_id", matchId);
      if (scorers.length > 0) {
        await supabase.from("flagday_match_scorers").insert(
          scorers.map((s) => ({
            match_id: matchId,
            player_name: s.playerName,
            team_name: s.teamName,
            goals: s.goals || 1,
          }))
        );
      }
    }

    // 3. RECULCUL ET MISE À JOUR DU CLASSEMENT (STANDINGS)
    if (currentMatch.round.includes("Groupe")) {
      const { data: tournament } = await supabase
        .from("flagday_competitions")
        .select("age_category")
        .eq("id", competitionId)
        .single();
      
      const categoryName = tournament?.age_category;
      const { data: catData } = await supabase.from("flagday_categories").select("id").eq("competition_id", competitionId).eq("name", categoryName).single();

      if (catData) {
        // Récupérer tous les matchs de poule terminés pour cette catégorie
        const { data: groupMatches } = await supabase
          .from("flagday_matches")
          .select("*")
          .eq("competition_id", competitionId)
          .eq("status", "finished")
          .filter("round", "ilike", `%${categoryName}%Groupe%`);

        // Récupérer le mapping des équipes dans les standings
        const { data: standings } = await supabase
          .from("flagday_standings")
          .select("*")
          .eq("category_id", catData.id);

        if (standings) {
          for (const standing of standings) {
            const teamId = standing.team_id;
            let pts = 0, played = 0, won = 0, drawn = 0, lost = 0, gf = 0, ga = 0;

            groupMatches?.forEach(m => {
              if (m.home_team_id === teamId || m.away_team_id === teamId) {
                played++;
                const isHome = m.home_team_id === teamId;
                const myScore = isHome ? m.home_score : m.away_score;
                const oppScore = isHome ? m.away_score : m.home_score;
                
                gf += myScore;
                ga += oppScore;

                if (myScore > oppScore) { pts += 3; won++; }
                else if (myScore < oppScore) { lost++; }
                else { pts += 1; drawn++; }
              }
            });

            // Mettre à jour la ligne dans flagday_standings
            await supabase
              .from("flagday_standings")
              .update({
                points: pts,
                played: played,
                won: won,
                drawn: drawn,
                lost: lost,
                goals_for: gf,
                goals_against: ga
              })
              .eq("id", standing.id);
          }
        }

        // 3.1 Vérifier si on doit générer la phase finale (Demi-finales)
        // On ne le fait que si TOUS les matchs du groupe sont terminés
        const { data: allGroupMatches } = await supabase
          .from("flagday_matches")
          .select("*")
          .eq("competition_id", competitionId)
          .filter("round", "ilike", `%${categoryName}%Groupe%`);

        const allFinished = allGroupMatches?.every(m => m.status === "finished") && allGroupMatches?.length > 0;

        if (allFinished) {
          const teamStats = {};
          standings.forEach(s => teamStats[s.team_id] = { id: s.team_id, group: s.group_name, pts: 0, diff: 0, gf: 0 });

          allGroupMatches.forEach(m => {
            const hId = m.home_team_id;
            const aId = m.away_team_id;
            teamStats[hId].gf += m.home_score;
            teamStats[hId].diff += (m.home_score - m.away_score);
            teamStats[aId].gf += m.away_score;
            teamStats[aId].diff += (m.away_score - m.home_score);
            if (m.home_score > m.away_score) teamStats[hId].pts += 3;
            else if (m.home_score < m.away_score) teamStats[aId].pts += 3;
            else { teamStats[hId].pts += 1; teamStats[aId].pts += 1; }
          });

          const sortedA = Object.values(teamStats).filter((s) => s.group === 'A').sort((a,b) => b.pts - a.pts || b.diff - a.diff || b.gf - a.gf);
          const sortedB = Object.values(teamStats).filter((s) => s.group === 'B').sort((a,b) => b.pts - a.pts || b.diff - a.diff || b.gf - a.gf);

          const { data: existingSF } = await supabase.from("flagday_matches").select("id").eq("competition_id", competitionId).ilike("round", `%${categoryName}%Demi-finale%`);
          
          if (existingSF?.length === 0 && sortedA.length >= 2 && sortedB.length >= 2) {
            await supabase.from("flagday_matches").insert([
              { competition_id: competitionId, round: `${categoryName} - Demi-finale 1`, home_team_id: sortedA[0].id, away_team_id: sortedB[1].id, status: 'scheduled', kickoff: new Date().toISOString(), venue: 'Terrain Principal' },
              { competition_id: competitionId, round: `${categoryName} - Demi-finale 2`, home_team_id: sortedB[0].id, away_team_id: sortedA[1].id, status: 'scheduled', kickoff: new Date().toISOString(), venue: 'Terrain Principal' }
            ]);
          }
        }
      }
    }

    // 4. Vérifier si on doit générer la Finale
    if (currentMatch.round.includes("Demi-finale")) {
      const { data: tournament } = await supabase
        .from("flagday_competitions")
        .select("age_category")
        .eq("id", competitionId)
        .single();
      
      const category = tournament?.age_category;

      const { data: allSFMatches } = await supabase
        .from("flagday_matches")
        .select("*")
        .eq("competition_id", competitionId)
        .filter("round", "ilike", `%${category}%Demi-finale%`);

      const allFinished = allSFMatches.every(m => m.status === "finished");

      if (allFinished && allSFMatches.length === 2) {
        // Identifier les gagnants
        const getWinner = (m) => m.home_score >= m.away_score ? m.home_team_id : m.away_team_id;
        
        const sf1 = allSFMatches.find(m => m.round.includes("1"));
        const sf2 = allSFMatches.find(m => m.round.includes("2"));

        const { data: existingFinal } = await supabase
          .from("flagday_matches")
          .select("id")
          .eq("competition_id", competitionId)
          .ilike("round", `%${category}%Finale%`)
          .not("round", "ilike", "%Demi%");

        if (existingFinal.length === 0) {
          await supabase.from("flagday_matches").insert({
            competition_id: competitionId,
            round: `${category} - Finale`,
            home_team_id: getWinner(sf1),
            away_team_id: getWinner(sf2),
            status: 'scheduled',
            kickoff: new Date().toISOString(),
            venue: 'Terrain d\'Honneur'
          });
        }
      }
    }

    // 5. Mettre à jour au statut 'completed' si la finale est terminée
    if (currentMatch.round.includes("Finale") && !currentMatch.round.includes("Demi")) {
       await supabase.from("flagday_competitions").update({ status: 'completed' }).eq("id", competitionId);
    }

    return NextResponse.json({ data: currentMatch, success: true });
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
        home_team:home_team_id(id, name, logo_url, color),
        away_team:away_team_id(id, name, logo_url, color)
      `)
      .eq("competition_id", id)
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

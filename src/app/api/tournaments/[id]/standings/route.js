import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase-client";

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    // Get all matches for this tournament
    const { data: matches, error: matchError } = await supabase
      .from("flagday_matches")
      .select(`
        *,
        home_team:home_team_id(id, name, logo, color, category),
        away_team:away_team_id(id, name, logo, color, category)
      `)
      .eq("competition", id)
      .eq("status", "finished");

    if (matchError) {
      return NextResponse.json({ error: matchError.message }, { status: 500 });
    }

    // Get all teams in this tournament
    const { data: teams, error: teamError } = await supabase
      .from("flagday_competition_teams")
      .select(`
        flagday_teams:team_id(*)
      `)
      .eq("competition_id", id);

    if (teamError) {
      return NextResponse.json({ error: teamError.message }, { status: 500 });
    }

    // Calculate standings by category
    const standings = {};

    // Initialize standings for each team
    const teamMap = {};
    teams?.forEach((item) => {
      const team = item.flagday_teams;
      const category = team.category || "U9";

      if (!standings[category]) {
        standings[category] = [];
      }

      teamMap[team.id] = team;

      standings[category].push({
        teamId: team.id,
        teamName: team.name,
        teamLogo: team.logo,
        teamColor: team.color,
        points: 0,
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        goalDifference: 0,
      });
    });

    // Process finished matches
    matches?.forEach((match) => {
      const homeCategory = match.home_team?.category || "U9";
      const awayCategory = match.away_team?.category || "U9";

      // Handle home team
      const homeTeamStanding = standings[homeCategory]?.find(
        (s) => s.teamId === match.home_team_id
      );
      if (homeTeamStanding) {
        homeTeamStanding.played += 1;
        homeTeamStanding.goalsFor += match.home_score || 0;
        homeTeamStanding.goalsAgainst += match.away_score || 0;

        if (match.home_score > match.away_score) {
          homeTeamStanding.won += 1;
          homeTeamStanding.points += 3;
        } else if (match.home_score === match.away_score) {
          homeTeamStanding.drawn += 1;
          homeTeamStanding.points += 1;
        } else {
          homeTeamStanding.lost += 1;
        }
      }

      // Handle away team
      const awayTeamStanding = standings[awayCategory]?.find(
        (s) => s.teamId === match.away_team_id
      );
      if (awayTeamStanding) {
        awayTeamStanding.played += 1;
        awayTeamStanding.goalsFor += match.away_score || 0;
        awayTeamStanding.goalsAgainst += match.home_score || 0;

        if (match.away_score > match.home_score) {
          awayTeamStanding.won += 1;
          awayTeamStanding.points += 3;
        } else if (match.away_score === match.home_score) {
          awayTeamStanding.drawn += 1;
          awayTeamStanding.points += 1;
        } else {
          awayTeamStanding.lost += 1;
        }
      }
    });

    // Calculate goal difference and sort by points
    Object.keys(standings).forEach((category) => {
      standings[category] = standings[category]
        .map((team) => ({
          ...team,
          goalDifference: team.goalsFor - team.goalsAgainst,
        }))
        .sort((a, b) => {
          if (b.points !== a.points) {
            return b.points - a.points;
          }
          return b.goalDifference - a.goalDifference;
        });
    });

    return NextResponse.json({ data: standings, success: true });
  } catch (error) {
    console.error("Erreur standings:", error);
    return NextResponse.json(
      { error: "Erreur lors du calcul des classements" },
      { status: 500 }
    );
  }
}

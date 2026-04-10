import {
  TournamentTeam,
  TournamentGroup,
  GroupStanding,
  Match,
  AgeCategory,
} from "@/types/tournament";

// Nombre de groupes par catégorie
const GROUPS_PER_CATEGORY: { [key: string]: number } = {
  U9: 2,
  U11: 2,
  U13: 2,
  U15: 2,
  U17: 2,
  U21: 2,
};

// Tirage au sort - distribue les équipes dans les groupes
export const drawTeamsIntoGroups = (
  teams: TournamentTeam[],
  category: AgeCategory,
): TournamentGroup[] => {
  const categoryTeams = teams.filter((t) => t.category === category);
  const groupCount = GROUPS_PER_CATEGORY[category] || 2;
  const teamsPerGroup = Math.ceil(categoryTeams.length / groupCount);

  // Mélanger les équipes aléatoirement
  const shuffled = [...categoryTeams].sort(() => Math.random() - 0.5);

  // Créer les groupes
  const groups: TournamentGroup[] = [];
  for (let i = 0; i < groupCount; i++) {
    const groupTeams = shuffled.slice(
      i * teamsPerGroup,
      (i + 1) * teamsPerGroup,
    );

    // Créer les matchs du groupe (tour rond)
    const matches = generateGroupMatches(groupTeams, category);

    groups.push({
      id: `group-${category}-${String.fromCharCode(65 + i)}`,
      name: `Groupe ${String.fromCharCode(65 + i)}`,
      category,
      teams: groupTeams,
      matches,
      standings: initializeStandings(groupTeams),
    });
  }

  return groups;
};

// Génère les matchs de poule (tour rond)
export const generateGroupMatches = (
  teams: TournamentTeam[],
  category: AgeCategory,
): Match[] => {
  const matches: Match[] = [];
  const n = teams.length;

  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      matches.push({
        id: `match-${Date.now()}-${Math.random()}`,
        teamA: teams[i],
        teamB: teams[j],
        isPlayed: false,
        phase: "groups",
      });
    }
  }

  return matches;
};

// Initialise les classements
export const initializeStandings = (teams: TournamentTeam[]): GroupStanding[] => {
  return teams.map((team) => ({
    team,
    played: 0,
    wins: 0,
    draws: 0,
    losses: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    goalDifference: 0,
    points: 0,
  }));
};

// Calcule les standings après un match
export const calculateStandings = (matches: Match[], teams: TournamentTeam[]): GroupStanding[] => {
  const standings = initializeStandings(teams);

  matches.forEach((match) => {
    if (!match.isPlayed) return;

    const aIndex = standings.findIndex((s) => s.team.id === match.teamA.id);
    const bIndex = standings.findIndex((s) => s.team.id === match.teamB.id);

    if (aIndex === -1 || bIndex === -1) return;

    const scoreA = match.scoreA || 0;
    const scoreB = match.scoreB || 0;

    // Mise à jour des stats
    standings[aIndex].played++;
    standings[bIndex].played++;

    standings[aIndex].goalsFor += scoreA;
    standings[aIndex].goalsAgainst += scoreB;
    standings[bIndex].goalsFor += scoreB;
    standings[bIndex].goalsAgainst += scoreA;

    standings[aIndex].goalDifference = standings[aIndex].goalsFor - standings[aIndex].goalsAgainst;
    standings[bIndex].goalDifference = standings[bIndex].goalsFor - standings[bIndex].goalsAgainst;

    // Déterminer le résultat
    if (scoreA > scoreB) {
      standings[aIndex].wins++;
      standings[aIndex].points += 3;
      standings[bIndex].losses++;
    } else if (scoreB > scoreA) {
      standings[bIndex].wins++;
      standings[bIndex].points += 3;
      standings[aIndex].losses++;
    } else {
      standings[aIndex].draws++;
      standings[aIndex].points += 1;
      standings[bIndex].draws++;
      standings[bIndex].points += 1;
    }
  });

  // Trier par points, puis par différence de buts, puis par matchs gagnés
  return standings.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.goalDifference !== a.goalDifference)
      return b.goalDifference - a.goalDifference;
    return b.goalsFor - a.goalsFor;
  });
};

// Génère les phases suivantes (playoffs, semis, finals)
export const generateNextPhase = (
  groups: TournamentGroup[],
  currentPhase: "groups" | "playoffs" | "semifinals",
): Match[] => {
  const matches: Match[] = [];

  // Récupérer les équipes qualifiées de chaque groupe
  const qualifiedTeams: TournamentTeam[][] = groups.map((group) =>
    group.standings.slice(0, 2).map((s) => s.team),
  );

  if (currentPhase === "groups") {
    // Phase des playoffs: 1er de A vs 2e de B, 1er de B vs 2e de A, etc.
    for (let i = 0; i < qualifiedTeams.length; i += 2) {
      if (i + 1 < qualifiedTeams.length) {
        matches.push({
          id: `match-playoff-${Date.now()}-${Math.random()}`,
          teamA: qualifiedTeams[i][0],
          teamB: qualifiedTeams[i + 1][1],
          isPlayed: false,
          phase: "playoffs",
        });

        matches.push({
          id: `match-playoff-${Date.now()}-${Math.random()}`,
          teamA: qualifiedTeams[i + 1][0],
          teamB: qualifiedTeams[i][1],
          isPlayed: false,
          phase: "playoffs",
        });
      }
    }
  }

  return matches;
};

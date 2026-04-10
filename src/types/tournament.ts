export type AgeCategory = "U9" | "U11" | "U13" | "U15" | "U17" | "U21";
export type TournamentPhase = "groups" | "playoffs" | "semifinals" | "finals" | "completed";

export interface TournamentTeam {
  id: string;
  name: string;
  logo: string;
  category: AgeCategory;
  assignedGroup?: string;
}

export interface Match {
  id: string;
  teamA: TournamentTeam;
  teamB: TournamentTeam;
  scoreA?: number;
  scoreB?: number;
  isPlayed: boolean;
  phase: TournamentPhase;
  matchDate?: string;
}

export interface GroupStanding {
  team: TournamentTeam;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
}

export interface TournamentGroup {
  id: string;
  name: string;
  category: AgeCategory;
  teams: TournamentTeam[];
  matches: Match[];
  standings: GroupStanding[];
}

export interface TournamentCategory {
  category: AgeCategory;
  groups: TournamentGroup[];
  currentPhase: TournamentPhase;
  matches: Match[];
}

export interface Tournament {
  id: string;
  name: string;
  description?: string;
  startDate: string;
  endDate?: string;
  categories: TournamentCategory[];
  allTeams: TournamentTeam[];
  status: "draft" | "active" | "completed";
  createdAt: string;
  updatedAt: string;
}

export interface TournamentFormData {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  selectedCategories: AgeCategory[];
}

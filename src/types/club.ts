export type PlayerStatus = "actif" | "blesse" | "suspendu";

export type PaymentStatus = "paid" | "pending" | "late";

export type EventType = "match" | "entrainement" | "reunion";

export type EventCalendarColor = "Danger" | "Success" | "Primary" | "Warning";

export type PaymentMethod = "virement" | "carte" | "especes" | "mobile";

export type StaffRole = "Coach" | "Assistant" | "Admin" | "Medical";

export type MatchFormResult = "W" | "D" | "L";

export type MatchState = "FT" | "A venir";

export interface Player {
  id: string;
  nom: string;
  prenom: string;
  photoUrl: string;
  poste: string;
  categorie: string;
  statut: PlayerStatus;
  telephone: string;
  email: string;
  dateInscription: string;
  dateNaissance: string;
  adresse: string;
  cotisationMontant: number;
  cotisationStatut: PaymentStatus;
  dernierPaiement: string;
}

export interface ClubEvent {
  id: string;
  titre: string;
  date: string;
  lieu: string;
  type: EventType;
  calendarColor?: EventCalendarColor;
  participants: string[];
}

export interface Payment {
  id: string;
  playerId: string;
  montant: number;
  statut: PaymentStatus;
  periode: string;
  methode: PaymentMethod;
  datePaiement?: string;
}

export interface Parent {
  id: string;
  nom: string;
  prenom: string;
  telephone: string;
  email: string;
  lien: string;
  playerId: string;
}

export interface StaffMember {
  id: string;
  nom: string;
  role: StaffRole;
  telephone: string;
  email: string;
  dateDebut: string;
}

export interface Alumni {
  id: string;
  nom: string;
  anneeEntree: number;
  anneeSortie: number;
  poste: string;
  situationActuelle: string;
}

export interface ClubStandingRow {
  teamId: string;
  teamName: string;
  logoUrl: string;
  pts: number;
  played: number;
  wins: number;
  losses: number;
  draws: number;
  goalsFor: number;
  goalsAgainst: number;
  form: MatchFormResult[];
}

export interface ClubFixture {
  id: string;
  competition: string;
  round: string;
  kickoff: string;
  status: MatchState;
  homeTeamId: string;
  awayTeamId: string;
  homeTeamName: string;
  awayTeamName: string;
  homeLogoUrl: string;
  awayLogoUrl: string;
  homeScore?: number;
  awayScore?: number;
}

export interface PlayerFormValues {
  photoUrl: string;
  nom: string;
  prenom: string;
  dateNaissance: string;
  poste: string;
  categorie: string;
  telephone: string;
  email: string;
}

export interface ParentFormValues {
  nom: string;
  prenom: string;
  telephone: string;
  email: string;
  lien: string;
  playerId: string;
}

export interface StaffFormValues {
  nom: string;
  role: StaffRole;
  telephone: string;
  email: string;
  dateDebut: string;
}

export interface AlumniFormValues {
  nom: string;
  anneeEntree: number;
  anneeSortie: number;
  poste: string;
  situationActuelle: string;
}

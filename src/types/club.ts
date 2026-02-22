export type PlayerStatus = "actif" | "blesse" | "suspendu";

export type PaymentStatus = "paid" | "pending" | "late";

export type EventType = "match" | "entrainement" | "reunion";

export type PaymentMethod = "virement" | "carte" | "especes" | "mobile";

export type StaffRole = "Coach" | "Assistant" | "Admin" | "Medical";

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

export interface PlayerFormValues {
  photoUrl: string;
  nom: string;
  prenom: string;
  dateNaissance: string;
  poste: string;
  categorie: string;
  telephone: string;
  email: string;
  adresse: string;
  statut: PlayerStatus;
  cotisationMontant: number;
  cotisationStatut: PaymentStatus;
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

"use client";

import { usePathname } from "next/navigation";
import React, { createContext, useContext, useEffect, useState } from "react";
import { Alumni, ClubEvent, Parent, Payment, Player, StaffMember } from "@/types/club";

type SetState<T> = React.Dispatch<React.SetStateAction<T>>;

interface ClubDataContextValue {
  players: Player[];
  setPlayers: SetState<Player[]>;
  parents: Parent[];
  setParents: SetState<Parent[]>;
  staff: StaffMember[];
  setStaff: SetState<StaffMember[]>;
  alumni: Alumni[];
  setAlumni: SetState<Alumni[]>;
  events: ClubEvent[];
  setEvents: SetState<ClubEvent[]>;
  payments: Payment[];
  setPayments: SetState<Payment[]>;
  hydrated: boolean;
}

const ClubDataContext = createContext<ClubDataContextValue | null>(null);

async function fetchJson(url: string) {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    return { data: [] };
  }
  return response.json();
}

export const ClubDataProvider = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const [players, setPlayers] = useState<Player[]>([]);
  const [parents, setParents] = useState<Parent[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [alumni, setAlumni] = useState<Alumni[]>([]);
  const [events, setEvents] = useState<ClubEvent[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const shouldLoadClubData =
      pathname.startsWith("/club") ||
      pathname.startsWith("/evenements") ||
      pathname.startsWith("/paiements") ||
      pathname.startsWith("/classement");

    if (!shouldLoadClubData) {
      setHydrated(true);
      return;
    }

    const load = async () => {
      try {
        const isEventSection = pathname.startsWith("/evenements");
        const isPaymentSection = pathname.startsWith("/paiements");
        const playersRes = await fetchJson("/api/club/players");
        const parentsRes = isEventSection || isPaymentSection ? { data: [] } : await fetchJson("/api/club/parents");
        const staffRes = isEventSection || isPaymentSection ? { data: [] } : await fetchJson("/api/club/staff");
        const alumniRes = isEventSection || isPaymentSection ? { data: [] } : await fetchJson("/api/club/alumni");
        const eventsRes = isPaymentSection ? { data: [] } : await fetchJson("/api/club/events");
        const paymentsRes = isEventSection ? { data: [] } : await fetchJson("/api/club/payments");

        setPlayers(
          (playersRes.data || []).map((row: any) => ({
            id: row.id,
            nom: row.nom,
            prenom: row.prenom,
            photoUrl: row.photo_url,
            poste: row.poste,
            categorie: row.categorie,
            statut: row.statut,
            telephone: row.telephone,
            email: row.email,
            dateInscription: row.date_inscription,
            dateNaissance: row.date_naissance,
            adresse: row.adresse,
            cotisationMontant: Number(row.cotisation_montant),
            cotisationStatut: row.cotisation_statut,
            dernierPaiement: row.dernier_paiement || "",
          })),
        );
        setParents(
          (parentsRes.data || []).map((row: any) => ({
            id: row.id,
            nom: row.nom,
            prenom: row.prenom,
            telephone: row.telephone,
            email: row.email,
            lien: row.lien,
            playerId: row.player_id,
          })),
        );
        setStaff(
          (staffRes.data || []).map((row: any) => ({
            id: row.id,
            nom: row.name || row.nom,
            photoUrl: row.photo_url,
            role: row.role,
            telephone: row.phone || row.telephone,
            email: row.email,
            dateDebut: row.start_date || row.date_debut,
          })),
        );
        setAlumni(
          (alumniRes.data || []).map((row: any) => ({
            id: row.id,
            nom: row.nom,
            anneeEntree: row.annee_entree,
            anneeSortie: row.annee_sortie,
            poste: row.poste,
            situationActuelle: row.situation_actuelle,
          })),
        );
        setEvents(
          (eventsRes.data || []).map((row: any) => ({
            id: row.id,
            titre: row.titre,
            date: row.date,
            lieu: row.lieu,
            type: row.type,
            calendarColor: row.calendar_color || undefined,
            participants: row.participants || [],
          })),
        );
        setPayments(
          (paymentsRes.data || []).map((row: any) => ({
            id: row.id,
            playerId: row.player_id,
            montant: Number(row.montant),
            statut: row.statut,
            periode: row.periode,
            methode: row.methode,
            datePaiement: row.date_paiement || undefined,
          })),
        );
      } catch (error) {
        console.error("[ClubDataContext] chargement partiel impossible", error);
      } finally {
        setHydrated(true);
      }
    };

    void load();
  }, [pathname]);

  return (
    <ClubDataContext.Provider value={{ players, setPlayers, parents, setParents, staff, setStaff, alumni, setAlumni, events, setEvents, payments, setPayments, hydrated }}>
      {children}
    </ClubDataContext.Provider>
  );
};

export const useClubData = () => {
  const context = useContext(ClubDataContext);
  if (!context) throw new Error("useClubData must be used inside ClubDataProvider");
  return context;
};

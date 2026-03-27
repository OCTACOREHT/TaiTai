"use client";

<<<<<<< HEAD
import { usePathname } from "next/navigation";
import React, { createContext, useContext, useEffect, useState } from "react";
import { Alumni, ClubEvent, Parent, Payment, Player, StaffMember } from "@/types/club";
=======
import React, { createContext, useContext, useEffect, useState } from "react";
import {
  mockAlumni,
  mockEvents,
  mockParents,
  mockPayments,
  mockPlayers,
  mockStaff,
} from "@/data/club/mock-data";
import {
  Alumni,
  ClubEvent,
  Parent,
  Payment,
  Player,
  StaffMember,
} from "@/types/club";
>>>>>>> 8dace4bc0a45c5486fb56dd83a4a0b5a447a7b3a

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

<<<<<<< HEAD
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
            nom: row.nom,
            role: row.role,
            telephone: row.telephone,
            email: row.email,
            dateDebut: row.date_debut,
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
=======
const STORAGE_KEYS = {
  players: "club-data-players-v1",
  parents: "club-data-parents-v1",
  staff: "club-data-staff-v1",
  alumni: "club-data-alumni-v1",
  events: "club-data-events-v1",
  payments: "club-data-payments-v1",
};

const parseStoredArray = <T,>(value: string | null, fallback: T[]): T[] => {
  if (!value) {
    return fallback;
  }
  try {
    const parsed = JSON.parse(value) as T[];
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
};

export const ClubDataProvider = ({ children }: { children: React.ReactNode }) => {
  const [players, setPlayers] = useState<Player[]>(mockPlayers);
  const [parents, setParents] = useState<Parent[]>(mockParents);
  const [staff, setStaff] = useState<StaffMember[]>(mockStaff);
  const [alumni, setAlumni] = useState<Alumni[]>(mockAlumni);
  const [events, setEvents] = useState<ClubEvent[]>(mockEvents);
  const [payments, setPayments] = useState<Payment[]>(mockPayments);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    setPlayers(
      parseStoredArray<Player>(
        window.localStorage.getItem(STORAGE_KEYS.players),
        mockPlayers,
      ),
    );
    setParents(
      parseStoredArray<Parent>(
        window.localStorage.getItem(STORAGE_KEYS.parents),
        mockParents,
      ),
    );
    setStaff(
      parseStoredArray<StaffMember>(
        window.localStorage.getItem(STORAGE_KEYS.staff),
        mockStaff,
      ),
    );
    setAlumni(
      parseStoredArray<Alumni>(
        window.localStorage.getItem(STORAGE_KEYS.alumni),
        mockAlumni,
      ),
    );
    setEvents(
      parseStoredArray<ClubEvent>(
        window.localStorage.getItem(STORAGE_KEYS.events),
        mockEvents,
      ),
    );
    setPayments(
      parseStoredArray<Payment>(
        window.localStorage.getItem(STORAGE_KEYS.payments),
        mockPayments,
      ),
    );
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated || typeof window === "undefined") {
      return;
    }
    window.localStorage.setItem(STORAGE_KEYS.players, JSON.stringify(players));
  }, [hydrated, players]);

  useEffect(() => {
    if (!hydrated || typeof window === "undefined") {
      return;
    }
    window.localStorage.setItem(STORAGE_KEYS.parents, JSON.stringify(parents));
  }, [hydrated, parents]);

  useEffect(() => {
    if (!hydrated || typeof window === "undefined") {
      return;
    }
    window.localStorage.setItem(STORAGE_KEYS.staff, JSON.stringify(staff));
  }, [hydrated, staff]);

  useEffect(() => {
    if (!hydrated || typeof window === "undefined") {
      return;
    }
    window.localStorage.setItem(STORAGE_KEYS.alumni, JSON.stringify(alumni));
  }, [hydrated, alumni]);

  useEffect(() => {
    if (!hydrated || typeof window === "undefined") {
      return;
    }
    window.localStorage.setItem(STORAGE_KEYS.events, JSON.stringify(events));
  }, [hydrated, events]);

  useEffect(() => {
    if (!hydrated || typeof window === "undefined") {
      return;
    }
    window.localStorage.setItem(STORAGE_KEYS.payments, JSON.stringify(payments));
  }, [hydrated, payments]);

  return (
    <ClubDataContext.Provider
      value={{
        players,
        setPlayers,
        parents,
        setParents,
        staff,
        setStaff,
        alumni,
        setAlumni,
        events,
        setEvents,
        payments,
        setPayments,
        hydrated,
      }}
    >
>>>>>>> 8dace4bc0a45c5486fb56dd83a4a0b5a447a7b3a
      {children}
    </ClubDataContext.Provider>
  );
};

export const useClubData = () => {
  const context = useContext(ClubDataContext);
<<<<<<< HEAD
  if (!context) throw new Error("useClubData must be used inside ClubDataProvider");
=======
  if (!context) {
    throw new Error("useClubData must be used inside ClubDataProvider");
  }
>>>>>>> 8dace4bc0a45c5486fb56dd83a4a0b5a447a7b3a
  return context;
};

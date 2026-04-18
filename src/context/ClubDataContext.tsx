"use client";

import { usePathname } from "next/navigation";
import React, { createContext, useContext, useEffect, useState } from "react";
import { Alumni, ClubEvent, Parent, Payment, Player, StaffMember } from "@/types/club";

type SetState<T> = React.Dispatch<React.SetStateAction<T>>;

interface ClubDataContextValue {
  players: Player[];
  setPlayers: SetState<Player[]>;
  staff: StaffMember[];
  setStaff: SetState<StaffMember[]>;
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
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [events, setEvents] = useState<ClubEvent[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const shouldLoadClubData =
      pathname.startsWith("/club") ||
      pathname.startsWith("/evenements") ||
      pathname.startsWith("/paiements") ||
      pathname.startsWith("/tracking") ||
      pathname.startsWith("/classement");

    if (!shouldLoadClubData) {
      setHydrated(true);
      return;
    }

    const load = async () => {
      try {
        const isEventSection = pathname.startsWith("/evenements");
        const isPaymentSection = pathname.startsWith("/paiements");

        const [playersRes, staffRes, eventsRes, paymentsRes] = await Promise.all([
          fetchJson("/api/club/players"),
          isEventSection || isPaymentSection ? Promise.resolve({ data: [] }) : fetchJson("/api/club/staff"),
          isPaymentSection ? Promise.resolve({ data: [] }) : fetchJson("/api/club/events"),
          isEventSection ? Promise.resolve({ data: [] }) : fetchJson("/api/club/payments"),
        ]);

        setPlayers(
          (playersRes.data || []).map((row: any) => ({
            id: row.id,
            nom: row.nom || row.last_name || row.lastName || "",
            prenom: row.prenom || row.first_name || row.firstName || "",
            photoUrl: row.photoUrl || row.photo_url || "",
            poste: row.poste || row.position || "",
            categorie: row.categorie || row.category || "",
            statut: row.statut || row.status || "actif",
            telephone: row.telephone || row.phone || "",
            email: row.email || "",
            dateInscription: row.dateInscription || row.date_inscription || row.registration_date || "",
            dateNaissance: row.dateNaissance || row.date_naissance || row.birth_date || "",
            adresse: row.adresse || row.address || "",
            cotisationMontant: Number(row.cotisationMontant || row.cotisation_montant || row.membership_amount || 0),
            cotisationStatut: row.cotisationStatut || row.cotisation_statut || row.membership_status || "pending",
            dernierPaiement: row.dernierPaiement || row.dernier_paiement || row.last_payment_date || "",
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
        console.error("[ClubDataContext] chargement impossible", error);
      } finally {
        setHydrated(true);
      }
    };

    void load();
  }, [pathname]);

  return (
    <ClubDataContext.Provider
      value={{
        players,
        setPlayers,
        staff,
        setStaff,
        events,
        setEvents,
        payments,
        setPayments,
        hydrated,
      }}
    >
      {children}
    </ClubDataContext.Provider>
  );
};

export const useClubData = () => {
  const context = useContext(ClubDataContext);
  if (!context) throw new Error("useClubData must be used inside ClubDataProvider");
  return context;
};

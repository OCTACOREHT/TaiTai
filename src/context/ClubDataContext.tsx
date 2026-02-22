"use client";

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
      {children}
    </ClubDataContext.Provider>
  );
};

export const useClubData = () => {
  const context = useContext(ClubDataContext);
  if (!context) {
    throw new Error("useClubData must be used inside ClubDataProvider");
  }
  return context;
};

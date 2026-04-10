"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { useClubData } from "@/context/ClubDataContext";
import { EventType } from "@/types/club";
import { getPlayerFullName } from "@/lib/club/metrics";
import { eventTypeToCalendarColor } from "@/lib/club/event-calendar";

const inputClassName =
  "h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90";

const selectClassName =
  "h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90";

export default function NewEventPage() {
  const router = useRouter();
  const { players, setEvents } = useClubData();
  const [titre, setTitre] = useState("");
  const [date, setDate] = useState("");
  const [lieu, setLieu] = useState("");
  const [type, setType] = useState<EventType>("entrainement");
  const [participants, setParticipants] = useState<string[]>([]);
  const [submitError, setSubmitError] = useState("");

  const handleSubmit = async () => {
    setSubmitError("");
    if (!titre || !date || !lieu) {
      setSubmitError("Renseignez le titre, la date et le lieu.");
      return;
    }

    const nextEvent = {
      id: crypto.randomUUID(),
      titre,
      date,
      lieu,
      type,
      calendarColor: eventTypeToCalendarColor(type),
      participants,
    };

    const response = await fetch("/api/club/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(nextEvent),
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => ({ error: "Impossible d'enregistrer l'evenement." }));
      setSubmitError(payload.error || "Impossible d'enregistrer l'evenement.");
      return;
    }

    setEvents((prevEvents) => [...prevEvents, nextEvent]);
    router.push("/evenements");
  };

  return (
    <div className="space-y-6">
      <PageBreadcrumb pageTitle="Ajouter un evenement" />
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          <div className="md:col-span-2 xl:col-span-3">
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
              Titre
            </label>
            <input
              value={titre}
              onChange={(event) => setTitre(event.target.value)}
              className={inputClassName}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
              Date et heure
            </label>
            <input
              type="datetime-local"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              className={inputClassName}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
              Lieu
            </label>
            <input
              value={lieu}
              onChange={(event) => setLieu(event.target.value)}
              className={inputClassName}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
              Type
            </label>
            <select
              value={type}
              onChange={(event) => setType(event.target.value as EventType)}
              className={selectClassName}
            >
              <option value="match">Match</option>
              <option value="entrainement">Entrainement</option>
              <option value="reunion">Reunion</option>
            </select>
          </div>
          <div className="md:col-span-2 xl:col-span-3">
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
              Participants
            </label>
            <select
              multiple
              value={participants}
              onChange={(event) =>
                setParticipants(
                  Array.from(event.target.selectedOptions).map(
                    (option) => option.value,
                  ),
                )
              }
              className="min-h-36 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
            >
              {players.map((player) => (
                <option key={player.id} value={player.id}>
                  {getPlayerFullName(player)}
                </option>
              ))}
            </select>
          </div>
        </div>
        {submitError ? (
          <div className="mt-6 rounded-xl border border-error-200 bg-error-50 px-4 py-3 text-sm text-error-700 dark:border-error-900/40 dark:bg-error-900/10 dark:text-error-300">
            {submitError}
          </div>
        ) : null}
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => router.push("/evenements")}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-white/[0.03]"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600"
          >
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
}

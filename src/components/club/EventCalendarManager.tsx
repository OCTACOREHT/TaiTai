"use client";

import { Dispatch, SetStateAction, useMemo, useRef, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import interactionPlugin from "@fullcalendar/interaction";
import {
  DateSelectArg,
  EventClickArg,
  EventContentArg,
  EventInput,
} from "@fullcalendar/core";
import { Modal } from "@/components/ui/modal";
import { useModal } from "@/hooks/useModal";
import Badge from "@/components/ui/badge/Badge";
import { ClubEvent, EventType, Player } from "@/types/club";
import { eventTypeLabel, colorFromEventType } from "@/lib/club/status";
import { formatClubDate, getPlayerFullName } from "@/lib/club/metrics";

interface EventCalendarManagerProps {
  events: ClubEvent[];
  setEvents: Dispatch<SetStateAction<ClubEvent[]>>;
  players: Player[];
}

interface EventFormState {
  id?: string;
  titre: string;
  date: string;
  lieu: string;
  type: EventType;
  participants: string[];
}

const defaultFormState: EventFormState = {
  titre: "",
  date: "",
  lieu: "",
  type: "entrainement",
  participants: [],
};

const inputClassName =
  "h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90";

const selectClassName =
  "h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90";

const toInputDateTime = (value: string) => {
  if (!value) {
    return "";
  }
  const date = new Date(value);
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const hh = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
};

export default function EventCalendarManager({
  events,
  setEvents,
  players,
}: EventCalendarManagerProps) {
  const [formState, setFormState] = useState<EventFormState>(defaultFormState);
  const calendarRef = useRef<FullCalendar>(null);
  const { isOpen, openModal, closeModal } = useModal();

  const eventInputs = useMemo<EventInput[]>(
    () =>
      events.map((event) => ({
        id: event.id,
        title: event.titre,
        start: event.date,
        extendedProps: {
          type: event.type,
          lieu: event.lieu,
        },
      })),
    [events],
  );

  const sortedEvents = useMemo(
    () =>
      [...events].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
      ),
    [events],
  );

  const resetForm = () => {
    setFormState(defaultFormState);
  };

  const openCreateModal = (dateValue?: string) => {
    setFormState({
      ...defaultFormState,
      date: dateValue ?? toInputDateTime(new Date().toISOString()),
    });
    openModal();
  };

  const openEditModal = (event: ClubEvent) => {
    setFormState({
      id: event.id,
      titre: event.titre,
      date: toInputDateTime(event.date),
      lieu: event.lieu,
      type: event.type,
      participants: event.participants,
    });
    openModal();
  };

  const handleDateSelect = (selectInfo: DateSelectArg) => {
    const defaultDate = `${selectInfo.startStr}T18:00`;
    openCreateModal(defaultDate);
  };

  const handleEventClick = (eventClick: EventClickArg) => {
    const targetEvent = events.find((event) => event.id === eventClick.event.id);
    if (targetEvent) {
      openEditModal(targetEvent);
    }
  };

  const handleSaveEvent = () => {
    if (!formState.titre || !formState.date || !formState.lieu) {
      return;
    }

    if (formState.id) {
      setEvents((prevEvents) =>
        prevEvents.map((event) =>
          event.id === formState.id
            ? {
                ...event,
                titre: formState.titre,
                date: formState.date,
                lieu: formState.lieu,
                type: formState.type,
                participants: formState.participants,
              }
            : event,
        ),
      );
    } else {
      setEvents((prevEvents) => [
        ...prevEvents,
        {
          id: `event-${Date.now()}`,
          titre: formState.titre,
          date: formState.date,
          lieu: formState.lieu,
          type: formState.type,
          participants: formState.participants,
        },
      ]);
    }

    closeModal();
    resetForm();
  };

  const handleDeleteEvent = (eventId: string) => {
    setEvents((prevEvents) => prevEvents.filter((event) => event.id !== eventId));
  };

  const closeAndReset = () => {
    closeModal();
    resetForm();
  };

  const renderEventContent = (eventInfo: EventContentArg) => (
    <div className="flex items-center gap-1 rounded-sm p-1">
      <span className="text-[11px] font-medium text-gray-700 dark:text-gray-200">
        {eventInfo.event.title}
      </span>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Calendrier des evenements
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Planifiez les matchs, entrainements et reunions
            </p>
          </div>
          <button
            type="button"
            onClick={() => openCreateModal()}
            className="rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600"
          >
            + Ajouter un evenement
          </button>
        </div>
        <div className="custom-calendar">
          <FullCalendar
            ref={calendarRef}
            plugins={[
              dayGridPlugin,
              timeGridPlugin,
              listPlugin,
              interactionPlugin,
            ]}
            initialView="dayGridMonth"
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "dayGridMonth,timeGridWeek,listWeek",
            }}
            events={eventInputs}
            selectable
            select={handleDateSelect}
            eventClick={handleEventClick}
            eventContent={renderEventContent}
          />
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
        <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">
          Liste des evenements
        </h3>
        <div className="space-y-3">
          {sortedEvents.map((event) => (
            <div
              key={event.id}
              className="flex flex-col gap-3 rounded-xl border border-gray-200 p-4 dark:border-gray-700 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h4 className="font-medium text-gray-800 dark:text-white/90">
                    {event.titre}
                  </h4>
                  <Badge size="sm" color={colorFromEventType(event.type)}>
                    {eventTypeLabel[event.type]}
                  </Badge>
                </div>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {formatClubDate(event.date)} - {event.lieu}
                </p>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Participants: {event.participants.length}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-white/[0.03]"
                  onClick={() => openEditModal(event)}
                >
                  Modifier
                </button>
                <button
                  type="button"
                  className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-error-600 hover:bg-error-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-white/[0.03]"
                  onClick={() => handleDeleteEvent(event.id)}
                >
                  Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Modal isOpen={isOpen} onClose={closeAndReset} className="max-w-[820px] p-6 lg:p-8">
        <div className="space-y-6">
          <div>
            <h4 className="text-xl font-semibold text-gray-800 dark:text-white/90">
              {formState.id ? "Modifier evenement" : "Creer evenement"}
            </h4>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Mettez a jour la planification du club.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                Titre
              </label>
              <input
                value={formState.titre}
                onChange={(event) =>
                  setFormState((prev) => ({ ...prev, titre: event.target.value }))
                }
                className={inputClassName}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                Date et heure
              </label>
              <input
                type="datetime-local"
                value={formState.date}
                onChange={(event) =>
                  setFormState((prev) => ({ ...prev, date: event.target.value }))
                }
                className={inputClassName}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                Lieu
              </label>
              <input
                value={formState.lieu}
                onChange={(event) =>
                  setFormState((prev) => ({ ...prev, lieu: event.target.value }))
                }
                className={inputClassName}
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                Type
              </label>
              <select
                value={formState.type}
                onChange={(event) =>
                  setFormState((prev) => ({
                    ...prev,
                    type: event.target.value as EventType,
                  }))
                }
                className={selectClassName}
              >
                <option value="match">Match</option>
                <option value="entrainement">Entrainement</option>
                <option value="reunion">Reunion</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                Participants
              </label>
              <select
                multiple
                value={formState.participants}
                onChange={(event) => {
                  const selected = Array.from(event.target.selectedOptions).map(
                    (option) => option.value,
                  );
                  setFormState((prev) => ({ ...prev, participants: selected }));
                }}
                className="min-h-32 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
              >
                {players.map((player) => (
                  <option key={player.id} value={player.id}>
                    {getPlayerFullName(player)}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Maintenez Ctrl/Cmd pour selection multiple.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-3">
            <button
              type="button"
              className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-white/[0.03]"
              onClick={closeAndReset}
            >
              Annuler
            </button>
            <button
              type="button"
              className="rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600"
              onClick={handleSaveEvent}
            >
              {formState.id ? "Sauvegarder" : "Creer"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

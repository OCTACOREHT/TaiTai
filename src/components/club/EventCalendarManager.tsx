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
import { ClubEvent, EventCalendarColor, Player } from "@/types/club";
import { eventTypeLabel, colorFromEventType } from "@/lib/club/status";
import { formatClubDate } from "@/lib/club/metrics";
import {
  calendarColorClass,
  calendarColors,
  calendarColorToType,
  eventTypeToCalendarColor,
} from "@/lib/club/event-calendar";

interface EventCalendarManagerProps {
  events: ClubEvent[];
  setEvents: Dispatch<SetStateAction<ClubEvent[]>>;
  players: Player[];
}

interface EventFormState {
  id?: string;
  titre: string;
  startDate: string;
  endDate: string;
  lieu: string;
  calendarColor: EventCalendarColor;
}

const defaultFormState: EventFormState = {
  titre: "",
  startDate: "",
  endDate: "",
  lieu: "",
  calendarColor: "Primary",
};

const inputClassName =
  "h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90";

const toInputDate = (value: string) => {
  if (!value) {
    return "";
  }
  const date = new Date(value);
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

export default function EventCalendarManager({
  events,
  setEvents,
  players,
}: EventCalendarManagerProps) {
  const [formState, setFormState] = useState<EventFormState>(defaultFormState);
<<<<<<< HEAD
  const [submitError, setSubmitError] = useState("");
  const [saving, setSaving] = useState(false);
=======
>>>>>>> 8dace4bc0a45c5486fb56dd83a4a0b5a447a7b3a
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
          calendarColor: event.calendarColor ?? eventTypeToCalendarColor(event.type),
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
<<<<<<< HEAD
    setSubmitError("");
=======
>>>>>>> 8dace4bc0a45c5486fb56dd83a4a0b5a447a7b3a
  };

  const openCreateModal = (dateValue?: string) => {
    setFormState({
      ...defaultFormState,
      startDate: dateValue ?? toInputDate(new Date().toISOString()),
      endDate: dateValue ?? toInputDate(new Date().toISOString()),
      lieu: "Stade FC Toro",
    });
    openModal();
  };

  const openEditModal = (event: ClubEvent) => {
    setFormState({
      id: event.id,
      titre: event.titre,
      startDate: toInputDate(event.date),
      endDate: toInputDate(event.date),
      lieu: event.lieu,
      calendarColor: event.calendarColor ?? eventTypeToCalendarColor(event.type),
    });
    openModal();
  };

  const handleDateSelect = (selectInfo: DateSelectArg) => {
    openCreateModal(selectInfo.startStr);
  };

  const handleEventClick = (eventClick: EventClickArg) => {
    const targetEvent = events.find((event) => event.id === eventClick.event.id);
    if (targetEvent) {
      openEditModal(targetEvent);
    }
  };

<<<<<<< HEAD
  const handleSaveEvent = async () => {
    if (!formState.titre || !formState.startDate) {
      setSubmitError("Renseignez au minimum le titre et la date.");
=======
  const handleSaveEvent = () => {
    if (!formState.titre || !formState.startDate) {
>>>>>>> 8dace4bc0a45c5486fb56dd83a4a0b5a447a7b3a
      return;
    }

    const eventDate = `${formState.startDate}T18:00:00`;
    const eventType = calendarColorToType[formState.calendarColor];
<<<<<<< HEAD
    setSaving(true);
    setSubmitError("");

    if (formState.id) {
      const nextEvents = events.map((event) =>
        event.id === formState.id
          ? {
              ...event,
              titre: formState.titre,
              date: eventDate,
              lieu: formState.lieu || "Stade FC Toro",
              type: eventType,
              calendarColor: formState.calendarColor,
            }
          : event,
      );

      const response = await fetch("/api/club/events", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: nextEvents }),
      });

      const payload = await response
        .json()
        .catch(() => ({ error: "Impossible d'enregistrer l'evenement." }));

      if (!response.ok) {
        setSubmitError(payload.error || "Impossible d'enregistrer l'evenement.");
        setSaving(false);
        return;
      }

      setEvents(nextEvents);
    } else {
      const nextEvent = {
        id: crypto.randomUUID(),
        titre: formState.titre,
        date: eventDate,
        lieu: formState.lieu || "Stade FC Toro",
        type: eventType,
        calendarColor: formState.calendarColor,
        participants: [],
      };

      const response = await fetch("/api/club/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nextEvent),
      });

      const payload = await response
        .json()
        .catch(() => ({ error: "Impossible d'enregistrer l'evenement." }));

      if (!response.ok) {
        setSubmitError(payload.error || "Impossible d'enregistrer l'evenement.");
        setSaving(false);
        return;
      }

      setEvents((prevEvents) => [...prevEvents, nextEvent]);
    }

    setSaving(false);
=======

    if (formState.id) {
      setEvents((prevEvents) =>
        prevEvents.map((event) =>
          event.id === formState.id
            ? {
                ...event,
                titre: formState.titre,
                date: eventDate,
                lieu: formState.lieu || "Stade FC Toro",
                type: eventType,
                calendarColor: formState.calendarColor,
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
          date: eventDate,
          lieu: formState.lieu || "Stade FC Toro",
          type: eventType,
          calendarColor: formState.calendarColor,
          participants: [],
        },
      ]);
    }

>>>>>>> 8dace4bc0a45c5486fb56dd83a4a0b5a447a7b3a
    closeModal();
    resetForm();
  };

<<<<<<< HEAD
  const handleDeleteEvent = async (eventId: string) => {
    const nextEvents = events.filter((event) => event.id !== eventId);
    setSaving(true);
    const response = await fetch("/api/club/events", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: nextEvents }),
    });

    const payload = await response
      .json()
      .catch(() => ({ error: "Impossible de supprimer l'evenement." }));

    if (!response.ok) {
      setSubmitError(payload.error || "Impossible de supprimer l'evenement.");
      setSaving(false);
      return;
    }

    setEvents(nextEvents);
    setSaving(false);
=======
  const handleDeleteEvent = (eventId: string) => {
    setEvents((prevEvents) => prevEvents.filter((event) => event.id !== eventId));
>>>>>>> 8dace4bc0a45c5486fb56dd83a4a0b5a447a7b3a
  };

  const closeAndReset = () => {
    closeModal();
    resetForm();
  };

  const renderEventContent = (eventInfo: EventContentArg) => {
    const color = eventInfo.event.extendedProps
      .calendarColor as EventCalendarColor;
    const colorClass = calendarColorClass(color);

    return (
      <div
        className={`event-fc-color flex fc-event-main items-center ${colorClass}`}
      >
        <div className="fc-daygrid-event-dot"></div>
        <div className="fc-event-time">{eventInfo.timeText}</div>
        <div className="fc-event-title">{eventInfo.event.title}</div>
      </div>
    );
  };

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

      <Modal
        isOpen={isOpen}
        onClose={closeAndReset}
        className="max-w-[900px] p-6 lg:p-10"
      >
        <div className="space-y-6">
          <div>
            <h4 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
              {formState.id ? "Edit Event" : "Add Event"}
            </h4>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Plan your next big moment: schedule or edit an event to stay on track
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                Event Title
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
              <label className="mb-4 block text-sm font-medium text-gray-700 dark:text-gray-400">
                Event Color
              </label>
              <div className="flex flex-wrap items-center gap-5">
                {calendarColors.map((calendarColor) => (
                  <label
                    key={calendarColor}
                    className="inline-flex items-center gap-2 text-lg text-gray-800 dark:text-white/90"
                  >
                    <span className="relative">
                      <input
                        type="radio"
                        className="sr-only"
                        name="event-color"
                        checked={formState.calendarColor === calendarColor}
                        onChange={() =>
                          setFormState((prev) => ({
                            ...prev,
                            calendarColor,
                          }))
                        }
                      />
                      <span className="flex h-6 w-6 items-center justify-center rounded-full border border-gray-300 dark:border-gray-700">
                        <span
                          className={`h-3 w-3 rounded-full bg-brand-500 ${
                            formState.calendarColor === calendarColor
                              ? "block"
                              : "hidden"
                          }`}
                        ></span>
                      </span>
                    </span>
                    {calendarColor}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                Enter Start Date
              </label>
              <input
                type="date"
                value={formState.startDate}
                onChange={(event) =>
                  setFormState((prev) => ({
                    ...prev,
                    startDate: event.target.value,
                  }))
                }
                className={inputClassName}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                Enter End Date
              </label>
              <input
                type="date"
                value={formState.endDate}
                onChange={(event) =>
                  setFormState((prev) => ({ ...prev, endDate: event.target.value }))
                }
                className={inputClassName}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                Location
              </label>
              <input
                value={formState.lieu}
                onChange={(event) =>
                  setFormState((prev) => ({ ...prev, lieu: event.target.value }))
                }
                className={inputClassName}
                placeholder="Stade FC Toro"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
<<<<<<< HEAD
            {submitError ? (
              <div className="w-full rounded-xl border border-error-200 bg-error-50 px-4 py-3 text-sm text-error-700 dark:border-error-900/40 dark:bg-error-900/10 dark:text-error-300">
                {submitError}
              </div>
            ) : null}
=======
>>>>>>> 8dace4bc0a45c5486fb56dd83a4a0b5a447a7b3a
            <button
              type="button"
              className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-white/[0.03]"
              onClick={closeAndReset}
            >
              Close
            </button>
            <button
              type="button"
              className="rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600"
              onClick={handleSaveEvent}
<<<<<<< HEAD
              disabled={saving}
            >
              {saving ? "Saving..." : formState.id ? "Update Event" : "Add Event"}
=======
            >
              {formState.id ? "Update Event" : "Add Event"}
>>>>>>> 8dace4bc0a45c5486fb56dd83a4a0b5a447a7b3a
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

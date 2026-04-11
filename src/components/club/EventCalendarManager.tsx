"use client";

import { Dispatch, SetStateAction, useMemo, useRef, useState, useEffect } from "react";
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
import { ClubEvent, EventCalendarColor, Player, EventType } from "@/types/club";
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
  type: EventType;
  youtubeUrl: string;
  homeTeamId: string;
  awayTeamId: string;
  participants: string[];
  calendarColor: EventCalendarColor;
}

const defaultFormState: EventFormState = {
  titre: "",
  startDate: "",
  endDate: "",
  lieu: "",
  type: "flag_day",
  youtubeUrl: "",
  homeTeamId: "",
  awayTeamId: "",
  participants: [],
  calendarColor: "Primary",
};

const inputClassName =
  "h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90";

const selectClassName =
  "h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90";

const toInputDate = (value: string) => {
  if (!value) {
    return "";
  }
  const date = new Date(value);
  if (isNaN(date.getTime())) return "";
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

interface Team {
  id: string;
  name: string;
  logo_url: string;
}

export default function EventCalendarManager({
  events,
  setEvents,
  players,
}: EventCalendarManagerProps) {
  const [formState, setFormState] = useState<EventFormState>(defaultFormState);
  const [submitError, setSubmitError] = useState("");
  const [saving, setSaving] = useState(false);
  const calendarRef = useRef<FullCalendar>(null);
  
  const { isOpen, openModal, closeModal } = useModal();
  const { isOpen: isTeamModalOpen, openModal: openTeamModal, closeModal: closeTeamModal } = useModal();
  
  const [teams, setTeams] = useState<Team[]>([]);
  const [newTeamName, setNewTeamName] = useState("");
  const [newTeamLogo, setNewTeamLogo] = useState("");
  const [creatingTeam, setCreatingTeam] = useState(false);

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      const res = await fetch("/api/tournaments/global-teams");
      const json = await res.json();
      if (json.success) {
        setTeams(json.data);
      }
    } catch (e) {
      console.error("Failed to fetch teams", e);
    }
  };

  const handleCreateTeam = async () => {
    if (!newTeamName) return;
    setCreatingTeam(true);
    try {
      const res = await fetch("/api/tournaments/global-teams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newTeamName, logo_url: newTeamLogo }),
      });
      const json = await res.json();
      if (json.success) {
        setTeams((prev) => [...prev, json.data]);
        setNewTeamName("");
        setNewTeamLogo("");
        closeTeamModal();
      }
    } catch (e) {
      console.error("Failed to create team", e);
    } finally {
      setCreatingTeam(false);
    }
  };

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
    setSubmitError("");
  };

  const handleTypeChange = (newType: EventType) => {
    const typeLabels: Record<string, string> = {
      live_diffusion: "Live Diffusion",
      vertieres_cup: "Vertieres Cup",
      flag_day: "Flag Day",
      intrasquad: "Intrasquad",
      international: "International",
    };

    setFormState((prev) => ({
      ...prev,
      type: newType,
      titre: typeLabels[newType] || prev.titre,
      calendarColor: eventTypeToCalendarColor(newType),
      youtubeUrl: newType === "live_diffusion" ? prev.youtubeUrl : "",
      homeTeamId: newType === "live_diffusion" ? prev.homeTeamId : "",
      awayTeamId: newType === "live_diffusion" ? prev.awayTeamId : "",
      participants: newType === "live_diffusion" ? prev.participants : [],
    }));
  };

  const openCreateModal = (dateValue?: string) => {
    const initialDate = dateValue ?? toInputDate(new Date().toISOString());
    setFormState({
      ...defaultFormState,
      startDate: initialDate,
      endDate: initialDate,
      lieu: "Stade FC Toro",
      type: "flag_day",
      titre: "Flag Day",
      calendarColor: eventTypeToCalendarColor("flag_day"),
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
      type: event.type,
      youtubeUrl: (event as any).youtubeUrl || (event as any).youtube_url || "",
      homeTeamId: event.home_team_id || "",
      awayTeamId: event.away_team_id || "",
      participants: event.participants || [],
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

  const handleSaveEvent = async () => {
    if (!formState.titre || !formState.startDate) {
      setSubmitError("Renseignez au minimum le titre et la date.");
      return;
    }

    const eventDate = `${formState.startDate}T18:00:00`;
    setSaving(true);
    setSubmitError("");

    const payloadEvent = {
      id: formState.id || crypto.randomUUID(),
      titre: formState.titre,
      date: eventDate,
      lieu: formState.lieu || "Stade FC Toro",
      type: formState.type,
      youtubeUrl: formState.youtubeUrl,
      home_team_id: formState.homeTeamId || null,
      away_team_id: formState.awayTeamId || null,
      calendarColor: formState.calendarColor,
      participants: formState.participants,
    };

    if (formState.id) {
       const response = await fetch("/api/club/events", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: events.map(e => e.id === formState.id ? { ...e, ...payloadEvent } : e) }),
      });
      if (response.ok) {
        const res2 = await fetch("/api/club/events");
        const json2 = await res2.json();
        if (json2.data) setEvents(json2.data);
      } else {
        const payload = await response.json().catch(() => ({ error: "Erreur sauvegarde." }));
        setSubmitError(payload.error || "Erreur sauvegarde.");
        setSaving(false);
        return;
      }
    } else {
      const response = await fetch("/api/club/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payloadEvent),
      });
      if (response.ok) {
        const res2 = await fetch("/api/club/events");
        const json2 = await res2.json();
        if (json2.data) setEvents(json2.data);
      } else {
        const payload = await response.json().catch(() => ({ error: "Erreur creation." }));
        setSubmitError(payload.error || "Erreur creation.");
        setSaving(false);
        return;
      }
    }

    setSaving(false);
    closeModal();
    resetForm();
  };

  const handleDeleteEvent = async (eventId: string) => {
    const nextEvents = events.filter((event) => event.id !== eventId);
    setSaving(true);
    const response = await fetch("/api/club/events", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: nextEvents }),
    });

    if (!response.ok) {
      setSubmitError("Impossible de supprimer l'evenement.");
      setSaving(false);
      return;
    }

    setEvents(nextEvents);
    setSaving(false);
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
        <div className="fc-event-title">{eventInfo.event.title}</div>
      </div>
    );
  };

  const selectedHomeTeam = teams.find(t => t.id === formState.homeTeamId);
  const selectedAwayTeam = teams.find(t => t.id === formState.awayTeamId);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Calendrier des evenements
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Planifiez les matchs, diffusions et tournois
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
                  {event.home_team && event.away_team && (
                    <span className="text-xs text-gray-400 font-medium">
                      ({event.home_team.name} vs {event.away_team.name})
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {formatClubDate(event.date)} - {event.lieu}
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

      <Modal isOpen={isOpen} onClose={closeAndReset} className="max-w-[750px] p-6 lg:p-10">
        <div className="space-y-6">
          <div>
            <h4 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
              {formState.id ? "Modifier l'événement" : "Ajouter un événement"}
            </h4>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                Type d&apos;événement
              </label>
              <select
                value={formState.type}
                onChange={(event) => handleTypeChange(event.target.value as EventType)}
                className={selectClassName}
              >
                <optgroup label="DIFFUSION">
                  <option value="live_diffusion">Live Diffusion</option>
                </optgroup>
                <optgroup label="TOURNOIS">
                  <option value="vertieres_cup">Vertieres Cup</option>
                  <option value="flag_day">Flag Day</option>
                  <option value="intrasquad">Intrasquad</option>
                  <option value="international">International</option>
                </optgroup>
              </select>
            </div>

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
                Date
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

            {formState.type === "live_diffusion" && (
              <div className="md:col-span-2 border-t border-gray-100 dark:border-gray-800 pt-4 mt-2">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-semibold text-gray-800 dark:text-white/90">Configuration du Match</h4>
                  <button 
                    type="button" 
                    onClick={openTeamModal}
                    className="text-xs font-medium text-brand-500 hover:text-brand-600 underline"
                  >
                    + Nouvelle équipe
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                      Équipe Domicile
                    </label>
                    <div className="flex items-center gap-3">
                      <select
                        value={formState.homeTeamId}
                        onChange={(e) => setFormState(prev => ({ ...prev, homeTeamId: e.target.value }))}
                        className={selectClassName}
                      >
                        <option value="">Choisir</option>
                        {teams.map(t => (
                          <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                      </select>
                      {selectedHomeTeam && (
                        <img src={selectedHomeTeam.logo_url} className="h-9 w-9 object-contain" alt="logo" />
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                      Équipe Extérieur
                    </label>
                    <div className="flex items-center gap-3">
                      <select
                        value={formState.awayTeamId}
                        onChange={(e) => setFormState(prev => ({ ...prev, awayTeamId: e.target.value }))}
                        className={selectClassName}
                      >
                        <option value="">Choisir</option>
                        {teams.map(t => (
                          <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                      </select>
                      {selectedAwayTeam && (
                        <img src={selectedAwayTeam.logo_url} className="h-9 w-9 object-contain" alt="logo" />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {formState.type === "live_diffusion" && (
              <div className="md:col-span-2">
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                  Lien YouTube
                </label>
                <input
                  value={formState.youtubeUrl}
                  onChange={(event) =>
                    setFormState((prev) => ({ ...prev, youtubeUrl: event.target.value }))
                  }
                  className={inputClassName}
                />
              </div>
            )}

            {formState.type === "live_diffusion" && (
              <div className="md:col-span-2">
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                  Participants
                </label>
                <select
                  multiple
                  value={formState.participants}
                  onChange={(event) =>
                    setFormState((prev) => ({
                      ...prev,
                      participants: Array.from(event.target.selectedOptions).map(
                        (option) => option.value,
                      ),
                    }))
                  }
                  className="min-h-36 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                >
                  {players.map((player) => (
                    <option key={player.id} value={player.id}>
                      {player.prenom} {player.nom}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
            {submitError ? (
              <div className="w-full rounded-xl border border-error-200 bg-error-50 px-4 py-3 text-sm text-error-700 dark:border-error-900/40 dark:bg-error-900/10 dark:text-error-300">
                {submitError}
              </div>
            ) : null}
            <button
              type="button"
              className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-white/[0.03]"
              onClick={closeAndReset}
            >
              Fermer
            </button>
            <button
              type="button"
              className="rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600"
              onClick={handleSaveEvent}
              disabled={saving}
            >
              {saving ? "Sauvegarde..." : formState.id ? "Mettre à jour" : "Ajouter l'événement"}
            </button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={isTeamModalOpen} onClose={closeTeamModal} className="max-w-[500px] p-6">
        <div className="space-y-4">
          <h3 className="text-lg font-bold">Créer une nouvelle équipe</h3>
          <div>
            <label className="block text-sm font-medium mb-1">Nom de l&apos;équipe</label>
            <input 
              value={newTeamName}
              onChange={e => setNewTeamName(e.target.value)}
              className={inputClassName}
              placeholder="Ex: Tempête FC"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">URL du Logo (Optionnel)</label>
            <input 
              value={newTeamLogo}
              onChange={e => setNewTeamLogo(e.target.value)}
              className={inputClassName}
              placeholder="https://..."
            />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <button onClick={closeTeamModal} className="px-4 py-2 text-sm text-gray-600">Annuler</button>
            <button 
              onClick={handleCreateTeam} 
              disabled={creatingTeam || !newTeamName}
              className="px-4 py-2 bg-brand-500 text-white rounded-lg text-sm disabled:opacity-50"
            >
              {creatingTeam ? "Création..." : "Enregistrer l'équipe"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

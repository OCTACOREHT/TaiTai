"use client";

import {
  SectionCard,
  SelectInput,
  TextAreaInput,
  TextInput,
} from "@/components/common/CmsShared";
import {
  ScheduleCategory,
  ScheduleEvent,
  scheduleCategoryOptions,
} from "@/lib/data";
import { useMemo, useState, type FormEvent } from "react";
import { StatusPill } from "./StatusPill";

const formatLongDate = (value: string) =>
  new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(value));

export function DatesManagement({ initialEvents }: { initialEvents: ScheduleEvent[] }) {
  const [events, setEvents] = useState(
    [...initialEvents].sort((a, b) => a.date.localeCompare(b.date)),
  );
  const [draft, setDraft] = useState({
    title: "",
    date: "",
    time: "12:00",
    category: "Service" as ScheduleCategory,
    note: "",
  });

  const stats = useMemo(() => {
    const todayIso = new Date().toISOString().slice(0, 10);
    const todayEvents = events.filter((event) => event.date === todayIso).length;
    const weekEvents = events.filter((event) => {
      const eventDate = new Date(event.date);
      const diffDays =
        (eventDate.getTime() - new Date(todayIso).getTime()) / (1000 * 60 * 60 * 24);
      return diffDays >= 0 && diffDays <= 7;
    }).length;
    const nextEvent = events[0];

    return {
      todayEvents,
      weekEvents,
      nextEvent,
    };
  }, [events]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!draft.title.trim() || !draft.date) {
      return;
    }

    const nextEvent: ScheduleEvent = {
      id: `date-${Date.now()}`,
      title: draft.title.trim(),
      date: draft.date,
      time: draft.time,
      category: draft.category,
      note: draft.note.trim() || "Note operationnelle a completer.",
    };

    setEvents((current) => [...current, nextEvent].sort((a, b) => a.date.localeCompare(b.date)));
    setDraft({
      title: "",
      date: "",
      time: "12:00",
      category: "Service",
      note: "",
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-xs dark:border-gray-800 dark:bg-white/[0.03]">
          <p className="text-sm text-gray-500 dark:text-gray-400">Aujourd'hui</p>
          <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white/90">
            {stats.todayEvents}
          </p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-xs dark:border-gray-800 dark:bg-white/[0.03]">
          <p className="text-sm text-gray-500 dark:text-gray-400">Cette semaine</p>
          <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white/90">
            {stats.weekEvents}
          </p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-xs dark:border-gray-800 dark:bg-white/[0.03]">
          <p className="text-sm text-gray-500 dark:text-gray-400">Prochaine date</p>
          <p className="mt-2 text-lg font-semibold text-gray-900 dark:text-white/90">
            {stats.nextEvent ? stats.nextEvent.title : "A planifier"}
          </p>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {stats.nextEvent ? formatLongDate(stats.nextEvent.date) : "Ajoutez un evenement"}
          </p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <SectionCard
          title="Agenda du restaurant"
          description="Toutes les dates importantes du service, des livraisons et de l'equipe."
        >
          <div className="space-y-4">
            {events.map((entry) => (
              <article
                key={entry.id}
                className="rounded-2xl border border-gray-200 px-4 py-4 dark:border-gray-800"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      {formatLongDate(entry.date)} a {entry.time}
                    </p>
                    <h3 className="mt-1 text-base font-semibold text-gray-900 dark:text-white/90">
                      {entry.title}
                    </h3>
                    <p className="mt-3 text-sm leading-6 text-gray-500 dark:text-gray-400">
                      {entry.note}
                    </p>
                  </div>
                  <StatusPill value={entry.category} />
                </div>
              </article>
            ))}
          </div>
        </SectionCard>

        <SectionCard
          title="Ajouter une date"
          description="Creez un rendez-vous de service, une reservation ou une livraison."
        >
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid gap-4">
              <TextInput
                placeholder="Titre de la date"
                value={draft.title}
                onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))}
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <TextInput
                  type="date"
                  value={draft.date}
                  onChange={(event) => setDraft((current) => ({ ...current, date: event.target.value }))}
                />
                <TextInput
                  type="time"
                  value={draft.time}
                  onChange={(event) => setDraft((current) => ({ ...current, time: event.target.value }))}
                />
              </div>
              <SelectInput
                value={draft.category}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    category: event.target.value as ScheduleCategory,
                  }))
                }
              >
                {scheduleCategoryOptions.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </SelectInput>
              <TextAreaInput
                rows={4}
                placeholder="Note logistique, nombre de couverts, preparation..."
                value={draft.note}
                onChange={(event) => setDraft((current) => ({ ...current, note: event.target.value }))}
              />
            </div>

            <button
              type="submit"
              className="inline-flex h-11 w-full items-center justify-center rounded-lg bg-brand-500 px-4 text-sm font-medium text-white shadow-theme-xs transition hover:bg-brand-600"
            >
              Ajouter la date
            </button>
          </form>
        </SectionCard>
      </div>
    </div>
  );
}

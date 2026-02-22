"use client";

import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import EventCalendarManager from "@/components/club/EventCalendarManager";
import { useClubData } from "@/context/ClubDataContext";

export default function EventsPageContent() {
  const { events, setEvents, players } = useClubData();

  return (
    <div className="space-y-6">
      <PageBreadcrumb pageTitle="Evenements" />
      <EventCalendarManager events={events} setEvents={setEvents} players={players} />
    </div>
  );
}

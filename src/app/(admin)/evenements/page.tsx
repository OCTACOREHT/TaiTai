import type { Metadata } from "next";
import EventsPageContent from "@/components/club/pages/EventsPageContent";

export const metadata: Metadata = {
  title: "Evenements | TailAdmin",
  description: "Calendrier et gestion des evenements du club",
};

export default function EventsPage() {
  return <EventsPageContent />;
}

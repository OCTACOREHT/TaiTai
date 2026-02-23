import type { Metadata } from "next";
import StandingsPageContent from "@/components/club/pages/StandingsPageContent";

export const metadata: Metadata = {
  title: "Classement | TailAdmin",
  description: "Classement et resultats de championnat du club",
};

export default function StandingsPage() {
  return <StandingsPageContent />;
}


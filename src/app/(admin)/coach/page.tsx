import type { Metadata } from "next";
import CoachTacticsPage from "@/components/club/pages/CoachTacticsPage";

export const metadata: Metadata = {
  title: "Coach FIFA | TailAdmin",
  description: "Preparation terrain FIFA, gestion d'equipe et compositions",
};

export default function CoachPage() {
  return <CoachTacticsPage />;
}

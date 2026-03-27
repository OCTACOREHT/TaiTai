"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { SectionCard } from "@/components/common/CmsShared";
import PlayerTable from "@/components/club/PlayerTable";
import { useClubData } from "@/context/ClubDataContext";

export default function ClubPlayersPage() {
  const router = useRouter();
  const { players, setPlayers } = useClubData();

  return (
    <div className="space-y-6">
      <PageBreadCrumb pageTitle="Joueurs" />

      <SectionCard
        title="Effectif du club"
        description="Ajoutez, modifiez et suivez les joueurs relies a la base de donnees."
        actions={
          <Link
            href="/club/joueurs/nouveau"
            className="rounded-lg bg-brand-500 px-4 py-3 text-sm font-medium text-white transition hover:bg-brand-600"
          >
            Ajouter un joueur
          </Link>
        }
      >
        <PlayerTable
          players={players}
          onEditPlayer={(player) => router.push(`/club/joueurs/${player.id}/modifier`)}
          onDeletePlayer={async (player) => {
            const response = await fetch(`/api/club/players/${player.id}`, { method: "DELETE" });
            if (!response.ok) {
              return;
            }
            setPlayers((prevPlayers) =>
              prevPlayers.filter((item) => item.id !== player.id),
            );
          }}
        />
      </SectionCard>
    </div>
  );
}

"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { SectionCard } from "@/components/common/CmsShared";
import PlayerForm from "@/components/club/forms/PlayerForm";
import { useClubData } from "@/context/ClubDataContext";
import { createPlayerFromForm } from "@/lib/club/player-form";

export default function NewClubPlayerPage() {
  const router = useRouter();
  const { players, setPlayers } = useClubData();

  const categories = useMemo(
    () => [...new Set(players.map((player) => player.categorie))].sort(),
    [players],
  );

  return (
    <div className="space-y-6">
      <PageBreadCrumb pageTitle="Ajouter un joueur" />

      <SectionCard
        title="Nouveau joueur"
        description="Chaque ajout est sauvegarde dans la table club_players."
      >
        <PlayerForm
          categories={categories.length > 0 ? categories : undefined}
          onCancel={() => router.push("/club/joueurs")}
          onSubmit={async (values) => {
            const now = new Date().toISOString().slice(0, 10);
            const nextPlayer = createPlayerFromForm(crypto.randomUUID(), values, now);
            const response = await fetch("/api/club/players", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(nextPlayer),
            });
            if (!response.ok) {
              return;
            }
            setPlayers((prevPlayers) => [nextPlayer, ...prevPlayers]);
            router.push("/club/joueurs");
          }}
          submitLabel="Ajouter le joueur"
        />
      </SectionCard>
    </div>
  );
}

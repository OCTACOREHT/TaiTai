"use client";

import { useMemo } from "react";
import { notFound, useParams, useRouter } from "next/navigation";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { SectionCard } from "@/components/common/CmsShared";
import PlayerForm from "@/components/club/forms/PlayerForm";
import { useClubData } from "@/context/ClubDataContext";
import { toPlayerFormValues } from "@/lib/club/player-form";

export default function EditClubPlayerPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { players, setPlayers } = useClubData();

  const player = useMemo(
    () => players.find((item) => item.id === params.id),
    [params.id, players],
  );
  const categories = useMemo(
    () => [...new Set(players.map((item) => item.categorie))].sort(),
    [players],
  );

  if (!player) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <PageBreadCrumb pageTitle="Modifier un joueur" />

      <SectionCard
        title="Edition du joueur"
        description="Les modifications sont enregistrees dans la base du club."
      >
        <PlayerForm
          initialValues={toPlayerFormValues(player)}
          categories={categories.length > 0 ? categories : undefined}
          onCancel={() => router.push("/club/joueurs")}
          onSubmit={async (values) => {
            const nextPlayer = {
              ...player,
              ...values,
              photoUrl: values.photoUrl || player.photoUrl,
            };
            const response = await fetch(`/api/club/players/${player.id}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(nextPlayer),
            });
            if (!response.ok) {
              return;
            }
            setPlayers((prevPlayers) =>
              prevPlayers.map((item) => (item.id === player.id ? nextPlayer : item)),
            );
            router.push("/club/joueurs");
          }}
          submitLabel="Mettre a jour"
        />
      </SectionCard>
    </div>
  );
}

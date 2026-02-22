"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import PlayerTable from "@/components/club/PlayerTable";
import { useDashboardConfig } from "@/hooks/useDashboardConfig";
import { useClubData } from "@/context/ClubDataContext";
import { getPlayerFullName } from "@/lib/club/metrics";

export default function PlayersPage() {
  const router = useRouter();
  const { players, setPlayers } = useClubData();
  const { enabledPlayerColumns } = useDashboardConfig();

  const handleDeletePlayer = (playerId: string) => {
    const target = players.find((player) => player.id === playerId);
    if (!target) {
      return;
    }

    const shouldDelete = window.confirm(
      `Supprimer le joueur ${getPlayerFullName(target)} ?`,
    );
    if (!shouldDelete) {
      return;
    }

    setPlayers((prevPlayers) =>
      prevPlayers.filter((player) => player.id !== playerId),
    );
  };

  const tableColumns =
    enabledPlayerColumns.length > 0 ? enabledPlayerColumns : undefined;

  return (
    <div>
      <PageBreadcrumb pageTitle="Joueurs" />

      <div className="mb-6 flex items-center justify-end">
        <Link
          href="/joueurs/nouveau"
          className="rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600"
        >
          + Ajouter un joueur
        </Link>
      </div>

      <PlayerTable
        players={players}
        columns={tableColumns}
        onViewPlayer={(player) => router.push(`/joueurs/${player.id}`)}
        onEditPlayer={(player) => router.push(`/joueurs/${player.id}/modifier`)}
        onDeletePlayer={(player) => handleDeletePlayer(player.id)}
      />
    </div>
  );
}

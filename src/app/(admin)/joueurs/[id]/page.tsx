"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { useClubData } from "@/context/ClubDataContext";
import {
  formatClubCurrency,
  formatClubDate,
  getPlayerFullName,
} from "@/lib/club/metrics";
import { paymentStatusLabel, playerStatusLabel } from "@/lib/club/status";

const getSafeAvatarSrc = (photoUrl: string, fullName: string) => {
  const trimmed = photoUrl.trim();
  if (trimmed.length > 0) {
    return trimmed;
  }
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(
    fullName,
  )}&background=0D8ABC&color=fff`;
};

export default function PlayerDetailsPage() {
  const params = useParams<{ id: string }>();
  const playerId = params.id;
  const { players } = useClubData();

  const player = players.find((item) => item.id === playerId);

  if (!player) {
    return (
      <div className="space-y-6">
        <PageBreadcrumb pageTitle="Fiche joueur" />
        <div className="rounded-2xl border border-gray-200 bg-white p-5 text-sm text-gray-600 dark:border-gray-800 dark:bg-white/[0.03] dark:text-gray-300">
          Joueur introuvable.
        </div>
        <Link
          href="/joueurs"
          className="text-sm font-medium text-brand-500 hover:text-brand-600"
        >
          Retour a la liste
        </Link>
      </div>
    );
  }

  const fullName = getPlayerFullName(player);
  const avatarSrc = getSafeAvatarSrc(player.photoUrl, fullName);

  return (
    <div className="space-y-6">
      <PageBreadcrumb pageTitle="Fiche joueur" />
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <Image
              src={avatarSrc}
              alt={fullName}
              width={80}
              height={80}
              className="h-20 w-20 rounded-full object-cover"
              unoptimized
            />
            <div>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white/90">
                {fullName}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {player.poste} - {player.categorie}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href={`/joueurs/${player.id}/modifier`}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-white/[0.03]"
            >
              Modifier
            </Link>
            <Link
              href="/joueurs"
              className="rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600"
            >
              Retour liste
            </Link>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
            <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Contact
            </p>
            <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
              {player.telephone}
            </p>
            <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
              {player.email}
            </p>
            <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
              {player.adresse}
            </p>
          </div>
          <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
            <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Profil
            </p>
            <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
              Statut: {playerStatusLabel[player.statut]}
            </p>
            <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
              Date naissance: {formatClubDate(player.dateNaissance)}
            </p>
            <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
              Inscription: {formatClubDate(player.dateInscription)}
            </p>
          </div>
          <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
            <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Cotisation
            </p>
            <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
              Montant: {formatClubCurrency(player.cotisationMontant)}
            </p>
            <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
              Paiement: {paymentStatusLabel[player.cotisationStatut]}
            </p>
            <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
              Dernier paiement: {formatClubDate(player.dernierPaiement)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

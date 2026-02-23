"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { useClubData } from "@/context/ClubDataContext";
import {
  defaultFifaFormationId,
  fifaFormations,
  TacticalFormation,
  TacticalRole,
} from "@/data/club/coach-formations";
import { getPlayerFullName } from "@/lib/club/metrics";
import { Player } from "@/types/club";

type SlotRole = TacticalRole | "GK";

type FormationSlot = {
  id: string;
  role: SlotRole;
  label: string;
  x: number;
  y: number;
};

const fallbackFormation = fifaFormations[0];

if (!fallbackFormation) {
  throw new Error("fifaFormations must not be empty.");
}

const lineXLayouts: Record<number, number[]> = {
  1: [50],
  2: [34, 66],
  3: [20, 50, 80],
  4: [14, 38, 62, 86],
  5: [10, 30, 50, 70, 90],
  6: [8, 24, 40, 60, 76, 92],
};

const roleChipStyles: Record<SlotRole, string> = {
  GK: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
  DEF: "bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300",
  MID: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
  ATT: "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300",
};

const markerStyles: Record<SlotRole, string> = {
  GK: "border-amber-200 bg-amber-500",
  DEF: "border-sky-200 bg-sky-500",
  MID: "border-emerald-200 bg-emerald-500",
  ATT: "border-rose-200 bg-rose-500",
};

const roleLabel: Record<SlotRole, string> = {
  GK: "Gardien",
  DEF: "Defense",
  MID: "Milieu",
  ATT: "Attaque",
};

const byPlayerName = (a: Player, b: Player) =>
  getPlayerFullName(a).localeCompare(getPlayerFullName(b), "fr");

const normalizePlayerRole = (poste: string): SlotRole => {
  const normalizedPoste = poste.toLowerCase();

  if (normalizedPoste.includes("gard")) {
    return "GK";
  }
  if (normalizedPoste.includes("def")) {
    return "DEF";
  }
  if (normalizedPoste.includes("mil")) {
    return "MID";
  }
  if (normalizedPoste.includes("attaq")) {
    return "ATT";
  }

  return "MID";
};

const getLineXPositions = (count: number) => {
  const preset = lineXLayouts[count];
  if (preset) {
    return preset;
  }

  if (count <= 1) {
    return [50];
  }

  const step = 80 / (count - 1);
  return Array.from({ length: count }, (_, index) => 10 + index * step);
};

const getDefenderLabels = (count: number) => {
  if (count === 1) {
    return ["CB"];
  }
  if (count === 2) {
    return ["LCB", "RCB"];
  }
  if (count === 3) {
    return ["LCB", "CB", "RCB"];
  }
  if (count === 4) {
    return ["LB", "LCB", "RCB", "RB"];
  }
  if (count === 5) {
    return ["LWB", "LCB", "CB", "RCB", "RWB"];
  }
  return Array.from({ length: count }, (_, index) => `D${index + 1}`);
};

const getMidfieldLabels = (count: number, y: number) => {
  const zone = y >= 60 ? "DM" : y >= 42 ? "CM" : "AM";

  if (count === 1) {
    return [`${zone}`];
  }
  if (count === 2) {
    return [`L${zone}`, `R${zone}`];
  }
  if (count === 3) {
    return [`L${zone}`, `${zone}`, `R${zone}`];
  }
  if (count === 4) {
    return [`L${zone}`, `LC${zone}`, `RC${zone}`, `R${zone}`];
  }
  if (count === 5) {
    return [`L${zone}`, `LC${zone}`, `${zone}`, `RC${zone}`, `R${zone}`];
  }
  return Array.from({ length: count }, (_, index) => `M${index + 1}`);
};

const getAttackerLabels = (count: number) => {
  if (count === 1) {
    return ["ST"];
  }
  if (count === 2) {
    return ["LS", "RS"];
  }
  if (count === 3) {
    return ["LW", "ST", "RW"];
  }
  if (count === 4) {
    return ["LW", "LS", "RS", "RW"];
  }
  return Array.from({ length: count }, (_, index) => `A${index + 1}`);
};

const getLineLabels = (role: TacticalRole, count: number, y: number) => {
  if (role === "DEF") {
    return getDefenderLabels(count);
  }
  if (role === "MID") {
    return getMidfieldLabels(count, y);
  }
  return getAttackerLabels(count);
};

const createFormationSlots = (formation: TacticalFormation): FormationSlot[] => {
  const defensiveLineY = 76;
  const attackingLineY = 22;
  const totalLines = formation.lines.length;

  const slots: FormationSlot[] = [
    {
      id: "slot-gk",
      role: "GK",
      label: "GK",
      x: 50,
      y: 90,
    },
  ];

  formation.lines.forEach((line, lineIndex) => {
    const progression = totalLines === 1 ? 0.5 : lineIndex / (totalLines - 1);
    const y = defensiveLineY - progression * (defensiveLineY - attackingLineY);
    const lineXPositions = getLineXPositions(line.count);
    const lineLabels = getLineLabels(line.role, line.count, y);

    lineXPositions.forEach((x, index) => {
      slots.push({
        id: `slot-${line.role}-${lineIndex}-${index}`,
        role: line.role,
        label: lineLabels[index] ?? `${line.role}${index + 1}`,
        x,
        y,
      });
    });
  });

  return slots;
};

const buildAutoAssignments = (slots: FormationSlot[], players: Player[]) => {
  const availablePlayers = [...players]
    .filter((player) => player.statut === "actif")
    .sort(byPlayerName);

  const pools: Record<SlotRole, Player[]> = {
    GK: [],
    DEF: [],
    MID: [],
    ATT: [],
  };

  availablePlayers.forEach((player) => {
    pools[normalizePlayerRole(player.poste)].push(player);
  });

  const usedPlayerIds = new Set<string>();
  const assignments: Record<string, string> = {};

  const pickFallback = () =>
    availablePlayers.find((player) => !usedPlayerIds.has(player.id));

  slots.forEach((slot) => {
    const preferred = pools[slot.role].find(
      (player) => !usedPlayerIds.has(player.id),
    );
    const selectedPlayer = preferred ?? pickFallback();

    if (!selectedPlayer) {
      return;
    }

    assignments[slot.id] = selectedPlayer.id;
    usedPlayerIds.add(selectedPlayer.id);
  });

  return assignments;
};

export default function CoachTacticsPage() {
  const { players, hydrated } = useClubData();
  const [formationId, setFormationId] = useState(
    defaultFifaFormationId || fallbackFormation.id,
  );
  const [planName, setPlanName] = useState("Plan de match principal");
  const [assignments, setAssignments] = useState<Record<string, string>>({});
  const [savedAt, setSavedAt] = useState<string | null>(null);

  const availablePlayers = useMemo(
    () =>
      [...players].filter((player) => player.statut === "actif").sort(byPlayerName),
    [players],
  );

  const unavailablePlayers = useMemo(
    () =>
      [...players]
        .filter((player) => player.statut !== "actif")
        .sort(byPlayerName),
    [players],
  );

  const selectedFormation = useMemo(
    () =>
      fifaFormations.find((formation) => formation.id === formationId) ??
      fallbackFormation,
    [formationId],
  );

  const slots = useMemo(
    () => createFormationSlots(selectedFormation),
    [selectedFormation],
  );

  useEffect(() => {
    setAssignments(buildAutoAssignments(slots, players));
  }, [slots, players]);

  const playerById = useMemo(
    () => new Map(players.map((player) => [player.id, player])),
    [players],
  );

  const starters = useMemo(
    () =>
      slots.map((slot) => ({
        slot,
        player: playerById.get(assignments[slot.id]) ?? null,
      })),
    [slots, playerById, assignments],
  );

  const selectedPlayerIds = useMemo(
    () => new Set(Object.values(assignments)),
    [assignments],
  );

  const benchPlayers = useMemo(
    () =>
      availablePlayers.filter((player) => !selectedPlayerIds.has(player.id)),
    [availablePlayers, selectedPlayerIds],
  );

  const filledSlots = starters.filter((entry) => entry.player !== null).length;
  const roleFitCount = starters.filter((entry) => {
    if (!entry.player) {
      return false;
    }
    return normalizePlayerRole(entry.player.poste) === entry.slot.role;
  }).length;

  const totalSlots = slots.length || 1;
  const coverageRate = Math.round((filledSlots / totalSlots) * 100);
  const chemistryRate = Math.round((roleFitCount / totalSlots) * 100);

  const formattedSavedAt = savedAt
    ? new Intl.DateTimeFormat("fr-FR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date(savedAt))
    : null;

  const handleAssignmentChange = (slotId: string, playerId: string) => {
    setAssignments((previous) => {
      const nextAssignments = { ...previous };

      if (!playerId) {
        delete nextAssignments[slotId];
        return nextAssignments;
      }

      Object.keys(nextAssignments).forEach((key) => {
        if (key !== slotId && nextAssignments[key] === playerId) {
          delete nextAssignments[key];
        }
      });

      nextAssignments[slotId] = playerId;
      return nextAssignments;
    });
  };

  const resetAutoAssignments = () => {
    setAssignments(buildAutoAssignments(slots, players));
  };

  const saveCurrentPlan = () => {
    setSavedAt(new Date().toISOString());
  };

  return (
    <div className="space-y-6">
      <PageBreadcrumb pageTitle="Coach FIFA" />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-4">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
          <p className="text-sm text-gray-500 dark:text-gray-400">Formations FIFA</p>
          <p className="mt-3 text-2xl font-semibold text-gray-800 dark:text-white/90">
            {fifaFormations.length}
          </p>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Catalogue complet disponible.
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
          <p className="text-sm text-gray-500 dark:text-gray-400">Joueurs actifs</p>
          <p className="mt-3 text-2xl font-semibold text-gray-800 dark:text-white/90">
            {availablePlayers.length}
          </p>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {hydrated ? "Donnees synchronisees localement." : "Chargement..."}
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
          <p className="text-sm text-gray-500 dark:text-gray-400">Postes couverts</p>
          <p className="mt-3 text-2xl font-semibold text-gray-800 dark:text-white/90">
            {filledSlots}/{totalSlots}
          </p>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Couverture de terrain: {coverageRate}%
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
          <p className="text-sm text-gray-500 dark:text-gray-400">Compatibilite poste</p>
          <p className="mt-3 text-2xl font-semibold text-brand-600 dark:text-brand-400">
            {chemistryRate}%
          </p>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {formattedSavedAt ? `Derniere sauvegarde: ${formattedSavedAt}` : "Plan non sauvegarde"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 2xl:grid-cols-12">
        <div className="2xl:col-span-8">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div className="grid flex-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Nom du plan
                  </label>
                  <input
                    type="text"
                    value={planName}
                    onChange={(event) => setPlanName(event.target.value)}
                    className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-3 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Formation active
                  </label>
                  <select
                    value={formationId}
                    onChange={(event) => setFormationId(event.target.value)}
                    className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-3 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                  >
                    {fifaFormations.map((formation) => (
                      <option key={formation.id} value={formation.id}>
                        {formation.label} - {formation.family}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={resetAutoAssignments}
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-white/[0.03]"
                >
                  Auto composer
                </button>
                <button
                  type="button"
                  onClick={saveCurrentPlan}
                  className="rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600"
                >
                  Sauvegarder
                </button>
              </div>
            </div>

            <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
              {selectedFormation.label} - {selectedFormation.style}
            </p>

            <div className="mt-5">
              <div className="relative mx-auto aspect-[3/4] w-full max-w-[560px] overflow-hidden rounded-3xl border-2 border-emerald-300/80 shadow-2xl dark:border-emerald-500/40">
                <div className="absolute inset-0 bg-gradient-to-b from-emerald-500 via-emerald-600 to-emerald-800" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.22),transparent_58%)]" />
                <div className="absolute inset-0 bg-[repeating-linear-gradient(to_bottom,transparent,transparent_54px,rgba(255,255,255,0.12)_55px,transparent_56px)]" />

                <div className="absolute left-0 right-0 top-1/2 border-t border-white/70" />
                <div className="absolute left-1/2 top-1/2 h-28 w-28 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/70" />
                <div className="absolute left-1/2 top-0 h-20 w-44 -translate-x-1/2 border-x border-b border-white/70" />
                <div className="absolute left-1/2 top-0 h-9 w-20 -translate-x-1/2 border-x border-b border-white/70" />
                <div className="absolute left-1/2 bottom-0 h-20 w-44 -translate-x-1/2 border-x border-t border-white/70" />
                <div className="absolute left-1/2 bottom-0 h-9 w-20 -translate-x-1/2 border-x border-t border-white/70" />

                {starters.map(({ slot, player }) => (
                  <div
                    key={slot.id}
                    className="absolute -translate-x-1/2 -translate-y-1/2"
                    style={{ left: `${slot.x}%`, top: `${slot.y}%` }}
                  >
                    <div
                      className={`mx-auto flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border-2 text-[10px] font-semibold text-white shadow-lg ${markerStyles[slot.role]}`}
                      title={`${slot.label} - ${player ? getPlayerFullName(player) : "Libre"}`}
                    >
                      {player ? (
                        <Image
                          src={player.photoUrl}
                          alt={getPlayerFullName(player)}
                          width={48}
                          height={48}
                          className="h-full w-full object-cover"
                          unoptimized
                        />
                      ) : (
                        <span>{slot.label}</span>
                      )}
                    </div>
                    <p className="mt-1 text-center text-[10px] font-semibold uppercase tracking-wide text-white">
                      {slot.label}
                    </p>
                    <p className="max-w-[84px] truncate text-center text-[10px] text-white/90">
                      {player ? player.prenom : "Libre"}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="2xl:col-span-4">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
            <h3 className="text-base font-semibold text-gray-800 dark:text-white/90">
              Gestion du XI titulaire
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Affecte un joueur a chaque poste. Un joueur ne peut etre assigne
              qu&apos;a un seul poste.
            </p>

            <div className="mt-4 max-h-[760px] space-y-3 overflow-y-auto pr-1">
              {starters.map(({ slot, player }) => {
                const naturalPlayers = availablePlayers.filter(
                  (candidate) => normalizePlayerRole(candidate.poste) === slot.role,
                );
                const alternativePlayers = availablePlayers.filter(
                  (candidate) => normalizePlayerRole(candidate.poste) !== slot.role,
                );

                return (
                  <div
                    key={`assign-${slot.id}`}
                    className="rounded-xl border border-gray-200 p-3 dark:border-gray-700"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-gray-800 dark:text-white/90">
                        {slot.label}
                      </p>
                      <span
                        className={`rounded-full px-2 py-1 text-[11px] font-medium ${roleChipStyles[slot.role]}`}
                      >
                        {roleLabel[slot.role]}
                      </span>
                    </div>

                    <select
                      value={assignments[slot.id] ?? ""}
                      onChange={(event) =>
                        handleAssignmentChange(slot.id, event.target.value)
                      }
                      className="mt-2 h-10 w-full rounded-lg border border-gray-300 bg-transparent px-3 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                    >
                      <option value="">Aucun joueur</option>
                      {naturalPlayers.length > 0 ? (
                        <optgroup label="Poste naturel">
                          {naturalPlayers.map((candidate) => (
                            <option key={`${slot.id}-nat-${candidate.id}`} value={candidate.id}>
                              {getPlayerFullName(candidate)} ({candidate.poste})
                            </option>
                          ))}
                        </optgroup>
                      ) : null}
                      {alternativePlayers.length > 0 ? (
                        <optgroup label="Hors poste">
                          {alternativePlayers.map((candidate) => (
                            <option key={`${slot.id}-alt-${candidate.id}`} value={candidate.id}>
                              {getPlayerFullName(candidate)} ({candidate.poste})
                            </option>
                          ))}
                        </optgroup>
                      ) : null}
                    </select>

                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      {player
                        ? `Titulaire: ${getPlayerFullName(player)}`
                        : "Titulaire: non assigne"}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <div className="xl:col-span-4">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
            <h3 className="text-base font-semibold text-gray-800 dark:text-white/90">
              Banc des remplacants
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Joueurs actifs non utilises dans le onze.
            </p>

            <div className="mt-4 space-y-2">
              {benchPlayers.length > 0 ? (
                benchPlayers.map((player) => (
                  <div
                    key={`bench-${player.id}`}
                    className="flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2 dark:border-gray-700"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-gray-800 dark:text-white/90">
                        {getPlayerFullName(player)}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {player.categorie}
                      </p>
                    </div>
                    <span
                      className={`ml-3 shrink-0 rounded-full px-2 py-1 text-[11px] font-medium ${roleChipStyles[normalizePlayerRole(player.poste)]}`}
                    >
                      {player.poste}
                    </span>
                  </div>
                ))
              ) : (
                <p className="rounded-lg border border-dashed border-gray-300 px-3 py-2 text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
                  Tout le groupe actif est utilise.
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="xl:col-span-4">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
            <h3 className="text-base font-semibold text-gray-800 dark:text-white/90">
              Joueurs indisponibles
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Blesse ou suspendu, hors feuille de match.
            </p>

            <div className="mt-4 space-y-2">
              {unavailablePlayers.length > 0 ? (
                unavailablePlayers.map((player) => (
                  <div
                    key={`off-${player.id}`}
                    className="flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2 dark:border-gray-700"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-gray-800 dark:text-white/90">
                        {getPlayerFullName(player)}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {player.poste}
                      </p>
                    </div>
                    <span
                      className={`ml-3 shrink-0 rounded-full px-2 py-1 text-[11px] font-medium ${
                        player.statut === "blesse"
                          ? "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300"
                          : "bg-error-100 text-error-700 dark:bg-error-500/15 dark:text-error-300"
                      }`}
                    >
                      {player.statut}
                    </span>
                  </div>
                ))
              ) : (
                <p className="rounded-lg border border-dashed border-gray-300 px-3 py-2 text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
                  Aucun joueur indisponible.
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="xl:col-span-4">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
            <h3 className="text-base font-semibold text-gray-800 dark:text-white/90">
              Catalogue formations FIFA
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Clique sur une formation pour l&apos;appliquer sur le terrain.
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              {fifaFormations.map((formation) => (
                <button
                  key={`formation-chip-${formation.id}`}
                  type="button"
                  onClick={() => setFormationId(formation.id)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                    formation.id === formationId
                      ? "border-brand-300 bg-brand-50 text-brand-700 dark:border-brand-500/40 dark:bg-brand-500/15 dark:text-brand-400"
                      : "border-gray-300 bg-white text-gray-600 hover:border-brand-300 hover:text-brand-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:border-brand-500/40 dark:hover:text-brand-400"
                  }`}
                  title={formation.style}
                >
                  {formation.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

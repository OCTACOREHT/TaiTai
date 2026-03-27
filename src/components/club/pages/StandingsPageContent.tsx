"use client";

import { FormEvent, useMemo, useState } from "react";
import Image from "next/image";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Modal } from "@/components/ui/modal";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CheckLineIcon, PlusIcon } from "@/icons";
import {
  mockClubFixtures,
  mockLeagueStandings,
  mockStandingTeams,
} from "@/data/club/standings-data";
import { ClubFixture, ClubStandingRow, MatchFormResult } from "@/types/club";

type AddResultFormState = {
  competition: string;
  round: string;
  kickoffDate: string;
  kickoffTime: string;
  homeTeamId: string;
  awayTeamId: string;
  homeScore: string;
  awayScore: string;
};

const defaultFormValues: AddResultFormState = {
  competition: "Ligue Elite",
  round: "J28",
  kickoffDate: "2026-03-19",
  kickoffTime: "20:30",
  homeTeamId: "team-fctoro",
  awayTeamId: "team-riviera",
  homeScore: "2",
  awayScore: "1",
};

const formBadgeClasses: Record<MatchFormResult, string> = {
  W: "bg-success-500 text-white",
  D: "bg-gray-400 text-white",
  L: "bg-error-500 text-white",
};

const formLabel: Record<MatchFormResult, string> = {
  W: "V",
  D: "N",
  L: "D",
};

const sortStandings = (rows: ClubStandingRow[]) =>
  [...rows].sort((a, b) => {
    if (b.pts !== a.pts) {
      return b.pts - a.pts;
    }
    const goalDiffA = a.goalsFor - a.goalsAgainst;
    const goalDiffB = b.goalsFor - b.goalsAgainst;
    if (goalDiffB !== goalDiffA) {
      return goalDiffB - goalDiffA;
    }
    return b.goalsFor - a.goalsFor;
  });

const updateTeamWithResult = (
  row: ClubStandingRow,
  goalsFor: number,
  goalsAgainst: number,
) => {
  const outcome: MatchFormResult =
    goalsFor > goalsAgainst ? "W" : goalsFor < goalsAgainst ? "L" : "D";

  return {
    ...row,
    played: row.played + 1,
    wins: row.wins + (outcome === "W" ? 1 : 0),
    draws: row.draws + (outcome === "D" ? 1 : 0),
    losses: row.losses + (outcome === "L" ? 1 : 0),
    goalsFor: row.goalsFor + goalsFor,
    goalsAgainst: row.goalsAgainst + goalsAgainst,
    pts: row.pts + (outcome === "W" ? 3 : outcome === "D" ? 1 : 0),
    form: [outcome, ...row.form].slice(0, 5),
  };
};

const formatKickoffDate = (kickoff: string) =>
  new Intl.DateTimeFormat("fr-FR", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  }).format(new Date(kickoff));

const formatKickoffTime = (kickoff: string) =>
  new Intl.DateTimeFormat("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(kickoff));

export default function StandingsPageContent() {
  const [standings, setStandings] = useState<ClubStandingRow[]>(
    mockLeagueStandings,
  );
  const [fixtures, setFixtures] = useState<ClubFixture[]>(mockClubFixtures);
  const [isAddResultOpen, setIsAddResultOpen] = useState(false);
  const [formValues, setFormValues] =
    useState<AddResultFormState>(defaultFormValues);
  const [formError, setFormError] = useState<string | null>(null);

  const sortedStandings = useMemo(() => sortStandings(standings), [standings]);
  const leader = sortedStandings[0];
  const fcToro = sortedStandings.find((row) => row.teamId === "team-fctoro");
  const fcToroRank = sortedStandings.findIndex(
    (row) => row.teamId === "team-fctoro",
  );

  const recentFixtures = useMemo(
    () =>
      fixtures
        .filter((fixture) => fixture.status === "FT")
        .sort(
          (a, b) =>
            new Date(b.kickoff).getTime() - new Date(a.kickoff).getTime(),
        )
        .slice(0, 6),
    [fixtures],
  );

  const upcomingFixtures = useMemo(
    () =>
      fixtures
        .filter((fixture) => fixture.status === "A venir")
        .sort(
          (a, b) =>
            new Date(a.kickoff).getTime() - new Date(b.kickoff).getTime(),
        )
        .slice(0, 6),
    [fixtures],
  );

  const closeAddResultModal = () => {
    setIsAddResultOpen(false);
    setFormError(null);
  };

  const handleAddResult = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (formValues.homeTeamId === formValues.awayTeamId) {
      setFormError("Les equipes domicile et exterieur doivent etre differentes.");
      return;
    }

    const homeScore = Number.parseInt(formValues.homeScore, 10);
    const awayScore = Number.parseInt(formValues.awayScore, 10);

    if (
      !Number.isFinite(homeScore) ||
      !Number.isFinite(awayScore) ||
      homeScore < 0 ||
      awayScore < 0
    ) {
      setFormError("Les scores doivent etre des nombres entiers positifs.");
      return;
    }

    const homeTeam = mockStandingTeams.find(
      (team) => team.id === formValues.homeTeamId,
    );
    const awayTeam = mockStandingTeams.find(
      (team) => team.id === formValues.awayTeamId,
    );

    if (!homeTeam || !awayTeam) {
      setFormError("Equipe introuvable. Verifiez la selection.");
      return;
    }

    const kickoff = `${formValues.kickoffDate}T${formValues.kickoffTime}:00`;
    const fixtureId = `fx-custom-${Date.now()}`;

    const newFixture: ClubFixture = {
      id: fixtureId,
      competition: formValues.competition.trim() || "Ligue Elite",
      round: formValues.round.trim() || "Journée",
      kickoff,
      status: "FT",
      homeTeamId: homeTeam.id,
      awayTeamId: awayTeam.id,
      homeTeamName: homeTeam.name,
      awayTeamName: awayTeam.name,
      homeLogoUrl: homeTeam.logoUrl,
      awayLogoUrl: awayTeam.logoUrl,
      homeScore,
      awayScore,
    };

    setFixtures((prevFixtures) => [newFixture, ...prevFixtures]);
    setStandings((prevStandings) =>
      prevStandings.map((row) => {
        if (row.teamId === homeTeam.id) {
          return updateTeamWithResult(row, homeScore, awayScore);
        }
        if (row.teamId === awayTeam.id) {
          return updateTeamWithResult(row, awayScore, homeScore);
        }
        return row;
      }),
    );

    setFormValues(defaultFormValues);
    closeAddResultModal();
  };

  return (
    <div className="space-y-6">
      <PageBreadcrumb pageTitle="Classement" />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-4">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
          <p className="text-sm text-gray-500 dark:text-gray-400">Leader actuel</p>
          <div className="mt-3 flex items-center gap-3">
            <Image
              src={leader.logoUrl}
              alt={leader.teamName}
              width={40}
              height={40}
              className="h-10 w-10 rounded-full object-cover"
              unoptimized
            />
            <div>
              <p className="text-sm font-semibold text-gray-800 dark:text-white/90">
                {leader.teamName}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {leader.pts} pts
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
          <p className="text-sm text-gray-500 dark:text-gray-400">Position FC Toro</p>
          <p className="mt-3 text-2xl font-semibold text-brand-600 dark:text-brand-400">
            {fcToroRank + 1}
          </p>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {fcToro ? `${fcToro.pts} pts, ${fcToro.goalsFor - fcToro.goalsAgainst} diff` : "-"}
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
          <p className="text-sm text-gray-500 dark:text-gray-400">Matchs enregistres</p>
          <p className="mt-3 text-2xl font-semibold text-gray-800 dark:text-white/90">
            {recentFixtures.length}
          </p>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Resultats recents visibles
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
          <button
            type="button"
            onClick={() => setIsAddResultOpen(true)}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600"
          >
            <PlusIcon className="size-4" />
            Ajouter un resultat
          </button>
          <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
            Saisie rapide d&apos;un score FT avec mise a jour du classement.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <div className="xl:col-span-8">
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="border-b border-gray-100 px-5 py-4 dark:border-gray-800">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                Classement Ligue Elite
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Exemple pro avec FC Toro en tete.
              </p>
            </div>
            <div className="max-w-full overflow-x-auto">
              <Table>
                <TableHeader className="border-b border-gray-100 dark:border-gray-800">
                  <TableRow>
                    <TableCell
                      isHeader
                      className="px-4 py-3 text-left text-theme-xs font-medium text-gray-500 dark:text-gray-400"
                    >
                      #
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-4 py-3 text-left text-theme-xs font-medium text-gray-500 dark:text-gray-400"
                    >
                      Equipe
                    </TableCell>
                    <TableCell isHeader className="px-2 py-3 text-center text-theme-xs font-medium text-gray-500 dark:text-gray-400">
                      PTS
                    </TableCell>
                    <TableCell isHeader className="px-2 py-3 text-center text-theme-xs font-medium text-gray-500 dark:text-gray-400">
                      J
                    </TableCell>
                    <TableCell isHeader className="px-2 py-3 text-center text-theme-xs font-medium text-gray-500 dark:text-gray-400">
                      W
                    </TableCell>
                    <TableCell isHeader className="px-2 py-3 text-center text-theme-xs font-medium text-gray-500 dark:text-gray-400">
                      L
                    </TableCell>
                    <TableCell isHeader className="px-2 py-3 text-center text-theme-xs font-medium text-gray-500 dark:text-gray-400">
                      N
                    </TableCell>
                    <TableCell isHeader className="px-2 py-3 text-center text-theme-xs font-medium text-gray-500 dark:text-gray-400">
                      GF
                    </TableCell>
                    <TableCell isHeader className="px-2 py-3 text-center text-theme-xs font-medium text-gray-500 dark:text-gray-400">
                      GA
                    </TableCell>
                    <TableCell isHeader className="px-2 py-3 text-center text-theme-xs font-medium text-gray-500 dark:text-gray-400">
                      +/-
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-4 py-3 text-center text-theme-xs font-medium text-gray-500 dark:text-gray-400"
                    >
                      5 derniers
                    </TableCell>
                  </TableRow>
                </TableHeader>

                <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {sortedStandings.map((row, index) => {
                    const goalDiff = row.goalsFor - row.goalsAgainst;
                    const isToro = row.teamId === "team-fctoro";
                    return (
                      <TableRow
                        key={row.teamId}
                        className={isToro ? "bg-brand-50/60 dark:bg-brand-500/10" : ""}
                      >
                        <TableCell className="px-4 py-3 text-sm font-semibold text-gray-800 dark:text-white/90">
                          {index + 1}
                        </TableCell>
                        <TableCell className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <Image
                              src={row.logoUrl}
                              alt={row.teamName}
                              width={28}
                              height={28}
                              className="h-7 w-7 rounded-full object-cover"
                              unoptimized
                            />
                            <span className="text-sm font-medium text-gray-800 dark:text-white/90">
                              {row.teamName}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="px-2 py-3 text-center text-sm font-semibold text-gray-800 dark:text-white/90">
                          {row.pts}
                        </TableCell>
                        <TableCell className="px-2 py-3 text-center text-sm text-gray-600 dark:text-gray-300">
                          {row.played}
                        </TableCell>
                        <TableCell className="px-2 py-3 text-center text-sm text-gray-600 dark:text-gray-300">
                          {row.wins}
                        </TableCell>
                        <TableCell className="px-2 py-3 text-center text-sm text-gray-600 dark:text-gray-300">
                          {row.losses}
                        </TableCell>
                        <TableCell className="px-2 py-3 text-center text-sm text-gray-600 dark:text-gray-300">
                          {row.draws}
                        </TableCell>
                        <TableCell className="px-2 py-3 text-center text-sm text-gray-600 dark:text-gray-300">
                          {row.goalsFor}
                        </TableCell>
                        <TableCell className="px-2 py-3 text-center text-sm text-gray-600 dark:text-gray-300">
                          {row.goalsAgainst}
                        </TableCell>
                        <TableCell className="px-2 py-3 text-center text-sm font-medium text-gray-700 dark:text-gray-200">
                          {goalDiff > 0 ? `+${goalDiff}` : goalDiff}
                        </TableCell>
                        <TableCell className="px-4 py-3">
                          <div className="flex items-center justify-center gap-1.5">
                            {row.form.map((result, resultIndex) => (
                              <span
                                key={`${row.teamId}-form-${resultIndex}`}
                                className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-semibold ${formBadgeClasses[result]}`}
                                title={result === "W" ? "Victoire" : result === "D" ? "Nul" : "Defaite"}
                              >
                                {formLabel[result]}
                              </span>
                            ))}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>

        <div className="space-y-6 xl:col-span-4">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
            <h3 className="text-base font-semibold text-gray-800 dark:text-white/90">
              Resultats recents
            </h3>
            <div className="mt-4 space-y-3">
              {recentFixtures.map((fixture) => (
                <div
                  key={fixture.id}
                  className="rounded-xl border border-gray-200 p-3 dark:border-gray-700"
                >
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {fixture.round} - {fixture.competition}
                  </p>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {formatKickoffDate(fixture.kickoff)}
                  </p>
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-2">
                      <Image
                        src={fixture.homeLogoUrl}
                        alt={fixture.homeTeamName}
                        width={20}
                        height={20}
                        className="h-5 w-5 rounded-full object-cover"
                        unoptimized
                      />
                      <span className="truncate text-sm text-gray-800 dark:text-white/90">
                        {fixture.homeTeamName}
                      </span>
                    </div>
                    <span className="text-sm font-semibold text-gray-800 dark:text-white/90">
                      {fixture.homeScore} - {fixture.awayScore}
                    </span>
                    <div className="flex min-w-0 items-center gap-2">
                      <span className="truncate text-right text-sm text-gray-800 dark:text-white/90">
                        {fixture.awayTeamName}
                      </span>
                      <Image
                        src={fixture.awayLogoUrl}
                        alt={fixture.awayTeamName}
                        width={20}
                        height={20}
                        className="h-5 w-5 rounded-full object-cover"
                        unoptimized
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
            <h3 className="text-base font-semibold text-gray-800 dark:text-white/90">
              Prochains matchs
            </h3>
            <div className="mt-4 space-y-3">
              {upcomingFixtures.map((fixture) => (
                <div
                  key={fixture.id}
                  className="rounded-xl border border-gray-200 p-3 dark:border-gray-700"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {fixture.round} - {fixture.competition}
                    </p>
                    <span className="rounded-full bg-brand-50 px-2 py-1 text-[11px] font-medium text-brand-700 dark:bg-brand-500/15 dark:text-brand-400">
                      A venir
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {formatKickoffDate(fixture.kickoff)} - {formatKickoffTime(fixture.kickoff)}
                  </p>
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-2">
                      <Image
                        src={fixture.homeLogoUrl}
                        alt={fixture.homeTeamName}
                        width={20}
                        height={20}
                        className="h-5 w-5 rounded-full object-cover"
                        unoptimized
                      />
                      <span className="truncate text-sm text-gray-800 dark:text-white/90">
                        {fixture.homeTeamName}
                      </span>
                    </div>
                    <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                      vs
                    </span>
                    <div className="flex min-w-0 items-center gap-2">
                      <span className="truncate text-right text-sm text-gray-800 dark:text-white/90">
                        {fixture.awayTeamName}
                      </span>
                      <Image
                        src={fixture.awayLogoUrl}
                        alt={fixture.awayTeamName}
                        width={20}
                        height={20}
                        className="h-5 w-5 rounded-full object-cover"
                        unoptimized
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50/70 p-4 text-sm text-gray-600 dark:border-gray-700 dark:bg-white/[0.02] dark:text-gray-300">
        <p className="font-medium text-gray-700 dark:text-gray-200">Point API (pro)</p>
        <p className="mt-1">
          Donnees demo dans <code>src/data/club/standings-data.ts</code>. Pour
          brancher votre API, remplacez cette source par un fetch serveur
          (exemple: route <code>/api/classement</code> et <code>/api/matchs</code>).
        </p>
      </div>

      <Modal
        isOpen={isAddResultOpen}
        onClose={closeAddResultModal}
        className="mx-4 max-w-[860px]"
      >
        <div className="rounded-3xl bg-white p-6 dark:bg-gray-900 sm:p-8">
          <div className="pr-12">
            <h3 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
              Ajouter un resultat
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Le score est ajoute au bloc resultats et met a jour le classement.
            </p>
          </div>

          <form className="mt-6 space-y-5" onSubmit={handleAddResult}>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Competition
                </label>
                <input
                  type="text"
                  value={formValues.competition}
                  onChange={(event) =>
                    setFormValues((prev) => ({
                      ...prev,
                      competition: event.target.value,
                    }))
                  }
                  className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-3 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Journee / Tour
                </label>
                <input
                  type="text"
                  value={formValues.round}
                  onChange={(event) =>
                    setFormValues((prev) => ({ ...prev, round: event.target.value }))
                  }
                  className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-3 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Date
                </label>
                <input
                  type="date"
                  value={formValues.kickoffDate}
                  onChange={(event) =>
                    setFormValues((prev) => ({
                      ...prev,
                      kickoffDate: event.target.value,
                    }))
                  }
                  className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-3 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Heure
                </label>
                <input
                  type="time"
                  value={formValues.kickoffTime}
                  onChange={(event) =>
                    setFormValues((prev) => ({
                      ...prev,
                      kickoffTime: event.target.value,
                    }))
                  }
                  className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-3 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Equipe domicile
                </label>
                <select
                  value={formValues.homeTeamId}
                  onChange={(event) =>
                    setFormValues((prev) => ({
                      ...prev,
                      homeTeamId: event.target.value,
                    }))
                  }
                  className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-3 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                >
                  {mockStandingTeams.map((team) => (
                    <option key={team.id} value={team.id}>
                      {team.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Equipe exterieur
                </label>
                <select
                  value={formValues.awayTeamId}
                  onChange={(event) =>
                    setFormValues((prev) => ({
                      ...prev,
                      awayTeamId: event.target.value,
                    }))
                  }
                  className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-3 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                >
                  {mockStandingTeams.map((team) => (
                    <option key={team.id} value={team.id}>
                      {team.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Score domicile
                </label>
                <input
                  type="number"
                  min={0}
                  value={formValues.homeScore}
                  onChange={(event) =>
                    setFormValues((prev) => ({
                      ...prev,
                      homeScore: event.target.value,
                    }))
                  }
                  className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-3 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Score exterieur
                </label>
                <input
                  type="number"
                  min={0}
                  value={formValues.awayScore}
                  onChange={(event) =>
                    setFormValues((prev) => ({
                      ...prev,
                      awayScore: event.target.value,
                    }))
                  }
                  className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-3 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                />
              </div>
            </div>

            {formError ? (
              <p className="rounded-lg border border-error-200 bg-error-50 px-3 py-2 text-sm text-error-700 dark:border-error-500/30 dark:bg-error-500/10 dark:text-error-400">
                {formError}
              </p>
            ) : null}

            <div className="flex flex-wrap justify-end gap-3">
              <button
                type="button"
                onClick={closeAddResultModal}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-white/[0.03]"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600"
              >
                <CheckLineIcon className="size-4" />
                Enregistrer le score
              </button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { SectionCard } from "@/components/common/CmsShared";
import { AgeCategory } from "@/types/tournament";

export default function TournamentPage() {
  const params = useParams();
  const tournamentId = params.id as string;

  const [selectedCategory, setSelectedCategory] = useState<AgeCategory>("U9");
  const [selectedTab, setSelectedTab] = useState("matchs");
  const [tournament, setTournament] = useState<any>(null);
  const [matches, setMatches] = useState<any[]>([]);
  const [standings, setStandings] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const CATEGORIES: AgeCategory[] = ["U9", "U11", "U13", "U15", "U17", "U21"];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const tourRes = await fetch(`/api/tournaments/${tournamentId}`);
        const tourData = await tourRes.json();
        setTournament(tourData.data);

        const matchRes = await fetch(`/api/tournaments/${tournamentId}/matches`);
        const matchData = await matchRes.json();
        setMatches(matchData.data || []);

        const standingsRes = await fetch(`/api/tournaments/${tournamentId}/standings`);
        const standingsData = await standingsRes.json();
        setStandings(standingsData.data || {});
      } catch (error) {
        console.error("Erreur:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [tournamentId]);

  if (loading) {
    return (
      <div className="space-y-6">
        <PageBreadCrumb pageTitle="Chargement..." />
        <div className="text-center py-8 text-gray-500">Chargement des données...</div>
      </div>
    );
  }

  const categoryMatches = matches.filter((m) => m.round?.includes(selectedCategory));

  return (
    <div className="space-y-6">
      <PageBreadCrumb pageTitle={tournament?.name || "Gestion du championnat"} />

      {/* Sélection de catégorie */}
      <div>
        <label className="mb-3 block text-sm font-medium text-gray-700 dark:text-gray-400">
          Catégorie
        </label>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`py-2 px-3 rounded-lg font-medium text-sm transition ${
                selectedCategory === cat
                  ? "bg-brand-500 text-white"
                  : "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <div className="flex gap-8">
          {["poules", "matchs", "resultats", "phases"].map((tab) => (
            <button
              key={tab}
              onClick={() => setSelectedTab(tab)}
              className={`py-3 px-2 text-sm font-medium border-b-2 transition ${
                selectedTab === tab
                  ? "border-brand-500 text-brand-600 dark:text-brand-400"
                  : "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300"
              }`}
            >
              {tab === "poules" && "Poules"}
              {tab === "matchs" && "Matchs"}
              {tab === "resultats" && "Résultats"}
              {tab === "phases" && "Phases"}
            </button>
          ))}
        </div>
      </div>

      {/* Contenu des tabs */}
      {selectedTab === "poules" && (
        <SectionCard title="Classement" description={`Poule ${selectedCategory}`}>
          {standings && standings[selectedCategory]?.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-100 dark:bg-gray-800">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-gray-300">
                      Pos
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-gray-300">
                      Équipe
                    </th>
                    <th className="px-4 py-3 text-center font-medium text-gray-700 dark:text-gray-300">
                      J
                    </th>
                    <th className="px-4 py-3 text-center font-medium text-gray-700 dark:text-gray-300">
                      G
                    </th>
                    <th className="px-4 py-3 text-center font-medium text-gray-700 dark:text-gray-300">
                      N
                    </th>
                    <th className="px-4 py-3 text-center font-medium text-gray-700 dark:text-gray-300">
                      P
                    </th>
                    <th className="px-4 py-3 text-center font-medium text-gray-700 dark:text-gray-300">
                      BP
                    </th>
                    <th className="px-4 py-3 text-center font-medium text-gray-700 dark:text-gray-300">
                      BC
                    </th>
                    <th className="px-4 py-3 text-center font-medium text-gray-700 dark:text-gray-300">
                      Diff
                    </th>
                    <th className="px-4 py-3 text-center font-medium text-gray-700 dark:text-gray-300">
                      Pts
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {standings[selectedCategory].map((team: any, index: number) => (
                    <tr
                      key={team.teamId}
                      className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      <td className="px-4 py-3 font-semibold text-gray-900 dark:text-white">
                        {index + 1}
                      </td>
                      <td className="px-4 py-3 text-gray-900 dark:text-white">
                        <div className="flex items-center gap-2">
                          {team.teamLogo && (
                            <img
                              src={team.teamLogo}
                              alt={team.teamName}
                              className="w-6 h-6 rounded"
                            />
                          )}
                          <span>{team.teamName}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center text-gray-900 dark:text-white">
                        {team.played}
                      </td>
                      <td className="px-4 py-3 text-center text-green-600 dark:text-green-400 font-medium">
                        {team.won}
                      </td>
                      <td className="px-4 py-3 text-center text-yellow-600 dark:text-yellow-400 font-medium">
                        {team.drawn}
                      </td>
                      <td className="px-4 py-3 text-center text-red-600 dark:text-red-400 font-medium">
                        {team.lost}
                      </td>
                      <td className="px-4 py-3 text-center text-gray-900 dark:text-white">
                        {team.goalsFor}
                      </td>
                      <td className="px-4 py-3 text-center text-gray-900 dark:text-white">
                        {team.goalsAgainst}
                      </td>
                      <td className="px-4 py-3 text-center font-medium text-gray-900 dark:text-white">
                        {team.goalDifference > 0 ? "+" : ""}{team.goalDifference}
                      </td>
                      <td className="px-4 py-3 text-center font-bold text-brand-600 dark:text-brand-400">
                        {team.points}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              Aucune donnée de classement pour {selectedCategory}
            </div>
          )}
        </SectionCard>
      )}

      {selectedTab === "matchs" && (
        <SectionCard title="Calendrier des matchs" description={`${selectedCategory} (${categoryMatches.length} matchs)`}>
          {categoryMatches.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Aucun match pour {selectedCategory}
            </div>
          ) : (
            <div className="space-y-3">
              {categoryMatches.map((match) => (
                <div
                  key={match.id}
                  className="flex items-center justify-between gap-4 border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                >
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(match.kickoff).toLocaleDateString("fr-FR")} -{" "}
                      {new Date(match.kickoff).toLocaleTimeString("fr-FR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {match.round || "Match"}
                    </p>
                  </div>

                  <div className="flex-1 text-right">
                    <p className="font-medium text-gray-900 dark:text-white">
                      {match.home_team?.name || "Équipe A"}
                    </p>
                  </div>

                  <div className="text-center">
                    {match.status === "finished" ? (
                      <div>
                        <p className="text-2xl font-bold text-brand-600 dark:text-brand-400">
                          {match.home_score}-{match.away_score}
                        </p>
                        <p className="text-xs text-gray-500">Joué</p>
                      </div>
                    ) : (
                      <button className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs font-medium hover:bg-gray-300">
                        Ajouter
                      </button>
                    )}
                  </div>

                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-white">
                      {match.away_team?.name || "Équipe B"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      )}

      {selectedTab === "resultats" && (
        <SectionCard title="Ajouter un résultat" description={`${selectedCategory}`}>
          <form className="space-y-4 max-w-2xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                  Match
                </label>
                <select className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2.5 text-sm">
                  <option>Sélectionner un match</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                  Score Équipe A
                </label>
                <input
                  type="number"
                  min="0"
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2.5 text-sm"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                  Score Équipe B
                </label>
                <input
                  type="number"
                  min="0"
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2.5 text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              className="bg-brand-500 hover:bg-brand-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium"
            >
              Enregistrer le résultat
            </button>
          </form>
        </SectionCard>
      )}

      {selectedTab === "phases" && (
        <SectionCard title="Phases suivantes" description={`${selectedCategory}`}>
          <div className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Une fois les poules terminées, cliquez sur le bouton pour générer automatiquement les phases suivantes.
            </p>
            <button className="bg-brand-500 hover:bg-brand-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium">
              Générer les phases suivantes
            </button>
          </div>
        </SectionCard>
      )}
    </div>
  );
}

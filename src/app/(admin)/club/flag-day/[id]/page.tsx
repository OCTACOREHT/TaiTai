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
  const [scorers, setScorers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Formulaire de résultat
  const [resultForm, setResultForm] = useState({
    matchId: "",
    homeScore: 0,
    awayScore: 0,
    scorers: [] as { playerName: string; teamName: string; goals: number }[],
  });
  const [newScorer, setNewScorer] = useState({ playerName: "", teamName: "", goals: 1 });

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

        const scorersRes = await fetch(`/api/tournaments/${tournamentId}/scorers`);
        const scorersData = await scorersRes.json();
        setScorers(scorersData.data || []);
      } catch (error) {
        console.error("Erreur:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [tournamentId]);

  const handleSubmitResult = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resultForm.matchId) return alert("Sélectionnez un match");

    try {
      setLoading(true);
      const res = await fetch(`/api/tournaments/${tournamentId}/matches`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(resultForm),
      });

      const data = await res.json();
      if (data.success) {
        alert("Résultat enregistré !");
        // Recharger les données
        window.location.reload();
      } else {
        alert(data.error || "Erreur lors de l'enregistrement");
      }
    } catch (error) {
      console.error(error);
      alert("Erreur de connexion");
    } finally {
      setLoading(false);
    }
  };

  const addScorerToForm = () => {
    if (!newScorer.playerName || !newScorer.teamName) return;
    setResultForm({
      ...resultForm,
      scorers: [...resultForm.scorers, newScorer],
    });
    setNewScorer({ ...newScorer, playerName: "", goals: 1 });
  };

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

      <div className="border-b border-gray-200 dark:border-gray-700">
        <div className="flex gap-8">
          {["poules", "matchs", "resultats", "buteurs", "phases"].map((tab) => (
            <button
              key={tab}
              onClick={() => setSelectedTab(tab)}
              className={`py-3 px-2 text-sm font-medium border-b-2 transition capitalize ${
                selectedTab === tab
                  ? "border-brand-500 text-brand-600 dark:text-brand-400"
                  : "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300"
              }`}
            >
              {tab === "resultats" ? "Résultats" : tab}
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
          <form onSubmit={handleSubmitResult} className="space-y-4 max-w-2xl">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                  Match
                </label>
                <select
                  required
                  value={resultForm.matchId}
                  onChange={(e) => {
                    const match = categoryMatches.find(m => m.id === e.target.value);
                    setResultForm({ ...resultForm, matchId: e.target.value });
                    if (match) {
                      setNewScorer(s => ({ ...s, teamName: match.home_team.name }));
                    }
                  }}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2.5 text-sm"
                >
                  <option value="">Sélectionner un match</option>
                  {categoryMatches.filter(m => m.status !== "finished").map(m => (
                    <option key={m.id} value={m.id}>
                      {m.round} : {m.home_team.name} vs {m.away_team.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                  Score {resultForm.matchId && categoryMatches.find(m => m.id === resultForm.matchId)?.home_team.name}
                </label>
                <input
                  type="number"
                  min="0"
                  value={resultForm.homeScore}
                  onChange={(e) => setResultForm({ ...resultForm, homeScore: parseInt(e.target.value) })}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2.5 text-sm"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                  Score {resultForm.matchId && categoryMatches.find(m => m.id === resultForm.matchId)?.away_team.name}
                </label>
                <input
                  type="number"
                  min="0"
                  value={resultForm.awayScore}
                  onChange={(e) => setResultForm({ ...resultForm, awayScore: parseInt(e.target.value) })}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2.5 text-sm"
                />
              </div>
            </div>

            {/* Saisie des buteurs */}
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <h4 className="text-sm font-bold mb-3">Ajouter les buteurs</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-3">
                <input
                  placeholder="Nom du joueur"
                  value={newScorer.playerName}
                  onChange={(e) => setNewScorer({ ...newScorer, playerName: e.target.value })}
                  className="rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
                />
                <select
                  value={newScorer.teamName}
                  onChange={(e) => setNewScorer({ ...newScorer, teamName: e.target.value })}
                  className="rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
                >
                  {resultForm.matchId && (
                    <>
                      <option value={categoryMatches.find(m => m.id === resultForm.matchId)?.home_team.name}>
                        {categoryMatches.find(m => m.id === resultForm.matchId)?.home_team.name}
                      </option>
                      <option value={categoryMatches.find(m => m.id === resultForm.matchId)?.away_team.name}>
                        {categoryMatches.find(m => m.id === resultForm.matchId)?.away_team.name}
                      </option>
                    </>
                  )}
                </select>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="1"
                    value={newScorer.goals}
                    onChange={(e) => setNewScorer({ ...newScorer, goals: parseInt(e.target.value) })}
                    className="w-16 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
                  />
                  <button
                    type="button"
                    onClick={addScorerToForm}
                    className="flex-1 bg-gray-100 dark:bg-gray-700 text-xs font-bold rounded-lg hover:bg-gray-200"
                  >
                    Ajouter
                  </button>
                </div>
              </div>

              {/* Liste des buteurs ajoutés au formulaire */}
              <div className="flex flex-wrap gap-2">
                {resultForm.scorers.map((s, idx) => (
                  <span key={idx} className="bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-2 border border-brand-100 dark:border-brand-500/20">
                    {s.playerName} ({s.teamName}) x{s.goals}
                    <button
                      type="button"
                      onClick={() => setResultForm({ ...resultForm, scorers: resultForm.scorers.filter((_, i) => i !== idx) })}
                      className="text-red-500 hover:text-red-700"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-brand-500 hover:bg-brand-600 text-white px-4 py-3 rounded-lg text-sm font-bold shadow-lg shadow-brand-500/20"
              >
                {loading ? "Enregistrement..." : "Enregistrer le résultat et les buteurs"}
              </button>
            </div>
          </form>
        </SectionCard>
      )}

      {selectedTab === "buteurs" && (
        <SectionCard title="Meilleurs Buteurs" description={`Top buteurs - ${selectedCategory}`}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 dark:bg-gray-800">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-gray-300">Pos</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-gray-300">Joueur</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-gray-300">Équipe</th>
                  <th className="px-4 py-3 text-center font-medium text-gray-700 dark:text-gray-300">Buts</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {(() => {
                  // Agréger les buteurs par nom pour la catégorie
                  const categoryScorers: Record<string, { name: string; team: string; goals: number }> = {};
                  scorers.forEach(s => {
                    if (s.flagday_matches?.round?.includes(selectedCategory)) {
                      const key = `${s.player_name}-${s.team_name}`;
                      if (!categoryScorers[key]) {
                        categoryScorers[key] = { name: s.player_name, team: s.team_name, goals: 0 };
                      }
                      categoryScorers[key].goals += s.goals;
                    }
                  });

                  const sortedScorers = Object.values(categoryScorers).sort((a, b) => b.goals - a.goals);

                  if (sortedScorers.length === 0) {
                    return (
                      <tr>
                        <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                          Aucun buteur enregistré pour {selectedCategory}
                        </td>
                      </tr>
                    );
                  }

                  return sortedScorers.map((scorer, index) => (
                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="px-4 py-3 font-semibold text-gray-900 dark:text-white">{index + 1}</td>
                      <td className="px-4 py-3 text-gray-900 dark:text-white font-medium">{scorer.name}</td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{scorer.team}</td>
                      <td className="px-4 py-3 text-center font-bold text-brand-600 dark:text-brand-400">
                        {scorer.goals}
                      </td>
                    </tr>
                  ));
                })()}
              </tbody>
            </table>
          </div>
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

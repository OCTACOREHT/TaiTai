"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { SectionCard } from "@/components/common/CmsShared";
import { AgeCategory } from "@/types/tournament";

export default function DrawPage() {
  const router = useRouter();
  const params = useParams();
  const tournamentId = params.id as string;

  const [selectedCategory, setSelectedCategory] = useState<AgeCategory>("U9");
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawComplete, setDrawComplete] = useState(false);
  const [groups, setGroups] = useState<{ A: any[], B: any[] } | null>(null);
  const [error, setError] = useState("");
  const [teamCounts, setTeamCounts] = useState<Record<string, number>>({});

  const CATEGORIES: AgeCategory[] = ["U9", "U11", "U13", "U15", "U17", "U21"];

  useEffect(() => {
    const fetchTeamCounts = async () => {
      try {
        const res = await fetch(`/api/tournaments/${tournamentId}/teams`);
        const data = await res.json();
        if (data.success) {
          const counts: Record<string, number> = {};
          data.data.forEach((item: any) => {
            const cat = item.category || "U9";
            counts[cat] = (counts[cat] || 0) + 1;
          });
          setTeamCounts(counts);
        }
      } catch (error) {
        console.error("Erreur comptage:", error);
      }
    };
    fetchTeamCounts();
  }, [tournamentId]);

  const handleStartDraw = async () => {
    if ((teamCounts[selectedCategory] || 0) < 8) {
      alert(`La catégorie ${selectedCategory} nécessite au moins 8 équipes (Actuel: ${teamCounts[selectedCategory] || 0})`);
      return;
    }

    setIsDrawing(true);
    setError("");
    
    try {
      const response = await fetch(`/api/tournaments/${tournamentId}/draw`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category: selectedCategory }),
      });

      const result = await response.json();

      if (!result.success) {
        setError(result.error || "Erreur lors du tirage");
        setIsDrawing(false);
        return;
      }

      // Animation du tirage
      await new Promise((resolve) => setTimeout(resolve, 2000));

      setGroups(result.data.groups);
      setDrawComplete(true);
    } catch (err) {
      setError("Erreur technique lors du tirage");
    } finally {
      setIsDrawing(false);
    }
  };

  const handleContinue = () => {
    router.push(`/club/flag-day/${tournamentId}`);
  };

  return (
    <div className="space-y-6">
      <PageBreadCrumb pageTitle="Tirage au sort" />

      <SectionCard
        title="Animation du tirage"
        description="Visualisez la distribution des équipes dans les groupes"
      >
        <div className="space-y-6">
          {/* Sélection de catégorie */}
          <div>
            <label className="mb-3 block text-sm font-medium text-gray-700 dark:text-gray-400">
              Catégorie
            </label>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    setSelectedCategory(cat);
                    setDrawComplete(false);
                    setError("");
                  }}
                  disabled={isDrawing}
                  className={`py-2 px-3 rounded-lg font-medium text-sm transition relative ${
                    selectedCategory === cat
                      ? "bg-brand-500 text-white"
                      : "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                  } disabled:opacity-50`}
                >
                  {cat}
                  {teamCounts[cat] > 0 && (
                    <span className={`absolute -top-1 -right-1 px-1.5 py-0.5 rounded-full text-[10px] ${
                      teamCounts[cat] >= 8 ? "bg-green-500 text-white" : "bg-red-500 text-white"
                    }`}>
                      {teamCounts[cat]}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-900/10 dark:text-red-300">
              {error}
            </div>
          )}

          {/* Animation de tirage */}
          <div className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 rounded-lg p-8 min-h-96 flex flex-col items-center justify-center overflow-hidden">
            {/* Particules d'animation */}
            <div className="absolute inset-0">
              {isDrawing &&
                Array.from({ length: 12 }).map((_, i) => (
                  <div
                    key={i}
                    className={`absolute w-2 h-2 bg-white rounded-full animate-pulse`}
                    style={{
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                      animation: `pulse ${1 + Math.random() * 2}s infinite`,
                    }}
                  />
                ))}
            </div>

            <div className="relative z-10 text-center">
              {isDrawing ? (
                <>
                  <div className="mb-4">
                    <div className="mx-auto h-12 w-12 border-4 border-white border-t-transparent rounded-full animate-spin" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Tirage en cours...</h3>
                  <p className="text-blue-200">Distribution des {selectedCategory}</p>
                </>
              ) : drawComplete ? (
                <>
                  <div className="text-5xl mb-4">✓</div>
                  <h3 className="text-2xl font-bold text-white mb-2">Tirage terminé!</h3>
                  <p className="text-blue-200">Les groupes ont été créés</p>
                </>
              ) : (
                <>
                  <h3 className="text-2xl font-bold text-white mb-2">
                    Prêt pour le tirage?
                  </h3>
                  <p className="text-blue-200 mb-6">
                    Cliquez sur le bouton pour lancer le tirage au sort de la catégorie
                    {selectedCategory}
                  </p>
                  <button
                    onClick={handleStartDraw}
                    className="bg-white text-blue-900 px-6 py-3 rounded-lg font-bold hover:bg-blue-50"
                  >
                    Lancer le tirage
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Résumé des groupes */}
          {drawComplete && groups && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                  Groupe A
                </h4>
                <ul className="space-y-2">
                  {groups.A.map((team: any, i: number) => (
                    <li key={team.team_id} className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                      <span className="w-5 h-5 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-full text-xs">{i+1}</span>
                      {team.flagday_teams.name}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                  Groupe B
                </h4>
                <ul className="space-y-2">
                  {groups.B.map((team: any, i: number) => (
                    <li key={team.team_id} className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                      <span className="w-5 h-5 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-full text-xs">{i+1}</span>
                      {team.flagday_teams.name}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Boutons d'action */}
          <div className="flex gap-3 justify-end">
            {!isDrawing && !drawComplete && (
              <button
                onClick={() => router.back()}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
              >
                Retour
              </button>
            )}
            {drawComplete && (
              <>
                <button
                  onClick={() => {
                    setDrawComplete(false);
                    handleStartDraw();
                  }}
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                >
                  Re-tirer
                </button>
                <button
                  onClick={handleContinue}
                  className="rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600"
                >
                  Continuer vers le championnat
                </button>
              </>
            )}
          </div>
        </div>
      </SectionCard>
    </div>
  );
}

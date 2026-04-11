"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { SectionCard } from "@/components/common/CmsShared";
import { AgeCategory } from "@/types/tournament";

const CATEGORIES: AgeCategory[] = ["U9", "U11", "U13", "U15", "U17", "U21"];

interface Team {
  id: string;
  name: string;
  logo: string;
  category: AgeCategory;
}

export default function TournamentTeamsPage() {
  const router = useRouter();
  const params = useParams();
  const tournamentId = params.id as string;

  const [teams, setTeams] = useState<Team[]>([]);
  const [globalTeams, setGlobalTeams] = useState<any[]>([]);
  const [newTeam, setNewTeam] = useState({
    name: "",
    logo: "",
    category: "U9" as AgeCategory,
  });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setFetching(true);
        // 1. Charger les équipes globales pour les suggestions
        const globalRes = await fetch("/api/tournaments/global-teams");
        const globalData = await globalRes.json();
        if (globalData.success) {
          setGlobalTeams(globalData.data);
        }

        // 2. Charger les équipes déjà associées à ce tournoi (si modif)
        const currentRes = await fetch(`/api/tournaments/${tournamentId}/teams`);
        const currentData = await currentRes.json();
        if (currentData.success && currentData.data.length > 0) {
          const formattedTeams = currentData.data.map((item: any) => ({
            id: item.team_id,
            name: item.flagday_teams.name,
            logo: item.logo_url || item.flagday_teams.logo_url,
            category: item.category || "U9", // Par défaut si vide
          }));
          setTeams(formattedTeams);
        }
      } catch (error) {
        console.error("Erreur chargement:", error);
      } finally {
        setFetching(false);
      }
    };

    fetchData();
  }, [tournamentId]);

  const handleAddTeam = () => {
    if (!newTeam.name.trim()) {
      alert("Veuillez entrer le nom de l'équipe");
      return;
    }

    // Vérifier si c'est une équipe existante pour récupérer son logo
    const existingTeam = globalTeams.find(
      (t) => t.name.toLowerCase() === newTeam.name.toLowerCase(),
    );

    const team: Team = {
      id: existingTeam ? existingTeam.id : `new-${Date.now()}`,
      name: existingTeam ? existingTeam.name : newTeam.name,
      logo: newTeam.logo || (existingTeam ? existingTeam.logo_url : ""),
      category: newTeam.category,
    };

    // Éviter les doublons par nom dans la liste locale
    if (teams.some((t) => t.name.toLowerCase() === team.name.toLowerCase())) {
      alert("Cette équipe est déjà ajoutée");
      return;
    }

    setTeams([...teams, team]);
    setNewTeam({ name: "", logo: "", category: "U9" });
  };

  const handleRemoveTeam = (teamId: string) => {
    setTeams(teams.filter((t) => t.id !== teamId));
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setNewTeam((prev) => ({
          ...prev,
          logo: event.target?.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleNext = async () => {
    if (teams.length < 8) {
      alert("Il faut au moins 8 équipes pour générer les poules (2 groupes de 4).");
      return;
    }

    setLoading(true);
    console.log("Démarrage de la sauvegarde pour le tournoi:", tournamentId);
    console.log("Équipes à sauvegarder:", teams);

    try {
      // Sauvegarder les équipes une par une (le backend gère le create-or-link)
      const results = [];
      for (const team of teams) {
        const res = await fetch(`/api/tournaments/${tournamentId}/teams`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            teamName: team.name,
            logo: team.logo,
            category: team.category,
          }),
        });
        
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || `Erreur lors de la sauvegarde de l'équipe ${team.name}`);
        }
        results.push(data);
      }

      console.log("Sauvegarde réussie:", results);
      router.push(`/club/flag-day/${tournamentId}/tirage`);
    } catch (error: any) {
      console.error("Erreur détaillée lors de la sauvegarde:", error);
      alert(`Erreur lors de la sauvegarde : ${error.message}`);
      setLoading(false);
    }
  };

  const inputClassName =
    "w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90";

  const teamsByCategory = CATEGORIES.reduce(
    (acc, cat) => {
      acc[cat] = teams.filter((t) => t.category === cat);
      return acc;
    },
    {} as Record<AgeCategory, Team[]>,
  );

  return (
    <div className="space-y-6">
      <PageBreadCrumb pageTitle="Ajouter les équipes" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SectionCard
          title="Ajouter une équipe"
          description="Remplissez les informations de l'équipe"
        >
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                Nom de l'équipe
              </label>
              <input
                type="text"
                value={newTeam.name}
                onChange={(e) => {
                  const name = e.target.value;
                  const found = globalTeams.find(t => t.name.toLowerCase() === name.toLowerCase());
                  setNewTeam({ 
                    ...newTeam, 
                    name, 
                    logo: found ? found.logo_url : (newTeam.logo?.startsWith('data:') ? newTeam.logo : "")
                  });
                }}
                placeholder="Tapez le nom ou choisissez..."
                className={inputClassName}
                list="global-teams-list"
              />
              <datalist id="global-teams-list">
                {globalTeams.map((t) => (
                  <option key={t.id} value={t.name} />
                ))}
              </datalist>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                Logo de l'équipe
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoChange}
                className="block w-full text-sm text-gray-500"
              />
              {newTeam.logo && (
                <div className="mt-2">
                  <img
                    src={newTeam.logo}
                    alt="Logo preview"
                    className="h-16 w-16 rounded-lg object-cover"
                  />
                </div>
              )}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                Catégorie
              </label>
              <select
                value={newTeam.category}
                onChange={(e) =>
                  setNewTeam({ ...newTeam, category: e.target.value as AgeCategory })
                }
                className={inputClassName}
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleAddTeam}
              className="w-full rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600"
            >
              Ajouter l'équipe
            </button>
          </div>
        </SectionCard>

        <SectionCard
          title="Équipes ajoutées"
          description={`${teams.length} équipe(s)`}
        >
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {teams.length === 0 ? (
              <p className="text-sm text-gray-500 py-4">Aucune équipe ajoutée</p>
            ) : (
              teams.map((team) => (
                <div
                  key={team.id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-gray-200 p-3 dark:border-gray-700"
                >
                  <div className="flex items-center gap-3">
                    {team.logo && (
                      <img
                        src={team.logo}
                        alt={team.name}
                        className="h-10 w-10 rounded object-cover"
                      />
                    )}
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {team.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {team.category}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveTeam(team.id)}
                    className="text-red-600 hover:text-red-700 text-sm font-medium"
                  >
                    Retirer
                  </button>
                </div>
              ))
            )}
          </div>
        </SectionCard>
      </div>

      <div className="flex gap-3 justify-end">
        <button
          onClick={() => router.back()}
          className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
        >
          Retour
        </button>
        <button
          onClick={handleNext}
          disabled={loading || teams.length < 8}
          className="rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 disabled:bg-gray-400 disabled:cursor-not-allowed group relative"
        >
          {loading ? "Sauvegarde..." : "Continuer vers le tirage"}
          {teams.length < 8 && !loading && (
            <span className="absolute -top-10 left-1/2 -translate-x-1/2 scale-0 rounded bg-gray-900 p-2 text-xs text-white group-hover:scale-100 transition-all whitespace-nowrap">
              Minimum 8 équipes requises ({8 - teams.length} manquantes)
            </span>
          )}
        </button>
      </div>
    </div>
  );
}

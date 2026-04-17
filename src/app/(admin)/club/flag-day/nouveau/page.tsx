"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { SectionCard, cn } from "@/components/common/CmsShared";

const CATEGORIES = ["U9", "U11", "U13", "U15", "U17", "U19", "U21"];

interface Team {
  id: string;
  name: string;
  logo_url: string;
}

export default function NewTournamentWizard() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Form State
  const [formData, setFormData] = useState({
    name: "",
    season: new Date().getFullYear().toString(),
    description: "",
    age_category: "U15",
    selectedTeamIds: [] as string[],
  });

  // Teams Data
  const [availableTeams, setAvailableTeams] = useState<Team[]>([]);
  const [searchTeam, setSearchTeam] = useState("");
  const [isAddingNewTeam, setIsAddingNewTeam] = useState(false);
  const [newTeamName, setNewTeamName] = useState("");

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const res = await fetch("/api/tournaments/global-teams");
        const data = await res.json();
        setAvailableTeams(data.data || []);
      } catch (err) {
        console.error("Erreur teams:", err);
      }
    };
    fetchTeams();
  }, []);

  const nextStep = () => {
    if (step === 1 && !formData.name.trim()) return setError("Le nom est obligatoire");
    if (step === 3 && formData.selectedTeamIds.length < 8) return setError("Il faut au moins 8 équipes");
    setError("");
    setStep(step + 1);
  };

  const prevStep = () => {
    setError("");
    setStep(step - 1);
  };

  const toggleTeam = (id: string) => {
    setFormData(prev => ({
      ...prev,
      selectedTeamIds: prev.selectedTeamIds.includes(id)
        ? prev.selectedTeamIds.filter(tid => tid !== id)
        : [...prev.selectedTeamIds, id]
    }));
  };

  const addNewTeam = async () => {
    if (!newTeamName.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/tournaments/global-teams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newTeamName }),
      });
      const data = await res.json();
      if (data.success) {
        setAvailableTeams([...availableTeams, data.data]);
        toggleTeam(data.data.id);
        setNewTeamName("");
        setIsAddingNewTeam(false);
      }
    } catch (err) {
      setError("Erreur lors de l'ajout de l'équipe");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");

    try {
      // 1. Créer le tournoi et la catégorie
      const res = await fetch("/api/tournaments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const tourData = await res.json();
      if (!res.ok) throw new Error(tourData.error);

      const tournamentId = tourData.data.id;

      // 2. Lier les équipes au tournoi
      // On crée un endpoint de liaison massive pour les équipes
      const teamsRes = await fetch(`/api/tournaments/${tournamentId}/teams`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          teamIds: formData.selectedTeamIds,
          category: formData.age_category 
        }),
      });

      if (!teamsRes.ok) throw new Error("Erreur lors de l'inscription des équipes");

      // 3. Générer le tirage au sort (2 poules de 4)
      const drawRes = await fetch(`/api/tournaments/${tournamentId}/draw`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!drawRes.ok) throw new Error("Erreur lors du tirage automatique");

      router.push(`/club/flag-day/${tournamentId}`);
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue");
      setLoading(false);
    }
  };

  const filteredTeams = availableTeams.filter(t => 
    t.name.toLowerCase().includes(searchTeam.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <PageBreadCrumb pageTitle="Championnat Wizard" />

      {/* Stepper Header */}
      <div className="bg-white dark:bg-white/[0.03] p-8 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm transition-all duration-500">
        <div className="flex items-center justify-between relative">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="flex flex-col items-center z-10 transition-all duration-500">
              <div className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center font-bold transition-all duration-500",
                step === s ? "bg-brand-500 text-white shadow-lg shadow-brand-500/30 scale-110" : 
                step > s ? "bg-green-500 text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-400"
              )}>
                {step > s ? "✓" : s}
              </div>
              <span className={cn("mt-2 text-[10px] font-bold uppercase tracking-wider", step === s ? "text-brand-500" : "text-gray-400")}>
                {s === 1 ? "Infos" : s === 2 ? "Catégorie" : s === 3 ? "Équipes" : "Génération"}
              </span>
            </div>
          ))}
          {/* Progress Line */}
          <div className="absolute top-6 left-0 w-full h-0.5 bg-gray-100 dark:bg-gray-800 -z-0">
            <div 
              className="h-full bg-brand-500 transition-all duration-500" 
              style={{ width: `${((step - 1) / 3) * 100}%` }}
            />
          </div>
        </div>
      </div>

      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        {step === 1 && (
          <SectionCard title="Étape 1 : Dénomination" description="Donnez un nom et une saison à votre compétition.">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Nom de la compétition *</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-2xl p-4 text-lg font-medium focus:ring-2 focus:ring-brand-500/20"
                  placeholder="Ex: Tournoi d'été FC Toro"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Saison</label>
                  <input 
                    type="text" 
                    value={formData.season}
                    onChange={e => setFormData({...formData, season: e.target.value})}
                    className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-2xl p-4 text-lg focus:ring-2 focus:ring-brand-500/20"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Description (Optionnel)</label>
                <textarea 
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-2xl p-4 min-h-[120px] focus:ring-2 focus:ring-brand-500/20"
                  placeholder="Détails sur l'organisation..."
                />
              </div>
            </div>
          </SectionCard>
        )}

        {step === 2 && (
          <SectionCard title="Étape 2 : Catégorie d'âge" description="Sélectionnez la catégorie pour ce championnat.">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setFormData({...formData, age_category: cat})}
                  className={cn(
                    "p-6 rounded-3xl border-2 transition-all text-center",
                    formData.age_category === cat 
                      ? "border-brand-500 bg-brand-50/50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 font-bold" 
                      : "border-gray-100 dark:border-gray-800 hover:border-gray-200"
                  )}
                >
                  <span className="text-xl">{cat}</span>
                </button>
              ))}
            </div>
          </SectionCard>
        )}

        {step === 3 && (
          <SectionCard 
            title="Étape 3 : Inscription des équipes" 
            description={`Sélectionnez au moins 8 équipes (${formData.selectedTeamIds.length} sélectionnées).`}
          >
            <div className="space-y-6">
              <div className="flex gap-2">
                <input 
                  type="text"
                  placeholder="Rechercher une équipe..."
                  value={searchTeam}
                  onChange={e => setSearchTeam(e.target.value)}
                  className="flex-1 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl px-6 py-3"
                />
                <button 
                  onClick={() => setIsAddingNewTeam(true)}
                  className="bg-brand-500 text-white px-6 rounded-2xl font-bold text-sm"
                >
                  + Nouvelle
                </button>
              </div>

              {isAddingNewTeam && (
                <div className="p-6 bg-brand-50 dark:bg-brand-500/5 rounded-3xl flex gap-3 animate-in zoom-in-95 duration-200">
                  <input 
                    autoFocus
                    value={newTeamName}
                    onChange={e => setNewTeamName(e.target.value)}
                    placeholder="Nom de la nouvelle équipe"
                    className="flex-1 bg-white dark:bg-gray-900 border-none rounded-xl px-4 py-2"
                  />
                  <button onClick={addNewTeam} disabled={loading} className="text-brand-600 font-bold">Ajouter</button>
                  <button onClick={() => setIsAddingNewTeam(false)} className="text-gray-400">Annuler</button>
                </div>
              )}

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {filteredTeams.map(team => (
                  <button
                    key={team.id}
                    onClick={() => toggleTeam(team.id)}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-2xl border transition-all",
                      formData.selectedTeamIds.includes(team.id)
                        ? "border-brand-500 bg-brand-50/50 dark:bg-brand-500/10"
                        : "border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-white/5"
                    )}
                  >
                    <img src={team.logo_url} alt="" className="w-8 h-8 rounded-full object-contain bg-white p-1" />
                    <span className="text-sm font-medium truncate">{team.name}</span>
                    {formData.selectedTeamIds.includes(team.id) && <span className="ml-auto text-brand-500 font-bold">✓</span>}
                  </button>
                ))}
              </div>
            </div>
          </SectionCard>
        )}

        {step === 4 && (
          <SectionCard title="Étape 4 : Génération" description="Vérifiez les informations avant de lancer la compétition.">
            <div className="p-8 bg-gray-50 dark:bg-white/[0.02] rounded-3xl space-y-4">
              <div className="flex justify-between border-b border-gray-100 dark:border-gray-800 pb-4">
                <span className="text-gray-400">Compétition</span>
                <span className="font-bold text-gray-900 dark:text-white">{formData.name} ({formData.season})</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 dark:border-gray-800 pb-4">
                <span className="text-gray-400">Catégorie</span>
                <span className="font-bold text-brand-500">{formData.age_category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Équipes engagées</span>
                <span className="font-bold">{formData.selectedTeamIds.length} équipes</span>
              </div>
              <div className="mt-8 p-6 bg-brand-500 text-white rounded-2xl text-sm italic">
                En cliquant sur "Générer", le système va répartir automatiquement les équipes en 2 poules de 4 et créer le calendrier complet des matchs.
              </div>
            </div>
          </SectionCard>
        )}

        {error && (
          <div className="mt-6 p-4 bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 text-red-600 dark:text-red-400 rounded-2xl text-sm font-bold animate-in shake-100">
            {error}
          </div>
        )}

        <div className="mt-10 flex justify-between gap-4">
          {step > 1 && (
            <button 
              onClick={prevStep}
              className="flex-1 py-4 px-8 rounded-2xl border border-gray-200 dark:border-gray-800 font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 transition-all outline-none"
            >
              Précédent
            </button>
          )}
          {step < 4 ? (
            <button 
              onClick={nextStep}
              className="flex-[2] py-4 px-8 rounded-2xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold hover:opacity-90 transition-all outline-none shadow-xl"
            >
              Suivant
            </button>
          ) : (
            <button 
              onClick={handleSubmit}
              disabled={loading}
              className="flex-[2] py-4 px-8 rounded-2xl bg-brand-500 text-white font-bold hover:bg-brand-600 transition-all outline-none shadow-xl shadow-brand-500/20 disabled:opacity-50"
            >
              {loading ? "Génération en cours..." : "Générer le Tirage"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

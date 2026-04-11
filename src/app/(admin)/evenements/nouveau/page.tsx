import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { useClubData } from "@/context/ClubDataContext";
import { EventType } from "@/types/club";
import { getPlayerFullName } from "@/lib/club/metrics";
import { eventTypeToCalendarColor } from "@/lib/club/event-calendar";
import { Modal } from "@/components/ui/modal";
import { useModal } from "@/hooks/useModal";

const inputClassName =
  "h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90";

const selectClassName =
  "h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90";

interface Team {
  id: string;
  name: string;
  logo_url: string;
}

export default function NewEventPage() {
  const router = useRouter();
  const { players, setEvents } = useClubData();
  const [titre, setTitre] = useState("");
  const [date, setDate] = useState("");
  const [lieu, setLieu] = useState("");
  const [type, setType] = useState<EventType>("flag_day");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [participants, setParticipants] = useState<string[]>([]);
  const [homeTeamId, setHomeTeamId] = useState("");
  const [awayTeamId, setAwayTeamId] = useState("");
  
  const [teams, setTeams] = useState<Team[]>([]);
  const [submitError, setSubmitError] = useState("");

  const { isOpen, openModal, closeModal } = useModal();
  const [newTeamName, setNewTeamName] = useState("");
  const [newTeamLogo, setNewTeamLogo] = useState("");
  const [creatingTeam, setCreatingTeam] = useState(false);

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      const res = await fetch("/api/tournaments/global-teams");
      const json = await res.json();
      if (json.success) {
        setTeams(json.data);
      }
    } catch (e) {
      console.error("Failed to fetch teams", e);
    }
  };

  const handleCreateTeam = async () => {
    if (!newTeamName) return;
    setCreatingTeam(true);
    try {
      const res = await fetch("/api/tournaments/global-teams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newTeamName, logo_url: newTeamLogo }),
      });
      const json = await res.json();
      if (json.success) {
        setTeams((prev) => [...prev, json.data]);
        setNewTeamName("");
        setNewTeamLogo("");
        closeModal();
      }
    } catch (e) {
      console.error("Failed to create team", e);
    } finally {
      setCreatingTeam(false);
    }
  };

  const handleTypeChange = (newType: EventType) => {
    setType(newType);
    
    // Auto-fill title
    const typeLabels: Record<string, string> = {
      live_diffusion: "Live Diffusion",
      vertieres_cup: "Vertieres Cup",
      flag_day: "Flag Day",
      intrasquad: "Intrasquad",
      international: "International",
    };
    
    if (typeLabels[newType]) {
      setTitre(typeLabels[newType]);
    }

    // Reset fields if not relevant
    if (newType !== "live_diffusion") {
      setParticipants([]);
      setYoutubeUrl("");
      setHomeTeamId("");
      setAwayTeamId("");
    }
  };

  const handleSubmit = async () => {
    setSubmitError("");
    if (!titre || !date || !lieu) {
      setSubmitError("Renseignez le titre, la date et le lieu.");
      return;
    }

    const nextEvent = {
      id: crypto.randomUUID(),
      titre,
      date,
      lieu,
      type,
      youtubeUrl,
      home_team_id: homeTeamId || null,
      away_team_id: awayTeamId || null,
      calendarColor: eventTypeToCalendarColor(type),
      participants,
    };

    const response = await fetch("/api/club/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(nextEvent),
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => ({ error: "Impossible d'enregistrer l'evenement." }));
      setSubmitError(payload.error || "Impossible d'enregistrer l'evenement.");
      return;
    }

    setEvents((prevEvents) => [...prevEvents, nextEvent]);
    router.push("/evenements");
  };

  const selectedHomeTeam = teams.find(t => t.id === homeTeamId);
  const selectedAwayTeam = teams.find(t => t.id === awayTeamId);

  return (
    <div className="space-y-6">
      <PageBreadcrumb pageTitle="Ajouter un evenement" />
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
              Type d&apos;événement
            </label>
            <select
              value={type}
              onChange={(event) => handleTypeChange(event.target.value as EventType)}
              className={selectClassName}
            >
              <optgroup label="DIFFUSION">
                <option value="live_diffusion">Live Diffusion</option>
              </optgroup>
              <optgroup label="TOURNOIS">
                <option value="vertieres_cup">Vertieres Cup</option>
                <option value="flag_day">Flag Day</option>
                <option value="intrasquad">Intrasquad</option>
                <option value="international">International</option>
              </optgroup>
            </select>
          </div>

          <div className="md:col-span-1 xl:col-span-2">
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
              Titre (Rempli automatiquement)
            </label>
            <input
              value={titre}
              onChange={(event) => setTitre(event.target.value)}
              className={inputClassName}
              placeholder="Ex: Flag Day Tournament"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
              Date et heure
            </label>
            <input
              type="datetime-local"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              className={inputClassName}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
              Lieu
            </label>
            <input
              value={lieu}
              onChange={(event) => setLieu(event.target.value)}
              className={inputClassName}
              placeholder="Ex: Stade Sylvio Cator"
            />
          </div>

          {type === "live_diffusion" && (
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                Lien YouTube (Live)
              </label>
              <input
                value={youtubeUrl}
                onChange={(event) => setYoutubeUrl(event.target.value)}
                className={inputClassName}
                placeholder="https://youtube.com/live/..."
              />
            </div>
          )}

          {type === "live_diffusion" && (
            <div className="md:col-span-2 xl:col-span-3 border-t border-gray-100 dark:border-gray-800 pt-4 mt-2">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-semibold text-gray-800 dark:text-white/90">Configuration du Match</h4>
                <button 
                  type="button" 
                  onClick={openModal}
                  className="text-xs font-medium text-brand-500 hover:text-brand-600 underline"
                >
                  + Créer une équipe manquante
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                    Équipe Domicile
                  </label>
                  <div className="flex items-center gap-3">
                    <select
                      value={homeTeamId}
                      onChange={(e) => setHomeTeamId(e.target.value)}
                      className={selectClassName}
                    >
                      <option value="">Sélectionner une équipe</option>
                      {teams.map(t => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                    {selectedHomeTeam && (
                      <img src={selectedHomeTeam.logo_url} className="h-10 w-10 object-contain rounded border border-gray-200" alt="logo" />
                    )}
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                    Équipe Extérieur
                  </label>
                  <div className="flex items-center gap-3">
                    <select
                      value={awayTeamId}
                      onChange={(e) => setAwayTeamId(e.target.value)}
                      className={selectClassName}
                    >
                      <option value="">Sélectionner une équipe</option>
                      {teams.map(t => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                    {selectedAwayTeam && (
                      <img src={selectedAwayTeam.logo_url} className="h-10 w-10 object-contain rounded border border-gray-200" alt="logo" />
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {type === "live_diffusion" && (
            <div className="md:col-span-2 xl:col-span-3">
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                Participants (uniquement pour le Live)
              </label>
              <select
                multiple
                value={participants}
                onChange={(event) =>
                  setParticipants(
                    Array.from(event.target.selectedOptions).map(
                      (option) => option.value,
                    ),
                  )
                }
                className="min-h-36 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
              >
                {players.map((player) => (
                  <option key={player.id} value={player.id}>
                    {getPlayerFullName(player)}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {submitError ? (
          <div className="mt-6 rounded-xl border border-error-200 bg-error-50 px-4 py-3 text-sm text-error-700 dark:border-error-900/40 dark:bg-error-900/10 dark:text-error-300">
            {submitError}
          </div>
        ) : null}

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => router.push("/evenements")}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-white/[0.03]"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600"
          >
            Enregistrer
          </button>
        </div>
      </div>

      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[500px] p-6">
        <div className="space-y-4">
          <h3 className="text-lg font-bold">Créer une nouvelle équipe</h3>
          <div>
            <label className="block text-sm font-medium mb-1">Nom de l&apos;équipe</label>
            <input 
              value={newTeamName}
              onChange={e => setNewTeamName(e.target.value)}
              className={inputClassName}
              placeholder="Ex: Tempête FC"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">URL du Logo (Optionnel)</label>
            <input 
              value={newTeamLogo}
              onChange={e => setNewTeamLogo(e.target.value)}
              className={inputClassName}
              placeholder="https://... ou laissez vide pour FC Toro logo"
            />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <button onClick={closeModal} className="px-4 py-2 text-sm">Annuler</button>
            <button 
              onClick={handleCreateTeam} 
              disabled={creatingTeam || !newTeamName}
              className="px-4 py-2 bg-brand-500 text-white rounded-lg text-sm disabled:opacity-50"
            >
              {creatingTeam ? "Création..." : "Enregistrer l'équipe"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}


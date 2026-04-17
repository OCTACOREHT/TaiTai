"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { SectionCard, cn } from "@/components/common/CmsShared";

interface Match {
  id: string;
  round: string;
  home_team_id: string;
  away_team_id: string;
  home_score: number | null;
  away_score: number | null;
  status: "scheduled" | "finished";
  kickoff: string;
  home_team?: any;
  away_team?: any;
}

export default function TournamentPage() {
  const params = useParams();
  const router = useRouter();
  const tournamentId = params.id as string;

  const [selectedTab, setSelectedTab] = useState("poules");
  const [tournament, setTournament] = useState<any>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [standings, setStandings] = useState<any[]>([]);
  const [scorers, setScorers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Match Scoring State
  const [editingMatch, setEditingMatch] = useState<Match | null>(null);
  const [scoreForm, setScoreForm] = useState({ home: 0, away: 0 });
  const [matchScorers, setMatchScorers] = useState<{ playerName: string; teamName: string; goals: number }[]>([]);
  const [newScorer, setNewScorer] = useState({ name: "", team: "", goals: 1 });

  useEffect(() => {
    fetchData();
  }, [tournamentId]);

  const fetchData = async () => {
    try {
      const [tourRes, matchRes, standingsRes, scorersRes] = await Promise.all([
        fetch(`/api/tournaments/${tournamentId}`),
        fetch(`/api/tournaments/${tournamentId}/matches`),
        fetch(`/api/tournaments/${tournamentId}/standings`),
        fetch(`/api/tournaments/${tournamentId}/scorers`)
      ]);

      const [tour, matchesData, stand, scor] = await Promise.all([
        tourRes.json(),
        matchRes.json(),
        standingsRes.json(),
        scorersRes.json()
      ]);

      setTournament(tour.data);
      setMatches(matchesData.data || []);
      
      // Flatten standings (API returns { category: [standings] })
      const cat = tour.data?.age_category || "U9";
      setStandings(stand.data?.[cat] || []);
      setScorers(scor.data || []);
    } catch (error) {
      console.error("Erreur:", error);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSaveScore = async () => {
    if (!editingMatch) return;
    try {
      setLoading(true);
      
      // AUTO-ADD: Si l'utilisateur a rempli un nom mais oublié de cliquer sur "+"
      const finalScorers = [...matchScorers];
      if (newScorer.name && newScorer.team) {
        finalScorers.push({
          playerName: newScorer.name,
          teamName: newScorer.team,
          goals: newScorer.goals
        });
      }

      const res = await fetch(`/api/tournaments/${tournamentId}/matches`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          matchId: editingMatch.id,
          homeScore: scoreForm.home,
          awayScore: scoreForm.away,
          scorers: finalScorers
        }),
      });

      if (res.ok) {
        showToast("Score enregistré !");
        setEditingMatch(null);
        await fetchData(); // Refresh everything (new standings, potential semi-finals)
      }
    } catch (err) {
      showToast("Erreur lors de la sauvegarde", "error");
    } finally {
      setLoading(false);
    }
  };

  const addScorer = () => {
    if (!newScorer.name || !newScorer.team) return;
    setMatchScorers([...matchScorers, { playerName: newScorer.name, teamName: newScorer.team, goals: newScorer.goals }]);
    setNewScorer({ ...newScorer, name: "", goals: 1 });
  };

  if (loading && !tournament) return <div className="p-20 text-center animate-pulse text-gray-400">Initialisation de l'arène...</div>;

  const groupA = standings.filter(s => s.groupName === 'A' || s.group_name === 'A');
  const groupB = standings.filter(s => s.groupName === 'B' || s.group_name === 'B');
  
  const groupMatches = matches.filter(m => m.round.includes("Groupe"));
  const semiFinals = matches.filter(m => m.round.includes("Demi-finale"));
  const finals = matches.filter(m => m.round.includes("Finale") && !m.round.includes("Demi"));

  return (
    <div className="space-y-8 relative pb-20">
      {toast && (
        <div className={cn(
          "fixed top-6 left-1/2 -translate-x-1/2 z-[500] flex items-center gap-4 rounded-3xl px-8 py-4 shadow-[0_20px_50px_rgba(0,0,0,0.3)] animate-in fade-in slide-in-from-top-10 duration-500",
          toast.type === "success" ? "bg-teal-500 text-white" : "bg-red-600 text-white"
        )}>
          <div className="text-2xl animate-bounce">🏆</div>
          <span className="text-lg font-black uppercase tracking-widest">{toast.message}</span>
        </div>
      )}

      <PageBreadCrumb pageTitle={tournament?.name || "Détails du tournoi"} />

      {/* Header Statut */}
      <div className="bg-white dark:bg-white/[0.03] p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-wrap items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-brand-500/10 rounded-2xl flex items-center justify-center">
             <span className="text-2xl font-black text-brand-500">{tournament?.age_category}</span>
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">{tournament?.name}</h1>
            <p className="text-sm text-gray-500 font-medium">Saison {tournament?.season} • {tournament?.status === 'in_progress' ? 'En cours' : tournament?.status === 'completed' ? 'Terminé' : 'Préparation'}</p>
          </div>
        </div>
        
        <div className="flex bg-gray-100 dark:bg-white/5 p-1 rounded-2xl">
          {["poules", "matchs", "buteurs", "phases"].map((tab) => (
            <button
              key={tab}
              onClick={() => setSelectedTab(tab)}
              className={cn(
                "px-6 py-2.5 rounded-xl text-sm font-bold transition-all uppercase tracking-widest",
                selectedTab === tab 
                  ? "bg-white dark:bg-white/10 text-brand-500 shadow-sm" 
                  : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              )}
            >
              {tab === 'phases' ? 'Bracket' : tab}
            </button>
          ))}
        </div>
      </div>

      {/* TABS CONTENT */}
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        {selectedTab === "poules" && (
          <div className="grid lg:grid-cols-2 gap-8">
            <RankingTable title="Poule A" teams={groupA} />
            <RankingTable title="Poule B" teams={groupB} />
          </div>
        )}

        {selectedTab === "matchs" && (
          <div className="space-y-6">
             <SectionCard title="Matchs de Poule" description="Saisie des scores en direct.">
                <div className="grid gap-4">
                   {groupMatches.length === 0 ? <p className="text-gray-400 py-10 text-center">Aucun match programmé.</p> : 
                    groupMatches.map(m => <MatchRow key={m.id} match={m} onEdit={() => {
                        setEditingMatch(m);
                        setScoreForm({ home: m.home_score || 0, away: m.away_score || 0 });
                        setMatchScorers([]);
                        setNewScorer({ name: "", team: m.home_team?.name || "", goals: 1 });
                    }} />)
                   }
                </div>
             </SectionCard>
          </div>
        )}

        {selectedTab === "buteurs" && (
           <SectionCard title="Classement des Buteurs" description="Les gâchettes du tournoi.">
              <div className="overflow-x-auto">
                 <table className="w-full">
                    <thead>
                       <tr className="border-b border-gray-100 dark:border-gray-800 text-left">
                          <th className="py-4 px-4 text-xs font-black uppercase text-gray-400">#</th>
                          <th className="py-4 px-4 text-xs font-black uppercase text-gray-400">Joueur</th>
                          <th className="py-4 px-4 text-xs font-black uppercase text-gray-400">Équipe</th>
                          <th className="py-4 px-4 text-xs font-black uppercase text-gray-400 text-right">Buts</th>
                       </tr>
                    </thead>
                    <tbody>
                        {(() => {
                            const statsMap = new Map();
                            // Assurer que scorers est bien un tableau
                            const rawScorers = Array.isArray(scorers) ? scorers : [];
                            
                            rawScorers.forEach(s => {
                                // On gère le cas où le champ s'appelle player_name (snake_case)
                                const pName = s.player_name || s.playerName || "Inconnu";
                                const tName = s.team_name || s.teamName || "Inconnu";
                                const gCount = Number(s.goals) || 0;
                                
                                const key = `${pName}-${tName}`;
                                if (!statsMap.has(key)) statsMap.set(key, { name: pName, team: tName, goals: 0 });
                                statsMap.get(key).goals += gCount;
                            });

                            const result = Array.from(statsMap.values())
                                .filter(s => s.goals > 0)
                                .sort((a,b) => b.goals - a.goals);
                            
                            if (result.length === 0) return (
                               <tr><td colSpan={4} className="py-10 text-center text-gray-400 italic">Aucun buteur enregistré pour le moment.</td></tr>
                            );

                            return result.map((s, i) => (
                           <tr key={i} className="border-b border-gray-50 dark:border-gray-800/50 hover:bg-brand-500/5 transition-all duration-300">
                              <td className="py-5 px-6 font-black text-gray-300">
                                 <span className={cn(
                                   "w-8 h-8 rounded-full flex items-center justify-center text-xs",
                                   i === 0 ? "bg-yellow-500 text-white shadow-lg shadow-yellow-500/30" : ""
                                 )}>{i + 1}</span>
                              </td>
                              <td className="py-5 px-6 font-bold text-gray-900 dark:text-white uppercase tracking-tight">{s.name}</td>
                              <td className="py-5 px-6 text-sm font-medium text-gray-500 italic">{s.team}</td>
                              <td className="py-5 px-6 text-right font-black text-brand-500 text-2xl animate-in zoom-in-50 duration-500">{s.goals}</td>
                           </tr>
                        ));
                        })()}
                    </tbody>
                 </table>
              </div>
           </SectionCard>
        )}

        {selectedTab === "phases" && (
          <div className="space-y-12">
            <SectionCard title="Demi-Finales" description="Généré automatiquement dès la fin des poules.">
               <div className="grid md:grid-cols-2 gap-6">
                  {semiFinals.length === 0 ? <p className="text-gray-400 py-10 text-center">En attente des résultats de poules...</p> : 
                   semiFinals.map(m => <MatchRow key={m.id} match={m} onEdit={() => {
                        setEditingMatch(m);
                        setScoreForm({ home: m.home_score || 0, away: m.away_score || 0 });
                   }} />)}
               </div>
            </SectionCard>
            <SectionCard title="La Grande Finale" description="Le sommet du tournoi.">
                <div className="max-w-xl mx-auto">
                   {finals.length === 0 ? <p className="text-gray-400 py-10 text-center">La finale n'est pas encore programmé.</p> : 
                    finals.map(m => <MatchRow key={m.id} match={m} onEdit={() => {
                        setEditingMatch(m);
                        setScoreForm({ home: m.home_score || 0, away: m.away_score || 0 });
                    }} />)}
                </div>
            </SectionCard>
          </div>
        )}
      </div>

      {/* Modal Score Entry (Simple Overlay) */}
      {editingMatch && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-gray-900/80 backdrop-blur-sm animate-in fade-in duration-300">
           <div className="bg-white dark:bg-gray-900 w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
              <div className="p-8 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                 <h2 className="text-xl font-black uppercase tracking-widest text-gray-900 dark:text-white">Saisie du Score</h2>
                 <button onClick={() => setEditingMatch(null)} className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center font-bold">×</button>
              </div>
              <div className="p-8 space-y-8">
                 <div className="flex items-center justify-around gap-4 text-center">
                    <div className="flex-1">
                       <img src={editingMatch.home_team?.logo_url || "/images/logo/fc-toro.png"} className="w-20 h-20 mx-auto bg-gray-50 p-2 rounded-2xl object-contain mb-4" />
                       <p className="font-black uppercase text-sm tracking-tight line-clamp-1">{editingMatch.home_team?.name}</p>
                       <input 
                         type="number" 
                         value={scoreForm.home} 
                         onChange={e => setScoreForm({...scoreForm, home: parseInt(e.target.value) || 0})}
                         className="mt-4 w-20 h-20 bg-gray-50 dark:bg-white/5 border-none rounded-[2rem] text-3xl font-black text-center focus:ring-4 focus:ring-brand-500/20"
                       />
                    </div>
                    <div className="text-4xl font-black text-gray-300">VS</div>
                    <div className="flex-1">
                       <img src={editingMatch.away_team?.logo_url || "/images/logo/fc-toro.png"} className="w-20 h-20 mx-auto bg-gray-50 p-2 rounded-2xl object-contain mb-4" />
                       <p className="font-black uppercase text-sm tracking-tight line-clamp-1">{editingMatch.away_team?.name}</p>
                       <input 
                         type="number" 
                         value={scoreForm.away} 
                         onChange={e => setScoreForm({...scoreForm, away: parseInt(e.target.value) || 0})}
                         className="mt-4 w-20 h-20 bg-gray-50 dark:bg-white/5 border-none rounded-[2rem] text-3xl font-black text-center focus:ring-4 focus:ring-brand-500/20"
                       />
                    </div>
                 </div>

                 {/* Match Scorers Inline form */}
                 <div className="pt-8 border-t border-gray-100 dark:border-gray-800">
                    <h3 className="text-xs font-black uppercase text-gray-400 mb-4 tracking-widest">Buteurs du match</h3>
                    <div className="flex gap-2 mb-4">
                       <input 
                         placeholder="Nom du joueur"
                         value={newScorer.name}
                         onChange={e => setNewScorer({...newScorer, name: e.target.value})}
                         className="flex-1 bg-gray-50 dark:bg-white/5 border-none rounded-xl px-4 py-3 text-sm"
                       />
                       <select 
                         value={newScorer.team}
                         onChange={e => setNewScorer({...newScorer, team: e.target.value})}
                         className="flex-1 bg-gray-50 dark:bg-white/5 border-none rounded-xl px-4 py-3 text-sm"
                       >
                          <option value={editingMatch.home_team?.name}>{editingMatch.home_team?.name}</option>
                          <option value={editingMatch.away_team?.name}>{editingMatch.away_team?.name}</option>
                       </select>
                       <input 
                         type="number"
                         min="1"
                         value={newScorer.goals}
                         onChange={e => setNewScorer({...newScorer, goals: parseInt(e.target.value) || 1})}
                         className="w-16 bg-gray-50 dark:bg-white/5 border-none rounded-xl px-2 py-3 text-sm text-center font-bold"
                       />
                       <button onClick={addScorer} className="bg-brand-500 text-white w-12 rounded-xl font-bold transition-transform active:scale-95">+</button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                       {matchScorers.map((s, i) => (
                          <div key={i} className="bg-gray-100 dark:bg-white/5 px-4 py-2 rounded-full text-[10px] font-black uppercase border border-gray-200 dark:border-white/10 flex items-center gap-2">
                             {s.playerName} ({s.teamName})
                             <button onClick={() => setMatchScorers(matchScorers.filter((_, idx) => idx !== i))} className="text-red-500">×</button>
                          </div>
                       ))}
                    </div>
                 </div>

                 <button 
                  onClick={handleSaveScore}
                  disabled={loading}
                  className="w-full py-5 bg-brand-500 text-white rounded-3xl font-black uppercase tracking-widest shadow-xl shadow-brand-500/30 hover:bg-brand-600 transition-all disabled:opacity-50"
                 >
                    {loading ? "Enregistrement..." : "Valider le résultat et les buteurs"}
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}

function RankingTable({ title, teams }: { title: string, teams: any[] }) {
   return (
      <div className="bg-white dark:bg-white/[0.03] rounded-[40px] border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm">
         <div className="p-8 border-b border-gray-50 dark:border-gray-800">
            <h3 className="text-xl font-black uppercase tracking-widest text-gray-900 dark:text-white flex items-center gap-3">
               <span className="w-2 h-8 bg-brand-500 rounded-full"></span>
               {title}
            </h3>
         </div>
         <div className="overflow-x-auto">
            <table className="w-full text-left">
               <thead>
                  <tr className="bg-gray-50/50 dark:bg-white/[0.01]">
                     <th className="py-4 px-6 text-[10px] font-black uppercase text-gray-400">#</th>
                     <th className="py-4 px-6 text-[10px] font-black uppercase text-gray-400">Équipe</th>
                     <th className="py-4 px-2 text-[10px] font-black uppercase text-gray-400 text-center">J</th>
                     <th className="py-4 px-2 text-[10px] font-black uppercase text-gray-400 text-center text-brand-500">Pts</th>
                     <th className="py-4 px-2 text-[10px] font-black uppercase text-gray-400 text-center">+/-</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
                  {teams.length === 0 ? <tr><td colSpan={5} className="py-10 text-center text-gray-400 italic">En attente des premiers tirs...</td></tr> : 
                   teams.map((t, i) => (
                    <tr key={t.teamId} className="group hover:bg-gray-50 dark:hover:bg-brand-500/5 transition-colors">
                       <td className="py-5 px-6 font-black text-gray-300 group-hover:text-brand-500">{i + 1}</td>
                       <td className="py-5 px-6">
                          <div className="flex items-center gap-4">
                             <img src={t.teamLogo || "/images/logo/fc-toro.png"} className="w-8 h-8 rounded-lg bg-gray-50 p-1 object-contain" />
                             <span className="font-bold text-gray-900 dark:text-white uppercase tracking-tight line-clamp-1">{t.teamName}</span>
                          </div>
                       </td>
                       <td className="py-5 px-2 text-center font-bold">{t.played}</td>
                       <td className="py-5 px-2 text-center font-black text-xl text-brand-500">{t.points}</td>
                       <td className="py-5 px-2 text-center font-bold text-gray-400">{t.goalDifference > 0 ? `+${t.goalDifference}` : t.goalDifference}</td>
                    </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>
   );
}

function MatchRow({ match, onEdit }: { match: Match, onEdit: () => void }) {
   const isFinished = match.status === 'finished';
   const homeWin = isFinished && (match.home_score || 0) > (match.away_score || 0);
   const awayWin = isFinished && (match.away_score || 0) > (match.home_score || 0);

   return (
      <div className={cn(
        "bg-white dark:bg-white/[0.02] border border-gray-100 dark:border-gray-800 rounded-3xl p-5 flex items-center justify-between gap-6 hover:shadow-xl transition-all group overflow-hidden relative",
        isFinished && "border-brand-500/20"
      )}>
         {isFinished && <div className="absolute top-0 left-0 w-1 h-full bg-brand-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />}
         
         <div className="hidden sm:block flex-1 max-w-[120px]">
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 block border-b border-gray-50 dark:border-gray-800 pb-1 mb-1 opacity-50">{match.round.split('-')[1] || match.round}</span>
            <span className="text-xs font-bold text-gray-400 tracking-tighter">{new Date(match.kickoff).toLocaleTimeString("fr-FR", { hour: '2-digit', minute: '2-digit' })}</span>
         </div>

         <div className="flex-[3] flex items-center justify-end gap-5 text-right relative">
            {homeWin && <span className="absolute -top-4 right-0 text-[10px] font-black text-teal-500 animate-bounce tracking-widest">🏆 WINNER</span>}
            <span className={cn("font-black uppercase tracking-tight text-sm line-clamp-1 transition-all", homeWin ? "text-brand-500 scale-105" : "text-gray-900 dark:text-white")}>{match.home_team?.name}</span>
            <img src={match.home_team?.logo_url || "/images/logo/fc-toro.png"} className={cn("w-12 h-12 rounded-2xl bg-gray-50 p-2 object-contain transition-transform", homeWin && "scale-110 shadow-lg")} />
         </div>

         <div className="flex-1 min-w-[100px] text-center z-10">
            {isFinished ? (
              <div className="bg-brand-500 text-white rounded-2xl py-3 px-5 shadow-xl shadow-brand-500/30 scale-110 animate-in zoom-in-90 duration-500">
                 <span className="text-3xl font-black italic tracking-tighter">{match.home_score} - {match.away_score}</span>
              </div>
            ) : (
              <button 
               onClick={onEdit} 
               className="w-full bg-gray-100 dark:bg-white/5 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-500 hover:bg-brand-500 hover:text-white hover:scale-105 transition-all shadow-inner"
              >
                 Saisir
              </button>
            )}
         </div>

         <div className="flex-[3] flex items-center gap-5 text-left relative">
            <img src={match.away_team?.logo_url || "/images/logo/fc-toro.png"} className={cn("w-12 h-12 rounded-2xl bg-gray-50 p-2 object-contain transition-transform", awayWin && "scale-110 shadow-lg")} />
            <span className={cn("font-black uppercase tracking-tight text-sm line-clamp-1 transition-all", awayWin ? "text-brand-500 scale-105" : "text-gray-900 dark:text-white")}>{match.away_team?.name}</span>
            {awayWin && <span className="absolute -top-4 left-0 text-[10px] font-black text-teal-500 animate-bounce tracking-widest">🏆 WINNER</span>}
         </div>
      </div>
   );
}

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { SectionCard, cn } from "@/components/common/CmsShared";
import { useCms } from "@/context/CmsContext";
import Loader from "@/components/common/Loader";

interface TournamentItem {
  id: string;
  name: string;
  description?: string;
  startDate: string;
  status: "preparation" | "in_progress" | "completed";
  isPublished: boolean;
  ageCategory: string;
}

export default function FlagDayPage() {
  const { currentUser } = useCms();
  const [tournaments, setTournaments] = useState<TournamentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [tournamentToDelete, setTournamentToDelete] = useState<{id: string, name: string} | null>(null);

  useEffect(() => {
    fetchTournaments();
  }, []);

  const fetchTournaments = async () => {
    try {
      const response = await fetch("/api/tournaments");
      const data = await response.json();
      
      const transformed = (data.data || []).map((comp: any) => ({
        id: comp.id,
        name: comp.name,
        description: comp.description,
        startDate: comp.created_at,
        status: comp.status,
        isPublished: comp.is_published,
        ageCategory: comp.age_category,
      }));
      
      setTournaments(transformed);
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

  const togglePublication = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/tournaments/${id}`, {
        method: "PUT", // Utilise le endpoint PUT générique
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_published: !currentStatus }),
      });

      if (res.ok) {
        setTournaments(tournaments.map(t => t.id === id ? { ...t, isPublished: !currentStatus } : t));
        showToast(!currentStatus ? "Compétition publiée sur le site !" : "Compétition retirée du site.");
      }
    } catch (err) {
      showToast("Erreur lors de la mise à jour", "error");
    }
  };

  const handleDelete = async () => {
    if (!tournamentToDelete) return;

    try {
      setLoading(true);
      const res = await fetch(`/api/tournaments/${tournamentToDelete.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setTournaments(tournaments.filter(t => t.id !== tournamentToDelete.id));
        showToast("Le tournoi a été supprimé avec succès.");
      } else {
        showToast("Erreur lors de la suppression.", "error");
      }
    } catch (err) {
      showToast("Erreur réseau.", "error");
    } finally {
      setLoading(false);
      setIsDeleteModalOpen(false);
      setTournamentToDelete(null);
    }
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case "preparation":
        return { label: "En préparation", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" };
      case "in_progress":
        return { label: "En cours", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" };
      case "completed":
        return { label: "Terminé", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" };
      default:
        return { label: status, color: "bg-gray-100 text-gray-700" };
    }
  };

  return (
    <div className="space-y-8 relative">
      {/* Toast Notification */}
      {toast && (
        <div className={cn(
          "fixed top-6 right-6 z-50 flex items-center gap-3 rounded-xl px-6 py-4 shadow-2xl animate-in slide-in-from-right-full transition-all duration-300",
          toast.type === "success" ? "bg-green-600 text-white" : "bg-red-600 text-white"
        )}>
          <span className="text-sm font-bold tracking-wide uppercase">{toast.message}</span>
        </div>
      )}

      <PageBreadCrumb pageTitle="Flag Day - Gestion Premium" />

      <div className="flex items-center justify-between bg-white dark:bg-white/[0.03] p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Championnats <span className="text-brand-500">Flag Day</span>
          </h2>
          <p className="mt-1 text-gray-500 dark:text-gray-400">Gérez l'excellence sportive en temps réel.</p>
        </div>
        <Link
          href="/club/flag-day/nouveau"
          className="group relative inline-flex items-center justify-center overflow-hidden rounded-2xl bg-brand-500 px-8 py-3.5 font-bold text-white transition-all hover:bg-brand-600 hover:shadow-xl hover:shadow-brand-500/20 active:scale-95"
        >
          <span className="relative flex items-center gap-2">
            <span>Nouveau Tournoi</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:translate-x-1"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
          </span>
        </Link>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {loading ? (
          <div className="col-span-full py-16 flex flex-col items-center justify-center gap-4 bg-white/5 rounded-3xl border border-white/10">
            <Loader />
            <p className="text-sm font-medium text-gray-400">Récupération des tournois Flag Day...</p>
          </div>
        ) : tournaments.length === 0 ? (
          <div className="col-span-full py-20 text-center bg-gray-50 dark:bg-white/[0.02] rounded-3xl border-2 border-dashed border-gray-100 dark:border-gray-800">
            <p className="text-lg text-gray-400 font-medium">Aucun tournoi disponible. Créez votre première compétition !</p>
          </div>
        ) : (
          tournaments.map((tournament) => {
            const statusInfo = getStatusInfo(tournament.status);
            return (
              <div
                key={tournament.id}
                className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:border-brand-500/30 hover:shadow-2xl hover:shadow-brand-500/5 dark:border-gray-800 dark:bg-white/[0.03] dark:hover:border-brand-500/20"
              >
                {/* Bouton de suppression permanent et visible */}
                {/* Bouton de suppression - Uniquement pour Super Admin */}
                {currentUser?.role === "super_admin" && (
                  <button
                    onClick={() => {
                      setTournamentToDelete({ id: tournament.id, name: tournament.name });
                      setIsDeleteModalOpen(true);
                    }}
                    className="absolute top-4 right-4 z-10 p-2.5 text-red-500 bg-red-50 dark:bg-red-500/10 hover:bg-red-500 hover:text-white rounded-2xl transition-all shadow-sm border border-red-200 dark:border-red-500/20 active:scale-90"
                    title="Supprimer la compétition"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                  </button>
                )}

                <div>
                  <div className="flex items-center justify-between gap-4">
                    <span className={cn("inline-flex items-center rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest", statusInfo.color)}>
                      {statusInfo.label}
                    </span>
                    <span className="text-xs font-bold text-gray-400 bg-gray-50 dark:bg-white/5 px-3 py-1 rounded-full uppercase">
                      {tournament.ageCategory || "Global"}
                    </span>
                  </div>
                  
                  <h3 className="mt-6 text-xl font-bold leading-tight text-gray-900 dark:text-white group-hover:text-brand-500 transition-colors">
                    {tournament.name}
                  </h3>
                  <p className="mt-2 line-clamp-2 text-sm text-gray-500 dark:text-gray-400">
                    {tournament.description || "Aucune description fournie."}
                  </p>
                </div>

                <div className="mt-8 space-y-4 pt-6 border-t border-gray-50 dark:border-gray-800">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase text-gray-400">Publication</span>
                    <button
                      onClick={() => togglePublication(tournament.id, tournament.isPublished)}
                      className={cn(
                        "relative h-6 w-11 rounded-full transition-all duration-300 focus:outline-none",
                        tournament.isPublished ? "bg-green-500" : "bg-gray-200 dark:bg-gray-700"
                      )}
                    >
                      <span className={cn(
                        "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-all duration-300",
                        tournament.isPublished ? "left-[22px]" : "left-0.5"
                      )} />
                    </button>
                  </div>

                  <Link
                    href={`/club/flag-day/${tournament.id}`}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-gray-50 py-3 text-sm font-bold text-gray-900 transition-all hover:bg-gray-900 hover:text-white dark:bg-white/5 dark:text-white dark:hover:bg-brand-500"
                  >
                    Gérer la compétition
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M7 7h10v10"/><path d="M7 17 17 7"/></svg>
                  </Link>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* MODALE DE CONFIRMATION DE SUPPRESSION PREMIUM */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[600] flex items-center justify-center p-6 bg-gray-950/90 backdrop-blur-md animate-in fade-in duration-300">
           <div className="bg-white dark:bg-gray-900 w-full max-w-sm rounded-[40px] shadow-[0_0_80px_rgba(239,68,68,0.2)] overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-10 duration-500 border border-red-500/20">
              <div className="p-8 text-center space-y-6">
                 <div className="w-20 h-20 bg-red-100 dark:bg-red-500/10 rounded-3xl flex items-center justify-center mx-auto mb-2 animate-pulse">
                    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                 </div>
                 
                 <div>
                    <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Supprimer ?</h2>
                    <p className="mt-2 text-sm text-gray-500 font-medium">
                       Voulez-vous vraiment effacer <span className="text-red-500 font-bold">"{tournamentToDelete?.name}"</span> ? 
                       <br/>Cette action est irréversible.
                    </p>
                 </div>

                 <div className="flex flex-col gap-3">
                    <button 
                      onClick={handleDelete}
                      disabled={loading}
                      className="w-full py-4 bg-red-500 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-red-500/30 hover:bg-red-600 hover:-translate-y-0.5 transition-all disabled:opacity-50"
                    >
                       {loading ? "Suppression..." : "Confirmer la suppression"}
                    </button>
                    <button 
                      onClick={() => {
                        setIsDeleteModalOpen(false);
                        setTournamentToDelete(null);
                      }}
                      className="w-full py-4 text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest text-xs hover:text-gray-900 dark:hover:text-white transition-colors"
                    >
                       Annuler
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}

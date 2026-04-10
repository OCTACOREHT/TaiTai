"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { SectionCard } from "@/components/common/CmsShared";

interface TournamentItem {
  id: string;
  name: string;
  description?: string;
  startDate: string;
  status: "draft" | "active" | "completed";
  categories: string[];
}

export default function FlagDayPage() {
  const [tournaments, setTournaments] = useState<TournamentItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        const response = await fetch("/api/tournaments");
        const data = await response.json();
        
        // Transformer les données Supabase au format attendu
        const transformed = (data.data || []).map((comp: any) => ({
          id: comp.id,
          name: comp.name,
          description: comp.description,
          startDate: comp.date_creation,
          status: comp.active ? "active" : "draft",
          categories: [], // À charger séparément si besoin
        }));
        
        setTournaments(transformed);
      } catch (error) {
        console.error("Erreur:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTournaments();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft":
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "completed":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      default:
        return "";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "draft":
        return "Brouillon";
      case "active":
        return "En cours";
      case "completed":
        return "Terminé";
      default:
        return status;
    }
  };

  return (
    <div className="space-y-6">
      <PageBreadCrumb pageTitle="Flag Day - Championnats" />

      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Gestion des Championnats
        </h2>
        <Link
          href="/club/flag-day/nouveau"
          className="rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600"
        >
          Nouveau Championnat
        </Link>
      </div>

      <SectionCard title="Championnats" description="Gérez vos championnats et tournois">
        {loading ? (
          <div className="text-center py-8 text-gray-500">Chargement...</div>
        ) : tournaments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Aucun championnat créé. Commencez par en créer un !
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">
                    Nom
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">
                    Catégories
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">
                    Date de début
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">
                    Statut
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {tournaments.map((tournament) => (
                  <tr
                    key={tournament.id}
                    className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  >
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900 dark:text-white">
                        {tournament.name}
                      </div>
                      {tournament.description && (
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {tournament.description}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {tournament.categories?.join(", ") || "-"}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {new Date(tournament.startDate).toLocaleDateString("fr-FR")}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(
                          tournament.status,
                        )}`}
                      >
                        {getStatusLabel(tournament.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/club/flag-day/${tournament.id}`}
                        className="text-brand-600 hover:text-brand-700 text-sm font-medium dark:text-brand-400"
                      >
                        Gérer
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>
    </div>
  );
}

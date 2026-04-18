"use client";

import { SectionCard, StatusBadge, formatDate, formatNumber } from "@/components/common/CmsShared";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { getAdminToken } from "@/lib/admin-auth";
import { fetchAdminJson, mapDbStage } from "@/lib/cms-admin-client";
import { CmsStage } from "@/types/cms";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import Loader from "@/components/common/Loader";

export default function StagesPage() {
  const [stages, setStages] = useState<CmsStage[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const payload = await fetchAdminJson("/api/admin/stages");
        setStages(Array.isArray(payload.data) ? payload.data.map(mapDbStage) : []);
      } catch (error) {
        console.error("[StagesPage] chargement impossible", error);
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, []);

  const filteredStages = useMemo(() => {
    return stages.filter((stage) => {
      const matchesSearch =
        stage.title.toLowerCase().includes(search.toLowerCase()) ||
        stage.department.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "all" || stage.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [search, stages, statusFilter]);

  return (
    <div className="space-y-6">
      <PageBreadCrumb pageTitle="Stages" />

      <SectionCard
        title="Offres de stage"
        description="Publiez, ajustez ou cloturez vos opportunites."
        actions={
          <Link
            href="/stages/nouveau"
            className="rounded-lg bg-brand-500 px-4 py-3 text-sm font-medium text-white transition hover:bg-brand-600"
          >
            Nouveau stage
          </Link>
        }
      >
        <div className="grid gap-4 lg:grid-cols-[1fr_220px]">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Rechercher par titre ou departement"
            className="h-11 rounded-lg border border-gray-300 bg-white px-4 text-sm text-gray-900 shadow-theme-xs outline-hidden transition focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
          />
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="h-11 rounded-lg border border-gray-300 bg-white px-4 text-sm text-gray-900 shadow-theme-xs outline-hidden transition focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
          >
            <option value="all">Tous les statuts</option>
            <option value="draft">Draft</option>
            <option value="review">Review</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
        </div>

        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="text-xs uppercase tracking-[0.16em] text-gray-500">
              <tr>
                <th className="pb-3">Stage</th>
                <th className="pb-3">Format</th>
                <th className="pb-3">Statut</th>
                <th className="pb-3">Cloture</th>
                <th className="pb-3 text-right">Tracking</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12">
                     <div className="flex flex-col items-center justify-center gap-4">
                        <Loader />
                        <p className="text-sm font-medium text-gray-400">Récupération des stages disponibles...</p>
                     </div>
                  </td>
                </tr>
              ) : filteredStages.map((stage) => (
                <tr key={stage.id}>
                  <td className="py-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={stage.coverImage || "/images/cards/card-01.jpg"}
                        alt={stage.title}
                        className="h-14 w-20 rounded-xl object-cover"
                      />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white/90">{stage.title}</p>
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          {stage.department} - {stage.location}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 text-gray-500 dark:text-gray-400">{stage.workMode}</td>
                  <td className="py-4">
                    <StatusBadge value={stage.status} />
                  </td>
                  <td className="py-4 text-gray-500 dark:text-gray-400">
                    {stage.closeDate || formatDate(stage.updatedAt)}
                  </td>
                  <td className="py-4 text-right text-gray-500 dark:text-gray-400">
                    <div>{formatNumber(stage.metrics.views)} vues</div>
                    <div className="text-xs">{formatNumber(stage.metrics.applications)} candidatures</div>
                  </td>
                  <td className="py-4">
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`/stages/${stage.id}/modifier`}
                        className="rounded-lg border border-gray-300 px-3 py-2 text-xs font-semibold text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                      >
                        Modifier
                      </Link>
                      <button
                        type="button"
                        onClick={async () => {
                          const token = getAdminToken();
                          if (!token) {
                            return;
                          }
                          const response = await fetch(`/api/admin/stages/${stage.id}`, {
                            method: "DELETE",
                            headers: { Authorization: `Bearer ${token}` },
                          });
                          if (!response.ok) {
                            return;
                          }
                          setStages((prev) => prev.filter((item) => item.id !== stage.id));
                        }}
                        className="rounded-lg border border-error-300 px-3 py-2 text-xs font-semibold text-error-700 transition hover:bg-error-50 dark:border-error-900/40 dark:text-error-300 dark:hover:bg-error-900/10"
                      >
                        Supprimer
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}

"use client";

import { SectionCard, StatusBadge, formatDate, formatNumber } from "@/components/common/CmsShared";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { getAdminToken } from "@/lib/admin-auth";
import { fetchAdminJson, mapDbArticle, mapDbUser } from "@/lib/cms-admin-client";
import { CmsArticle, CmsUser } from "@/types/cms";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

export default function ArticlesPage() {
  const [articles, setArticles] = useState<CmsArticle[]>([]);
  const [users, setUsers] = useState<CmsUser[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    const load = async () => {
      try {
        const [articlesPayload, usersPayload] = await Promise.all([
          fetchAdminJson("/api/admin/articles?limit=100"),
          fetchAdminJson("/api/admin/users"),
        ]);
        setArticles(
          Array.isArray(articlesPayload.data)
            ? articlesPayload.data.map(mapDbArticle)
            : [],
        );
        setUsers(
          Array.isArray(usersPayload.data) ? usersPayload.data.map(mapDbUser) : [],
        );
      } catch (error) {
        console.error("[ArticlesPage] chargement impossible", error);
      }
    };

    void load();
  }, []);

  const filteredArticles = useMemo(() => {
    return articles.filter((article) => {
      const matchesSearch =
        article.title.toLowerCase().includes(search.toLowerCase()) ||
        article.category.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "all" || article.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [articles, search, statusFilter]);

  return (
    <div className="space-y-6">
      <PageBreadCrumb pageTitle="Articles" />

      <SectionCard
        title="Bibliotheque d'articles"
        description="Liste, edition, suppression et apercu des publications."
        actions={
          <Link
            href="/joueurs/nouveau"
            className="rounded-lg bg-brand-500 px-4 py-3 text-sm font-medium text-white transition hover:bg-brand-600"
          >
            Nouvel article
          </Link>
        }
      >
        <div className="grid gap-4 lg:grid-cols-[1fr_220px]">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Rechercher par titre ou categorie"
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
                <th className="pb-3">Article</th>
                <th className="pb-3">Auteur</th>
                <th className="pb-3">Statut</th>
                <th className="pb-3">Publication</th>
                <th className="pb-3 text-right">Tracking</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {filteredArticles.map((article) => {
                const author = users.find((user) => user.id === article.authorId);
                return (
                  <tr key={article.id}>
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={article.coverImage || "/images/grid-image/image-01.png"}
                          alt={article.title}
                          className="h-14 w-20 rounded-xl object-cover"
                        />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white/90">{article.title}</p>
                          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                            {article.category}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 text-gray-500 dark:text-gray-400">
                      {author?.name || "Auteur inconnu"}
                    </td>
                    <td className="py-4">
                      <StatusBadge value={article.status} />
                    </td>
                    <td className="py-4 text-gray-500 dark:text-gray-400">
                      {formatDate(article.publishedAt || article.updatedAt)}
                    </td>
                    <td className="py-4 text-right text-gray-500 dark:text-gray-400">
                      <div>{formatNumber(article.metrics.views)} vues</div>
                      <div className="text-xs">{formatNumber(article.metrics.linkClicks)} clics</div>
                    </td>
                    <td className="py-4">
                      <div className="flex justify-end gap-2">
                        <Link
                          href={`/joueurs/${article.id}`}
                          className="rounded-lg border border-gray-300 px-3 py-2 text-xs font-semibold text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                        >
                          Apercu
                        </Link>
                        <Link
                          href={`/joueurs/${article.id}/modifier`}
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
                            const response = await fetch(`/api/admin/articles/${article.id}`, {
                              method: "DELETE",
                              headers: { Authorization: `Bearer ${token}` },
                            });
                            if (!response.ok) {
                              return;
                            }
                            setArticles((prev) => prev.filter((item) => item.id !== article.id));
                          }}
                          className="rounded-lg border border-error-300 px-3 py-2 text-xs font-semibold text-error-700 transition hover:bg-error-50 dark:border-error-900/40 dark:text-error-300 dark:hover:bg-error-900/10"
                        >
                          Supprimer
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}

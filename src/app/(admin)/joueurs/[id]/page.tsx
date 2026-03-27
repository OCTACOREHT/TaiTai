"use client";

import { StatusBadge, formatDate } from "@/components/common/CmsShared";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { useCms } from "@/context/CmsContext";
import { getAdminToken } from "@/lib/admin-auth";
import { CmsArticle } from "@/types/cms";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

function mapArticle(row: Record<string, unknown>): CmsArticle {
  return {
    id: String(row.id ?? ""),
    slug: String(row.slug ?? ""),
    title: String(row.titre_fr ?? ""),
    excerpt: String(row.extrait_fr ?? ""),
    body: String(row.contenu_fr ?? ""),
    coverImage: String(row.photo_couverture ?? "/images/grid-image/image-01.png"),
    category: String(row.categorie ?? "Articles"),
    tags: Array.isArray(row.tags) ? row.tags.map(String) : [],
    authorId: String(row.auteur_id ?? row.auteur ?? ""),
    featured: Boolean(row.featured),
    status:
      row.statut === "publie" || row.statut === "published"
        ? "published"
        : row.statut === "revision" || row.statut === "review"
        ? "review"
        : row.statut === "archive" || row.statut === "archived"
        ? "archived"
        : "draft",
    seoTitle: String(row.titre_en ?? row.titre_fr ?? ""),
    seoDescription: String(row.extrait_fr ?? ""),
    createdAt: String(row.date_creation ?? new Date().toISOString()),
    updatedAt: String(row.date_modification ?? row.date_creation ?? new Date().toISOString()),
    publishedAt: row.date_publication ? String(row.date_publication) : null,
    metrics: {
      views: Number(row.views ?? 0),
      linkClicks: Number(row.linkClicks ?? 0),
      shares: Number(row.shares ?? 0),
      leads: Number(row.leads ?? 0),
    },
  };
}

export default function ArticlePreviewPage() {
  const params = useParams<{ id: string }>();
  const { users, trackArticleView } = useCms();
  const [article, setArticle] = useState<CmsArticle | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getAdminToken();

    const loadArticle = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await fetch(`/api/admin/articles/${params.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      });

      if (!response.ok) {
        setLoading(false);
        return;
      }

      const payload = await response.json();
      setArticle(mapArticle(payload.data));
      setLoading(false);
    };

    void loadArticle();
  }, [params.id]);

  useEffect(() => {
    if (article) {
      trackArticleView(article.id);
    }
  }, [article, trackArticleView]);

  const author = users.find((user) => user.id === article?.authorId);

  if (loading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6 text-sm text-gray-500 dark:border-gray-800 dark:bg-white/[0.03] dark:text-gray-400">
        Chargement de l'article...
      </div>
    );
  }

  if (!article) {
    return (
      <div className="rounded-2xl border border-error-200 bg-error-50 p-6 text-sm text-error-700 dark:border-error-900/40 dark:bg-error-900/10 dark:text-error-300">
        Article introuvable.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageBreadCrumb pageTitle="Apercu Article" />

      <div className="overflow-hidden rounded-[28px] border border-gray-200 bg-white shadow-theme-xs dark:border-gray-800 dark:bg-white/[0.03]">
        <img src={article.coverImage} alt={article.title} className="h-72 w-full object-cover" />
        <div className="p-6 sm:p-8">
          <div className="flex flex-wrap items-center gap-3">
            <StatusBadge value={article.status} />
            <span className="text-sm text-gray-500 dark:text-gray-400">{article.category}</span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {formatDate(article.publishedAt || article.updatedAt)}
            </span>
          </div>
          <h1 className="mt-5 text-3xl font-semibold text-gray-900 dark:text-white/90">
            {article.title}
          </h1>
          <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">{author?.name}</p>
          <div
            className="cms-prose mt-8 max-w-none text-gray-700 dark:text-gray-300"
            dangerouslySetInnerHTML={{ __html: article.body }}
          />
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href={`/joueurs/${article.id}/modifier`}
              className="rounded-lg bg-brand-500 px-4 py-3 text-sm font-medium text-white transition hover:bg-brand-600"
            >
              Modifier
            </Link>
            <Link
              href="/joueurs"
              className="rounded-lg border border-gray-300 px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              Retour a la liste
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

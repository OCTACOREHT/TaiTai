"use client";

import { CmsArticleForm } from "@/components/common/CmsForms";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { useCms } from "@/context/CmsContext";
<<<<<<< HEAD
import { getAdminToken } from "@/lib/admin-auth";
import { CmsArticle } from "@/types/cms";
import { useParams, useRouter } from "next/navigation";
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
=======
import { useParams, useRouter } from "next/navigation";
>>>>>>> 8dace4bc0a45c5486fb56dd83a4a0b5a447a7b3a

export default function EditArticlePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
<<<<<<< HEAD
  const { users } = useCms();
  const [article, setArticle] = useState<CmsArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = getAdminToken();

    const loadArticle = async () => {
      if (!token) {
        setError("Session admin absente.");
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
        setError("Article introuvable.");
        setLoading(false);
        return;
      }

      const payload = await response.json();
      setArticle(mapArticle(payload.data));
      setLoading(false);
    };

    void loadArticle();
  }, [params.id]);

  if (loading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6 text-sm text-gray-500 dark:border-gray-800 dark:bg-white/[0.03] dark:text-gray-400">
        Chargement de l'article...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-error-200 bg-error-50 p-6 text-sm text-error-700 dark:border-error-900/40 dark:bg-error-900/10 dark:text-error-300">
        {error}
      </div>
    );
  }
=======
  const { articles, users, saveArticle } = useCms();
  const article = articles.find((entry) => entry.id === params.id);
>>>>>>> 8dace4bc0a45c5486fb56dd83a4a0b5a447a7b3a

  if (!article) {
    return (
      <div className="rounded-2xl border border-error-200 bg-error-50 p-6 text-sm text-error-700 dark:border-error-900/40 dark:bg-error-900/10 dark:text-error-300">
        Article introuvable.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageBreadCrumb pageTitle="Modifier Article" />
      <CmsArticleForm
        initialValue={article}
        authors={users}
        submitLabel="Enregistrer les changements"
<<<<<<< HEAD
        onSubmit={async (value) => {
          const token = getAdminToken();

          if (!token) {
            setError("Session admin absente.");
            return;
          }

          const response = await fetch(`/api/admin/articles/${params.id}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              titre_fr: value.title,
              titre_en: value.seoTitle || value.title,
              contenu_fr: value.body,
              contenu_en: null,
              extrait_fr: value.excerpt,
              extrait_en: null,
              photo_couverture: value.coverImage || null,
              categorie: value.category,
              tags: value.tags,
              featured: value.featured,
              seo_title: value.seoTitle || "",
              seo_description: value.seoDescription || "",
              date_publication:
                value.status === "published"
                  ? value.publishedAt || new Date().toISOString()
                  : null,
              statut: value.status,
            }),
          });

          if (!response.ok) {
            const payload = await response.json();
            setError(payload.error || "Impossible d'enregistrer les changements.");
            return;
          }

=======
        onSubmit={(value) => {
          saveArticle(value);
>>>>>>> 8dace4bc0a45c5486fb56dd83a4a0b5a447a7b3a
          router.push("/joueurs");
        }}
      />
    </div>
  );
}

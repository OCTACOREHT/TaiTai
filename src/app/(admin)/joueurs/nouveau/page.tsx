"use client";

import { CmsArticleForm } from "@/components/common/CmsForms";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { useCms } from "@/context/CmsContext";
import { getAdminToken } from "@/lib/admin-auth";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function NewArticlePage() {
  const { users, currentUser } = useCms();
  const router = useRouter();
  const [submitError, setSubmitError] = useState("");

  return (
    <div className="space-y-6">
      <PageBreadCrumb pageTitle="Nouvel Article" />
      <CmsArticleForm
        authors={users}
        submitLabel="Creer l'article"
        initialValue={
          currentUser
            ? {
                id: "",
                slug: "",
                title: "",
                excerpt: "",
                body: "",
                coverImage: "",
                category: "Actualites",
                tags: [],
                authorId: currentUser.id,
                featured: false,
                status: "draft",
                seoTitle: "",
                seoDescription: "",
                createdAt: "",
                updatedAt: "",
                publishedAt: null,
                metrics: { views: 0, linkClicks: 0, shares: 0, leads: 0 },
              }
            : undefined
        }
        onSubmit={async (value) => {
          setSubmitError("");

          const token = getAdminToken();

          if (!token) {
            setSubmitError("Connectez-vous d'abord avec un compte admin pour enregistrer en base.");
            return;
          }

          const response = await fetch("/api/admin/articles", {
            method: "POST",
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
              date_publication: value.status === "published" ? new Date().toISOString() : null,
              statut: value.status,
            }),
          });

          const payload = await response.json();

          if (!response.ok) {
            setSubmitError(payload.error || "Impossible d'enregistrer l'article dans la base.");
            return;
          }

          router.push("/joueurs");
        }}
      />
      {submitError ? (
        <div className="rounded-xl border border-error-200 bg-error-50 px-4 py-3 text-sm text-error-700 dark:border-error-900/40 dark:bg-error-900/10 dark:text-error-300">
          {submitError}
        </div>
      ) : null}
    </div>
  );
}

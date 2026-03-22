"use client";

import { CmsArticleForm } from "@/components/common/CmsForms";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { useCms } from "@/context/CmsContext";
import { useParams, useRouter } from "next/navigation";

export default function EditArticlePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { articles, users, saveArticle } = useCms();
  const article = articles.find((entry) => entry.id === params.id);

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
        onSubmit={(value) => {
          saveArticle(value);
          router.push("/joueurs");
        }}
      />
    </div>
  );
}

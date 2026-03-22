"use client";

import { StatusBadge, formatDate } from "@/components/common/CmsShared";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { useCms } from "@/context/CmsContext";
import Link from "next/link";
import { useEffect } from "react";
import { useParams } from "next/navigation";

export default function ArticlePreviewPage() {
  const params = useParams<{ id: string }>();
  const { articles, users, trackArticleView } = useCms();
  const article = articles.find((entry) => entry.id === params.id);
  const author = users.find((user) => user.id === article?.authorId);

  useEffect(() => {
    if (article) {
      trackArticleView(article.id);
    }
  }, [article, trackArticleView]);

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

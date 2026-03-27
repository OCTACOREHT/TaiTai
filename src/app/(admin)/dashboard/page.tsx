"use client";

import { MetricCard, SectionCard, StatusBadge, formatDate, formatNumber } from "@/components/common/CmsShared";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { useCms } from "@/context/CmsContext";
import Link from "next/link";

export default function DashboardPage() {
  const {
    articles,
    stages,
    partners,
    users,
    homePage,
    currentUser,
    alerts,
  } = useCms();

  const publishedArticles = articles.filter((article) => article.status === "published");
  const publishedStages = stages.filter((stage) => stage.status === "published");
  const totalArticleViews = articles.reduce((sum, article) => sum + article.metrics.views, 0);
  const totalStageApplications = stages.reduce(
    (sum, stage) => sum + stage.metrics.applications,
    0,
  );
  const totalPartnerClicks = partners.reduce((sum, partner) => sum + partner.clicks, 0);

  return (
    <div className="space-y-6">
      <PageBreadCrumb pageTitle="Dashboard CMS" />

      <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-theme-xs dark:border-gray-800 dark:bg-white/[0.03]">
        <p className="text-sm text-brand-500">Pilotage editorial</p>
        <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-gray-900 dark:text-white/90">
              Bonjour {currentUser?.name.split(" ")[0]}
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-gray-500 dark:text-gray-400">
              Le CMS gere vos articles, stages, partenaires et textes du site public sans changer
              la coque visuelle du dashboard.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/joueurs/nouveau"
              className="rounded-lg bg-brand-500 px-4 py-3 text-sm font-medium text-white transition hover:bg-brand-600"
            >
              Nouvel article
            </Link>
            <Link
              href="/staff/nouveau"
              className="rounded-lg border border-gray-300 px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              Nouveau stage
            </Link>
          </div>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <MetricCard label="Articles publies" value={formatNumber(publishedArticles.length)} />
        <MetricCard label="Stages actifs" value={formatNumber(publishedStages.length)} />
        <MetricCard label="Partenaires" value={formatNumber(partners.length)} />
        <MetricCard label="Vues articles" value={formatNumber(totalArticleViews)} />
        <MetricCard label="Candidatures stages" value={formatNumber(totalStageApplications)} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <SectionCard
          title="Dernieres publications"
          description="Suivi rapide des contenus les plus recents."
        >
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-xs uppercase tracking-[0.14em] text-gray-500">
                <tr>
                  <th className="pb-3">Contenu</th>
                  <th className="pb-3">Statut</th>
                  <th className="pb-3">Date</th>
                  <th className="pb-3 text-right">Tracking</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {[...articles.slice(0, 3), ...stages.slice(0, 3)].map((entry) => {
                  const isArticle = "category" in entry;
                  const href = isArticle
                    ? `/joueurs/${entry.id}/modifier`
                    : `/staff/${entry.id}/modifier`;
                  const metric = isArticle
                    ? `${formatNumber(entry.metrics.views)} vues`
                    : `${formatNumber(entry.metrics.applications)} candidatures`;

                  return (
                    <tr key={entry.id}>
                      <td className="py-4">
                        <Link href={href} className="font-medium text-gray-900 dark:text-white/90">
                          {entry.title}
                        </Link>
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          {isArticle ? entry.category : entry.department}
                        </p>
                      </td>
                      <td className="py-4">
                        <StatusBadge value={entry.status} />
                      </td>
                      <td className="py-4 text-gray-500 dark:text-gray-400">
                        {formatDate(entry.publishedAt || entry.updatedAt)}
                      </td>
                      <td className="py-4 text-right text-gray-500 dark:text-gray-400">
                        {metric}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </SectionCard>

        <SectionCard title="Alertes editoriales" description="Elements a traiter rapidement.">
          <div className="space-y-3">
            {alerts.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-300 p-5 text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
                Aucun blocage en cours.
              </div>
            ) : (
              alerts.map((alert) => (
                <Link
                  key={alert.id}
                  href={alert.href}
                  className="block rounded-2xl border border-gray-200 px-4 py-4 transition hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-white/5"
                >
                  <p className="font-medium text-gray-900 dark:text-white/90">{alert.title}</p>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{alert.description}</p>
                </Link>
              ))
            )}
          </div>
        </SectionCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <SectionCard title="Equipe editoriale" description="Comptes pouvant publier et modifier.">
          <div className="space-y-3">
            {users.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between rounded-2xl border border-gray-200 px-4 py-4 dark:border-gray-800"
              >
                <div className="flex items-center gap-3">
                  <img src={user.avatar} alt={user.name} className="h-11 w-11 rounded-full object-cover" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white/90">{user.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{user.title}</p>
                  </div>
                </div>
                <StatusBadge value={user.role} />
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Performance site public" description="Indicateurs du site editable.">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-gray-200 px-4 py-5 dark:border-gray-800">
              <p className="text-sm text-gray-500 dark:text-gray-400">Visites page principale</p>
              <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white/90">
                {formatNumber(homePage.visits)}
              </p>
            </div>
            <div className="rounded-2xl border border-gray-200 px-4 py-5 dark:border-gray-800">
              <p className="text-sm text-gray-500 dark:text-gray-400">Clics CTA</p>
              <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white/90">
                {formatNumber(homePage.ctaClicks)}
              </p>
            </div>
            <div className="rounded-2xl border border-gray-200 px-4 py-5 dark:border-gray-800">
              <p className="text-sm text-gray-500 dark:text-gray-400">Clics partenaires</p>
              <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white/90">
                {formatNumber(totalPartnerClicks)}
              </p>
            </div>
            <div className="rounded-2xl border border-gray-200 px-4 py-5 dark:border-gray-800">
              <p className="text-sm text-gray-500 dark:text-gray-400">Taux CTA / visite</p>
              <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white/90">
                {homePage.visits > 0
                  ? `${Math.round((homePage.ctaClicks / homePage.visits) * 100)}%`
                  : "0%"}
              </p>
            </div>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}

"use client";

import { MetricCard, SectionCard, formatNumber } from "@/components/common/CmsShared";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { useCms } from "@/context/CmsContext";

export default function TrackingPage() {
  const { articles, stages, partners, homePage, users } = useCms();

  const totalArticleViews = articles.reduce((sum, article) => sum + article.metrics.views, 0);
  const totalStageViews = stages.reduce((sum, stage) => sum + stage.metrics.views, 0);
  const totalApplications = stages.reduce((sum, stage) => sum + stage.metrics.applications, 0);
  const totalPartnerClicks = partners.reduce((sum, partner) => sum + partner.clicks, 0);

  return (
    <div className="space-y-6">
      <PageBreadCrumb pageTitle="Tracking" />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Vues articles" value={formatNumber(totalArticleViews)} />
        <MetricCard label="Vues stages" value={formatNumber(totalStageViews)} />
        <MetricCard label="Candidatures" value={formatNumber(totalApplications)} />
        <MetricCard label="Clics partenaires" value={formatNumber(totalPartnerClicks)} />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <SectionCard title="Top articles" description="Formats qui attirent le plus de vues.">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-xs uppercase tracking-[0.16em] text-gray-500">
                <tr>
                  <th className="pb-3">Article</th>
                  <th className="pb-3 text-right">Vues</th>
                  <th className="pb-3 text-right">Clics</th>
                  <th className="pb-3 text-right">Leads</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {[...articles]
                  .sort((a, b) => b.metrics.views - a.metrics.views)
                  .slice(0, 6)
                  .map((article) => (
                    <tr key={article.id}>
                      <td className="py-4">
                        <p className="font-medium text-gray-900 dark:text-white/90">{article.title}</p>
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{article.category}</p>
                      </td>
                      <td className="py-4 text-right text-gray-500 dark:text-gray-400">
                        {formatNumber(article.metrics.views)}
                      </td>
                      <td className="py-4 text-right text-gray-500 dark:text-gray-400">
                        {formatNumber(article.metrics.linkClicks)}
                      </td>
                      <td className="py-4 text-right text-gray-500 dark:text-gray-400">
                        {formatNumber(article.metrics.leads)}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </SectionCard>

        <SectionCard title="Top stages" description="Offres les plus consultees.">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-xs uppercase tracking-[0.16em] text-gray-500">
                <tr>
                  <th className="pb-3">Stage</th>
                  <th className="pb-3 text-right">Vues</th>
                  <th className="pb-3 text-right">Candidatures</th>
                  <th className="pb-3 text-right">Contacts</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {[...stages]
                  .sort((a, b) => b.metrics.views - a.metrics.views)
                  .slice(0, 6)
                  .map((stage) => (
                    <tr key={stage.id}>
                      <td className="py-4">
                        <p className="font-medium text-gray-900 dark:text-white/90">{stage.title}</p>
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          {stage.department}
                        </p>
                      </td>
                      <td className="py-4 text-right text-gray-500 dark:text-gray-400">
                        {formatNumber(stage.metrics.views)}
                      </td>
                      <td className="py-4 text-right text-gray-500 dark:text-gray-400">
                        {formatNumber(stage.metrics.applications)}
                      </td>
                      <td className="py-4 text-right text-gray-500 dark:text-gray-400">
                        {formatNumber(stage.metrics.contactClicks)}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </SectionCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <SectionCard title="Partenaires les plus cliques" description="Visibilite de la page partenaires.">
          <div className="space-y-3">
            {[...partners]
              .sort((a, b) => b.clicks - a.clicks)
              .map((partner) => (
                <div
                  key={partner.id}
                  className="flex items-center justify-between rounded-2xl border border-gray-200 px-4 py-4 dark:border-gray-800"
                >
                  <div className="flex items-center gap-3">
                    <img src={partner.logo} alt={partner.name} className="h-10 w-14 object-contain" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white/90">{partner.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{partner.category}</p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white/90">
                    {formatNumber(partner.clicks)}
                  </span>
                </div>
              ))}
          </div>
        </SectionCard>

        <SectionCard title="Production par auteur" description="Qui publie quoi dans le CMS.">
          <div className="space-y-3">
            {users.map((user) => {
              const authoredArticles = articles.filter((article) => article.authorId === user.id).length;
              const authoredStages = stages.filter((stage) => stage.contactEmail === user.email).length;

              return (
                <div
                  key={user.id}
                  className="flex items-center justify-between rounded-2xl border border-gray-200 px-4 py-4 dark:border-gray-800"
                >
                  <div className="flex items-center gap-3">
                    <img src={user.avatar} alt={user.name} className="h-11 w-11 rounded-full object-cover" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white/90">{user.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{user.role}</p>
                    </div>
                  </div>
                  <div className="text-right text-sm text-gray-500 dark:text-gray-400">
                    <p>{formatNumber(authoredArticles)} article(s)</p>
                    <p>{formatNumber(authoredStages)} stage(s)</p>
                  </div>
                </div>
              );
            })}
          </div>
        </SectionCard>
      </div>

      <SectionCard title="Tableau site public" description="Vue de synthese pour la direction.">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="text-xs uppercase tracking-[0.16em] text-gray-500">
              <tr>
                <th className="pb-3">Canal</th>
                <th className="pb-3 text-right">Valeur</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              <tr>
                <td className="py-4 font-medium text-gray-900 dark:text-white/90">Visites page principale</td>
                <td className="py-4 text-right text-gray-500 dark:text-gray-400">
                  {formatNumber(homePage.visits)}
                </td>
              </tr>
              <tr>
                <td className="py-4 font-medium text-gray-900 dark:text-white/90">Clics sur CTA</td>
                <td className="py-4 text-right text-gray-500 dark:text-gray-400">
                  {formatNumber(homePage.ctaClicks)}
                </td>
              </tr>
              <tr>
                <td className="py-4 font-medium text-gray-900 dark:text-white/90">Taux de clic CTA</td>
                <td className="py-4 text-right text-gray-500 dark:text-gray-400">
                  {homePage.visits > 0
                    ? `${Math.round((homePage.ctaClicks / homePage.visits) * 100)}%`
                    : "0%"}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}

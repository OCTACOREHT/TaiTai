"use client";

import { formatDate } from "@/components/common/CmsShared";
import PublicSiteShell from "@/components/common/PublicSiteShell";
import { useCms } from "@/context/CmsContext";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";

export default function PublicCmsHome({ embedded = false }: { embedded?: boolean }) {
  const {
    homePage,
    publishedArticles,
    publishedStages,
    partners,
    trackArticleLinkClick,
    trackArticleView,
    trackHomeCta,
    trackHomeVisit,
    trackPartnerClick,
    trackStageApplication,
    trackStageContact,
    trackStageView,
  } = useCms();
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(
    homePage.featuredArticleIds[0] || publishedArticles[0]?.id || null,
  );
  const [selectedStageId, setSelectedStageId] = useState<string | null>(
    homePage.featuredStageIds[0] || publishedStages[0]?.id || null,
  );
  const [isConnecting, setIsConnecting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!embedded) {
      trackHomeVisit();
    }
  }, [embedded, trackHomeVisit]);

  const featuredArticles = useMemo(() => {
    const explicit = homePage.featuredArticleIds
      .map((id) => publishedArticles.find((article) => article.id === id))
      .filter(Boolean);

    if (explicit.length > 0) {
      return explicit;
    }

    return publishedArticles.slice(0, 3);
  }, [homePage.featuredArticleIds, publishedArticles]);

  const featuredStages = useMemo(() => {
    const explicit = homePage.featuredStageIds
      .map((id) => publishedStages.find((stage) => stage.id === id))
      .filter(Boolean);

    if (explicit.length > 0) {
      return explicit;
    }

    return publishedStages.slice(0, 3);
  }, [homePage.featuredStageIds, publishedStages]);

  const featuredPartners = useMemo(
    () => partners.filter((partner) => partner.featured).slice(0, 6),
    [partners],
  );

  const selectedArticle =
    featuredArticles.find((article) => article?.id === selectedArticleId) || featuredArticles[0];
  const selectedStage =
    featuredStages.find((stage) => stage?.id === selectedStageId) || featuredStages[0];

  const content = (
    <div>
      <section id="hero" className="relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${homePage.heroBackgroundImage})` }}
        />
        <div className="absolute inset-0 bg-gray-950/75" />
        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-20 sm:px-6 lg:grid-cols-[1.35fr_0.85fr] lg:px-8 lg:py-28">
          <div>
            <span className="inline-flex rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-brand-200">
              {homePage.heroBadge}
            </span>
            <h1 className="mt-6 max-w-4xl text-4xl font-semibold leading-tight text-white sm:text-5xl">
              {homePage.heroTitle}
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-gray-200 sm:text-lg">
              {homePage.heroSubtitle}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href={homePage.heroPrimaryCtaUrl}
                onClick={trackHomeCta}
                className="rounded-full bg-brand-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-600"
              >
                {homePage.heroPrimaryCtaLabel}
              </a>
              <a
                href={homePage.heroSecondaryCtaUrl}
                onClick={trackHomeCta}
                className="rounded-full border border-white/20 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                {homePage.heroSecondaryCtaLabel}
              </a>
              <button
                onClick={() => {
                  trackHomeCta();
                  setIsConnecting(true);
                  // Maintain the loading state as requested
                  router.push("/signin");
                }}
                disabled={isConnecting}
                className="flex items-center justify-center min-w-[140px] rounded-full border border-white/10 px-5 py-3 text-sm font-semibold text-white/80 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed"
              >
                {isConnecting ? <Loader /> : "Connexion CMS"}
              </button>
            </div>
          </div>
          <div className="grid gap-4 rounded-[28px] border border-white/10 bg-white/8 p-4 backdrop-blur">
            {homePage.metrics.map((metric) => (
              <div
                key={metric.label}
                className="rounded-2xl border border-white/10 bg-black/20 px-5 py-5"
              >
                <p className="text-sm text-gray-300">{metric.label}</p>
                <p className="mt-2 text-3xl font-semibold text-white">{metric.value}</p>
                {metric.note ? <p className="mt-2 text-xs text-gray-400">{metric.note}</p> : null}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1fr_0.9fr] lg:px-8">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-500">
            Presentation
          </p>
          <h2 className="mt-3 text-3xl font-semibold text-white">{homePage.aboutTitle}</h2>
          <p className="mt-5 max-w-3xl text-base leading-8 text-gray-300">{homePage.aboutBody}</p>
        </div>
        <div className="rounded-[28px] border border-white/10 bg-white/5 p-6">
          <p className="text-sm text-gray-400">Suivi rapide</p>
          <div className="mt-6 grid gap-4">
            <div className="rounded-2xl bg-black/20 px-5 py-4">
              <p className="text-sm text-gray-400">Visites page principale</p>
              <p className="mt-2 text-2xl font-semibold text-white">{homePage.visits}</p>
            </div>
            <div className="rounded-2xl bg-black/20 px-5 py-4">
              <p className="text-sm text-gray-400">Clics sur les CTA</p>
              <p className="mt-2 text-2xl font-semibold text-white">{homePage.ctaClicks}</p>
            </div>
          </div>
        </div>
      </section>

      <section id="articles" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-500">
              Articles
            </p>
            <h2 className="mt-2 text-3xl font-semibold text-white">{homePage.articleSectionTitle}</h2>
            <p className="mt-4 max-w-3xl text-base leading-8 text-gray-300">
              {homePage.articleSectionIntro}
            </p>
          </div>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="grid gap-4">
            {featuredArticles.map((article) =>
              article ? (
                <button
                  key={article.id}
                  type="button"
                  onClick={() => {
                    setSelectedArticleId(article.id);
                    trackArticleView(article.id);
                    trackArticleLinkClick(article.id);
                  }}
                  className={`overflow-hidden rounded-[24px] border p-4 text-left transition ${
                    selectedArticle?.id === article.id
                      ? "border-brand-400 bg-white/10"
                      : "border-white/10 bg-white/5 hover:bg-white/8"
                  }`}
                >
                  <img src={article.coverImage} alt={article.title} className="h-40 w-full rounded-2xl object-cover" />
                  <p className="mt-4 text-xs uppercase tracking-[0.18em] text-brand-300">
                    {article.category}
                  </p>
                  <h3 className="mt-2 text-xl font-semibold text-white">{article.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-gray-300">{article.excerpt}</p>
                  <div className="mt-4 flex items-center justify-between text-xs text-gray-400">
                    <span>{formatDate(article.publishedAt)}</span>
                    <span>{article.metrics.views} vues</span>
                  </div>
                </button>
              ) : null,
            )}
          </div>

          {selectedArticle ? (
            <div className="rounded-[28px] border border-white/10 bg-white/5 p-6">
              <img
                src={selectedArticle.coverImage}
                alt={selectedArticle.title}
                className="h-64 w-full rounded-[24px] object-cover"
              />
              <div className="mt-6 flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.16em] text-brand-300">
                <span>{selectedArticle.category}</span>
                <span className="h-1 w-1 rounded-full bg-white/30" />
                <span>{formatDate(selectedArticle.publishedAt)}</span>
              </div>
              <h3 className="mt-4 text-3xl font-semibold text-white">{selectedArticle.title}</h3>
              <div
                className="cms-prose mt-6 max-w-none text-gray-300"
                dangerouslySetInnerHTML={{ __html: selectedArticle.body }}
              />
            </div>
          ) : null}
        </div>
      </section>

      <section id="stages" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-500">
            Stages
          </p>
          <h2 className="mt-2 text-3xl font-semibold text-white">{homePage.stageSectionTitle}</h2>
          <p className="mt-4 max-w-3xl text-base leading-8 text-gray-300">
            {homePage.stageSectionIntro}
          </p>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="grid gap-4">
            {featuredStages.map((stage) =>
              stage ? (
                <button
                  key={stage.id}
                  type="button"
                  onClick={() => {
                    setSelectedStageId(stage.id);
                    trackStageView(stage.id);
                  }}
                  className={`overflow-hidden rounded-[24px] border p-4 text-left transition ${
                    selectedStage?.id === stage.id
                      ? "border-brand-400 bg-white/10"
                      : "border-white/10 bg-white/5 hover:bg-white/8"
                  }`}
                >
                  <img src={stage.coverImage} alt={stage.title} className="h-40 w-full rounded-2xl object-cover" />
                  <div className="mt-4 flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.16em] text-brand-300">
                    <span>{stage.department}</span>
                    <span className="h-1 w-1 rounded-full bg-white/30" />
                    <span>{stage.workMode}</span>
                  </div>
                  <h3 className="mt-2 text-xl font-semibold text-white">{stage.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-gray-300">{stage.excerpt}</p>
                  <div className="mt-4 flex items-center justify-between text-xs text-gray-400">
                    <span>{stage.location}</span>
                    <span>{stage.metrics.applications} candidatures</span>
                  </div>
                </button>
              ) : null,
            )}
          </div>

          {selectedStage ? (
            <div className="rounded-[28px] border border-white/10 bg-white/5 p-6">
              <img
                src={selectedStage.coverImage}
                alt={selectedStage.title}
                className="h-64 w-full rounded-[24px] object-cover"
              />
              <div className="mt-6 flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.16em] text-brand-300">
                <span>{selectedStage.department}</span>
                <span className="h-1 w-1 rounded-full bg-white/30" />
                <span>{selectedStage.duration}</span>
                <span className="h-1 w-1 rounded-full bg-white/30" />
                <span>{selectedStage.workMode}</span>
              </div>
              <h3 className="mt-4 text-3xl font-semibold text-white">{selectedStage.title}</h3>
              <div
                className="cms-prose mt-6 max-w-none text-gray-300"
                dangerouslySetInnerHTML={{ __html: selectedStage.body }}
              />
              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href={`mailto:${selectedStage.contactEmail}?subject=Candidature ${selectedStage.title}`}
                  onClick={() => {
                    trackStageApplication(selectedStage.id);
                    trackStageContact(selectedStage.id);
                  }}
                  className="rounded-full bg-brand-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-600"
                >
                  Postuler
                </a>
                <span className="rounded-full border border-white/10 px-5 py-3 text-sm text-gray-300">
                  Cloture: {selectedStage.closeDate || "a definir"}
                </span>
              </div>
            </div>
          ) : null}
        </div>
      </section>

      <section id="partenaires" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-500">
            Partenaires
          </p>
          <h2 className="mt-2 text-3xl font-semibold text-white">{homePage.partnerSectionTitle}</h2>
          <p className="mt-4 max-w-3xl text-base leading-8 text-gray-300">
            {homePage.partnerSectionIntro}
          </p>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {featuredPartners.map((partner) => (
            <a
              key={partner.id}
              href={partner.website}
              target="_blank"
              rel="noreferrer"
              onClick={() => trackPartnerClick(partner.id)}
              className="rounded-[24px] border border-white/10 bg-white/5 p-6 transition hover:bg-white/10"
            >
              <div className="flex h-16 items-center justify-center rounded-2xl bg-white">
                <img src={partner.logo} alt={partner.name} className="max-h-10 max-w-[140px] object-contain" />
              </div>
              <div className="mt-5 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">{partner.name}</h3>
                <span className="rounded-full border border-white/10 px-2.5 py-1 text-xs uppercase tracking-[0.15em] text-brand-300">
                  {partner.tier}
                </span>
              </div>
              <p className="mt-3 text-sm leading-7 text-gray-300">{partner.description}</p>
            </a>
          ))}
        </div>
      </section>
    </div>
  );

  if (embedded) {
    return content;
  }

  return <PublicSiteShell>{content}</PublicSiteShell>;
}

"use client";

import Button from "@/components/ui/button/Button";
import {
  FieldLabel,
  ImageField,
  SectionCard,
  TextAreaInput,
  TextInput,
  ToggleInput,
} from "@/components/common/CmsShared";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { useCms } from "@/context/CmsContext";
import { useState } from "react";

export default function SiteSettingsPage() {
  const {
    homePage,
    siteSettings,
    publishedArticles,
    publishedStages,
    updateHomePage,
    updateSiteSettings,
  } = useCms();
  const [saved, setSaved] = useState("");

  const toggleFeaturedArticle = (articleId: string) => {
    const next = homePage.featuredArticleIds.includes(articleId)
      ? homePage.featuredArticleIds.filter((id) => id !== articleId)
      : [...homePage.featuredArticleIds, articleId].slice(-3);
    updateHomePage({ featuredArticleIds: next });
  };

  const toggleFeaturedStage = (stageId: string) => {
    const next = homePage.featuredStageIds.includes(stageId)
      ? homePage.featuredStageIds.filter((id) => id !== stageId)
      : [...homePage.featuredStageIds, stageId].slice(-3);
    updateHomePage({ featuredStageIds: next });
  };

  const handleSaveNotice = () => {
    setSaved("Les reglages du site ont ete enregistres.");
    window.setTimeout(() => setSaved(""), 2500);
  };

  return (
    <div className="space-y-6">
      <PageBreadCrumb pageTitle="Site Public" />

      {saved ? (
        <div className="rounded-xl border border-success-200 bg-success-50 px-4 py-3 text-sm text-success-700 dark:border-success-900/40 dark:bg-success-900/10 dark:text-success-300">
          {saved}
        </div>
      ) : null}

      <SectionCard title="Hero principal" description="Message d'accueil, CTA et image de fond.">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-2">
            <FieldLabel>Badge</FieldLabel>
            <TextInput
              value={homePage.heroBadge}
              onChange={(event) => updateHomePage({ heroBadge: event.target.value })}
            />
          </div>
          <div className="space-y-2">
            <FieldLabel>Nom du site</FieldLabel>
            <TextInput
              value={siteSettings.siteName}
              onChange={(event) => updateSiteSettings({ siteName: event.target.value })}
            />
          </div>
        </div>

        <div className="space-y-2">
          <FieldLabel>Titre principal</FieldLabel>
          <TextAreaInput
            rows={3}
            value={homePage.heroTitle}
            onChange={(event) => updateHomePage({ heroTitle: event.target.value })}
          />
        </div>

        <div className="space-y-2">
          <FieldLabel>Sous-titre</FieldLabel>
          <TextAreaInput
            rows={4}
            value={homePage.heroSubtitle}
            onChange={(event) => updateHomePage({ heroSubtitle: event.target.value })}
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-2">
            <FieldLabel>CTA principal</FieldLabel>
            <TextInput
              value={homePage.heroPrimaryCtaLabel}
              onChange={(event) => updateHomePage({ heroPrimaryCtaLabel: event.target.value })}
            />
          </div>
          <div className="space-y-2">
            <FieldLabel>Lien CTA principal</FieldLabel>
            <TextInput
              value={homePage.heroPrimaryCtaUrl}
              onChange={(event) => updateHomePage({ heroPrimaryCtaUrl: event.target.value })}
            />
          </div>
          <div className="space-y-2">
            <FieldLabel>CTA secondaire</FieldLabel>
            <TextInput
              value={homePage.heroSecondaryCtaLabel}
              onChange={(event) => updateHomePage({ heroSecondaryCtaLabel: event.target.value })}
            />
          </div>
          <div className="space-y-2">
            <FieldLabel>Lien CTA secondaire</FieldLabel>
            <TextInput
              value={homePage.heroSecondaryCtaUrl}
              onChange={(event) => updateHomePage({ heroSecondaryCtaUrl: event.target.value })}
            />
          </div>
        </div>

        <ImageField
          label="Image de fond"
          value={homePage.heroBackgroundImage}
          onChange={(value) => updateHomePage({ heroBackgroundImage: value })}
        />
      </SectionCard>

      <SectionCard title="Sections du site" description="Textes de presentation et infos de contact.">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-2">
            <FieldLabel>Titre bloc presentation</FieldLabel>
            <TextInput
              value={homePage.aboutTitle}
              onChange={(event) => updateHomePage({ aboutTitle: event.target.value })}
            />
          </div>
          <div className="space-y-2">
            <FieldLabel>Tagline publique</FieldLabel>
            <TextInput
              value={siteSettings.publicTagline}
              onChange={(event) => updateSiteSettings({ publicTagline: event.target.value })}
            />
          </div>
        </div>

        <div className="space-y-2">
          <FieldLabel>Texte de presentation</FieldLabel>
          <TextAreaInput
            rows={4}
            value={homePage.aboutBody}
            onChange={(event) => updateHomePage({ aboutBody: event.target.value })}
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-2">
            <FieldLabel>Email principal</FieldLabel>
            <TextInput
              value={siteSettings.primaryEmail}
              onChange={(event) => updateSiteSettings({ primaryEmail: event.target.value })}
            />
          </div>
          <div className="space-y-2">
            <FieldLabel>Telephone</FieldLabel>
            <TextInput
              value={siteSettings.phone}
              onChange={(event) => updateSiteSettings({ phone: event.target.value })}
            />
          </div>
          <div className="space-y-2">
            <FieldLabel>Adresse</FieldLabel>
            <TextInput
              value={siteSettings.address}
              onChange={(event) => updateSiteSettings({ address: event.target.value })}
            />
          </div>
        </div>

        <div className="space-y-2">
          <FieldLabel>Texte de footer</FieldLabel>
          <TextAreaInput
            rows={3}
            value={siteSettings.footerText}
            onChange={(event) => updateSiteSettings({ footerText: event.target.value })}
          />
        </div>
      </SectionCard>

      <SectionCard title="Contenus mis en avant" description="Choisissez jusqu'a trois articles et trois stages.">
        <div className="grid gap-6 xl:grid-cols-2">
          <div className="space-y-3">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Articles en vedette</p>
            {publishedArticles.map((article) => (
              <ToggleInput
                key={article.id}
                checked={homePage.featuredArticleIds.includes(article.id)}
                onChange={() => toggleFeaturedArticle(article.id)}
                label={article.title}
              />
            ))}
          </div>
          <div className="space-y-3">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Stages en vedette</p>
            {publishedStages.map((stage) => (
              <ToggleInput
                key={stage.id}
                checked={homePage.featuredStageIds.includes(stage.id)}
                onChange={() => toggleFeaturedStage(stage.id)}
                label={stage.title}
              />
            ))}
          </div>
        </div>
      </SectionCard>

      <div className="flex justify-end">
        <Button onClick={handleSaveNotice}>Enregistrer les reglages</Button>
      </div>
    </div>
  );
}

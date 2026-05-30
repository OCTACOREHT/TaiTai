"use client";

import Button from "@/components/ui/button/Button";
import {
  FieldLabel,
  ImageField,
  SectionCard,
  SelectInput,
  TextAreaInput,
  TextInput,
  ToggleInput,
} from "@/components/common/CmsShared";
import CmsRichTextEditor from "@/components/common/CmsRichTextEditor";
import { CmsArticle, CmsPartner, CmsStage, CmsUser } from "@/types/cms";
import React, { useMemo, useState } from "react";

const emptyArticle: CmsArticle = {
  id: "",
  slug: "",
  title: "",
  excerpt: "",
  body: "",
  coverImage: "",
  category: "Actualites",
  tags: [],
  authorId: "",
  featured: false,
  status: "draft",
  seoTitle: "",
  seoDescription: "",
  createdAt: "",
  updatedAt: "",
  publishedAt: null,
  metrics: { views: 0, linkClicks: 0, shares: 0, leads: 0 },
};

const emptyStage: CmsStage = {
  id: "",
  slug: "",
  title: "",
  excerpt: "",
  body: "",
  coverImage: "",
  department: "Communication",
  location: "",
  workMode: "hybrid",
  duration: "",
  contactEmail: "",
  closeDate: null,
  featured: false,
  status: "draft",
  createdAt: "",
  updatedAt: "",
  publishedAt: null,
  metrics: { views: 0, applications: 0, contactClicks: 0 },
};

const emptyPartner: CmsPartner = {
  id: "",
  name: "",
  website: "",
  logo: "",
  category: "Media",
  tier: "silver",
  description: "",
  featured: false,
  createdAt: "",
  clicks: 0,
};

const emptyUser: CmsUser = {
  id: "",
  name: "",
  email: "",
  password: "",
  role: "author",
  title: "",
  avatar: "",
  bio: "",
  active: true,
  lastLoginAt: null,
};

export function CmsArticleForm({
  initialValue,
  authors,
  submitLabel,
  onSubmit,
}: {
  initialValue?: CmsArticle;
  authors: CmsUser[];
  submitLabel: string;
  onSubmit: (value: CmsArticle) => void;
}) {
  const [form, setForm] = useState<CmsArticle>(initialValue ?? emptyArticle);
  const [tagsValue, setTagsValue] = useState((initialValue?.tags || []).join(", "));
  const [error, setError] = useState("");

  const selectedAuthor = useMemo(
    () => authors.find((author) => author.id === form.authorId)?.id || authors[0]?.id || "",
    [authors, form.authorId],
  );

  const updateField = <K extends keyof CmsArticle>(key: K, value: CmsArticle[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (!form.title.trim() || !form.excerpt.trim() || !form.body.trim()) {
      setError("Renseignez au minimum le titre, le resume et le contenu de l'article.");
      return;
    }

    onSubmit({
      ...form,
      authorId: form.authorId || selectedAuthor,
      tags: tagsValue
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <SectionCard
        title="Contenu de l'article"
        description="Redigez, structurez et preparez la publication."
      >
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-2">
            <FieldLabel>Titre</FieldLabel>
            <TextInput
              value={form.title}
              onChange={(event) => updateField("title", event.target.value)}
              placeholder="Titre de l'article"
            />
          </div>
          <div className="space-y-2">
            <FieldLabel>Categorie</FieldLabel>
            <TextInput
              value={form.category}
              onChange={(event) => updateField("category", event.target.value)}
              placeholder="Actualites"
            />
          </div>
          <div className="space-y-2">
            <FieldLabel>Auteur</FieldLabel>
            <SelectInput
              value={form.authorId || selectedAuthor}
              onChange={(event) => updateField("authorId", event.target.value)}
            >
              {authors.map((author) => (
                <option key={author.id} value={author.id}>
                  {author.name} - {author.role}
                </option>
              ))}
            </SelectInput>
          </div>
          <div className="space-y-2">
            <FieldLabel>Statut</FieldLabel>
            <SelectInput
              value={form.status}
              onChange={(event) => updateField("status", event.target.value as CmsArticle["status"])}
            >
              <option value="draft">Draft</option>
              <option value="review">Review</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </SelectInput>
          </div>
        </div>

        <div className="space-y-2">
          <FieldLabel>Resume</FieldLabel>
          <TextAreaInput
            rows={3}
            value={form.excerpt}
            onChange={(event) => updateField("excerpt", event.target.value)}
            placeholder="Resume court visible dans les cartes et tableaux."
          />
        </div>

        <div className="space-y-2">
          <FieldLabel hint="Utilisez la barre pour mettre en gras, ajouter des liens, des titres et des listes.">
            Corps de l'article
          </FieldLabel>
          <CmsRichTextEditor value={form.body} onChange={(value) => updateField("body", value)} />
        </div>
      </SectionCard>

      <SectionCard title="Visibilite et SEO" description="Ajustez les elements visibles du site.">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-2">
            <FieldLabel>Mots-cles</FieldLabel>
            <TextInput
              value={tagsValue}
              onChange={(event) => setTagsValue(event.target.value)}
              placeholder="cms, actualites, club"
            />
          </div>
          <div className="space-y-2">
            <FieldLabel>SEO title</FieldLabel>
            <TextInput
              value={form.seoTitle}
              onChange={(event) => updateField("seoTitle", event.target.value)}
              placeholder="Titre SEO"
            />
          </div>
        </div>

        <div className="space-y-2">
          <FieldLabel>SEO description</FieldLabel>
          <TextAreaInput
            rows={3}
            value={form.seoDescription}
            onChange={(event) => updateField("seoDescription", event.target.value)}
            placeholder="Description SEO"
          />
        </div>

        <ImageField
          label="Image de couverture"
          value={form.coverImage}
          onChange={(value) => updateField("coverImage", value)}
          hint="Ajoutez une URL ou importez une image locale."
        />

        <ToggleInput
          checked={form.featured}
          onChange={(checked) => updateField("featured", checked)}
          label="Mettre cet article en avant sur la page principale"
        />
      </SectionCard>

      {error ? (
        <div className="rounded-xl border border-error-200 bg-error-50 px-4 py-3 text-sm text-error-700 dark:border-error-900/40 dark:bg-error-900/10 dark:text-error-300">
          {error}
        </div>
      ) : null}

      <div className="flex justify-end">
        <Button type="submit" className="min-w-[180px]">
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}

export function CmsStageForm({
  initialValue,
  submitLabel,
  onSubmit,
}: {
  initialValue?: CmsStage;
  submitLabel: string;
  onSubmit: (value: CmsStage) => void;
}) {
  const [form, setForm] = useState<CmsStage>(initialValue ?? emptyStage);
  const [error, setError] = useState("");

  const updateField = <K extends keyof CmsStage>(key: K, value: CmsStage[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (!form.title.trim() || !form.excerpt.trim() || !form.body.trim() || !form.contactEmail.trim()) {
      setError("Completez le titre, le resume, la description et l'email de contact.");
      return;
    }

    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <SectionCard title="Fiche de stage" description="Renseignez tous les elements visibles sur le site.">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-2">
            <FieldLabel>Titre</FieldLabel>
            <TextInput
              value={form.title}
              onChange={(event) => updateField("title", event.target.value)}
              placeholder="Titre du stage"
            />
          </div>
          <div className="space-y-2">
            <FieldLabel>Departement</FieldLabel>
            <TextInput
              value={form.department}
              onChange={(event) => updateField("department", event.target.value)}
              placeholder="Communication"
            />
          </div>
          <div className="space-y-2">
            <FieldLabel>Lieu</FieldLabel>
            <TextInput
              value={form.location}
              onChange={(event) => updateField("location", event.target.value)}
              placeholder="Port-au-Prince"
            />
          </div>
          <div className="space-y-2">
            <FieldLabel>Mode de travail</FieldLabel>
            <SelectInput
              value={form.workMode}
              onChange={(event) => updateField("workMode", event.target.value as CmsStage["workMode"])}
            >
              <option value="onsite">Onsite</option>
              <option value="hybrid">Hybrid</option>
              <option value="remote">Remote</option>
            </SelectInput>
          </div>
          <div className="space-y-2">
            <FieldLabel>Duree</FieldLabel>
            <TextInput
              value={form.duration}
              onChange={(event) => updateField("duration", event.target.value)}
              placeholder="4 mois"
            />
          </div>
          <div className="space-y-2">
            <FieldLabel>Statut</FieldLabel>
            <SelectInput
              value={form.status}
              onChange={(event) => updateField("status", event.target.value as CmsStage["status"])}
            >
              <option value="draft">Draft</option>
              <option value="review">Review</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </SelectInput>
          </div>
          <div className="space-y-2">
            <FieldLabel>Email de contact</FieldLabel>
            <TextInput
              type="email"
              value={form.contactEmail}
              onChange={(event) => updateField("contactEmail", event.target.value)}
              placeholder="recrutement@fctoro.cms"
            />
          </div>
          <div className="space-y-2">
            <FieldLabel>Date limite</FieldLabel>
            <TextInput
              type="date"
              value={form.closeDate || ""}
              onChange={(event) => updateField("closeDate", event.target.value || null)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <FieldLabel>Resume</FieldLabel>
          <TextAreaInput
            rows={3}
            value={form.excerpt}
            onChange={(event) => updateField("excerpt", event.target.value)}
            placeholder="Resume court de l'opportunite."
          />
        </div>

        <div className="space-y-2">
          <FieldLabel>Description detaillee</FieldLabel>
          <CmsRichTextEditor value={form.body} onChange={(value) => updateField("body", value)} />
        </div>

        <ImageField
          label="Image de couverture"
          value={form.coverImage}
          onChange={(value) => updateField("coverImage", value)}
        />

        <ToggleInput
          checked={form.featured}
          onChange={(checked) => updateField("featured", checked)}
          label="Mettre ce stage en avant sur la page principale"
        />
      </SectionCard>

      {error ? (
        <div className="rounded-xl border border-error-200 bg-error-50 px-4 py-3 text-sm text-error-700 dark:border-error-900/40 dark:bg-error-900/10 dark:text-error-300">
          {error}
        </div>
      ) : null}

      <div className="flex justify-end">
        <Button type="submit" className="min-w-[180px]">
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}

export function CmsPartnerForm({
  initialValue,
  submitLabel,
  onSubmit,
}: {
  initialValue?: CmsPartner;
  submitLabel: string;
  onSubmit: (value: CmsPartner) => void;
}) {
  const [form, setForm] = useState<CmsPartner>(initialValue ?? emptyPartner);
  const [error, setError] = useState("");

  const updateField = <K extends keyof CmsPartner>(key: K, value: CmsPartner[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (!form.name.trim() || !form.website.trim()) {
      setError("Renseignez au moins le nom du partenaire et son lien.");
      return;
    }

    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <SectionCard title="Fiche partenaire" description="Logo, lien et niveau de visibilite.">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-2">
            <FieldLabel>Nom</FieldLabel>
            <TextInput
              value={form.name}
              onChange={(event) => updateField("name", event.target.value)}
              placeholder="Nom du partenaire"
            />
          </div>
          <div className="space-y-2">
            <FieldLabel>Site web</FieldLabel>
            <TextInput
              type="url"
              value={form.website}
              onChange={(event) => updateField("website", event.target.value)}
              placeholder="https://..."
            />
          </div>
          <div className="space-y-2">
            <FieldLabel>Categorie</FieldLabel>
            <TextInput
              value={form.category}
              onChange={(event) => updateField("category", event.target.value)}
              placeholder="Media"
            />
          </div>
          <div className="space-y-2">
            <FieldLabel>Niveau</FieldLabel>
            <SelectInput
              value={form.tier}
              onChange={(event) => updateField("tier", event.target.value as CmsPartner["tier"])}
            >
              <option value="principal">Principal</option>
              <option value="gold">Gold</option>
              <option value="silver">Silver</option>
              <option value="media">Media</option>
            </SelectInput>
          </div>
        </div>

        <div className="space-y-2">
          <FieldLabel>Description</FieldLabel>
          <TextAreaInput
            rows={4}
            value={form.description}
            onChange={(event) => updateField("description", event.target.value)}
            placeholder="Description du partenariat"
          />
        </div>

        <ImageField label="Logo" value={form.logo} onChange={(value) => updateField("logo", value)} />

        <ToggleInput
          checked={form.featured}
          onChange={(checked) => updateField("featured", checked)}
          label="Afficher dans la zone partenaires mise en avant"
        />
      </SectionCard>

      {error ? (
        <div className="rounded-xl border border-error-200 bg-error-50 px-4 py-3 text-sm text-error-700 dark:border-error-900/40 dark:bg-error-900/10 dark:text-error-300">
          {error}
        </div>
      ) : null}

      <div className="flex justify-end">
        <Button type="submit" className="min-w-[180px]">
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}

export function CmsUserForm({
  initialValue,
  submitLabel,
  allowAdminFields = true,
  onSubmit,
}: {
  initialValue?: CmsUser;
  submitLabel: string;
  allowAdminFields?: boolean;
  onSubmit: (value: CmsUser) => void;
}) {
  const [form, setForm] = useState<CmsUser>(initialValue ?? emptyUser);
  const [error, setError] = useState("");

  const updateField = <K extends keyof CmsUser>(key: K, value: CmsUser[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (!form.name.trim() || !form.email.trim() || !form.password.trim()) {
      setError("Le nom, l'email et le mot de passe sont obligatoires.");
      return;
    }

    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <SectionCard title="Compte editeur" description="Acces, role et visuel du profil.">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-2">
            <FieldLabel>Nom complet</FieldLabel>
            <TextInput
              value={form.name}
              onChange={(event) => updateField("name", event.target.value)}
              placeholder="Nom complet"
            />
          </div>
          <div className="space-y-2">
            <FieldLabel>Fonction</FieldLabel>
            <TextInput
              value={form.title}
              onChange={(event) => updateField("title", event.target.value)}
              placeholder="Responsable editorial"
            />
          </div>
          <div className="space-y-2">
            <FieldLabel>Email</FieldLabel>
            <TextInput
              type="email"
              value={form.email}
              onChange={(event) => updateField("email", event.target.value)}
              placeholder="nom@fctoro.cms"
            />
          </div>
          <div className="space-y-2">
            <FieldLabel>Mot de passe</FieldLabel>
            <TextInput
              type="text"
              value={form.password}
              onChange={(event) => updateField("password", event.target.value)}
              placeholder="Mot de passe"
            />
          </div>
          {allowAdminFields ? (
            <div className="space-y-2">
              <FieldLabel>Role</FieldLabel>
              <SelectInput
                value={form.role}
                onChange={(event) => updateField("role", event.target.value as CmsUser["role"])}
              >
                <option value="admin">Admin</option>
                <option value="editor">Editor</option>
                <option value="author">Author</option>
              </SelectInput>
            </div>
          ) : null}
        </div>

        <div className="space-y-2">
          <FieldLabel>Bio</FieldLabel>
          <TextAreaInput
            rows={4}
            value={form.bio}
            onChange={(event) => updateField("bio", event.target.value)}
            placeholder="Presentation rapide du profil"
          />
        </div>

        <ImageField label="Avatar" value={form.avatar} onChange={(value) => updateField("avatar", value)} />

        {allowAdminFields ? (
          <ToggleInput
            checked={form.active}
            onChange={(checked) => updateField("active", checked)}
            label="Compte actif et autorise a publier"
          />
        ) : null}
      </SectionCard>

      {error ? (
        <div className="rounded-xl border border-error-200 bg-error-50 px-4 py-3 text-sm text-error-700 dark:border-error-900/40 dark:bg-error-900/10 dark:text-error-300">
          {error}
        </div>
      ) : null}

      <div className="flex justify-end">
        <Button type="submit" className="min-w-[180px]">
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}

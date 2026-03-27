"use client";

<<<<<<< HEAD
import { usePathname } from "next/navigation";
import {
  clearAdminSession,
  getAdminSession,
  getAdminToken,
} from "@/lib/admin-auth";
=======
import { seedCmsData } from "@/data/cms-seed";
>>>>>>> 8dace4bc0a45c5486fb56dd83a4a0b5a447a7b3a
import {
  AuthResponse,
  CmsArticle,
  CmsDataSnapshot,
  CmsPartner,
  CmsStage,
  CmsUser,
  HomePageSettings,
  SaveUserResponse,
  SignInPayload,
  SiteSettings,
} from "@/types/cms";
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

<<<<<<< HEAD
=======
const DATA_STORAGE_KEY = "fctoro-cms-data-v1";
const SESSION_STORAGE_KEY = "fctoro-cms-session-v1";
const PERSISTENT_SESSION_STORAGE_KEY = "fctoro-cms-persistent-session-v1";

>>>>>>> 8dace4bc0a45c5486fb56dd83a4a0b5a447a7b3a
type ArticleInput = Omit<CmsArticle, "createdAt" | "updatedAt" | "publishedAt" | "slug"> & {
  slug?: string;
};
type StageInput = Omit<CmsStage, "createdAt" | "updatedAt" | "publishedAt" | "slug"> & {
  slug?: string;
};

interface CmsAlert {
  id: string;
  title: string;
  description: string;
  href: string;
}

interface CmsContextValue extends CmsDataSnapshot {
  hydrated: boolean;
  currentUser: CmsUser | null;
  publishedArticles: CmsArticle[];
  publishedStages: CmsStage[];
  alerts: CmsAlert[];
  canManageUsers: boolean;
  signIn: (payload: SignInPayload) => AuthResponse;
  signOut: () => void;
  saveArticle: (input: ArticleInput) => CmsArticle;
  deleteArticle: (articleId: string) => void;
  saveStage: (input: StageInput) => CmsStage;
  deleteStage: (stageId: string) => void;
  savePartner: (input: CmsPartner) => CmsPartner;
  deletePartner: (partnerId: string) => void;
  saveUser: (input: CmsUser) => SaveUserResponse;
  deleteUser: (userId: string) => SaveUserResponse;
  updateHomePage: (patch: Partial<HomePageSettings>) => void;
  updateSiteSettings: (patch: Partial<SiteSettings>) => void;
  trackArticleView: (articleId: string) => void;
  trackArticleLinkClick: (articleId: string) => void;
  trackStageView: (stageId: string) => void;
  trackStageApplication: (stageId: string) => void;
  trackStageContact: (stageId: string) => void;
  trackPartnerClick: (partnerId: string) => void;
  trackHomeVisit: () => void;
  trackHomeCta: () => void;
}

<<<<<<< HEAD
const defaultHomePage: HomePageSettings = {
  heroBadge: "FC Toro CMS",
  heroTitle: "Pilotez vos contenus depuis le CMS.",
  heroSubtitle: "Les articles visibles sur cette page sont charges depuis la base de donnees.",
  heroPrimaryCtaLabel: "Voir les articles",
  heroPrimaryCtaUrl: "#articles",
  heroSecondaryCtaLabel: "Connexion CMS",
  heroSecondaryCtaUrl: "/signin",
  heroBackgroundImage: "/images/grid-image/image-01.png",
  aboutTitle: "Contenus centralises",
  aboutBody: "Le site public lit maintenant les articles depuis votre API Next et PostgreSQL.",
  articleSectionTitle: "Articles publies",
  articleSectionIntro: "Les articles ci-dessous proviennent directement de votre base.",
  stageSectionTitle: "Stages",
  stageSectionIntro: "Aucune source de base n'est encore branchee pour les stages.",
  partnerSectionTitle: "Partenaires",
  partnerSectionIntro: "Aucune source de base n'est encore branchee pour les partenaires.",
  metrics: [],
  featuredArticleIds: [],
  featuredStageIds: [],
  visits: 0,
  ctaClicks: 0,
};

const defaultSiteSettings: SiteSettings = {
  siteName: "FC Toro CMS",
  publicTagline: "Gestion editoriale connectee a PostgreSQL",
  primaryEmail: "contact@fctoro.cms",
  phone: "+509 0000-0000",
  address: "Port-au-Prince",
  footerText: "Le contenu editorial public est synchronise avec la base de donnees.",
  partnerPageTitle: "Partenaires",
  partnerPageIntro: "Section en attente de branchement base de donnees.",
  articlePageTitle: "Articles",
  articlePageIntro: "Les articles de cette page proviennent de PostgreSQL.",
  stagePageTitle: "Stages",
  stagePageIntro: "Section en attente de branchement base de donnees.",
};

const initialData: CmsDataSnapshot = {
  articles: [],
  stages: [],
  partners: [],
  users: [],
  homePage: defaultHomePage,
  siteSettings: defaultSiteSettings,
};

const CmsContext = createContext<CmsContextValue | null>(null);

function mapStatus(value: string | null | undefined): CmsArticle["status"] {
  switch (value) {
    case "publie":
    case "published":
      return "published";
    case "revision":
    case "review":
      return "review";
    case "archive":
    case "archived":
      return "archived";
    default:
      return "draft";
  }
}

function mapRole(value: string | null | undefined): CmsUser["role"] {
  if (value === "super_admin") {
    return "super_admin";
  }

  if (value === "editor" || value === "author") {
    return value;
  }

  return "admin";
}

function mapDbArticle(row: Record<string, unknown>): CmsArticle {
  return {
    id: String(row.id ?? ""),
    slug: String(row.slug ?? ""),
    title: String(row.titre_fr ?? row.title ?? ""),
    excerpt: String(row.extrait_fr ?? row.excerpt ?? ""),
    body: String(row.contenu_fr ?? row.body ?? row.extrait_fr ?? ""),
    coverImage: String(row.photo_couverture ?? row.coverImage ?? "/images/grid-image/image-01.png"),
    category: String(row.categorie ?? row.category ?? "Articles"),
    tags: Array.isArray(row.tags) ? row.tags.map(String) : [],
    authorId: String(row.auteur_id ?? row.authorId ?? row.auteur ?? ""),
    featured: Boolean(row.featured),
    status: mapStatus(String(row.statut ?? row.status ?? "")),
    seoTitle: String(row.seo_title ?? row.titre_en ?? row.seoTitle ?? row.titre_fr ?? ""),
    seoDescription: String(row.seo_description ?? row.seoDescription ?? row.extrait_fr ?? ""),
    createdAt: String(row.date_creation ?? row.createdAt ?? new Date().toISOString()),
    updatedAt: String(
      row.date_modification ?? row.updatedAt ?? row.date_creation ?? new Date().toISOString(),
    ),
    publishedAt: row.date_publication ? String(row.date_publication) : null,
    metrics: {
      views: Number(row.views ?? 0),
      linkClicks: Number(row.linkClicks ?? 0),
      shares: Number(row.shares ?? 0),
      leads: Number(row.leads ?? 0),
    },
  };
}

function mapDbStage(row: Record<string, unknown>): CmsStage {
  return {
    id: String(row.id ?? ""),
    slug: String(row.slug ?? ""),
    title: String(row.titre ?? ""),
    excerpt: String(row.extrait ?? ""),
    body: String(row.contenu ?? ""),
    coverImage: String(row.photo_couverture ?? "/images/grid-image/image-01.png"),
    department: String(row.departement ?? ""),
    location: String(row.location ?? ""),
    workMode: (row.work_mode as CmsStage["workMode"]) || "hybrid",
    duration: String(row.duration ?? ""),
    contactEmail: String(row.contact_email ?? ""),
    closeDate: row.close_date ? String(row.close_date) : null,
    featured: Boolean(row.featured),
    status: mapStatus(String(row.statut ?? "")),
    createdAt: String(row.date_creation ?? new Date().toISOString()),
    updatedAt: String(row.date_modification ?? new Date().toISOString()),
    publishedAt: row.date_publication ? String(row.date_publication) : null,
    metrics: {
      views: Number(row.views ?? 0),
      applications: Number(row.applications ?? 0),
      contactClicks: Number(row.contact_clicks ?? 0),
    },
  };
}

function mapDbPartner(row: Record<string, unknown>): CmsPartner {
  return {
    id: String(row.id ?? ""),
    name: String(row.nom ?? ""),
    website: String(row.website ?? ""),
    logo: String(row.logo ?? ""),
    category: String(row.categorie ?? "Media"),
    tier: (row.tier as CmsPartner["tier"]) || "silver",
    description: String(row.description ?? ""),
    featured: Boolean(row.featured),
    createdAt: String(row.date_creation ?? new Date().toISOString()),
    clicks: Number(row.clicks ?? 0),
  };
}

function mapDbUser(row: Record<string, unknown>): CmsUser {
  return {
    id: String(row.id ?? ""),
    name: String(row.nom ?? ""),
    email: String(row.email ?? ""),
    password: "",
    role: mapRole(String(row.role ?? "")),
    title: String(row.title ?? ""),
    avatar: String(row.avatar ?? "/images/user/owner.jpg"),
    bio: String(row.bio ?? ""),
    active: Boolean(row.actif ?? true),
    lastLoginAt: row.last_login_at ? String(row.last_login_at) : null,
  };
}

function createCurrentUserFromSession() {
  const session = getAdminSession();
  if (!session?.user) {
    return null;
  }

  return {
    ...session.user,
    role: mapRole(session.user.role),
    avatar: session.user.avatar || "/images/user/owner.jpg",
    title: session.user.title || "Administration",
    bio: session.user.bio || "",
    password: "",
    active: true,
  } satisfies CmsUser;
}

export const CmsProvider = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const [data, setData] = useState<CmsDataSnapshot>(initialData);
  const [currentUser, setCurrentUser] = useState<CmsUser | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const validateSession = async () => {
      const sessionUser = createCurrentUserFromSession();
      const token = getAdminToken();

      if (!sessionUser || !token) {
        clearAdminSession();
        setCurrentUser(null);
        setHydrated(true);
        return;
      }

      try {
        const response = await fetch("/api/admin/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Session invalide");
        }

        const payload = await response.json();
        setCurrentUser(mapDbUser(payload.data));
      } catch {
        clearAdminSession();
        setCurrentUser(null);
      } finally {
        setHydrated(true);
      }
    };

    void validateSession();
  }, []);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    const controller = new AbortController();

    const loadArticles = async () => {
      try {
        const token = getAdminToken();
        const headers = token ? { Authorization: `Bearer ${token}` } : undefined;

        const needsArticles =
          pathname === "/" ||
          pathname.startsWith("/dashboard");
        const needsStages =
          pathname.startsWith("/dashboard");
        const needsPartners =
          pathname.startsWith("/dashboard");
        const needsUsers =
          pathname.startsWith("/profile") ||
          pathname.startsWith("/dashboard");
        const needsSettings =
          pathname.startsWith("/parametres") ||
          pathname === "/" ||
          pathname.startsWith("/dashboard");

        const articlesRes = await fetch(
          token
            ? needsArticles
              ? "/api/admin/articles?limit=100"
              : "/api/admin/articles?limit=20"
            : "/api/articles?limit=100",
          {
            headers,
            signal: controller.signal,
            cache: "no-store",
          },
        );
        const stagesRes = token && needsStages
          ? await fetch("/api/admin/stages", {
              headers,
              signal: controller.signal,
              cache: "no-store",
            })
          : null;
        const partnersRes = token && needsPartners
          ? await fetch("/api/admin/partners", {
              headers,
              signal: controller.signal,
              cache: "no-store",
            })
          : null;
        const settingsRes = token && needsSettings
          ? await fetch("/api/admin/settings", {
              headers,
              signal: controller.signal,
              cache: "no-store",
            })
          : null;
        const usersRes = token && needsUsers
          ? await fetch("/api/admin/users", {
              headers,
              signal: controller.signal,
              cache: "no-store",
            })
          : null;

        const articlePayload = articlesRes && articlesRes.ok ? await articlesRes.json() : { data: [] };
        const stagePayload = stagesRes && stagesRes.ok ? await stagesRes.json() : { data: [] };
        const partnerPayload = partnersRes && partnersRes.ok ? await partnersRes.json() : { data: [] };
        const settingsPayload = settingsRes && settingsRes.ok ? await settingsRes.json() : {};
        const usersPayload = usersRes && usersRes.ok ? await usersRes.json() : { data: [] };

        setData((prev) => ({
          ...prev,
          articles: Array.isArray(articlePayload.data) ? articlePayload.data.map(mapDbArticle) : [],
          stages: Array.isArray(stagePayload.data) ? stagePayload.data.map(mapDbStage) : prev.stages,
          partners: Array.isArray(partnerPayload.data) ? partnerPayload.data.map(mapDbPartner) : prev.partners,
          users: Array.isArray(usersPayload.data) ? usersPayload.data.map(mapDbUser) : prev.users,
          homePage: settingsPayload.home
            ? {
                ...prev.homePage,
                heroBadge: settingsPayload.home.hero_badge,
                heroTitle: settingsPayload.home.hero_title,
                heroSubtitle: settingsPayload.home.hero_subtitle,
                heroPrimaryCtaLabel: settingsPayload.home.hero_primary_cta_label,
                heroPrimaryCtaUrl: settingsPayload.home.hero_primary_cta_url,
                heroSecondaryCtaLabel: settingsPayload.home.hero_secondary_cta_label,
                heroSecondaryCtaUrl: settingsPayload.home.hero_secondary_cta_url,
                heroBackgroundImage: settingsPayload.home.hero_background_image,
                aboutTitle: settingsPayload.home.about_title,
                aboutBody: settingsPayload.home.about_body,
                articleSectionTitle: settingsPayload.home.article_section_title,
                articleSectionIntro: settingsPayload.home.article_section_intro,
                stageSectionTitle: settingsPayload.home.stage_section_title,
                stageSectionIntro: settingsPayload.home.stage_section_intro,
                partnerSectionTitle: settingsPayload.home.partner_section_title,
                partnerSectionIntro: settingsPayload.home.partner_section_intro,
                featuredArticleIds: settingsPayload.home.featured_article_ids || [],
                featuredStageIds: settingsPayload.home.featured_stage_ids || [],
                visits: settingsPayload.home.visits || 0,
                ctaClicks: settingsPayload.home.cta_clicks || 0,
                metrics: Array.isArray(settingsPayload.metrics) ? settingsPayload.metrics.map((m: any) => ({ label: m.label, value: m.value, note: m.note || undefined })) : prev.homePage.metrics,
              }
            : prev.homePage,
          siteSettings: settingsPayload.site
            ? {
                ...prev.siteSettings,
                siteName: settingsPayload.site.site_name,
                publicTagline: settingsPayload.site.public_tagline,
                primaryEmail: settingsPayload.site.primary_email,
                phone: settingsPayload.site.phone,
                address: settingsPayload.site.address,
                footerText: settingsPayload.site.footer_text,
                partnerPageTitle: settingsPayload.site.partner_page_title,
                partnerPageIntro: settingsPayload.site.partner_page_intro,
                articlePageTitle: settingsPayload.site.article_page_title,
                articlePageIntro: settingsPayload.site.article_page_intro,
                stagePageTitle: settingsPayload.site.stage_page_title,
                stagePageIntro: settingsPayload.site.stage_page_intro,
              }
            : prev.siteSettings,
        }));
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          console.error("[CmsContext] Impossible de charger les articles");
        }
      }
    };

    void loadArticles();

    return () => controller.abort();
  }, [hydrated, currentUser, pathname]);

  useEffect(() => {
    if (!currentUser) {
      setData((prev) => ({ ...prev, users: [] }));
      return;
    }

    setData((prev) => ({ ...prev, users: [currentUser] }));
  }, [currentUser]);

  const publishedArticles = useMemo(
    () => data.articles.filter((article) => article.status === "published" && article.publishedAt),
=======
const CmsContext = createContext<CmsContextValue | null>(null);

const cloneSeed = (): CmsDataSnapshot => structuredClone(seedCmsData);

const parseSnapshot = (raw: string | null): CmsDataSnapshot => {
  if (!raw) {
    return cloneSeed();
  }

  try {
    const parsed = JSON.parse(raw) as Partial<CmsDataSnapshot>;
    const fallback = cloneSeed();
    return {
      articles: Array.isArray(parsed.articles) ? parsed.articles : fallback.articles,
      stages: Array.isArray(parsed.stages) ? parsed.stages : fallback.stages,
      partners: Array.isArray(parsed.partners) ? parsed.partners : fallback.partners,
      users: Array.isArray(parsed.users) ? parsed.users : fallback.users,
      homePage: parsed.homePage ? { ...fallback.homePage, ...parsed.homePage } : fallback.homePage,
      siteSettings: parsed.siteSettings
        ? { ...fallback.siteSettings, ...parsed.siteSettings }
        : fallback.siteSettings,
    };
  } catch {
    return cloneSeed();
  }
};

const createId = (prefix: string) =>
  `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

const slugify = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const ensureUniqueSlug = (
  preferred: string,
  entries: { id: string; slug: string }[],
  currentId?: string,
) => {
  const baseSlug = preferred || createId("content");
  let nextSlug = baseSlug;
  let suffix = 2;

  while (entries.some((entry) => entry.slug === nextSlug && entry.id !== currentId)) {
    nextSlug = `${baseSlug}-${suffix}`;
    suffix += 1;
  }

  return nextSlug;
};

const sortByMostRecent = <T extends { updatedAt?: string; publishedAt?: string | null; createdAt?: string }>(
  entries: T[],
) =>
  [...entries].sort((left, right) => {
    const leftDate = left.updatedAt ?? left.publishedAt ?? left.createdAt ?? "";
    const rightDate = right.updatedAt ?? right.publishedAt ?? right.createdAt ?? "";
    return rightDate.localeCompare(leftDate);
  });

const getSessionUserId = () => {
  if (typeof window === "undefined") {
    return null;
  }

  return (
    window.sessionStorage.getItem(SESSION_STORAGE_KEY) ??
    window.localStorage.getItem(PERSISTENT_SESSION_STORAGE_KEY)
  );
};

const persistSessionUserId = (userId: string | null, remember: boolean) => {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.removeItem(SESSION_STORAGE_KEY);
  window.localStorage.removeItem(PERSISTENT_SESSION_STORAGE_KEY);

  if (!userId) {
    return;
  }

  if (remember) {
    window.localStorage.setItem(PERSISTENT_SESSION_STORAGE_KEY, userId);
    return;
  }

  window.sessionStorage.setItem(SESSION_STORAGE_KEY, userId);
};

export const CmsProvider = ({ children }: { children: React.ReactNode }) => {
  const [data, setData] = useState<CmsDataSnapshot>(cloneSeed);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    setData(parseSnapshot(window.localStorage.getItem(DATA_STORAGE_KEY)));
    setCurrentUserId(getSessionUserId());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated || typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(DATA_STORAGE_KEY, JSON.stringify(data));
  }, [data, hydrated]);

  const currentUser = useMemo(
    () => data.users.find((user) => user.id === currentUserId) ?? null,
    [currentUserId, data.users],
  );

  const publishedArticles = useMemo(
    () =>
      sortByMostRecent(
        data.articles.filter((article) => article.status === "published" && article.publishedAt),
      ),
>>>>>>> 8dace4bc0a45c5486fb56dd83a4a0b5a447a7b3a
    [data.articles],
  );

  const publishedStages = useMemo(
<<<<<<< HEAD
    () => data.stages.filter((stage) => stage.status === "published" && stage.publishedAt),
    [data.stages],
  );

  const alerts = useMemo<CmsAlert[]>(
    () =>
      data.articles
        .filter((article) => article.status === "review")
        .slice(0, 3)
        .map((article) => ({
          id: `article-${article.id}`,
          title: "Article en revue",
          description: article.title,
          href: `/joueurs/${article.id}/modifier`,
        })),
    [data.articles],
  );

  const signIn = ({ email }: SignInPayload): AuthResponse => {
    const sessionUser = createCurrentUserFromSession();

    if (!sessionUser || sessionUser.email.toLowerCase() !== email.trim().toLowerCase()) {
      return {
        success: false,
        message: "Connexion invalide. Passez par l'ecran de connexion API.",
      };
    }

    setCurrentUser(sessionUser);
=======
    () =>
      sortByMostRecent(
        data.stages.filter((stage) => stage.status === "published" && stage.publishedAt),
      ),
    [data.stages],
  );

  const alerts = useMemo<CmsAlert[]>(() => {
    const reviewArticles = data.articles
      .filter((article) => article.status === "review")
      .slice(0, 3)
      .map((article) => ({
        id: `article-${article.id}`,
        title: "Article en revue",
        description: article.title,
        href: `/joueurs/${article.id}/modifier`,
      }));

    const draftStages = data.stages
      .filter((stage) => stage.status !== "published")
      .slice(0, 3)
      .map((stage) => ({
        id: `stage-${stage.id}`,
        title: "Stage a finaliser",
        description: stage.title,
        href: `/staff/${stage.id}/modifier`,
      }));

    return [...reviewArticles, ...draftStages];
  }, [data.articles, data.stages]);

  const canManageUsers = currentUser?.role === "admin";

  const signIn = ({ email, password, remember }: SignInPayload): AuthResponse => {
    const targetUser = data.users.find(
      (user) => user.email.toLowerCase() === email.trim().toLowerCase() && user.active,
    );

    if (!targetUser || targetUser.password !== password) {
      return {
        success: false,
        message: "Identifiants invalides. Verifiez votre email et mot de passe.",
      };
    }

    setCurrentUserId(targetUser.id);
    persistSessionUserId(targetUser.id, remember);
    setData((prev) => ({
      ...prev,
      users: prev.users.map((user) =>
        user.id === targetUser.id ? { ...user, lastLoginAt: new Date().toISOString() } : user,
      ),
    }));

>>>>>>> 8dace4bc0a45c5486fb56dd83a4a0b5a447a7b3a
    return { success: true };
  };

  const signOut = () => {
<<<<<<< HEAD
    clearAdminSession();
    setCurrentUser(null);
    setData((prev) => ({
      ...prev,
      articles: prev.articles.filter((article) => article.status === "published"),
      users: [],
    }));
  };

  const deleteArticle = (articleId: string) => {
    const token = getAdminToken();

    if (!token) {
      return;
    }

=======
    setCurrentUserId(null);
    persistSessionUserId(null, false);
  };

  const saveArticle = (input: ArticleInput) => {
    const now = new Date().toISOString();
    const existing = data.articles.find((article) => article.id === input.id);
    const nextArticle: CmsArticle = {
      ...existing,
      ...input,
      id: input.id || createId("article"),
      slug: ensureUniqueSlug(slugify(input.slug || input.title), data.articles, input.id),
      tags: Array.isArray(input.tags) ? input.tags.filter(Boolean) : [],
      featured: Boolean(input.featured),
      metrics: existing?.metrics ?? input.metrics ?? { views: 0, linkClicks: 0, shares: 0, leads: 0 },
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
      publishedAt:
        input.status === "published"
          ? existing?.publishedAt ?? now
          : input.status === "archived"
          ? existing?.publishedAt ?? null
          : existing?.publishedAt ?? null,
    };

    setData((prev) => ({
      ...prev,
      articles: sortByMostRecent(
        existing
          ? prev.articles.map((article) => (article.id === nextArticle.id ? nextArticle : article))
          : [nextArticle, ...prev.articles],
      ),
    }));

    return nextArticle;
  };

  const deleteArticle = (articleId: string) => {
>>>>>>> 8dace4bc0a45c5486fb56dd83a4a0b5a447a7b3a
    setData((prev) => ({
      ...prev,
      articles: prev.articles.filter((article) => article.id !== articleId),
      homePage: {
        ...prev.homePage,
        featuredArticleIds: prev.homePage.featuredArticleIds.filter((id) => id !== articleId),
      },
    }));
<<<<<<< HEAD

    void fetch(`/api/admin/articles/${articleId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).catch(() => {
      console.error("[CmsContext] Echec de suppression d'article");
    });
  };

  const saveArticle = (input: ArticleInput) =>
    ({
      ...input,
      slug: input.slug || "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      publishedAt: input.status === "published" ? new Date().toISOString() : null,
    }) as CmsArticle;

  const saveStage = (input: StageInput) =>
    {
      const token = getAdminToken();
      const nextStage = {
        ...input,
        slug: input.slug || "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        publishedAt: input.status === "published" ? new Date().toISOString() : null,
      } as CmsStage;

      if (!token) {
        return nextStage;
      }

      const payload = {
        titre: nextStage.title,
        extrait: nextStage.excerpt,
        contenu: nextStage.body,
        photo_couverture: nextStage.coverImage,
        departement: nextStage.department,
        location: nextStage.location,
        work_mode: nextStage.workMode,
        duration: nextStage.duration,
        contact_email: nextStage.contactEmail,
        close_date: nextStage.closeDate,
        featured: nextStage.featured,
        statut: nextStage.status,
        slug: nextStage.slug,
        date_publication: nextStage.publishedAt,
      };

      const method = nextStage.id ? "PUT" : "POST";
      const url = nextStage.id ? `/api/admin/stages/${nextStage.id}` : "/api/admin/stages";
      void fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      return nextStage;
    };

  const deleteStage = (stageId: string) => {
    const token = getAdminToken();
    if (!token) return;
    setData((prev) => ({ ...prev, stages: prev.stages.filter((stage) => stage.id !== stageId) }));
    void fetch(`/api/admin/stages/${stageId}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
  };

  const savePartner = (input: CmsPartner) => {
    const token = getAdminToken();
    if (!token) return input;
    const payload = {
      nom: input.name,
      website: input.website,
      logo: input.logo,
      categorie: input.category,
      tier: input.tier,
      description: input.description,
      featured: input.featured,
    };
    const method = input.id ? "PUT" : "POST";
    const url = input.id ? `/api/admin/partners/${input.id}` : "/api/admin/partners";
    void fetch(url, { method, headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify(payload) });
    return input;
  };

  const deletePartner = (partnerId: string) => {
    const token = getAdminToken();
    if (!token) return;
    setData((prev) => ({ ...prev, partners: prev.partners.filter((partner) => partner.id !== partnerId) }));
    void fetch(`/api/admin/partners/${partnerId}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
  };

  const saveUser = (input: CmsUser): SaveUserResponse => {
    const token = getAdminToken();
    if (!token) return { success: false, message: "Session admin absente." };
    const payload = { nom: input.name, email: input.email, password: input.password, role: input.role, title: input.title, avatar: input.avatar, bio: input.bio, actif: input.active };
    const method = input.id ? "PUT" : "POST";
    const url = input.id ? `/api/admin/users/${input.id}` : "/api/admin/users";
    void fetch(url, { method, headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify(payload) });
    return { success: true, user: input };
  };

  const deleteUser = (userId: string): SaveUserResponse => {
    const token = getAdminToken();
    if (!token) return { success: false, message: "Session admin absente." };
    setData((prev) => ({ ...prev, users: prev.users.filter((user) => user.id !== userId) }));
    void fetch(`/api/admin/users/${userId}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
=======
  };

  const saveStage = (input: StageInput) => {
    const now = new Date().toISOString();
    const existing = data.stages.find((stage) => stage.id === input.id);
    const nextStage: CmsStage = {
      ...existing,
      ...input,
      id: input.id || createId("stage"),
      slug: ensureUniqueSlug(slugify(input.slug || input.title), data.stages, input.id),
      featured: Boolean(input.featured),
      metrics: existing?.metrics ?? input.metrics ?? { views: 0, applications: 0, contactClicks: 0 },
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
      publishedAt:
        input.status === "published"
          ? existing?.publishedAt ?? now
          : input.status === "archived"
          ? existing?.publishedAt ?? null
          : existing?.publishedAt ?? null,
    };

    setData((prev) => ({
      ...prev,
      stages: sortByMostRecent(
        existing
          ? prev.stages.map((stage) => (stage.id === nextStage.id ? nextStage : stage))
          : [nextStage, ...prev.stages],
      ),
    }));

    return nextStage;
  };

  const deleteStage = (stageId: string) => {
    setData((prev) => ({
      ...prev,
      stages: prev.stages.filter((stage) => stage.id !== stageId),
      homePage: {
        ...prev.homePage,
        featuredStageIds: prev.homePage.featuredStageIds.filter((id) => id !== stageId),
      },
    }));
  };

  const savePartner = (input: CmsPartner) => {
    const existing = data.partners.find((partner) => partner.id === input.id);
    const nextPartner: CmsPartner = {
      ...existing,
      ...input,
      id: input.id || createId("partner"),
      createdAt: existing?.createdAt ?? new Date().toISOString(),
      clicks: existing?.clicks ?? input.clicks ?? 0,
    };

    setData((prev) => ({
      ...prev,
      partners: sortByMostRecent(
        existing
          ? prev.partners.map((partner) => (partner.id === nextPartner.id ? nextPartner : partner))
          : [nextPartner, ...prev.partners],
      ),
    }));

    return nextPartner;
  };

  const deletePartner = (partnerId: string) => {
    setData((prev) => ({
      ...prev,
      partners: prev.partners.filter((partner) => partner.id !== partnerId),
    }));
  };

  const saveUser = (input: CmsUser): SaveUserResponse => {
    const email = input.email.trim().toLowerCase();
    const existing = data.users.find((user) => user.id === input.id);
    const duplicate = data.users.find(
      (user) => user.email.toLowerCase() === email && user.id !== input.id,
    );

    if (duplicate) {
      return {
        success: false,
        message: "Cet email est deja utilise par un autre compte.",
      };
    }

    const nextUser: CmsUser = {
      ...existing,
      ...input,
      id: input.id || createId("user"),
      email,
      active: Boolean(input.active),
      lastLoginAt: existing?.lastLoginAt ?? input.lastLoginAt ?? null,
    };

    setData((prev) => ({
      ...prev,
      users: (existing
        ? prev.users.map((user) => (user.id === nextUser.id ? nextUser : user))
        : [nextUser, ...prev.users]
      ).sort((left, right) => left.name.localeCompare(right.name)),
    }));

    return {
      success: true,
      user: nextUser,
    };
  };

  const deleteUser = (userId: string): SaveUserResponse => {
    if (userId === currentUserId) {
      return {
        success: false,
        message: "Vous ne pouvez pas supprimer le compte actuellement connecte.",
      };
    }

    const remainingAdmins = data.users.filter((user) => user.role === "admin" && user.id !== userId);
    const targetUser = data.users.find((user) => user.id === userId);

    if (targetUser?.role === "admin" && remainingAdmins.length === 0) {
      return {
        success: false,
        message: "Le CMS doit conserver au moins un administrateur actif.",
      };
    }

    setData((prev) => ({
      ...prev,
      users: prev.users.filter((user) => user.id !== userId),
      articles: prev.articles.map((article) =>
        article.authorId === userId ? { ...article, authorId: currentUserId || article.authorId } : article,
      ),
    }));

>>>>>>> 8dace4bc0a45c5486fb56dd83a4a0b5a447a7b3a
    return { success: true };
  };

  const updateHomePage = (patch: Partial<HomePageSettings>) => {
<<<<<<< HEAD
    const token = getAdminToken();
    setData((prev) => {
      const next = { ...prev, homePage: { ...prev.homePage, ...patch } };
      if (token) {
        const settingsPayload = {
          home: {
            hero_badge: next.homePage.heroBadge,
            hero_title: next.homePage.heroTitle,
            hero_subtitle: next.homePage.heroSubtitle,
            hero_primary_cta_label: next.homePage.heroPrimaryCtaLabel,
            hero_primary_cta_url: next.homePage.heroPrimaryCtaUrl,
            hero_secondary_cta_label: next.homePage.heroSecondaryCtaLabel,
            hero_secondary_cta_url: next.homePage.heroSecondaryCtaUrl,
            hero_background_image: next.homePage.heroBackgroundImage,
            about_title: next.homePage.aboutTitle,
            about_body: next.homePage.aboutBody,
            article_section_title: next.homePage.articleSectionTitle,
            article_section_intro: next.homePage.articleSectionIntro,
            stage_section_title: next.homePage.stageSectionTitle,
            stage_section_intro: next.homePage.stageSectionIntro,
            partner_section_title: next.homePage.partnerSectionTitle,
            partner_section_intro: next.homePage.partnerSectionIntro,
            featured_article_ids: next.homePage.featuredArticleIds,
            featured_stage_ids: next.homePage.featuredStageIds,
            visits: next.homePage.visits,
            cta_clicks: next.homePage.ctaClicks,
          },
          metrics: next.homePage.metrics,
        };

        void fetch("/api/admin/settings", {
          method: "PUT",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify(settingsPayload),
        });
      }
      return next;
    });
  };

  const updateSiteSettings = (patch: Partial<SiteSettings>) => {
    const token = getAdminToken();
    setData((prev) => {
      const next = { ...prev, siteSettings: { ...prev.siteSettings, ...patch } };
      if (token) {
        const settingsPayload = {
          site: {
            site_name: next.siteSettings.siteName,
            public_tagline: next.siteSettings.publicTagline,
            primary_email: next.siteSettings.primaryEmail,
            phone: next.siteSettings.phone,
            address: next.siteSettings.address,
            footer_text: next.siteSettings.footerText,
            partner_page_title: next.siteSettings.partnerPageTitle,
            partner_page_intro: next.siteSettings.partnerPageIntro,
            article_page_title: next.siteSettings.articlePageTitle,
            article_page_intro: next.siteSettings.articlePageIntro,
            stage_page_title: next.siteSettings.stagePageTitle,
            stage_page_intro: next.siteSettings.stagePageIntro,
          },
        };

        void fetch("/api/admin/settings", {
          method: "PUT",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify(settingsPayload),
        });
      }
      return next;
    });
=======
    setData((prev) => ({
      ...prev,
      homePage: {
        ...prev.homePage,
        ...patch,
      },
    }));
  };

  const updateSiteSettings = (patch: Partial<SiteSettings>) => {
    setData((prev) => ({
      ...prev,
      siteSettings: {
        ...prev.siteSettings,
        ...patch,
      },
    }));
>>>>>>> 8dace4bc0a45c5486fb56dd83a4a0b5a447a7b3a
  };

  const trackArticleView = (articleId: string) => {
    setData((prev) => ({
      ...prev,
      articles: prev.articles.map((article) =>
        article.id === articleId
<<<<<<< HEAD
          ? { ...article, metrics: { ...article.metrics, views: article.metrics.views + 1 } }
=======
          ? {
              ...article,
              metrics: { ...article.metrics, views: article.metrics.views + 1 },
            }
>>>>>>> 8dace4bc0a45c5486fb56dd83a4a0b5a447a7b3a
          : article,
      ),
    }));
  };

  const trackArticleLinkClick = (articleId: string) => {
    setData((prev) => ({
      ...prev,
      articles: prev.articles.map((article) =>
        article.id === articleId
          ? {
              ...article,
              metrics: { ...article.metrics, linkClicks: article.metrics.linkClicks + 1 },
            }
          : article,
      ),
    }));
  };

<<<<<<< HEAD
  const trackStageView = (_stageId: string) => {};
  const trackStageApplication = (_stageId: string) => {};
  const trackStageContact = (_stageId: string) => {};
  const trackPartnerClick = (_partnerId: string) => {};
=======
  const trackStageView = (stageId: string) => {
    setData((prev) => ({
      ...prev,
      stages: prev.stages.map((stage) =>
        stage.id === stageId
          ? {
              ...stage,
              metrics: { ...stage.metrics, views: stage.metrics.views + 1 },
            }
          : stage,
      ),
    }));
  };

  const trackStageApplication = (stageId: string) => {
    setData((prev) => ({
      ...prev,
      stages: prev.stages.map((stage) =>
        stage.id === stageId
          ? {
              ...stage,
              metrics: { ...stage.metrics, applications: stage.metrics.applications + 1 },
            }
          : stage,
      ),
    }));
  };

  const trackStageContact = (stageId: string) => {
    setData((prev) => ({
      ...prev,
      stages: prev.stages.map((stage) =>
        stage.id === stageId
          ? {
              ...stage,
              metrics: { ...stage.metrics, contactClicks: stage.metrics.contactClicks + 1 },
            }
          : stage,
      ),
    }));
  };

  const trackPartnerClick = (partnerId: string) => {
    setData((prev) => ({
      ...prev,
      partners: prev.partners.map((partner) =>
        partner.id === partnerId ? { ...partner, clicks: partner.clicks + 1 } : partner,
      ),
    }));
  };
>>>>>>> 8dace4bc0a45c5486fb56dd83a4a0b5a447a7b3a

  const trackHomeVisit = () => {
    setData((prev) => ({
      ...prev,
      homePage: {
        ...prev.homePage,
        visits: prev.homePage.visits + 1,
      },
    }));
  };

  const trackHomeCta = () => {
    setData((prev) => ({
      ...prev,
      homePage: {
        ...prev.homePage,
        ctaClicks: prev.homePage.ctaClicks + 1,
      },
    }));
  };

  return (
    <CmsContext.Provider
      value={{
        ...data,
        hydrated,
        currentUser,
        publishedArticles,
        publishedStages,
        alerts,
<<<<<<< HEAD
        canManageUsers: currentUser?.role === "admin" || currentUser?.role === "super_admin",
=======
        canManageUsers,
>>>>>>> 8dace4bc0a45c5486fb56dd83a4a0b5a447a7b3a
        signIn,
        signOut,
        saveArticle,
        deleteArticle,
        saveStage,
        deleteStage,
        savePartner,
        deletePartner,
        saveUser,
        deleteUser,
        updateHomePage,
        updateSiteSettings,
        trackArticleView,
        trackArticleLinkClick,
        trackStageView,
        trackStageApplication,
        trackStageContact,
        trackPartnerClick,
        trackHomeVisit,
        trackHomeCta,
      }}
    >
      {children}
    </CmsContext.Provider>
  );
};

export const useCms = () => {
  const context = useContext(CmsContext);

  if (!context) {
    throw new Error("useCms must be used inside CmsProvider");
  }

  return context;
};

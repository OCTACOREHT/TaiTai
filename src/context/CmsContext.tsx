"use client";

import { seedCmsData } from "@/data/cms-seed";
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

const DATA_STORAGE_KEY = "fctoro-cms-data-v1";
const SESSION_STORAGE_KEY = "fctoro-cms-session-v1";
const PERSISTENT_SESSION_STORAGE_KEY = "fctoro-cms-persistent-session-v1";

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
    [data.articles],
  );

  const publishedStages = useMemo(
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

    return { success: true };
  };

  const signOut = () => {
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
    setData((prev) => ({
      ...prev,
      articles: prev.articles.filter((article) => article.id !== articleId),
      homePage: {
        ...prev.homePage,
        featuredArticleIds: prev.homePage.featuredArticleIds.filter((id) => id !== articleId),
      },
    }));
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

    return { success: true };
  };

  const updateHomePage = (patch: Partial<HomePageSettings>) => {
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
  };

  const trackArticleView = (articleId: string) => {
    setData((prev) => ({
      ...prev,
      articles: prev.articles.map((article) =>
        article.id === articleId
          ? {
              ...article,
              metrics: { ...article.metrics, views: article.metrics.views + 1 },
            }
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
        canManageUsers,
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

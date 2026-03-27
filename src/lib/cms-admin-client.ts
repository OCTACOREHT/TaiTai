"use client";

import { getAdminToken } from "@/lib/admin-auth";
import { CmsArticle, CmsPartner, CmsStage, CmsUser } from "@/types/cms";

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

export function mapDbArticle(row: Record<string, unknown>): CmsArticle {
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

export function mapDbStage(row: Record<string, unknown>): CmsStage {
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

export function mapDbPartner(row: Record<string, unknown>): CmsPartner {
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

export function mapDbUser(row: Record<string, unknown>): CmsUser {
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

export async function fetchAdminJson(url: string) {
  const token = getAdminToken();
  const response = await fetch(url, {
    cache: "no-store",
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });

  if (!response.ok) {
    throw new Error(`${url} -> ${response.status}`);
  }

  return response.json();
}

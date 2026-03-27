export type PublishStatus = "draft" | "review" | "published" | "archived";
export type StageWorkMode = "onsite" | "hybrid" | "remote";
<<<<<<< HEAD
export type UserRole = "admin" | "editor" | "author" | "super_admin";
=======
export type UserRole = "admin" | "editor" | "author";
>>>>>>> 8dace4bc0a45c5486fb56dd83a4a0b5a447a7b3a
export type PartnerTier = "principal" | "gold" | "silver" | "media";

export interface CmsUser {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  title: string;
  avatar: string;
  bio: string;
  active: boolean;
  lastLoginAt: string | null;
}

export interface ArticleMetrics {
  views: number;
  linkClicks: number;
  shares: number;
  leads: number;
}

export interface CmsArticle {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  coverImage: string;
  category: string;
  tags: string[];
  authorId: string;
  featured: boolean;
  status: PublishStatus;
  seoTitle: string;
  seoDescription: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  metrics: ArticleMetrics;
}

export interface StageMetrics {
  views: number;
  applications: number;
  contactClicks: number;
}

export interface CmsStage {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  coverImage: string;
  department: string;
  location: string;
  workMode: StageWorkMode;
  duration: string;
  contactEmail: string;
  closeDate: string | null;
  featured: boolean;
  status: PublishStatus;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  metrics: StageMetrics;
}

export interface CmsPartner {
  id: string;
  name: string;
  website: string;
  logo: string;
  category: string;
  tier: PartnerTier;
  description: string;
  featured: boolean;
  createdAt: string;
  clicks: number;
}

export interface HomeHeroMetric {
  label: string;
  value: string;
  note?: string;
}

export interface HomePageSettings {
  heroBadge: string;
  heroTitle: string;
  heroSubtitle: string;
  heroPrimaryCtaLabel: string;
  heroPrimaryCtaUrl: string;
  heroSecondaryCtaLabel: string;
  heroSecondaryCtaUrl: string;
  heroBackgroundImage: string;
  aboutTitle: string;
  aboutBody: string;
  articleSectionTitle: string;
  articleSectionIntro: string;
  stageSectionTitle: string;
  stageSectionIntro: string;
  partnerSectionTitle: string;
  partnerSectionIntro: string;
  metrics: HomeHeroMetric[];
  featuredArticleIds: string[];
  featuredStageIds: string[];
  visits: number;
  ctaClicks: number;
}

export interface SiteSettings {
  siteName: string;
  publicTagline: string;
  primaryEmail: string;
  phone: string;
  address: string;
  footerText: string;
  partnerPageTitle: string;
  partnerPageIntro: string;
  articlePageTitle: string;
  articlePageIntro: string;
  stagePageTitle: string;
  stagePageIntro: string;
}

export interface CmsDataSnapshot {
  articles: CmsArticle[];
  stages: CmsStage[];
  partners: CmsPartner[];
  users: CmsUser[];
  homePage: HomePageSettings;
  siteSettings: SiteSettings;
}

export interface SignInPayload {
  email: string;
  password: string;
  remember: boolean;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
}

export interface SaveUserResponse {
  success: boolean;
  message?: string;
  user?: CmsUser;
}

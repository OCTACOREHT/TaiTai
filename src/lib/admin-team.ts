import type { CmsUser, UserRole } from "@/types/cms";

export const ADMIN_TEAM_KEY = "taitai-admin-team";

export type StoredTeamUser = CmsUser & {
  password: string;
};

export const roleLabels: Record<UserRole, string> = {
  super_admin: "Administrateur principal",
  admin: "Administrateur",
  caissier: "Caissier",
  editor: "Editeur",
  author: "Auteur",
  moderator: "Moderateur",
};

export function getStoredTeamUsers(): StoredTeamUser[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(ADMIN_TEAM_KEY);
    return raw ? (JSON.parse(raw) as StoredTeamUser[]) : [];
  } catch {
    return [];
  }
}

export function saveStoredTeamUsers(users: StoredTeamUser[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ADMIN_TEAM_KEY, JSON.stringify(users));
}

export function createTeamUser(input: {
  name: string;
  email: string;
  password: string;
  role: "admin" | "caissier";
}) {
  const now = new Date().toISOString();

  return {
    id: `team-${Date.now()}`,
    name: input.name,
    email: input.email,
    password: input.password,
    role: input.role,
    title: input.role === "admin" ? "Administrateur" : "Caissier",
    avatar: "/images/user/owner.jpg",
    bio: "",
    active: true,
    lastLoginAt: now,
  } satisfies StoredTeamUser;
}

import type { CmsUser, UserRole } from "@/types/cms";
import bcrypt from "bcryptjs";
import { supabase } from "./supabase-client";

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

/**
 * Récupère tous les membres de l'équipe depuis la table admin_users de Supabase
 */
export async function fetchTeamUsersFromSupabase(): Promise<StoredTeamUser[]> {
  try {
    const { data, error } = await supabase
      .from("admin_users")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Erreur lors de la récupération des utilisateurs Supabase:", error);
      return getStoredTeamUsers();
    }

    const teamUsers: StoredTeamUser[] = (data || []).map((row: any) => ({
      id: row.id,
      name: row.name,
      email: row.email,
      password: "", // Ne pas exposer le hash
      role: row.role as UserRole,
      title: row.title || (row.role === "admin" ? "Administrateur" : "Caissier"),
      avatar: row.avatar || "/images/user/owner.jpg",
      bio: row.bio || "",
      active: row.active ?? true,
      lastLoginAt: row.last_login_at || null,
    }));

    // Synchroniser en cache local
    saveStoredTeamUsers(teamUsers);
    return teamUsers;
  } catch (err) {
    console.error("Erreur réseau récupération Supabase:", err);
    return getStoredTeamUsers();
  }
}

/**
 * Enregistre un nouveau membre d'équipe dans Supabase (table admin_users)
 */
export async function createTeamUserInSupabase(input: {
  name: string;
  email: string;
  password: string;
  role: "admin" | "caissier";
}): Promise<StoredTeamUser> {
  const normalizedEmail = input.email.trim().toLowerCase();
  const hashedPassword = await bcrypt.hash(input.password.trim(), 10);

  const { data, error } = await supabase
    .from("admin_users")
    .insert({
      name: input.name.trim(),
      email: normalizedEmail,
      password_hash: hashedPassword,
      role: input.role,
      title: input.role === "admin" ? "Administrateur" : "Caissier",
      avatar: "/images/user/owner.jpg",
      bio: "",
      active: true,
    })
    .select()
    .single();

  if (error || !data) {
    if (error?.code === "23505" || error?.message?.includes("unique")) {
      throw new Error("Cet email est déjà utilisé par un compte existant.");
    }
    throw new Error(error?.message || "Erreur lors de l'enregistrement sur Supabase.");
  }

  const newUser: StoredTeamUser = {
    id: data.id,
    name: data.name,
    email: data.email,
    password: "",
    role: data.role as UserRole,
    title: data.title || (data.role === "admin" ? "Administrateur" : "Caissier"),
    avatar: data.avatar || "/images/user/owner.jpg",
    bio: data.bio || "",
    active: data.active,
    lastLoginAt: data.last_login_at,
  };

  // Mettre à jour le cache local
  const currentLocal = getStoredTeamUsers();
  saveStoredTeamUsers([newUser, ...currentLocal.filter((u) => u.id !== newUser.id)]);

  return newUser;
}

/**
 * Supprime un membre d'équipe de Supabase
 */
export async function deleteTeamUserInSupabase(userId: string): Promise<boolean> {
  const { error } = await supabase
    .from("admin_users")
    .delete()
    .eq("id", userId);

  if (error) {
    throw new Error(error.message || "Erreur lors de la suppression sur Supabase.");
  }

  const currentLocal = getStoredTeamUsers();
  saveStoredTeamUsers(currentLocal.filter((u) => u.id !== userId));
  return true;
}

/**
 * Modifie le mot de passe d'un membre d'équipe dans Supabase
 */
export async function updateTeamUserPasswordInSupabase(userId: string, newPassword: string): Promise<boolean> {
  const hashedPassword = await bcrypt.hash(newPassword.trim(), 10);

  const { error } = await supabase
    .from("admin_users")
    .update({
      password_hash: hashedPassword,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);

  if (error) {
    throw new Error(error.message || "Erreur lors de la mise à jour du mot de passe sur Supabase.");
  }

  return true;
}

/**
 * Synchronise les utilisateurs existants de localStorage vers Supabase s'ils n'y sont pas encore
 */
export async function syncLocalTeamUsersToSupabase(): Promise<void> {
  if (typeof window === "undefined") return;
  const localUsers = getStoredTeamUsers();
  if (localUsers.length === 0) return;

  try {
    const { data: existingDbUsers } = await supabase.from("admin_users").select("email");
    const existingEmails = new Set((existingDbUsers || []).map((u: any) => u.email.toLowerCase()));

    for (const localUser of localUsers) {
      if (
        localUser.email &&
        localUser.email !== "taitai@gmail.com" &&
        !existingEmails.has(localUser.email.toLowerCase())
      ) {
        const passwordToHash = localUser.password || "taitai2024";
        const hashedPassword = await bcrypt.hash(passwordToHash, 10);
        await supabase.from("admin_users").insert({
          name: localUser.name,
          email: localUser.email.toLowerCase(),
          password_hash: hashedPassword,
          role: localUser.role === "admin" ? "admin" : "caissier",
          title: localUser.title || (localUser.role === "admin" ? "Administrateur" : "Caissier"),
          avatar: localUser.avatar || "/images/user/owner.jpg",
          bio: localUser.bio || "",
          active: localUser.active ?? true,
        });
      }
    }
  } catch (err) {
    console.warn("Échec de la synchronisation locale vers Supabase:", err);
  }
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

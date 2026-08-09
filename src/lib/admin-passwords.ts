import { supabase } from "./supabase-client";

export interface AdminPassword {
  id: string;
  email: string;
  password_hash: string;
  updated_at: string;
}

export async function getAdminPassword(id: string): Promise<AdminPassword | null> {
  const { data, error } = await supabase
    .from("admin_passwords")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    return null;
  }

  return data as AdminPassword;
}

export async function updateAdminPassword(id: string, newPassword: string): Promise<boolean> {
  const { error } = await supabase
    .from("admin_passwords")
    .update({ 
      password_hash: newPassword,
      updated_at: new Date().toISOString()
    })
    .eq("id", id);

  if (error) {
    console.error("Erreur lors de la mise à jour du mot de passe:", error);
    return false;
  }

  return true;
}

export async function createDefaultAdminPassword(): Promise<boolean> {
  const { error } = await supabase
    .from("admin_passwords")
    .insert({
      id: "owner-01",
      email: "taitai@gmail.com",
      password_hash: "taitai2024",
      updated_at: new Date().toISOString()
    });

  if (error) {
    console.error("Erreur lors de la création du mot de passe par défaut:", error);
    return false;
  }

  return true;
}
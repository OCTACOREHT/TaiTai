import bcrypt from "bcryptjs";
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
  try {
    // Hash password with bcrypt before updating in Supabase
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const { error } = await supabase
      .from("admin_passwords")
      .update({ 
        password_hash: hashedPassword,
        updated_at: new Date().toISOString()
      })
      .eq("id", id);

    if (error) {
      console.error("Erreur lors de la mise à jour du mot de passe:", error);
      return false;
    }

    return true;
  } catch (err) {
    console.error("Erreur lors du hachage du mot de passe:", err);
    return false;
  }
}

export async function createDefaultAdminPassword(): Promise<boolean> {
  try {
    const hashedPassword = await bcrypt.hash("taitai2024", 10);

    const { error } = await supabase
      .from("admin_passwords")
      .insert({
        id: "owner-01",
        email: "taitai@gmail.com",
        password_hash: hashedPassword,
        updated_at: new Date().toISOString()
      });

    if (error) {
      console.error("Erreur lors de la création du mot de passe par défaut:", error);
      return false;
    }

    return true;
  } catch (err) {
    console.error("Erreur hachage mot de passe par défaut:", err);
    return false;
  }
}
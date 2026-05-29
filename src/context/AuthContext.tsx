"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/lib/supabase-client";

export interface ClientUser {
  id: string;
  nom: string;
  telephone: string;
  email?: string;
}

interface AuthContextProps {
  user: ClientUser | null;
  loading: boolean;
  signIn: (email: string, mot_de_passe: string) => Promise<void>;
  signUp: (nom: string, telephone: string, email: string, mot_de_passe: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

// Fonction utilitaire pour hasher le mot de passe côté client (basique)
async function hashPassword(password: string) {
  const msgBuffer = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<ClientUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Charger la session au démarrage
  useEffect(() => {
    const fetchSession = async () => {
      const storedId = localStorage.getItem("taitai_user_id");
      if (storedId) {
        const { data, error } = await supabase
          .from("clients")
          .select("id, nom, telephone, email")
          .eq("id", storedId)
          .single();
        
        if (data && !error) {
          setUser(data);
        } else {
          localStorage.removeItem("taitai_user_id");
        }
      }
      setLoading(false);
    };
    fetchSession();
  }, []);

  const signIn = async (email: string, mot_de_passe: string) => {
    const hash = await hashPassword(mot_de_passe);
    const { data, error } = await supabase
      .from("clients")
      .select("id, nom, telephone, email")
      .eq("email", email)
      .eq("mot_de_passe_hash", hash)
      .single();

    if (error || !data) {
      throw new Error("Telefòn oswa modpas pa kòrèk.");
    }

    setUser(data);
    localStorage.setItem("taitai_user_id", data.id);
  };

  const signUp = async (nom: string, telephone: string, email: string, mot_de_passe: string) => {
    // Vérifier si le téléphone existe déjà
    const { data: existing } = await supabase
      .from("clients")
      .select("id")
      .eq("telephone", telephone)
      .single();

    if (existing) {
      throw new Error("Ce numéro de téléphone est déjà utilisé.");
    }

    const hash = await hashPassword(mot_de_passe);
    const { data, error } = await supabase
      .from("clients")
      .insert({
        nom,
        telephone,
        email,
        mot_de_passe_hash: hash
      })
      .select("id, nom, telephone, email")
      .single();

    if (error || !data) {
      throw new Error("Erreur lors de la création du compte.");
    }

    setUser(data);
    localStorage.setItem("taitai_user_id", data.id);
  };

  const signOut = async () => {
    setUser(null);
    localStorage.removeItem("taitai_user_id");
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth doit être utilisé à l'intérieur d'un AuthProvider");
  return ctx;
};

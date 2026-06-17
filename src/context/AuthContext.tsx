"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/lib/supabase-client";

export interface ClientUser {
  id: string;
  nom: string;
  telephone: string;
  email?: string;
  adresse?: string | null;
  ville?: string | null;
  departement?: string | null;
}

interface AuthContextProps {
  user: ClientUser | null;
  loading: boolean;
  signIn: (email: string, mot_de_passe: string) => Promise<void>;
  signUp: (
    nom: string,
    telephone: string,
    email: string,
    mot_de_passe: string,
    adresse: string,
    ville: string,
    departement: string,
  ) => Promise<void>;
  resetPassword: (email: string, mot_de_passe: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);
const SESSION_TIMEOUT_MS = 2 * 60 * 60 * 1000;
const SESSION_LAST_ACTIVITY_KEY = "taitai_last_activity_at";

export function getPasswordStrengthError(password: string) {
  if (password.length < 8) return "Modpas la dwe gen omwen 8 karakte.";
  if (!/[a-z]/.test(password)) return "Modpas la dwe gen omwen yon ti let.";
  if (!/[A-Z]/.test(password)) return "Modpas la dwe gen omwen yon gwo let.";
  if (!/[0-9]/.test(password)) return "Modpas la dwe gen omwen yon chif.";
  if (!/[^A-Za-z0-9]/.test(password)) return "Modpas la dwe gen omwen yon senbol espesyal.";
  return "";
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

async function hashPassword(password: string) {
  const msgBuffer = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<ClientUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSession = async () => {
      const storedId = localStorage.getItem("taitai_user_id");
      if (storedId) {
        const lastActivity = Number(localStorage.getItem(SESSION_LAST_ACTIVITY_KEY) || "0");

        if (!lastActivity || Date.now() - lastActivity > SESSION_TIMEOUT_MS) {
          localStorage.removeItem("taitai_user_id");
          localStorage.removeItem(SESSION_LAST_ACTIVITY_KEY);
          setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from("clients")
          .select("id, nom, telephone, email, adresse, ville, departement")
          .eq("id", storedId)
          .single();

        if (data && !error) {
          setUser(data);
        } else {
          localStorage.removeItem("taitai_user_id");
          localStorage.removeItem(SESSION_LAST_ACTIVITY_KEY);
        }
      }
      setLoading(false);
    };
    fetchSession();
  }, []);

  useEffect(() => {
    if (!user) return;

    const markActivity = () => {
      localStorage.setItem(SESSION_LAST_ACTIVITY_KEY, String(Date.now()));
    };

    const checkSession = () => {
      const lastActivity = Number(localStorage.getItem(SESSION_LAST_ACTIVITY_KEY) || "0");

      if (!lastActivity || Date.now() - lastActivity > SESSION_TIMEOUT_MS) {
        setUser(null);
        localStorage.removeItem("taitai_user_id");
        localStorage.removeItem(SESSION_LAST_ACTIVITY_KEY);
      }
    };

    markActivity();

    const events = ["click", "keydown", "scroll", "touchstart", "mousemove"];
    events.forEach((eventName) => window.addEventListener(eventName, markActivity, { passive: true }));
    const interval = window.setInterval(checkSession, 60 * 1000);

    return () => {
      events.forEach((eventName) => window.removeEventListener(eventName, markActivity));
      window.clearInterval(interval);
    };
  }, [user]);

  const signIn = async (email: string, mot_de_passe: string) => {
    const normalizedEmail = normalizeEmail(email);
    const hash = await hashPassword(mot_de_passe);
    const { data, error } = await supabase
      .from("clients")
      .select("id, nom, telephone, email, adresse, ville, departement")
      .eq("email", normalizedEmail)
      .eq("mot_de_passe_hash", hash)
      .single();

    if (error || !data) {
      throw new Error("Imel oswa modpas la pa korek.");
    }

    await supabase
      .from("clients")
      .update({ last_login_at: new Date().toISOString() })
      .eq("id", data.id);

    setUser(data);
    localStorage.setItem("taitai_user_id", data.id);
    localStorage.setItem(SESSION_LAST_ACTIVITY_KEY, String(Date.now()));
  };

  const signUp = async (
    nom: string,
    telephone: string,
    email: string,
    mot_de_passe: string,
    adresse: string,
    ville: string,
    departement: string,
  ) => {
    const normalizedEmail = normalizeEmail(email);
    const normalizedTelephone = telephone.trim();
    const passwordError = getPasswordStrengthError(mot_de_passe);

    if (passwordError) {
      throw new Error(passwordError);
    }

    const { data: existingEmail } = await supabase
      .from("clients")
      .select("id")
      .ilike("email", normalizedEmail)
      .maybeSingle();

    if (existingEmail) {
      throw new Error("Gen yon kont ki deja itilize imel sa a.");
    }

    const { data: existingPhone } = await supabase
      .from("clients")
      .select("id")
      .eq("telephone", normalizedTelephone)
      .maybeSingle();

    if (existingPhone) {
      throw new Error("Nimewo telefon sa a deja itilize.");
    }

    const hash = await hashPassword(mot_de_passe);
    const { data, error } = await supabase
      .from("clients")
      .insert({
        nom: nom.trim(),
        telephone: normalizedTelephone,
        email: normalizedEmail,
        adresse: adresse.trim(),
        ville: ville.trim(),
        departement: departement.trim(),
        mot_de_passe_hash: hash,
        last_login_at: new Date().toISOString(),
      })
      .select("id, nom, telephone, email, adresse, ville, departement")
      .single();

    if (error?.code === "23505") {
      throw new Error("Gen yon kont ki deja itilize imel sa a.");
    }

    if (error || !data) {
      throw new Error("Nou pa ka kreye kont lan.");
    }

    setUser(data);
    localStorage.setItem("taitai_user_id", data.id);
    localStorage.setItem(SESSION_LAST_ACTIVITY_KEY, String(Date.now()));
  };

  const resetPassword = async (email: string, mot_de_passe: string) => {
    const normalizedEmail = normalizeEmail(email);
    const passwordError = getPasswordStrengthError(mot_de_passe);

    if (passwordError) {
      throw new Error(passwordError);
    }

    const { data: existing, error: findError } = await supabase
      .from("clients")
      .select("id")
      .ilike("email", normalizedEmail)
      .single();

    if (findError || !existing) {
      throw new Error("Nou pa jwenn kont ki gen imel sa a.");
    }

    const hash = await hashPassword(mot_de_passe);
    const { error } = await supabase
      .from("clients")
      .update({ mot_de_passe_hash: hash })
      .eq("id", existing.id);

    if (error) {
      throw new Error("Nou pa ka chanje modpas la kounye a.");
    }
  };

  const signOut = async () => {
    setUser(null);
    localStorage.removeItem("taitai_user_id");
    localStorage.removeItem(SESSION_LAST_ACTIVITY_KEY);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, resetPassword, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth dwe itilize andedan yon AuthProvider");
  return ctx;
};

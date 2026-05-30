"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { LogIn, X, Lock, Phone, User, Mail, ChevronRight, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

function ModalPortal({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return createPortal(children, document.body);
}

export default function AuthModal() {
  const { user, signIn, signUp, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [nom, setNom] = useState("");
  const [telephone, setTelephone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Always release body scroll when modal is not open or on unmount
  useEffect(() => {
    if (!isOpen) document.body.style.overflow = "";
  }, [isOpen]);

  useEffect(() => {
    return () => { document.body.style.overflow = ""; };
  }, []);

  const reset = () => {
    setNom("");
    setTelephone("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setError("");
    setSuccess("");
    setLoading(false);
  };

  const openModal = (m: "login" | "signup") => {
    reset();
    setMode(m);
    setIsOpen(true);
    document.body.style.overflow = "hidden";
  };

  const closeModal = () => {
    setIsOpen(false);
    reset();
    document.body.style.overflow = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (mode === "signup" && !nom.trim()) {
      setError("Veuillez entrer votre nom complet.");
      return;
    }
    if (mode === "signup" && password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }
    if (password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }

    setLoading(true);
    try {
      if (mode === "login") {
        await signIn(email, password);
        closeModal();
      } else {
        await signUp(nom, telephone, email, password);
        closeModal(); // Auto-login is handled in signUp directly now
      }
    } catch (err: unknown) {
      const msg = (err as { message?: string })?.message || "Une erreur est survenue.";
      setError(msg);
      setLoading(false);
    }
  };

  // ── Logged-in state ──────────────────────────────────────────────────────────
  if (user) {
    const initials = user.nom?.slice(0, 2).toUpperCase() ?? "TT";
    return (
      <div className="relative">
        <button
          onClick={() => setShowUserMenu((p) => !p)}
          className="flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-bold text-[#101828] shadow-sm transition hover:border-[#F4A640] hover:text-[#F4A640]"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#F4A640] text-white text-xs font-black uppercase">
            {initials}
          </span>
          <span className="hidden sm:block">{user.nom.split(" ")[0]}</span>
        </button>

        {showUserMenu && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
            <div className="absolute right-0 top-full z-50 mt-3 w-64 rounded-3xl border border-gray-100 bg-white p-4 shadow-2xl">
              <p className="mb-1 text-xs font-black uppercase tracking-widest text-[#98A2B3]">Connecté en tant que</p>
              <p className="truncate text-sm font-bold text-[#101828] mb-1">{user.nom}</p>
              <p className="text-xs text-[#667085] mb-4">{user.telephone}</p>
              <button
                onClick={async () => { await signOut(); setShowUserMenu(false); }}
                className="w-full rounded-2xl bg-red-50 py-3 text-sm font-bold text-red-600 transition hover:bg-red-100"
              >
                Se déconnecter
              </button>
            </div>
          </>
        )}
      </div>
    );
  }

  // ── Logged-out state ─────────────────────────────────────────────────────────
  return (
    <>
      {/* Nav Button */}
      <button
        onClick={() => openModal("login")}
        className="flex items-center gap-2 rounded-2xl bg-[#F4A640] px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-[#F4A640]/30 transition hover:bg-[#101828] hover:scale-105 active:scale-95"
      >
        <LogIn size={16} strokeWidth={2.5} />
        <span>Connexion</span>
      </button>

      {/* Modal rendered via Portal directly on body */}
      {isOpen && (
        <ModalPortal>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-[9998] bg-black/60 backdrop-blur-sm"
            onClick={closeModal}
          />

          {/* Modal Card - centered via transform */}
          <div
            className="fixed left-1/2 top-1/2 z-[9999] w-full max-w-md -translate-x-1/2 -translate-y-1/2 px-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="rounded-3xl bg-white p-8 shadow-2xl w-full max-h-[90vh] overflow-y-auto">
              {/* Close */}
              <button
                onClick={closeModal}
                className="absolute right-5 top-5 rounded-xl p-2 text-[#98A2B3] transition hover:bg-gray-100 hover:text-[#101828]"
              >
                <X size={20} />
              </button>

              {/* Logo / Title */}
              <div className="mb-8 text-center mt-2">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F4A640]/10">
                  <span className="text-3xl">🍽️</span>
                </div>
                <h2 className="text-2xl font-black text-[#101828]">
                  {mode === "login" ? "Bienvenue !" : "Créer un compte"}
                </h2>
                <p className="mt-1 text-sm text-[#667085]">
                  {mode === "login"
                    ? "Connectez-vous pour passer commande"
                    : "Rejoignez TaiTai pour commander"}
                </p>
              </div>

              {/* Tabs */}
              <div className="mb-6 flex rounded-2xl bg-gray-100 p-1">
                <button
                  type="button"
                  onClick={() => { setMode("login"); reset(); }}
                  className={`flex-1 rounded-xl py-2.5 text-sm font-bold transition-all ${
                    mode === "login"
                      ? "bg-white text-[#101828] shadow-sm"
                      : "text-[#667085] hover:text-[#101828]"
                  }`}
                >
                  Connexion
                </button>
                <button
                  type="button"
                  onClick={() => { setMode("signup"); reset(); }}
                  className={`flex-1 rounded-xl py-2.5 text-sm font-bold transition-all ${
                    mode === "signup"
                      ? "bg-white text-[#101828] shadow-sm"
                      : "text-[#667085] hover:text-[#101828]"
                  }`}
                >
                  Inscription
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {mode === "signup" && (
                  <div className="relative">
                    <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#98A2B3]" />
                    <input
                      type="text"
                      required
                      placeholder="Nom complet (ex: Jean Dupont)"
                      value={nom}
                      onChange={(e) => setNom(e.target.value)}
                      className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-4 pl-12 pr-5 text-sm font-medium focus:border-[#F4A640] focus:outline-none focus:ring-4 focus:ring-[#F4A640]/10 transition-all"
                    />
                  </div>
                )}

                <div className="relative">
                  <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#98A2B3]" />
                  <input
                    type="email"
                    required
                    placeholder="Adresse email (ex: contact@gmail.com)"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-4 pl-12 pr-5 text-sm font-medium focus:border-[#F4A640] focus:outline-none focus:ring-4 focus:ring-[#F4A640]/10 transition-all"
                  />
                </div>

                {mode === "signup" && (
                  <div className="relative">
                    <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#98A2B3]" />
                    <input
                      type="tel"
                      required
                      placeholder="Téléphone (+509...)"
                      value={telephone}
                      onChange={(e) => setTelephone(e.target.value)}
                      className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-4 pl-12 pr-5 text-sm font-medium focus:border-[#F4A640] focus:outline-none focus:ring-4 focus:ring-[#F4A640]/10 transition-all"
                    />
                  </div>
                )}

                <div className="relative">
                  <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#98A2B3]" />
                  <input
                    type="password"
                    required
                    placeholder="Mot de passe"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-4 pl-12 pr-5 text-sm font-medium focus:border-[#F4A640] focus:outline-none focus:ring-4 focus:ring-[#F4A640]/10 transition-all"
                  />
                </div>

                {mode === "signup" && (
                  <div className="relative">
                    <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#98A2B3]" />
                    <input
                      type="password"
                      required
                      placeholder="Confirmer le mot de passe"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-4 pl-12 pr-5 text-sm font-medium focus:border-[#F4A640] focus:outline-none focus:ring-4 focus:ring-[#F4A640]/10 transition-all"
                    />
                  </div>
                )}

                {error && (
                  <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600 border border-red-100">
                    {error}
                  </div>
                )}
                {success && (
                  <div className="rounded-2xl bg-green-50 px-4 py-3 text-sm font-medium text-green-700 border border-green-100">
                    {success}
                  </div>
                )}

                {!success && (
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#F4A640] py-4 text-base font-black text-white shadow-lg shadow-[#F4A640]/20 transition-all hover:bg-[#101828] hover:scale-[1.02] active:scale-95 disabled:opacity-60"
                  >
                    {loading ? (
                      <Loader2 size={20} className="animate-spin" />
                    ) : (
                      <>
                        {mode === "login" ? "Se connecter" : "Créer mon compte"}
                        <ChevronRight size={18} strokeWidth={3} />
                      </>
                    )}
                  </button>
                )}
              </form>
            </div>
          </div>
        </ModalPortal>
      )}
    </>
  );
}

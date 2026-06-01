"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  Building2,
  ChevronRight,
  Loader2,
  Lock,
  LogIn,
  Mail,
  MapPin,
  Phone,
  User,
  X,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const DEPARTMENTS = [
  "Ouest",
  "Artibonite",
  "Centre",
  "Grand'Anse",
  "Nippes",
  "Nord",
  "Nord-Est",
  "Nord-Ouest",
  "Sud",
  "Sud-Est",
];

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
  const [adresse, setAdresse] = useState("");
  const [ville, setVille] = useState("");
  const [departement, setDepartement] = useState("Ouest");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    if (!isOpen) document.body.style.overflow = "";
  }, [isOpen]);

  useEffect(() => {
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const reset = () => {
    setNom("");
    setTelephone("");
    setAdresse("");
    setVille("");
    setDepartement("Ouest");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setError("");
    setLoading(false);
  };

  const openModal = (nextMode: "login" | "signup") => {
    reset();
    setMode(nextMode);
    setIsOpen(true);
    document.body.style.overflow = "hidden";
  };

  const closeModal = () => {
    setIsOpen(false);
    reset();
    document.body.style.overflow = "";
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");

    if (mode === "signup" && !nom.trim()) {
      setError("Tanpri antre non konple ou.");
      return;
    }
    if (mode === "signup" && (!adresse.trim() || !ville.trim() || !departement.trim())) {
      setError("Tanpri ranpli adres, vil ak depatman ou.");
      return;
    }
    if (mode === "signup" && password !== confirmPassword) {
      setError("Modpas yo pa menm.");
      return;
    }
    if (password.length < 6) {
      setError("Modpas la dwe gen omwen 6 karakte.");
      return;
    }

    setLoading(true);
    try {
      if (mode === "login") {
        await signIn(email, password);
      } else {
        await signUp(nom, telephone, email, password, adresse, ville, departement);
      }
      closeModal();
    } catch (err: unknown) {
      setError((err as { message?: string })?.message || "Gen yon ere ki pase.");
      setLoading(false);
    }
  };

  if (user) {
    const initials = user.nom?.slice(0, 2).toUpperCase() ?? "TT";
    return (
      <div className="relative">
        <button
          onClick={() => setShowUserMenu((value) => !value)}
          className="flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-bold text-[#101828] shadow-sm transition hover:border-[#F4A640] hover:text-[#F4A640]"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#F4A640] text-xs font-black uppercase text-white">
            {initials}
          </span>
          <span className="hidden sm:block">{user.nom.split(" ")[0]}</span>
        </button>

        {showUserMenu && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
            <div className="absolute right-0 top-full z-50 mt-3 w-64 rounded-3xl border border-gray-100 bg-white p-4 shadow-2xl">
              <p className="mb-1 text-xs font-black uppercase tracking-widest text-[#98A2B3]">Konekte kom</p>
              <p className="mb-1 truncate text-sm font-bold text-[#101828]">{user.nom}</p>
              <p className="mb-4 text-xs text-[#667085]">{user.telephone}</p>
              <button
                onClick={async () => {
                  await signOut();
                  setShowUserMenu(false);
                }}
                className="w-full rounded-2xl bg-red-50 py-3 text-sm font-bold text-red-600 transition hover:bg-red-100"
              >
                Dekonekte
              </button>
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => openModal("login")}
        className="flex items-center gap-2 rounded-2xl bg-[#F4A640] px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-[#F4A640]/30 transition hover:bg-[#101828] hover:scale-105 active:scale-95"
      >
        <LogIn size={16} strokeWidth={2.5} />
        <span>Konekte</span>
      </button>

      {isOpen && (
        <ModalPortal>
          <div className="fixed inset-0 z-[9998] bg-black/30 backdrop-blur-[1px]" onClick={closeModal} />
          <div
            className="fixed left-1/2 top-1/2 z-[9999] w-full max-w-lg -translate-x-1/2 -translate-y-1/2 px-4"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="w-full rounded-3xl bg-white p-5 shadow-2xl sm:p-6 max-h-[82vh] overflow-y-auto">
              <button
                onClick={closeModal}
                className="absolute right-5 top-5 rounded-xl p-2 text-[#98A2B3] transition hover:bg-gray-100 hover:text-[#101828]"
              >
                <X size={20} />
              </button>

              <div className="mb-5 mt-1 text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F4A640]/10">
                  <span className="text-2xl">TT</span>
                </div>
                <h2 className="text-2xl font-black text-[#101828]">
                  {mode === "login" ? "Byenveni !" : "Kreye yon kont"}
                </h2>
                <p className="mt-1 text-sm text-[#667085]">
                  {mode === "login" ? "Konekte pou pase komann" : "Antre nan TaiTai pou komande"}
                </p>
              </div>

              <div className="mb-5 flex rounded-2xl bg-gray-100 p-1">
                <button
                  type="button"
                  onClick={() => {
                    setMode("login");
                    reset();
                  }}
                  className={`flex-1 rounded-xl py-2.5 text-sm font-bold transition-all ${
                    mode === "login" ? "bg-white text-[#101828] shadow-sm" : "text-[#667085] hover:text-[#101828]"
                  }`}
                >
                  Koneksyon
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode("signup");
                    reset();
                  }}
                  className={`flex-1 rounded-xl py-2.5 text-sm font-bold transition-all ${
                    mode === "signup" ? "bg-white text-[#101828] shadow-sm" : "text-[#667085] hover:text-[#101828]"
                  }`}
                >
                  Enskripsyon
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3">
                {mode === "signup" && (
                  <div className="relative">
                    <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#98A2B3]" />
                    <input
                      type="text"
                      required
                      placeholder="Non konple"
                      value={nom}
                      onChange={(event) => setNom(event.target.value)}
                      className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-4 pl-12 pr-5 text-sm font-medium focus:border-[#F4A640] focus:outline-none focus:ring-4 focus:ring-[#F4A640]/10"
                    />
                  </div>
                )}

                <div className="relative">
                  <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#98A2B3]" />
                  <input
                    type="email"
                    required
                    placeholder="Adres imel"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-4 pl-12 pr-5 text-sm font-medium focus:border-[#F4A640] focus:outline-none focus:ring-4 focus:ring-[#F4A640]/10"
                  />
                </div>

                {mode === "signup" && (
                  <>
                    <div className="relative">
                      <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#98A2B3]" />
                      <input
                        type="tel"
                        required
                        placeholder="Telefon (+509...)"
                        value={telephone}
                        onChange={(event) => setTelephone(event.target.value)}
                        className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-4 pl-12 pr-5 text-sm font-medium focus:border-[#F4A640] focus:outline-none focus:ring-4 focus:ring-[#F4A640]/10"
                      />
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="relative">
                        <Building2 size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#98A2B3]" />
                        <input
                          type="text"
                          required
                          placeholder="Vil / komin"
                          value={ville}
                          onChange={(event) => setVille(event.target.value)}
                          className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-4 pl-12 pr-5 text-sm font-medium focus:border-[#F4A640] focus:outline-none focus:ring-4 focus:ring-[#F4A640]/10"
                        />
                      </div>
                      <div className="relative">
                        <select
                          required
                          value={departement}
                          onChange={(event) => setDepartement(event.target.value)}
                          className="w-full appearance-none rounded-2xl border border-gray-200 bg-gray-50 py-4 pl-5 pr-10 text-sm font-medium text-[#101828] focus:border-[#F4A640] focus:outline-none focus:ring-4 focus:ring-[#F4A640]/10"
                        >
                          {DEPARTMENTS.map((item) => (
                            <option key={item} value={item}>
                              {item}
                            </option>
                          ))}
                        </select>
                        <ChevronRight size={16} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 rotate-90 text-[#98A2B3]" />
                      </div>
                    </div>

                    <div className="relative">
                      <MapPin size={18} className="absolute left-4 top-5 text-[#98A2B3]" />
                      <textarea
                        required
                        placeholder="Adres konple"
                        value={adresse}
                        onChange={(event) => setAdresse(event.target.value)}
                        className="min-h-20 w-full rounded-2xl border border-gray-200 bg-gray-50 py-4 pl-12 pr-5 text-sm font-medium focus:border-[#F4A640] focus:outline-none focus:ring-4 focus:ring-[#F4A640]/10"
                      />
                    </div>
                  </>
                )}

                <div className="relative">
                  <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#98A2B3]" />
                  <input
                    type="password"
                    required
                    placeholder="Modpas"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-4 pl-12 pr-5 text-sm font-medium focus:border-[#F4A640] focus:outline-none focus:ring-4 focus:ring-[#F4A640]/10"
                  />
                </div>

                {mode === "signup" && (
                  <div className="relative">
                    <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#98A2B3]" />
                    <input
                      type="password"
                      required
                      placeholder="Konfime modpas la"
                      value={confirmPassword}
                      onChange={(event) => setConfirmPassword(event.target.value)}
                      className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-4 pl-12 pr-5 text-sm font-medium focus:border-[#F4A640] focus:outline-none focus:ring-4 focus:ring-[#F4A640]/10"
                    />
                  </div>
                )}

                {error && (
                  <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#F4A640] py-4 text-base font-black text-white shadow-lg shadow-[#F4A640]/20 transition-all hover:bg-[#101828] hover:scale-[1.02] active:scale-95 disabled:opacity-60"
                >
                  {loading ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : (
                    <>
                      {mode === "login" ? "Konekte" : "Kreye kont mwen"}
                      <ChevronRight size={18} strokeWidth={3} />
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </ModalPortal>
      )}
    </>
  );
}

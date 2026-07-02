"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { createPortal } from "react-dom";
import {
  Building2,
  ChevronRight,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  LogIn,
  Mail,
  MapPin,
  Phone,
  User,
  X,
} from "lucide-react";
import { getPasswordStrengthError, useAuth } from "@/context/AuthContext";


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

const CITIES_BY_DEPARTMENT: Record<string, string[]> = {
  Ouest: [
    "Port-au-Prince",
    "Petion-Ville",
    "Delmas",
    "Carrefour",
    "Tabarre",
    "Croix-des-Bouquets",
    "Kenscoff",
    "Gressier",
    "Leogane",
    "Arcahaie",
  ],
  Artibonite: [
    "Gonaives",
    "Saint-Marc",
    "Dessalines",
    "Verrettes",
    "Petite-Riviere de l'Artibonite",
    "Ennery",
    "Gros-Morne",
  ],
  Centre: [
    "Hinche",
    "Mirebalais",
    "Lascahobas",
    "Belladere",
    "Saut-d'Eau",
    "Thomonde",
    "Cerca-la-Source",
  ],
  "Grand'Anse": [
    "Jeremie",
    "Anse-d'Hainault",
    "Dame-Marie",
    "Corail",
    "Abricots",
    "Beaumont",
    "Roseaux",
  ],
  Nippes: [
    "Miragoane",
    "Anse-a-Veau",
    "Petite-Riviere de Nippes",
    "Baraderes",
    "Plaisance du Sud",
    "Fonds-des-Negres",
  ],
  Nord: [
    "Cap-Haitien",
    "Limonade",
    "Acul-du-Nord",
    "Grande-Riviere-du-Nord",
    "Milot",
    "Plaisance",
    "Saint-Raphael",
  ],
  "Nord-Est": [
    "Fort-Liberte",
    "Ouanaminthe",
    "Trou-du-Nord",
    "Terrier-Rouge",
    "Vallieres",
    "Caracol",
    "Mont-Organise",
  ],
  "Nord-Ouest": [
    "Port-de-Paix",
    "Saint-Louis du Nord",
    "Mole-Saint-Nicolas",
    "Jean-Rabel",
    "Bombardopolis",
    "Baie-de-Henne",
  ],
  Sud: [
    "Les Cayes",
    "Aquin",
    "Cavaillon",
    "Saint-Louis du Sud",
    "Port-Salut",
    "Torbeck",
    "Camp-Perrin",
  ],
  "Sud-Est": [
    "Jacmel",
    "Bainet",
    "Cotes-de-Fer",
    "Belle-Anse",
    "Marigot",
    "Thiotte",
    "Anse-a-Pitres",
  ],
};



function ModalPortal({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return createPortal(children, document.body);
}

export default function AuthModal() {
  const { user, signIn, signUp, resetPassword, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<"login" | "signup" | "reset">("login");
  const [nom, setNom] = useState("");
  const [telephone, setTelephone] = useState("");
  const [adresse, setAdresse] = useState("");
  const [ville, setVille] = useState("");
  const [departement, setDepartement] = useState("Ouest");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showUserMenu, setShowUserMenu] = useState(false);
  const selectedCities = CITIES_BY_DEPARTMENT[departement] || [];

  useEffect(() => {
    if (!isOpen) document.body.style.overflow = "";
  }, [isOpen]);

  useEffect(() => {
    if (mode === "signup" && selectedCities.length > 0 && !selectedCities.includes(ville)) {
      setVille(selectedCities[0]);
    }
  }, [departement, mode, selectedCities, ville]);

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
    setShowPassword(false);
    setShowConfirmPassword(false);
    setError("");
    setSuccess("");
    setLoading(false);
  };

  const openModal = (nextMode: "login" | "signup" | "reset") => {
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
    setSuccess("");

    if (mode === "signup" && !nom.trim()) {
      setError("Tanpri antre non konple ou.");
      return;
    }
    if (mode === "signup" && (!adresse.trim() || !ville.trim() || !departement.trim())) {
      setError("Tanpri ranpli adres, vil ak depatman ou.");
      return;
    }
    if ((mode === "signup" || mode === "reset") && password !== confirmPassword) {
      setError("Modpas yo pa menm.");
      return;
    }
    const passwordError = getPasswordStrengthError(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    setLoading(true);
    try {
      if (mode === "login") {
        await signIn(email, password);
        closeModal();
      } else if (mode === "signup") {
        await signUp(nom, telephone, email, password, adresse, ville, departement);
        closeModal();
      } else {
        await resetPassword(email, password);
        setPassword("");
        setConfirmPassword("");
        setShowPassword(false);
        setShowConfirmPassword(false);
        setMode("login");
        setSuccess("Modpas la chanje. Ou ka konekte ak nouvo modpas la.");
      }
    } catch (err: unknown) {
      setError((err as { message?: string })?.message || "Gen yon ere ki pase.");
    } finally {
      setLoading(false);
    }
  };

  if (user) {
    const initials = user.nom?.slice(0, 2).toUpperCase() ?? "TT";
    const firstName = user.nom.split(" ")[0] || "Kont";
    return (
      <div className="relative">
        <button
          onClick={() => setShowUserMenu((value) => !value)}
          className="group flex items-center gap-3 rounded-2xl border border-brand-500/20 bg-white px-2.5 py-2 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-brand-500 hover:shadow-lg hover:shadow-brand-500/10 sm:px-3"
        >
          <span className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-[#101828] text-sm font-black uppercase text-brand-500 shadow-inner">
            {initials}
            <span className="absolute -right-0.5 -top-0.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-green-500" />
          </span>
          <span className="hidden min-w-0 flex-col sm:flex">
            <span className="max-w-28 truncate text-xs font-black uppercase tracking-wider text-[#98A2B3]">
              Konekte
            </span>
            <span className="max-w-32 truncate text-sm font-black text-[#101828] group-hover:text-brand-500">
              {firstName}
            </span>
          </span>
          <ChevronRight className="hidden h-4 w-4 rotate-90 text-[#98A2B3] transition group-hover:text-brand-500 sm:block" />
        </button>

        {showUserMenu && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
            <div className="absolute right-0 top-full z-50 mt-3 w-[min(20rem,calc(100vw-2rem))] overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-2xl">
              <div className="bg-[#101828] p-5 text-white">
                <div className="flex items-center gap-3">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-500 text-sm font-black uppercase text-white">
                    {initials}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-base font-black">{user.nom}</p>
                    <p className="mt-1 text-xs font-bold text-white/60">Kont kliyan TaïTaï</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3 p-4">
                <div className="rounded-2xl bg-gray-50 p-4">
                  <p className="text-xs font-black uppercase tracking-widest text-[#98A2B3]">Kontak</p>
                  <p className="mt-2 text-sm font-bold text-[#101828]">{user.telephone}</p>
                  {user.email ? <p className="mt-1 truncate text-xs font-medium text-[#667085]">{user.email}</p> : null}
                </div>
                {user.ville || user.departement ? (
                  <div className="rounded-2xl bg-brand-500/10 p-4">
                    <p className="text-xs font-black uppercase tracking-widest text-brand-700">Adrès</p>
                    <p className="mt-2 text-sm font-bold text-[#101828]">
                      {[user.ville, user.departement].filter(Boolean).join(", ")}
                    </p>
                  </div>
                ) : null}
              <button
                onClick={async () => {
                  await signOut();
                  setShowUserMenu(false);
                }}
                  className="w-full rounded-2xl bg-red-50 py-3 text-sm font-black text-red-600 transition hover:bg-red-100"
              >
                Dekonekte
              </button>
              </div>
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
        className="flex items-center gap-2 rounded-2xl bg-brand-500 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-brand-500/30 transition hover:bg-[#101828] hover:scale-105 active:scale-95"
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


             <div className="mb-8 mt-2 text-center">
  <div className="mx-auto mb-4 relative h-20 w-40">
    <Image
      src="/images/logo/tailogo.png"
      alt="TaïTaï"
      fill
      className="object-contain"
    />
  </div>

  <h2 className="text-2xl font-black text-[#101828]">
    {mode === "login" ? "Byenveni !" : mode === "signup" ? "Kreye yon kont" : "Chanje modpas"}
  </h2>

  <p className="mt-1 text-sm text-[#667085]">
    {mode === "login"
      ? "Konekte pou pase kòmann"
      : "Antre nan TaïTaï pou kòmande"}
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
  {mode === "signup" ? (
    <>
      <div className="grid grid-cols-2 gap-3">
        <div className="relative">
          <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#98A2B3]" />
          <input type="text" required placeholder="Non konple" value={nom} onChange={(event) => setNom(event.target.value)} className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-4 pl-12 pr-5 text-sm font-medium focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10" />
        </div>

        <div className="relative">
          <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#98A2B3]" />
          <input type="tel" required placeholder="Telefòn" value={telephone} onChange={(event) => setTelephone(event.target.value)} className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-4 pl-12 pr-5 text-sm font-medium focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="relative">
          <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#98A2B3]" />
          <input type="email" required placeholder="Adres imel" value={email} onChange={(event) => setEmail(event.target.value)} className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-4 pl-12 pr-5 text-sm font-medium focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10" />
        </div>

        <div className="relative">
          <MapPin size={18} className="absolute left-4 top-5 text-[#98A2B3]" />
          <textarea required placeholder="Adres konplè" value={adresse} onChange={(event) => setAdresse(event.target.value)} className="h-[58px] w-full resize-none rounded-2xl border border-gray-200 bg-gray-50 py-4 pl-12 pr-5 text-sm font-medium focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="relative">
          <Building2 size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#98A2B3]" />
          <select required value={ville} onChange={(event) => setVille(event.target.value)} className="w-full appearance-none rounded-2xl border border-gray-200 bg-gray-50 py-4 pl-12 pr-10 text-sm font-medium text-[#101828] focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10">
            {selectedCities.map((city) => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
          <ChevronRight size={16} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 rotate-90 text-[#98A2B3]" />
        </div>

        <div className="relative">
          <select required value={departement} onChange={(event) => {
            const nextDepartment = event.target.value;
            setDepartement(nextDepartment);
            setVille(CITIES_BY_DEPARTMENT[nextDepartment]?.[0] || "");
          }} className="w-full appearance-none rounded-2xl border border-gray-200 bg-gray-50 py-4 pl-5 pr-10 text-sm font-medium text-[#101828] focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10">
            {DEPARTMENTS.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
          <ChevronRight size={16} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 rotate-90 text-[#98A2B3]" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="relative">
          <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#98A2B3]" />
          <input type={showPassword ? "text" : "password"} required placeholder="Modpas" value={password} onChange={(event) => setPassword(event.target.value)} className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-4 pl-12 pr-12 text-sm font-medium focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10" />
          <button
            type="button"
            onClick={() => setShowPassword((value) => !value)}
            aria-label={showPassword ? "Kache modpas la" : "Montre modpas la"}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-[#98A2B3] transition hover:text-brand-500"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        <div className="relative">
          <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#98A2B3]" />
          <input type={showConfirmPassword ? "text" : "password"} required placeholder="Konfime modpas" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-4 pl-12 pr-12 text-sm font-medium focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10" />
          <button
            type="button"
            onClick={() => setShowConfirmPassword((value) => !value)}
            aria-label={showConfirmPassword ? "Kache konfimasyon modpas la" : "Montre konfimasyon modpas la"}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-[#98A2B3] transition hover:text-brand-500"
          >
            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>
    </>
  ) : mode === "reset" ? (
    <>
      <div className="relative">
        <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#98A2B3]" />
        <input type="email" required placeholder="Adres imel" value={email} onChange={(event) => setEmail(event.target.value)} className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-4 pl-12 pr-5 text-sm font-medium focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10" />
      </div>

      <div className="relative">
        <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#98A2B3]" />
        <input type={showPassword ? "text" : "password"} required placeholder="Nouvo modpas" value={password} onChange={(event) => setPassword(event.target.value)} className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-4 pl-12 pr-12 text-sm font-medium focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10" />
        <button
          type="button"
          onClick={() => setShowPassword((value) => !value)}
          aria-label={showPassword ? "Kache modpas la" : "Montre modpas la"}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-[#98A2B3] transition hover:text-brand-500"
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>

      <div className="relative">
        <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#98A2B3]" />
        <input type={showConfirmPassword ? "text" : "password"} required placeholder="Konfime nouvo modpas" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-4 pl-12 pr-12 text-sm font-medium focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10" />
        <button
          type="button"
          onClick={() => setShowConfirmPassword((value) => !value)}
          aria-label={showConfirmPassword ? "Kache konfimasyon modpas la" : "Montre konfimasyon modpas la"}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-[#98A2B3] transition hover:text-brand-500"
        >
          {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>

      <button
        type="button"
        onClick={() => {
          reset();
          setMode("login");
        }}
        className="text-sm font-bold text-[#667085] transition hover:text-brand-500"
      >
        Retounen konekte
      </button>
    </>
  ) : (
    <>
      <div className="relative">
        <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#98A2B3]" />
        <input type="email" required placeholder="Adres imel" value={email} onChange={(event) => setEmail(event.target.value)} className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-4 pl-12 pr-5 text-sm font-medium focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10" />
      </div>

      <div className="relative">
        <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#98A2B3]" />
        <input type={showPassword ? "text" : "password"} required placeholder="Modpas" value={password} onChange={(event) => setPassword(event.target.value)} className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-4 pl-12 pr-12 text-sm font-medium focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10" />
        <button
          type="button"
          onClick={() => setShowPassword((value) => !value)}
          aria-label={showPassword ? "Kache modpas la" : "Montre modpas la"}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-[#98A2B3] transition hover:text-brand-500"
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => {
            reset();
            setMode("reset");
          }}
          className="text-sm font-bold text-brand-500 transition hover:text-[#101828]"
        >
          Ou bliye modpas ou ?
        </button>
      </div>
    </>
  )}

  {success && (
    <div className="rounded-2xl border border-green-100 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
      {success}
    </div>
  )}

  {error && (
    <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
      {error}
    </div>
  )}

  <button type="submit" disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-500 py-4 text-base font-black text-white shadow-lg shadow-brand-500/20 transition-all hover:bg-[#101828] hover:scale-[1.02] active:scale-95 disabled:opacity-60">
    {loading ? (
      <Loader2 size={20} className="animate-spin" />
    ) : (
      <>
        {mode === "reset" ? "Chanje modpas" : mode === "login" ? "Konekte" : "Kreye kont mwen"}
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
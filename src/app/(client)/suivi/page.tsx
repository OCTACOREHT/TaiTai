"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase-client";
import { Commande } from "@/types/restaurant";
import { useAuth } from "@/context/AuthContext";
import { Search, Package, CheckCircle2, Clock, ChefHat, MapPin, Loader2, Navigation, History, ArrowRight } from "lucide-react";

type OrderSummary = {
  id: string;
  numero: string;
  date: string;
  total: number;
};

export default function SuiviPage() {
  const { user } = useAuth();
  const [numero, setNumero] = useState("");
  const [commande, setCommande] = useState<Commande | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [history, setHistory] = useState<OrderSummary[]>([]);

  useEffect(() => {
    if (!user) return;

    const fetchUserOrders = async () => {
      const { data, error } = await supabase
        .from("commandes")
        .select("id, numero_commande, created_at, total")
        .eq("client_user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10);

      if (!error && data) {
        setHistory(
          data.map((order) => ({
            id: order.id,
            numero: order.numero_commande,
            date: order.created_at,
            total: order.total,
          })),
        );
      }
    };

    fetchUserOrders();
  }, [user]);

  const handleSearch = async (e?: React.FormEvent, manualNumero?: string) => {
    e?.preventDefault();
    if (!user) return;

    let searchNum = (manualNumero || numero).trim().toUpperCase();
    if (!searchNum) return;

    // Auto-prepend TT- if it's just numbers and 4 digits long
    if (/^\d{4}$/.test(searchNum)) {
      searchNum = `TT-${searchNum}`;
    }

    setLoading(true);
    setError("");
    
    const { data, error: fetchError } = await supabase
      .from("commandes")
      .select("*")
      .eq("numero_commande", searchNum)
      .eq("client_user_id", user?.id)
      .maybeSingle();

    if (fetchError) {
      setError("Gen yon erè ki pase pandan rechèch la.");
    } else if (!data) {
      setError("Nou pa jwenn kòmann sa a. Verifye nimewo a.");
      setCommande(null);
    } else {
      setCommande(data);
      if (manualNumero) setNumero(manualNumero);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!user || typeof window === "undefined") return;

    const numeroParam = new URLSearchParams(window.location.search).get("numero");
    if (numeroParam) {
      setNumero(numeroParam);
      handleSearch(undefined, numeroParam);
    }
  }, [user]);

  useEffect(() => {
    if (!commande) return;

    const channel = supabase
      .channel(`tracking-${commande.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'commandes',
          filter: `id=eq.${commande.id}`
        },
        (payload) => {
          setCommande(payload.new as Commande);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [commande?.id]);

  const steps = [
    { value: "En attente", label: "Ap tann", icon: Clock, desc: "Nou resevwa kòmann ou. Li ap tann konfimasyon." },
    { value: "En préparation", label: "Ap prepare", icon: ChefHat, desc: "Ekip kwizin nan ap prepare kòmann ou." },
    { value: "Prêt", label: "Pare", icon: Package, desc: "Kòmann nan pare. Nou ap anbale li oswa li pare pou sèvis." },
    { value: "Livré", label: "Livre", icon: CheckCircle2, desc: "Kòmann nan rive. Bon apeti !" },
    { value: "Annulee", label: "Anile", icon: CheckCircle2, desc: "Kòmann nan anile apre verifikasyon." },
  ];

  const currentStepIndex = steps.findIndex(s => s.value === commande?.statut);

  return (
    <div className="mx-auto max-w-3xl space-y-10 py-6 sm:space-y-16 sm:py-10">
      <div className="space-y-4 text-center">
        <h1 className="text-3xl font-extrabold tracking-tight text-[#101828] sm:text-5xl">Swivi kòmann</h1>
        <p className="text-base font-medium text-[#667085] sm:text-lg">Swiv kòmann ou an tan reyèl.</p>
      </div>

      <div className="space-y-8 rounded-3xl border border-gray-100 bg-white p-5 shadow-xl sm:p-8">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-[#98A2B3]" size={22} />
            <input 
              type="text"
              placeholder="Antre nimewo ou (egzanp: TT-1234)"
              value={numero}
              onChange={e => setNumero(e.target.value)}
              className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-4 pl-14 pr-4 text-base font-bold uppercase text-[#101828] transition-all placeholder:text-gray-300 focus:border-[#FF9000] focus:outline-none focus:ring-4 focus:ring-[#FF9000]/10 sm:py-5 sm:pr-6 sm:text-xl"
            />
          </div>
          <button 
            type="submit"
            disabled={loading}
            className="min-w-[160px] rounded-2xl bg-[#101828] px-8 py-4 font-bold text-white shadow-lg shadow-black/10 transition-all hover:bg-brand-500 active:scale-95 disabled:opacity-50 sm:min-w-[180px] sm:px-10 sm:py-5"
          >
            {loading ? <Loader2 className="animate-spin mx-auto" size={24} /> : "Swiv"}
          </button>
        </form>

        {error && (
          <div className="flex items-center gap-3 justify-center text-red-500 font-bold text-sm bg-red-50 p-4 rounded-xl border border-red-100 animate-in fade-in zoom-in duration-300">
             <Info size={16} />
             {error}
          </div>
        )}

        {/* History / Recent Orders */}
        {!commande && history.length > 0 && (
          <div className="space-y-4 pt-4 border-t border-gray-50">
            <h4 className="text-sm font-black text-[#98A2B3] uppercase tracking-widest flex items-center gap-2">
              <History size={16} />
              Kòmann resan
            </h4>
            <div className="grid gap-3">
              {history.map((h) => (
                <button
                  key={h.id}
                  onClick={() => handleSearch(undefined, h.numero)}
                  className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 hover:bg-brand-500/10 border border-transparent hover:border-brand-500/20 transition-all text-left group"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center text-[#101828] shadow-sm">
                       <Package size={20} />
                    </div>
                    <div>
                      <p className="font-bold text-[#101828]">{h.numero}</p>
                      <p className="text-xs text-[#667085]">{new Date(h.date).toLocaleDateString()} • {h.total} HTG</p>
                    </div>
                  </div>
                    <ArrowRight size={18} className="text-[#98A2B3] group-hover:text-brand-500 transition-transform group-hover:translate-x-1" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {commande && (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out">
          <div className="relative space-y-10 overflow-hidden rounded-3xl border border-gray-100 bg-white p-5 shadow-2xl sm:space-y-12 sm:p-10">
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
               <Navigation size={200} strokeWidth={1} />
            </div>

            <div className="flex flex-col items-center justify-between gap-6 border-b border-gray-50 pb-8 md:flex-row md:gap-8">
              <div className="text-center md:text-left space-y-1">
                <p className="text-xs font-black text-[#98A2B3] uppercase tracking-[0.2em]">Idantifyan</p>
                <h3 className="break-all text-2xl font-black text-[#101828] sm:text-3xl">{commande.numero_commande}</h3>
              </div>
              <div className="flex items-center gap-4 bg-gray-50 px-6 py-4 rounded-2xl border border-gray-100">
                <div className="text-center md:text-right space-y-1">
                  <p className="text-[10px] font-black text-[#98A2B3] uppercase tracking-[0.2em]">Total kòmann</p>
                  <h3 className="text-2xl font-black text-brand-500">{commande.total} HTG</h3>
                </div>
              </div>
            </div>

            {/* Stepper */}
            <div className="relative pt-4">
              <div className="space-y-10 sm:space-y-14">
                {steps.map((step, idx) => {
                  const isDone = idx < currentStepIndex;
                  const isCurrent = idx === currentStepIndex;
                  const Icon = step.icon;
                  
                  return (
                    <div key={step.label} className={`relative flex items-center gap-4 transition-all duration-500 sm:gap-8 ${!isDone && !isCurrent ? 'opacity-30 scale-95 grayscale' : 'opacity-100'}`}>
                      <div className={`z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-[1.5rem] border-4 shadow-xl transition-all duration-500 sm:h-20 sm:w-20 sm:rounded-[2.5rem] ${
                        isDone || isCurrent 
                        ? "border-brand-500/20 bg-brand-500 text-white rotate-[360deg]" 
                        : "border-gray-50 bg-white text-[#98A2B3]"
                      }`}>
                        <Icon size={24} strokeWidth={isCurrent ? 2.5 : 2} />
                      </div>
                      <div className="space-y-2 pt-2">
                        <div className="flex items-center gap-3">
                           <h4 className={`text-xl font-black sm:text-2xl ${isCurrent ? 'text-[#101828]' : 'text-[#667085]'}`}>{step.label}</h4>
                           {isCurrent && <span className="flex h-3 w-3 rounded-full bg-brand-500 animate-ping" />}
                        </div>
                        <p className="text-base font-medium leading-relaxed text-[#667085] sm:text-lg">{step.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center gap-6 rounded-3xl border border-gray-100 bg-white p-5 shadow-xl sm:p-8 md:flex-row md:gap-8">
             <div className="h-16 w-16 rounded-[1.25rem] bg-[#101828] flex items-center justify-center text-white shadow-lg shadow-black/20">
                <MapPin size={32} />
             </div>
             <div className="text-center md:text-left space-y-1">
                <p className="text-[10px] font-black text-[#98A2B3] uppercase tracking-[0.2em]">Kote pou resevwa</p>
                <p className="text-xl font-bold text-[#101828] leading-tight">{commande.adresse_livraison || "Sou plas (sal)"}</p>
             </div>
          </div>
          
          <button 
            onClick={() => setCommande(null)}
            className="w-full py-4 text-sm font-bold text-[#98A2B3] hover:text-[#101828] transition"
          >
            ← Retounen nan rechèch la
          </button>
        </div>
      )}
    </div>
  );
}

function Info({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="12" y1="16" x2="12" y2="12"></line>
      <line x1="12" y1="8" x2="12.01" y2="8"></line>
    </svg>
  );
}

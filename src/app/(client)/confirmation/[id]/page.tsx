"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase-client";
import { Commande } from "@/types/restaurant";
import { CheckCircle2, Package, MapPin, ArrowLeft, Loader2, Navigation, MessageCircle } from "lucide-react";

const WHATSAPP_NUMBER = "50948095613";
const statusLabels: Record<string, string> = {
  "En attente": "Ap tann",
  "En préparation": "Ap prepare",
  "Prêt": "Pare",
  "Livré": "Livre",
};
const canalLabels: Record<string, string> = {
  Livraison: "Livrezon",
  "A emporter": "Pou pote ale",
  Salle: "Sou plas",
};

export default function ConfirmationPage() {
  const { id } = useParams();
  const router = useRouter();
  const [commande, setCommande] = useState<Commande | null>(null);
  const [loading, setLoading] = useState(true);
  const [waMsg, setWaMsg] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCommande() {
      const { data, error } = await supabase
        .from("commandes")
        .select("*")
        .eq("id", id)
        .single();
      
      if (!error && data) {
        setCommande(data);
      }
      setLoading(false);
    }
    if (id) {
      fetchCommande();
      const msg = sessionStorage.getItem("pending_whatsapp_msg");
      if (msg) {
        setWaMsg(msg);
        // Try to auto-open WhatsApp, but don't worry if it's blocked, we have the button
        setTimeout(() => {
          window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`, "_blank");
          sessionStorage.removeItem("pending_whatsapp_msg");
        }, 500);
      }
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="animate-spin text-[#F4A640]" size={48} />
      </div>
    );
  }

  if (!commande) {
    return (
      <div className="py-20 text-center space-y-4">
        <h1 className="text-2xl font-bold">Nou pa jwenn kòmann nan</h1>
        <button onClick={() => router.push("/")} className="text-[#F4A640] hover:underline">Retounen akèy la</button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-12 py-10">
      <div className="flex flex-col items-center text-center space-y-6">
        <div className="h-24 w-24 rounded-[2.5rem] bg-green-50 flex items-center justify-center text-green-500 shadow-lg shadow-green-500/10 border-4 border-white">
          <CheckCircle2 size={48} strokeWidth={2.5} />
        </div>
        <div className="space-y-3">
          <h1 className="text-5xl font-black text-[#101828]">Mèsi, {commande.client_nom} !</h1>
          <p className="text-[#667085] text-xl font-medium">Kòmann ou <span className="text-[#101828] font-black">{commande.numero_commande}</span> sou wout.</p>
        </div>
      </div>

      <div className="rounded-3xl border border-gray-100 bg-white p-10 space-y-10 shadow-2xl overflow-hidden relative">
        <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
           <Package size={200} strokeWidth={1} />
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-8 border-b border-gray-50 pb-10">
          <div className="space-y-1">
            <p className="text-[10px] font-black text-[#98A2B3] uppercase tracking-[0.2em]">Eta aktyèl</p>
            <div className="flex items-center gap-3 text-3xl font-black text-[#F4A640]">
              <Package size={28} />
              {statusLabels[commande.statut] || commande.statut}
            </div>
          </div>
          <div className="text-center md:text-right space-y-1 bg-gray-50 px-8 py-5 rounded-2xl border border-gray-100">
            <p className="text-[10px] font-black text-[#98A2B3] uppercase tracking-[0.2em]">Total peye</p>
            <p className="text-3xl font-black text-[#101828]">{commande.total} HTG</p>
          </div>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          <div className="space-y-5">
            <h3 className="font-black text-[#101828] flex items-center gap-3 uppercase text-xs tracking-widest">
              <Navigation size={18} className="text-[#F4A640]" /> Fason pou resevwa
            </h3>
            <div className="rounded-2xl bg-gray-50 p-6 border border-gray-100">
              <p className="font-bold text-lg text-[#101828]">{canalLabels[commande.canal] || commande.canal}</p>
              {commande.table_numero && <p className="text-[#667085] mt-1 font-medium italic">Nimewo tab: {commande.table_numero}</p>}
            </div>
          </div>
          
          <div className="space-y-5">
            <h3 className="font-black text-[#101828] flex items-center gap-3 uppercase text-xs tracking-widest">
              <MapPin size={18} className="text-[#F4A640]" /> Destinasyon
            </h3>
            <div className="rounded-2xl bg-gray-50 p-6 border border-gray-100">
              <p className="text-[#667085] font-medium leading-relaxed italic">{commande.adresse_livraison || "Sou plas"}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-6 sm:flex-row sm:justify-center pt-4">
        {waMsg && (
          <button 
            onClick={() => window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${waMsg}`, "_blank")}
            className="flex items-center justify-center gap-3 rounded-2xl bg-[#25D366] px-12 py-6 font-black text-white transition-all hover:bg-[#128C7E] hover:scale-[1.02] active:scale-95 shadow-xl shadow-[#25D366]/20"
          >
            <MessageCircle size={24} />
            Voye sou WhatsApp
          </button>
        )}
        <button 
          onClick={() => router.push("/suivi")}
          className="rounded-2xl bg-[#101828] px-12 py-6 font-black text-white transition-all hover:bg-[#F4A640] hover:scale-[1.02] active:scale-95 shadow-xl shadow-black/10"
        >
          Swiv kòmann mwen
        </button>
        <button 
          onClick={() => router.push("/")}
          className="flex items-center justify-center gap-3 rounded-2xl bg-white border border-gray-200 px-12 py-6 font-black text-[#101828] transition-all hover:bg-gray-50 active:scale-95 shadow-lg shadow-black/5"
        >
          <ArrowLeft size={20} strokeWidth={3} />
          Retounen nan meni an
        </button>
      </div>
    </div>
  );
}

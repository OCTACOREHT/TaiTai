"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase-client";
import { Commande } from "@/types/restaurant";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, CreditCard, Loader2, MapPin, Navigation, Package, Search } from "lucide-react";

const statusLabels: Record<string, string> = {
  "En attente": "Ap tann",
  "En préparation": "Ap prepare",
  "Prêt": "Pare",
  "Livré": "Livre",
  Annulee: "Anile",
};

export default function ConfirmationPage() {
  const { id } = useParams();
  const router = useRouter();
  const [commande, setCommande] = useState<Commande | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCommande() {
      const { data, error } = await supabase
        .from("commandes")
        .select("*")
        .eq("id", id)
        .single();

      if (!error && data) setCommande(data);
      setLoading(false);
    }

    if (id) fetchCommande();
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
        <h1 className="text-2xl font-bold">Nou pa jwenn komann nan</h1>
        <button onClick={() => router.push("/")} className="text-[#F4A640] hover:underline">
          Retounen akey la
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8 py-6 sm:space-y-12 sm:py-10">
      <div className="rounded-3xl border border-green-100 bg-white p-5 text-center shadow-2xl sm:p-8">
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-[2rem] border-4 border-white bg-green-50 text-green-500 shadow-lg shadow-green-500/10">
          <CheckCircle2 size={48} strokeWidth={2.5} />
        </div>
        <div className="mt-6 space-y-3">
          <p className="text-sm font-black uppercase tracking-[0.25em] text-green-600">Komann pase ak sikse</p>
          <h1 className="break-words text-3xl font-black text-[#101828] sm:text-4xl md:text-5xl">Mesi, {commande.client_nom} !</h1>
          <p className="text-[#667085] text-lg font-medium">
            Nimewo komann ou se:
          </p>
          <div className="mx-auto inline-flex max-w-full break-all rounded-2xl bg-[#101828] px-5 py-4 text-2xl font-black tracking-widest text-[#F4A640] sm:px-8 sm:text-3xl">
            {commande.numero_commande}
          </div>
        </div>
        <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
          <Link
            href={`/suivi?numero=${commande.numero_commande}`}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#F4A640] px-8 py-4 font-black text-white shadow-lg shadow-[#F4A640]/20 transition hover:bg-[#101828]"
          >
            <Search size={18} strokeWidth={3} />
            Swiv komann nan
          </Link>
          <Link
            href="/menu"
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white px-8 py-4 font-black text-[#101828] shadow-sm transition hover:border-[#F4A640] hover:text-[#F4A640]"
          >
            Retounen nan meni an
          </Link>
        </div>
      </div>

      <div className="relative space-y-8 overflow-hidden rounded-3xl border border-gray-100 bg-white p-5 shadow-2xl sm:space-y-10 sm:p-10">
        <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
          <Package size={200} strokeWidth={1} />
        </div>

        <div className="flex flex-col items-center justify-between gap-6 border-b border-gray-50 pb-8 md:flex-row md:gap-8 md:pb-10">
          <div className="space-y-1">
            <p className="text-[10px] font-black text-[#98A2B3] uppercase tracking-[0.2em]">Eta aktyel</p>
            <div className="flex items-center gap-3 text-2xl font-black text-[#F4A640] sm:text-3xl">
              <Package size={28} />
              {statusLabels[commande.statut] || commande.statut}
            </div>
          </div>
          <div className="space-y-1 rounded-2xl border border-gray-100 bg-gray-50 px-5 py-4 text-center sm:px-8 sm:py-5 md:text-right">
            <p className="text-[10px] font-black text-[#98A2B3] uppercase tracking-[0.2em]">Total</p>
            <p className="text-3xl font-black text-[#101828]">{commande.total} HTG</p>
          </div>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          <div className="space-y-5">
            <h3 className="font-black text-[#101828] flex items-center gap-3 uppercase text-xs tracking-widest">
              <Navigation size={18} className="text-[#F4A640]" /> Fason pou resevwa
            </h3>
            <div className="rounded-2xl bg-gray-50 p-6 border border-gray-100">
              <p className="font-bold text-lg text-[#101828]">Livrezon</p>
            </div>
          </div>

          <div className="space-y-5">
            <h3 className="font-black text-[#101828] flex items-center gap-3 uppercase text-xs tracking-widest">
              <MapPin size={18} className="text-[#F4A640]" /> Destinasyon
            </h3>
            <div className="rounded-2xl bg-gray-50 p-6 border border-gray-100">
              <p className="text-[#667085] font-medium leading-relaxed italic">{commande.adresse_livraison}</p>
            </div>
          </div>

          <div className="space-y-5 md:col-span-2">
            <h3 className="font-black text-[#101828] flex items-center gap-3 uppercase text-xs tracking-widest">
              <CreditCard size={18} className="text-[#F4A640]" /> Peman
            </h3>
            <div className="rounded-2xl bg-gray-50 p-6 border border-gray-100">
              <p className="font-bold text-lg text-[#101828]">{commande.payment_method || "Peman sou plas"}</p>
              {commande.payment_status && (
                <p className="mt-1 text-sm font-bold text-[#667085]">Verifikasyon: {commande.payment_status}</p>
              )}
              {commande.payment_method !== "Sur place" && (
                <p className="mt-3 text-sm font-bold text-[#C87518]">
                  Admin nan ap verifye justificatif peman an avan preparasyon an.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-6 sm:flex-row sm:justify-center pt-4">
        <button
          onClick={() => router.push("/suivi")}
          className="rounded-2xl bg-[#101828] px-12 py-6 font-black text-white transition-all hover:bg-[#F4A640] hover:scale-[1.02] active:scale-95 shadow-xl shadow-black/10"
        >
          Swiv komann mwen
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

"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase-client";
import { useAuth } from "@/context/AuthContext";
import { CalendarDays, ChevronRight, Clock, Package, ReceiptText } from "lucide-react";

type OrderItem = {
  id: string;
  nom_plat: string;
  prix_unitaire: number;
  quantite: number;
  sous_total: number;
};

type OrderHistory = {
  id: string;
  numero_commande: string;
  canal: "Livraison";
  adresse_livraison: string | null;
  table_numero: string | null;
  statut: string;
  total: number;
  created_at: string;
  commande_items?: OrderItem[];
};

const statusLabels: Record<string, string> = {
  "En attente": "Ap tann",
  "En préparation": "Ap prepare",
  "Prêt": "Pare",
  "Livré": "Livre",
  Annulee: "Anile",
};

const canalLabels: Record<string, string> = {
  Livraison: "Livrezon",
  "A emporter": "Pou pote ale",
  Salle: "Sou plas",
};

const statusStyles: Record<string, string> = {
  "En attente": "bg-amber-50 text-amber-700 ring-amber-100",
  "En préparation": "bg-blue-50 text-blue-700 ring-blue-100",
  "Prêt": "bg-emerald-50 text-emerald-700 ring-emerald-100",
  "Livré": "bg-gray-100 text-gray-700 ring-gray-200",
  Annulee: "bg-red-50 text-red-700 ring-red-100",
};

export default function HistoriquePage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<OrderHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;

    const fetchOrders = async () => {
      setLoading(true);
      setError("");

      const { data, error: fetchError } = await supabase
        .from("commandes")
        .select("id, numero_commande, canal, adresse_livraison, table_numero, statut, total, created_at, commande_items(id, nom_plat, prix_unitaire, quantite, sous_total)")
        .eq("client_user_id", user.id)
        .order("created_at", { ascending: false });

      if (fetchError) {
        setError("Nou pa ka chaje istorik kòmann ou yo pou kounye a.");
        setOrders([]);
      } else {
        setOrders((data || []) as OrderHistory[]);
      }

      setLoading(false);
    };

    fetchOrders();
  }, [user]);

  return (
    <div className="mx-auto max-w-5xl space-y-10 py-8">
      <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#F4A640]/10 px-4 py-2 text-xs font-black uppercase tracking-widest text-[#C87518]">
            <ReceiptText size={15} />
            Kont mwen
          </div>
          <div>
            <h1 className="text-4xl font-black tracking-tight text-[#101828] md:text-5xl">Istorik kòmann</h1>
            <p className="mt-3 max-w-2xl text-base font-medium text-[#667085]">
              Gade tout kòmann ou te pase sou TaïTaï ak eta yo.
            </p>
          </div>
        </div>

        <Link
          href="/suivi"
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#101828] px-6 py-4 text-sm font-black text-white shadow-lg shadow-black/10 transition hover:bg-[#F4A640]"
        >
          Swiv yon kòmann
          <ChevronRight size={18} strokeWidth={3} />
        </Link>
      </div>

      {loading ? (
        <div className="flex h-72 items-center justify-center rounded-3xl border border-gray-100 bg-white shadow-sm">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#F4A640] border-t-transparent" />
        </div>
      ) : error ? (
        <div className="rounded-3xl border border-red-100 bg-red-50 p-8 text-center font-bold text-red-600">
          {error}
        </div>
      ) : orders.length === 0 ? (
        <div className="rounded-3xl border border-gray-100 bg-white p-12 text-center shadow-sm">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-gray-50 text-[#98A2B3]">
            <Package size={40} />
          </div>
          <h2 className="text-2xl font-black text-[#101828]">Ou poko gen kòmann</h2>
          <p className="mt-2 font-medium text-[#667085]">Lè ou pase yon kòmann, l ap parèt isit la.</p>
          <Link
            href="/menu"
            className="mt-8 inline-flex items-center justify-center rounded-2xl bg-[#F4A640] px-8 py-4 font-black text-white shadow-lg shadow-[#F4A640]/20 transition hover:bg-[#101828]"
          >
            Gade meni an
          </Link>
        </div>
      ) : (
        <div className="space-y-5">
          {orders.map((order) => (
            <article key={order.id} className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm transition hover:shadow-md">
              <div className="flex flex-col gap-5 border-b border-gray-50 p-6 md:flex-row md:items-center md:justify-between">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-2xl font-black text-[#101828]">{order.numero_commande}</h2>
                    <span className={`rounded-full px-3 py-1 text-xs font-black ring-1 ${statusStyles[order.statut] || "bg-gray-100 text-gray-700 ring-gray-200"}`}>
                      {statusLabels[order.statut] || order.statut}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm font-bold text-[#667085]">
                    <span className="inline-flex items-center gap-2">
                      <CalendarDays size={16} />
                      {new Date(order.created_at).toLocaleDateString("fr-FR")}
                    </span>
                    <span className="inline-flex items-center gap-2">
                      <Clock size={16} />
                      {new Date(order.created_at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                    <span>{canalLabels[order.canal] || order.canal}</span>
                  </div>
                </div>

                <div className="text-left md:text-right">
                  <p className="text-xs font-black uppercase tracking-widest text-[#98A2B3]">Total</p>
                  <p className="text-3xl font-black text-[#F4A640]">{order.total} HTG</p>
                </div>
              </div>

              <div className="grid gap-6 p-6 md:grid-cols-[1fr_auto]">
                <div className="space-y-3">
                  {(order.commande_items || []).length > 0 ? (
                    order.commande_items?.map((item) => (
                      <div key={item.id} className="flex items-center justify-between gap-4 rounded-2xl bg-gray-50 px-4 py-3">
                        <div>
                          <p className="font-black text-[#101828]">{item.nom_plat}</p>
                          <p className="text-sm font-bold text-[#667085]">Kantite: {item.quantite}</p>
                        </div>
                        <p className="shrink-0 font-black text-[#101828]">{item.sous_total} HTG</p>
                      </div>
                    ))
                  ) : (
                    <p className="rounded-2xl bg-gray-50 px-4 py-3 text-sm font-bold text-[#667085]">
                      Detay plat yo pa disponib.
                    </p>
                  )}
                </div>

                <Link
                  href={`/suivi?numero=${order.numero_commande}`}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-gray-200 px-5 text-sm font-black text-[#101828] transition hover:border-[#F4A640] hover:text-[#F4A640]"
                >
                  Swiv
                  <ChevronRight size={17} strokeWidth={3} />
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

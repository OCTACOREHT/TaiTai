"use client";

import React, { useEffect, useRef, useState } from "react";
import { X, Bell, ShoppingCart, User, Phone, Mail, MapPin, CreditCard } from "lucide-react";
import { supabase } from "@/lib/supabase-client";

interface OrderItem {
  id?: string;
  nom_plat: string;
  quantite: number;
  prix_unitaire: number;
  sous_total?: number;
}

interface OrderData {
  id: string;
  numero_commande: string;
  client_nom: string;
  client_tel: string;
  client_email?: string;
  adresse_livraison: string;
  total: number;
  payment_method: string;
  created_at: string;
  commande_items?: OrderItem[];
}

export default function OrderNotificationPopup() {
  const [showPopup, setShowPopup] = useState(false);
  const [order, setOrder] = useState<OrderData | null>(null);
  const lastOrderIdRef = useRef<string | null>(null);
  const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const popupShownForRef = useRef<string | null>(null);
  const ORDER_POPUP_WINDOW_MS = 30_000;
  const POPUP_HIDE_DELAY_MS = 15_000;

  const playNotificationSound = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      // Tone 1: C5 (523.25 Hz)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(523.25, ctx.currentTime);
      gain1.gain.setValueAtTime(0.3, ctx.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start();
      osc1.stop(ctx.currentTime + 0.35);

      // Tone 2: E5 (659.25 Hz) - Chime effect
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(659.25, ctx.currentTime + 0.15);
      gain2.gain.setValueAtTime(0.4, ctx.currentTime + 0.15);
      gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(ctx.currentTime + 0.15);
      osc2.stop(ctx.currentTime + 0.6);
    } catch (err) {
      console.warn("[notif audio error]", err);
    }
  };

  const isRecentOrder = (createdAt: string) => {
    const createdAtTimestamp = new Date(createdAt).getTime();
    const now = Date.now();
    return now - createdAtTimestamp < ORDER_POPUP_WINDOW_MS;
  };

  const showOrderPopup = (data: OrderData) => {
    if (popupShownForRef.current === data.id) return;
    popupShownForRef.current = data.id;

    setOrder(data);
    setShowPopup(true);
    playNotificationSound();

    console.log("🛒 Nouvelle commande détectée:", data.numero_commande);

    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => {
      setShowPopup(false);
    }, POPUP_HIDE_DELAY_MS);
  };

  const fetchLatestOrder = async () => {
    try {
      const { data } = await supabase
        .from("commandes")
        .select("id, numero_commande, client_nom, client_tel, adresse_livraison, total, payment_method, created_at, commande_items(id, nom_plat, quantite, prix_unitaire, sous_total)")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (data?.id) {
        if (lastOrderIdRef.current !== data.id) {
          lastOrderIdRef.current = data.id;
          if (isRecentOrder(data.created_at)) {
            showOrderPopup(data as OrderData);
          }
        }
      }
    } catch (err) {
      console.error("[notif] Erreur chargement dernière commande:", err);
    }
  };

  useEffect(() => {
    fetchLatestOrder();

    pollTimerRef.current = setInterval(fetchLatestOrder, 5000);

    return () => {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, []);

  const handleViewOrder = () => {
    setShowPopup(false);
    window.location.href = "/commandes";
  };

  if (!showPopup || !order) return null;

  return (
    <div className="fixed top-20 right-4 z-50 animate-slide-in">
      <div className="w-[450px] rounded-2xl border-2 border-brand-500 bg-white shadow-2xl shadow-brand-500/20">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-brand-100 bg-brand-50 p-4">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-brand-600 animate-pulse" />
            <h3 className="text-sm font-black text-brand-700">🛒 NOUVELLE COMMANDE !</h3>
          </div>
          <button
            onClick={() => setShowPopup(false)}
            className="rounded-lg p-1 text-brand-600 hover:bg-brand-100"
          >
            <X size={18} />
          </button>
        </div>

        {/* Contenu */}
        <div className="max-h-[500px] overflow-y-auto p-4">
          {/* Numéro et total */}
          <div className="mb-4 flex items-center justify-between rounded-xl bg-brand-50 p-3">
            <div>
              <p className="text-xs font-bold text-gray-600">Commande</p>
              <p className="text-lg font-black text-brand-600">#{order.numero_commande}</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold text-gray-600">Total</p>
              <p className="text-lg font-black text-brand-600">{order.total} HTG</p>
            </div>
          </div>

          {/* Détails client */}
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <User size={16} className="mt-0.5 text-gray-400" />
              <div className="flex-1">
                <p className="text-xs font-bold text-gray-900">{order.client_nom}</p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Phone size={16} className="mt-0.5 text-gray-400" />
              <p className="text-xs text-gray-600">{order.client_tel}</p>
            </div>

            {order.client_email && (
              <div className="flex items-start gap-2">
                <Mail size={16} className="mt-0.5 text-gray-400" />
                <p className="text-xs text-gray-600">{order.client_email}</p>
              </div>
            )}

            <div className="flex items-start gap-2">
              <MapPin size={16} className="mt-0.5 text-gray-400" />
              <p className="text-xs text-gray-600">{order.adresse_livraison}</p>
            </div>

            <div className="flex items-start gap-2">
              <CreditCard size={16} className="mt-0.5 text-gray-400" />
              <p className="text-xs text-gray-600">{order.payment_method}</p>
            </div>
          </div>

          {/* Plats commandés */}
          {order.commande_items && order.commande_items.length > 0 && (
            <div className="mt-3 border-t border-gray-100 pt-3">
              <p className="mb-2 text-xs font-black uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
                <ShoppingCart size={14} className="text-brand-500" />
                Détails des plats ({order.commande_items.length}) :
              </p>
              <div className="space-y-1.5 rounded-xl border border-gray-200 bg-gray-50/80 p-3">
                {order.commande_items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs">
                    <span className="font-bold text-gray-900">
                      {item.quantite}x {item.nom_plat}
                    </span>
                    <span className="font-black text-brand-600">
                      {(item.sous_total || item.prix_unitaire * item.quantite)} HTG
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Heure */}
          <div className="mt-3 border-t border-gray-100 pt-3">
            <p className="text-[10px] text-gray-400">
              {new Date(order.created_at).toLocaleTimeString("fr-FR")}
            </p>
          </div>
        </div>

        {/* Bouton */}
        <div className="border-t border-gray-100 p-3">
          <button
            onClick={handleViewOrder}
            className="w-full rounded-xl bg-brand-500 py-3 text-sm font-black text-white transition hover:bg-brand-600"
          >
            Voir la commande
          </button>
        </div>
      </div>
    </div>
  );
}

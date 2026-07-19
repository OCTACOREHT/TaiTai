"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase-client";
import { X, Bell, ShoppingCart } from "lucide-react";
import "./NewOrderNotification.css";

interface NewOrder {
  id: string;
  numero_commande: string;
  client_nom: string;
  total: number;
  created_at: string;
}

export default function NewOrderNotification() {
  const [showPopup, setShowPopup] = useState(false);
  const [newOrder, setNewOrder] = useState<NewOrder | null>(null);
  const [lastOrderId, setLastOrderId] = useState<string | null>(null);

  useEffect(() => {
    // Récupérer la dernière commande au chargement
    const fetchLastOrder = async () => {
      const { data } = await supabase
        .from("commandes")
        .select("id, numero_commande, client_nom, total, created_at")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (data) {
        setLastOrderId(data.id);
      }
    };

    fetchLastOrder();

    // Écouter les nouvelles commandes en temps réel
    const channel = supabase
      .channel("new-orders")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "commandes",
        },
        (payload) => {
          const order = payload.new as NewOrder;
          
          // Éviter les doublons
          if (order.id === lastOrderId) return;

          // Afficher la popup
          setNewOrder(order);
          setShowPopup(true);
          setLastOrderId(order.id);

          // Cacher automatiquement après 10 secondes
          setTimeout(() => {
            setShowPopup(false);
          }, 10000);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [lastOrderId]);

  const handleClick = () => {
    setShowPopup(false);
    window.location.href = "/commandes";
  };

  if (!showPopup || !newOrder) return null;

  return (
    <div className="fixed top-20 right-4 z-50 animate-slide-in">
      <div className="w-96 rounded-2xl border-2 border-green-500 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-green-100 bg-green-50 p-4">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-green-600 animate-pulse" />
            <h3 className="text-sm font-black text-green-800">NOUVELLE COMMANDE !</h3>
          </div>
          <button
            onClick={() => setShowPopup(false)}
            className="rounded-lg p-1 text-green-600 hover:bg-green-100"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-4">
          <div className="flex items-start gap-3">
            <div className="rounded-full bg-green-100 p-2">
              <ShoppingCart className="h-6 w-6 text-green-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-gray-900">
                Commande #{newOrder.numero_commande}
              </p>
              <p className="mt-1 text-xs text-gray-600">
                Client: <span className="font-semibold">{newOrder.client_nom}</span>
              </p>
              <p className="mt-1 text-lg font-black text-green-600">
                {newOrder.total} HTG
              </p>
              <p className="mt-1 text-[10px] text-gray-400">
                {new Date(newOrder.created_at).toLocaleTimeString("fr-FR")}
              </p>
            </div>
          </div>

          <button
            onClick={handleClick}
            className="mt-4 w-full rounded-xl bg-green-500 py-3 text-sm font-black text-white transition hover:bg-green-600"
          >
            Voir la commande
          </button>
        </div>
      </div>
    </div>
  );
}
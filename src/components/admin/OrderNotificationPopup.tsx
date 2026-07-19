"use client";

import React, { useEffect, useState } from "react";
import { X, Bell, ShoppingCart, User, Phone, Mail, MapPin, CreditCard } from "lucide-react";
import { supabase } from "@/lib/supabase-client";

interface OrderData {
  id: string;
  numero_commande: string;
  client_nom: string;
  client_tel: string;
  client_email: string;
  adresse_livraison: string;
  total: number;
  payment_method: string;
  created_at: string;
}

export default function OrderNotificationPopup() {
  const [showPopup, setShowPopup] = useState(false);
  const [order, setOrder] = useState<OrderData | null>(null);
  const [lastOrderId, setLastOrderId] = useState<string | null>(null);

  useEffect(() => {
    // Récupérer la dernière commande au chargement
    const fetchLastOrder = async () => {
      const { data } = await supabase
        .from("commandes")
        .select("id, numero_commande, client_nom, client_tel, client_email, adresse_livraison, total, payment_method, created_at")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (data) {
        setLastOrderId(data.id);
      }
    };

    fetchLastOrder();

    // Vérifier les nouvelles commandes toutes les 5 secondes
    const pollInterval = setInterval(async () => {
      try {
        const { data } = await supabase
          .from("commandes")
          .select("id, numero_commande, client_nom, client_tel, client_email, adresse_livraison, total, payment_method, created_at")
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (data && data.id !== lastOrderId) {
          console.log("🛒 Nouvelle commande détectée:", data.numero_commande);
          
          // Afficher la popup
          setOrder(data);
          setShowPopup(true);
          setLastOrderId(data.id);

          // Cacher automatiquement après 20 secondes
          setTimeout(() => {
            setShowPopup(false);
          }, 20000);
        }
      } catch (error) {
        console.error("Erreur lors de la vérification:", error);
      }
    }, 5000); // Vérifier toutes les 5 secondes

    return () => {
      clearInterval(pollInterval);
    };
  }, [lastOrderId]);

  const handleViewOrder = () => {
    setShowPopup(false);
    window.location.href = "/commandes";
  };

  if (!showPopup || !order) return null;

  return (
    <div className="fixed top-20 right-4 z-50 animate-slide-in">
      <div className="w-[450px] rounded-2xl border-2 border-green-500 bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-green-100 bg-green-50 p-4">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-green-600 animate-pulse" />
            <h3 className="text-sm font-black text-green-800">🛒 NOUVELLE COMMANDE !</h3>
          </div>
          <button
            onClick={() => setShowPopup(false)}
            className="rounded-lg p-1 text-green-600 hover:bg-green-100"
          >
            <X size={18} />
          </button>
        </div>

        {/* Contenu */}
        <div className="max-h-[500px] overflow-y-auto p-4">
          {/* Numéro et total */}
          <div className="mb-4 flex items-center justify-between rounded-xl bg-green-50 p-3">
            <div>
              <p className="text-xs font-bold text-gray-600">Commande</p>
              <p className="text-lg font-black text-green-600">#{order.numero_commande}</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold text-gray-600">Total</p>
              <p className="text-lg font-black text-green-600">{order.total} HTG</p>
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

            <div className="flex items-start gap-2">
              <Mail size={16} className="mt-0.5 text-gray-400" />
              <p className="text-xs text-gray-600">{order.client_email}</p>
            </div>

            <div className="flex items-start gap-2">
              <MapPin size={16} className="mt-0.5 text-gray-400" />
              <p className="text-xs text-gray-600">{order.adresse_livraison}</p>
            </div>

            <div className="flex items-start gap-2">
              <CreditCard size={16} className="mt-0.5 text-gray-400" />
              <p className="text-xs text-gray-600">{order.payment_method}</p>
            </div>
          </div>

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
            className="w-full rounded-xl bg-green-500 py-3 text-sm font-black text-white transition hover:bg-green-600"
          >
            Voir la commande
          </button>
        </div>
      </div>
    </div>
  );
}
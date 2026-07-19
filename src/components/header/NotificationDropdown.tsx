"use client";

import { supabase } from "@/lib/supabase-client";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { X, Bell, ShoppingCart } from "lucide-react";
import "./NotificationDropdown.css";

interface Order {
  id: string;
  numero_commande: string;
  client_nom: string;
  total: number;
  statut: string;
  created_at: string;
}

interface StockItem {
  id: string;
  nom: string;
  stock_quantity: number;
}

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [pendingOrders, setPendingOrders] = useState<Order[]>([]);
  const [criticalStocks, setCriticalStocks] = useState<StockItem[]>([]);
  const [showNewOrderPopup, setShowNewOrderPopup] = useState(false);
  const [newOrder, setNewOrder] = useState<Order | null>(null);
  const [lastOrderId, setLastOrderId] = useState<string | null>(null);

  // Charger les commandes en attente
  useEffect(() => {
    const loadPendingOrders = async () => {
      const { data } = await supabase
        .from("commandes")
        .select("id, numero_commande, client_nom, total, statut, created_at")
        .eq("statut", "En attente")
        .order("created_at", { ascending: false });

      if (data) {
        setPendingOrders(data);
      }
    };

    loadPendingOrders();
  }, []);

  // Charger les stocks critiques
  useEffect(() => {
    const loadCriticalStocks = async () => {
      const { data } = await supabase
        .from("menu_items")
        .select("id, nom, stock_quantity")
        .eq("disponible", true)
        .lte("stock_quantity", 5);

      if (data) {
        setCriticalStocks(data);
      }
    };

    loadCriticalStocks();
  }, []);

  // Système de polling pour détecter les nouvelles commandes (fonctionne tout le temps)
  useEffect(() => {
    let pollInterval: NodeJS.Timeout;
    let currentOrderCount = pendingOrders.length;
    let connectionErrorShown = false;

    const checkNewOrders = async () => {
      try {
        // Test de connexion Supabase
        const { data: testData, error: testError } = await supabase
          .from("commandes")
          .select("count")
          .limit(1);

        if (testError) {
          if (!connectionErrorShown) {
            console.error("❌ Erreur de connexion Supabase:", testError.message);
            console.error("Vérifiez votre connexion internet et votre clé API Supabase");
            connectionErrorShown = true;
          }
          return;
        }

        // Si on arrive ici, la connexion fonctionne
        if (connectionErrorShown) {
          console.log("✅ Connexion Supabase rétablie");
          connectionErrorShown = false;
        }

        const { data } = await supabase
          .from("commandes")
          .select("id, numero_commande, client_nom, total, statut, created_at")
          .eq("statut", "En attente")
          .order("created_at", { ascending: false });

        if (data && data.length > currentOrderCount) {
          // Nouvelle commande détectée
          const latestOrder = data[0];
          
          // Éviter les doublons
          if (latestOrder.id !== lastOrderId) {
            console.log("🛒 Nouvelle commande détectée:", latestOrder.numero_commande);
            
            // Mettre à jour la liste
            setPendingOrders(data);
            currentOrderCount = data.length;

            // Afficher la popup
            setNewOrder(latestOrder);
            setShowNewOrderPopup(true);
            setLastOrderId(latestOrder.id);

            // Cacher automatiquement après 10 secondes
            setTimeout(() => {
              setShowNewOrderPopup(false);
            }, 10000);
          }
        } else if (data) {
          setPendingOrders(data);
          currentOrderCount = data.length;
        }
      } catch (error) {
        console.error("❌ Erreur lors de la vérification des commandes:", error);
      }
    };

    // Vérifier immédiatement au chargement
    checkNewOrders();

    // Vérifier toutes les 5 secondes
    pollInterval = setInterval(checkNewOrders, 5000);

    return () => {
      if (pollInterval) {
        clearInterval(pollInterval);
      }
    };
  }, [lastOrderId]);

  const alerts = [
    {
      id: "orders-pending",
      title: "Commandes en attente",
      description: `${pendingOrders.length} ticket${pendingOrders.length > 1 ? 's' : ''} doi${pendingOrders.length > 1 ? 'vent' : 't'} encore passer en cuisine ou en salle.`,
      href: "/commandes",
    },
    {
      id: "stock-critical",
      title: "Stocks critiques",
      description: `${criticalStocks.length} produit${criticalStocks.length > 1 ? 's' : ''} ${criticalStocks.length > 1 ? 'sont' : 'est'} sous le seuil de securite.`,
      href: "/stocks",
    },
  ];

  const handleViewOrder = () => {
    setShowNewOrderPopup(false);
    window.location.href = "/commandes";
  };

  return (
    <div className="relative">
      <button
        className="dropdown-toggle relative flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
        onClick={() => setIsOpen((value) => !value)}
      >
        {alerts.length > 0 ? (
          <span className="absolute right-0 top-0.5 z-10 flex h-2 w-2 rounded-full bg-orange-400">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange-400 opacity-75" />
          </span>
        ) : null}
        <svg
          className="fill-current"
          width="20"
          height="20"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M10.75 2.29248C10.75 1.87827 10.4143 1.54248 10 1.54248C9.58583 1.54248 9.25004 1.87827 9.25004 2.29248V2.83613C6.08266 3.20733 3.62504 5.9004 3.62504 9.16748V14.4591H3.33337C2.91916 14.4591 2.58337 14.7949 2.58337 15.2091C2.58337 15.6234 2.91916 15.9591 3.33337 15.9591H4.37504H15.625H16.6667C17.0809 15.9591 17.4167 15.6234 17.4167 15.2091C17.4167 14.7949 17.0809 14.4591 16.6667 14.4591H16.375V9.16748C16.375 5.9004 13.9174 3.20733 10.75 2.83613V2.29248ZM14.875 14.4591V9.16748C14.875 6.47509 12.6924 4.29248 10 4.29248C7.30765 4.29248 5.12504 6.47509 5.12504 9.16748V14.4591H14.875ZM8.00004 17.7085C8.00004 18.1228 8.33583 18.4585 8.75004 18.4585H11.25C11.6643 18.4585 12 18.1228 12 17.7085C12 17.2943 11.6643 16.9585 11.25 16.9585H8.75004C8.33583 16.9585 8.00004 17.2943 8.00004 17.7085Z"
            fill="currentColor"
          />
        </svg>
      </button>

      <Dropdown
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        className="absolute right-0 mt-[17px] flex w-[calc(100vw-2rem)] max-w-[340px] flex-col rounded-2xl border border-gray-200 bg-white p-3 shadow-theme-lg dark:border-gray-800 dark:bg-gray-dark"
      >
        <div className="mb-3 flex items-center justify-between border-b border-gray-100 pb-3 dark:border-gray-800">
          <h5 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Alertes service</h5>
          <span className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700 dark:bg-brand-900/20 dark:text-brand-300">
            {alerts.length}
          </span>
        </div>

        <div className="custom-scrollbar max-h-[360px] space-y-2 overflow-y-auto">
          {alerts.map((alert) => (
            <Link
              key={alert.id}
              href={alert.href}
              onClick={() => setIsOpen(false)}
              className="block rounded-xl border border-gray-100 px-4 py-3 transition hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-white/5"
            >
              <p className="text-sm font-semibold text-gray-900 dark:text-white/90">{alert.title}</p>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{alert.description}</p>
            </Link>
          ))}
        </div>
      </Dropdown>

      {/* Popup de nouvelle commande */}
      {showNewOrderPopup && newOrder && (
        <div className="fixed top-20 right-4 z-50 animate-slide-in">
          <div className="w-96 rounded-2xl border-2 border-green-500 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-green-100 bg-green-50 p-4">
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-green-600 animate-pulse" />
                <h3 className="text-sm font-black text-green-800">NOUVELLE COMMANDE !</h3>
              </div>
              <button
                onClick={() => setShowNewOrderPopup(false)}
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
                onClick={handleViewOrder}
                className="mt-4 w-full rounded-xl bg-green-500 py-3 text-sm font-black text-white transition hover:bg-green-600"
              >
                Voir la commande
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

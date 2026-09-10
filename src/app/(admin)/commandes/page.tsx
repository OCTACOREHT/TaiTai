"use client";

import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { OrdersManagement } from "@/components/dashboard/OrdersManagement";
import { Toast } from "@/components/ui/toast/Toast";
import { restaurantOrders } from "@/lib/data";
import { supabase } from "@/lib/supabase-client";
import { AlertTriangle, Loader2, Power } from "lucide-react";
import { useEffect, useState } from "react";

export default function OrdersPage() {
  const [stockAlerts, setStockAlerts] = useState<{ lowStock: number; outOfStock: number; items: any[] }>({ lowStock: 0, outOfStock: 0, items: [] });
  const [loading, setLoading] = useState(true);
  const [commandesOuvertes, setCommandesOuvertes] = useState(true);
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [isToggling, setIsToggling] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    loadStockAlerts();
    loadSettings();

    const channel = supabase
      .channel("admin_restaurant_settings")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "restaurant_settings" },
        (payload: any) => {
          if (payload.new && typeof payload.new.commandes_ouvertes === "boolean") {
            setCommandesOuvertes(payload.new.commandes_ouvertes);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from("restaurant_settings")
        .select("commandes_ouvertes")
        .eq("id", "general")
        .single();

      if (!error && data) {
        setCommandesOuvertes(data.commandes_ouvertes);
      }
    } catch (error) {
      console.error("Failed to load restaurant settings:", error);
    } finally {
      setSettingsLoading(false);
    }
  };

  const handleToggleCommandes = async () => {
    if (isToggling) return;
    const nextState = !commandesOuvertes;
    setIsToggling(true);
    setCommandesOuvertes(nextState);

    try {
      const res = await fetch("/api/restaurant/status", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ commandes_ouvertes: nextState }),
      });

      if (!res.ok) {
        throw new Error("Erreur serveur");
      }

      setToast(
        nextState
          ? "Commandes en ligne ACTIVES : les clients peuvent maintenant passer commande."
          : "Commandes en ligne SUSPENDUES : les clients ne peuvent plus commander."
      );
    } catch (error) {
      setCommandesOuvertes(!nextState);
      setToast("Erreur : impossible de changer le statut des commandes.");
    } finally {
      setIsToggling(false);
    }
  };

  const loadStockAlerts = async () => {
    try {
      const { data, error } = await supabase
        .from("menu_items")
        .select("id, nom, stock_quantity")
        .eq("disponible", true)
        .is("deleted_at", null);

      if (!error && data) {
        const lowStock = data.filter(item => item.stock_quantity > 0 && item.stock_quantity <= 5).length;
        const outOfStock = data.filter(item => item.stock_quantity <= 0).length;
        setStockAlerts({
          lowStock,
          outOfStock,
          items: data.filter(item => item.stock_quantity <= 5)
        });
      }
    } catch (error) {
      console.error("Failed to load stock alerts:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageBreadCrumb pageTitle="Commandes" />

      {(stockAlerts.lowStock > 0 || stockAlerts.outOfStock > 0) && (
        <div className="space-y-3">
          {stockAlerts.outOfStock > 0 && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900/50 dark:bg-red-900/20">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
                <div className="flex-1">
                  <h3 className="text-sm font-bold text-red-800 dark:text-red-300">
                    Critique: Rupture de stock
                  </h3>
                  <p className="mt-1 text-sm text-red-700 dark:text-red-400">
                    {stockAlerts.outOfStock} plat(s) sont en rupture. Ils ne sont plus disponibles à la vente.
                  </p>
                </div>
              </div>
            </div>
          )}

          {stockAlerts.lowStock > 0 && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/50 dark:bg-amber-900/20">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                <div className="flex-1">
                  <h3 className="text-sm font-bold text-amber-800 dark:text-amber-300">
                    Attention: Stock faible
                  </h3>
                  <p className="mt-1 text-sm text-amber-700 dark:text-amber-400">
                    {stockAlerts.lowStock} plat(s) ont 5 unités ou moins. Réassortez rapidement.
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {stockAlerts.items
                      .filter(item => item.stock_quantity > 0 && item.stock_quantity <= 5)
                      .slice(0, 5)
                      .map(item => (
                        <span key={item.id} className="inline-flex items-center gap-1.5 rounded-lg bg-white px-2.5 py-1 text-xs font-semibold text-amber-800 dark:bg-amber-900/40 dark:text-amber-200">
                          {item.nom}
                          <span className="font-bold text-amber-600 dark:text-amber-400">({item.stock_quantity})</span>
                        </span>
                      ))}
                    {stockAlerts.items.filter(item => item.stock_quantity > 0 && item.stock_quantity <= 5).length > 5 && (
                      <span className="text-xs font-medium text-amber-700 dark:text-amber-400">
                        +{stockAlerts.items.filter(item => item.stock_quantity > 0 && item.stock_quantity <= 5).length - 5} autres
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {toast && <Toast title="Statut des commandes" message={toast} onClose={() => setToast(null)} />}

      <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-theme-xs dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-bold text-brand-500 uppercase tracking-wider">Service en direct</p>
            <h1 className="mt-1 text-2xl font-bold text-gray-900 dark:text-white/90 sm:text-3xl">
              Orchestration des tickets TaïTaï
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500 dark:text-gray-400">
              Gardez la cuisine, la salle et la livraison synchronisees depuis une seule table.
            </p>
          </div>

          {/* Bouton Toggle ON / OFF Commandes du site */}
          <div className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-gray-50/80 p-4 dark:border-gray-800 dark:bg-white/[0.02] sm:px-5 sm:py-3.5">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span
                  className={`inline-block h-2.5 w-2.5 rounded-full ${
                    commandesOuvertes ? "bg-emerald-500 animate-pulse" : "bg-red-500"
                  }`}
                />
                <span className="text-sm font-bold text-gray-900 dark:text-white">
                  Commandes en ligne :
                </span>
                <span
                  className={`text-sm font-extrabold uppercase ${
                    commandesOuvertes
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {commandesOuvertes ? "Ouvertes (ON)" : "Fermées (OFF)"}
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {commandesOuvertes
                  ? "Le site web accepte actuellement les commandes."
                  : "Les nouvelles commandes sont bloquées sur le site."}
              </p>
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={commandesOuvertes}
              disabled={settingsLoading || isToggling}
              onClick={handleToggleCommandes}
              className={`relative inline-flex h-8 w-16 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                commandesOuvertes ? "bg-emerald-500" : "bg-gray-300 dark:bg-gray-700"
              }`}
            >
              <span className="sr-only">Activer ou désactiver la réception des commandes</span>
              <span
                aria-hidden="true"
                className={`pointer-events-none inline-flex h-7 w-7 transform items-center justify-center rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                  commandesOuvertes ? "translate-x-8 text-emerald-600" : "translate-x-0 text-gray-400"
                }`}
              >
                {isToggling ? (
                  <Loader2 size={14} className="animate-spin text-gray-600" />
                ) : (
                  <Power size={14} strokeWidth={2.5} />
                )}
              </span>
            </button>
          </div>
        </div>
      </section>

      <OrdersManagement initialOrders={restaurantOrders} />
    </div>
  );
}

"use client";

import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { OrdersManagement } from "@/components/dashboard/OrdersManagement";
import { restaurantOrders } from "@/lib/data";
import { supabase } from "@/lib/supabase-client";
import { AlertTriangle } from "lucide-react";
import { useEffect, useState } from "react";

export default function OrdersPage() {
  const [stockAlerts, setStockAlerts] = useState<{ lowStock: number; outOfStock: number; items: any[] }>({ lowStock: 0, outOfStock: 0, items: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStockAlerts();
  }, []);

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

      <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-theme-xs dark:border-gray-800 dark:bg-white/[0.03]">
        <p className="text-sm text-brand-500">Service en direct</p>
        <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-gray-900 dark:text-white/90">
              Orchestration des tickets TaïTaï
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-gray-500 dark:text-gray-400">
              Gardez la cuisine, la salle et la livraison synchronisees depuis une seule table.
            </p>
          </div>
        </div>
      </section>

      <OrdersManagement initialOrders={restaurantOrders} />
    </div>
  );
}

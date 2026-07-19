"use client";

import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { MetricGrid } from "@/components/dashboard/MetricGrid";
import { PeriodFilter } from "@/components/dashboard/PeriodFilter";
import { SalesPerformanceChart } from "@/components/dashboard/SalesPerformanceChart";
import { useAutoRefresh } from "@/hooks/useAutoRefresh";
import {
  aggregateSalesTrend,
  aggregateSalesTrendByPeriod,
  aggregateSalesByPeriod,
  dashboardMetrics as initialMetrics,
  getCommandes,
  salesTrend as initialSalesTrend,
  type DashboardMetric,
  type PeriodType,
  type SalesPoint,
} from "@/lib/data";
import { supabase } from "@/lib/supabase-client";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { useEffect, useState } from "react";
import { DeliveryManagement } from "@/components/dashboard/DeliveryManagement";

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetric[]>(initialMetrics);
  const [salesTrendData, setSalesTrendData] = useState<SalesPoint[]>(initialSalesTrend);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>("week");
  const [stockAlerts, setStockAlerts] = useState<{ lowStock: number; outOfStock: number; items: any[] }>({ lowStock: 0, outOfStock: 0, items: [] });

  const loadData = async (showLoading = true) => {
    if (showLoading) setLoading(true);

    try {
      const ordersData = await getCommandes();
      
      // Load stock alerts
      const { data: stockData, error: stockError } = await supabase
        .from("menu_items")
        .select("id, nom, stock_quantity")
        .eq("disponible", true)
        .is("deleted_at", null);
      
      if (!stockError && stockData) {
        const lowStock = stockData.filter(item => item.stock_quantity > 0 && item.stock_quantity <= 5).length;
        const outOfStock = stockData.filter(item => item.stock_quantity <= 0).length;
        setStockAlerts({
          lowStock,
          outOfStock,
          items: stockData.filter(item => item.stock_quantity <= 5)
        });
      }

      // Update trend data based on selected period
      setSalesTrendData(aggregateSalesTrendByPeriod(ordersData, selectedPeriod));

      // Calculate metrics for the selected period
      const periodStats = aggregateSalesByPeriod(ordersData, selectedPeriod);

      // Filtrer les commandes du jour
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const todayOrders = ordersData.filter(o => new Date(o.date) >= todayStart);

      // Filtrer les 7 derniers jours pour le revenu hebdomadaire (pour la métrique par défaut)
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - 6);
      weekStart.setHours(0, 0, 0, 0);
      const weekOrders = ordersData.filter(o => new Date(o.date) >= weekStart);

      const weekRevenue = weekOrders.reduce((acc, curr) => acc + curr.total, 0);
      const todayRevenue = todayOrders.reduce((acc, curr) => acc + curr.total, 0);

      const updatedMetrics = [...initialMetrics];
      updatedMetrics[0].value = periodStats.revenue; // Revenue for selected period
      updatedMetrics[0].label = `Revenu (${periodStats.label.toLowerCase()})`; // Update label based on period
      updatedMetrics[1].value = todayOrders.length; // Today's orders
      updatedMetrics[2].value = todayRevenue; // Today's sales
      updatedMetrics[3].value =
        weekOrders.length > 0 ? Math.round(weekRevenue / weekOrders.length) : 0; // Average ticket

      setMetrics(updatedMetrics);
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedPeriod]);

  useEffect(() => {
    loadData();
  }, [selectedPeriod]);

  useAutoRefresh(() => loadData(false));

  return (
    <div className="space-y-6">
      <PageBreadCrumb pageTitle="Dashboard restaurant" />

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
        <p className="text-sm text-brand-500">TaïTaï</p>
        <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-gray-900 dark:text-white/90">
              Pilotage complet du restaurant TaïTaï
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-gray-500 dark:text-gray-400">
              Interface connectee a Supabase.{" "}
              {loading ? "Mise a jour des donnees..." : "Donnees synchronisees."}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/commandes"
              className="rounded-lg bg-brand-500 px-4 py-3 text-sm font-medium text-white transition hover:bg-brand-600"
            >
              Voir les commandes
            </Link>
            <Link
              href="/menu"
              className="rounded-lg border border-gray-300 px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              Gerer le menu
            </Link>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-theme-xs dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white/90">
              Filtrer les revenus par période
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Visualisez vos revenus par jour, semaine, mois, année ou tout le temps
            </p>
          </div>
          <PeriodFilter selectedPeriod={selectedPeriod} onPeriodChange={setSelectedPeriod} />
        </div>
      </section>

      <MetricGrid metrics={metrics} />

      <SalesPerformanceChart data={salesTrendData} />

      {/* Section de gestion des livraisons */}
      <DeliveryManagement />
    </div>
  );
}

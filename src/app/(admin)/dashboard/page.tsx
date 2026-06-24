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
import Link from "next/link";
import { useEffect, useState } from "react";

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetric[]>(initialMetrics);
  const [salesTrendData, setSalesTrendData] = useState<SalesPoint[]>(initialSalesTrend);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>("week");

  const loadData = async (showLoading = true) => {
    if (showLoading) setLoading(true);

    try {
      const ordersData = await getCommandes();

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

  useAutoRefresh(() => loadData(false));

  return (
    <div className="space-y-6">
      <PageBreadCrumb pageTitle="Dashboard restaurant" />

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
    </div>
  );
}

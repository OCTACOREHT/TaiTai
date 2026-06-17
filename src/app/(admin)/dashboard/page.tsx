"use client";

import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { MetricGrid } from "@/components/dashboard/MetricGrid";
import { SalesPerformanceChart } from "@/components/dashboard/SalesPerformanceChart";
import { useAutoRefresh } from "@/hooks/useAutoRefresh";
import {
  aggregateSalesTrend,
  dashboardMetrics as initialMetrics,
  getCommandes,
  salesTrend as initialSalesTrend,
  type DashboardMetric,
  type SalesPoint,
} from "@/lib/data";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetric[]>(initialMetrics);
  const [salesTrendData, setSalesTrendData] = useState<SalesPoint[]>(initialSalesTrend);
  const [loading, setLoading] = useState(true);

  const loadData = async (showLoading = true) => {
    if (showLoading) setLoading(true);

    try {
      const ordersData = await getCommandes();

      setSalesTrendData(aggregateSalesTrend(ordersData));

      // Filtrer les commandes du jour
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const todayOrders = ordersData.filter(o => new Date(o.date) >= todayStart);

      // Filtrer les 7 derniers jours pour le revenu hebdomadaire
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - 6);
      weekStart.setHours(0, 0, 0, 0);
      const weekOrders = ordersData.filter(o => new Date(o.date) >= weekStart);

      const weekRevenue = weekOrders.reduce((acc, curr) => acc + curr.total, 0);
      const todayRevenue = todayOrders.reduce((acc, curr) => acc + curr.total, 0);

      const updatedMetrics = [...initialMetrics];
      updatedMetrics[0].value = weekRevenue;
      updatedMetrics[1].value = todayOrders.length;
      updatedMetrics[2].value = todayRevenue;
      updatedMetrics[3].value =
        weekOrders.length > 0 ? Math.round(weekRevenue / weekOrders.length) : 0;

      setMetrics(updatedMetrics);
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

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

      <MetricGrid metrics={metrics} />

      <SalesPerformanceChart data={salesTrendData} />
    </div>
  );
}

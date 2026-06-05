"use client";

import { SectionCard } from "@/components/common/CmsShared";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { MetricGrid } from "@/components/dashboard/MetricGrid";
import { OrdersTable } from "@/components/dashboard/OrdersTable";
import { SalesPerformanceChart } from "@/components/dashboard/SalesPerformanceChart";
import { useAutoRefresh } from "@/hooks/useAutoRefresh";
import {
  aggregateSalesTrend,
  dashboardMetrics as initialMetrics,
  getCommandes,
  salesTrend as initialSalesTrend,
  type DashboardMetric,
  type RestaurantOrder,
  type SalesPoint,
} from "@/lib/data";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function DashboardPage() {
  const [orders, setOrders] = useState<RestaurantOrder[]>([]);
  const [metrics, setMetrics] = useState<DashboardMetric[]>(initialMetrics);
  const [salesTrendData, setSalesTrendData] = useState<SalesPoint[]>(initialSalesTrend);
  const [loading, setLoading] = useState(true);

  const loadData = async (showLoading = true) => {
    if (showLoading) setLoading(true);

    try {
      const ordersData = await getCommandes();

      setOrders(ordersData);
      setSalesTrendData(aggregateSalesTrend(ordersData));

      const totalRevenue = ordersData.reduce((acc, curr) => acc + curr.total, 0);
      const updatedMetrics = [...initialMetrics];
      updatedMetrics[0].value = totalRevenue;
      updatedMetrics[1].value = ordersData.length;
      updatedMetrics[3].value =
        ordersData.length > 0 ? Math.round(totalRevenue / ordersData.length) : 0;

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
        <p className="text-sm text-brand-500">TaiTai</p>
        <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-gray-900 dark:text-white/90">
              Pilotage complet du restaurant TaiTai
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

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <SalesPerformanceChart data={salesTrendData} />

        <SectionCard
          title="Commandes recentes"
          description="Les derniers tickets arrives du site client."
          actions={
            <Link
              href="/commandes"
              className="text-sm font-medium text-brand-500 transition hover:text-brand-600"
            >
              Ouvrir le module
            </Link>
          }
        >
          <OrdersTable orders={orders.slice(0, 5)} />
        </SectionCard>
      </div>
    </div>
  );
}

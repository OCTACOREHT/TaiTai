"use client";

import { SectionCard } from "@/components/common/CmsShared";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { CustomersTable } from "@/components/dashboard/CustomersTable";
import { InventoryOverview } from "@/components/dashboard/InventoryOverview";
import { MenuGrid } from "@/components/dashboard/MenuGrid";
import { MetricGrid } from "@/components/dashboard/MetricGrid";
import { OrdersTable } from "@/components/dashboard/OrdersTable";
import { QuickActionLinks } from "@/components/dashboard/QuickActionLinks";
import { SalesPerformanceChart } from "@/components/dashboard/SalesPerformanceChart";
import {
  getCommandes,
  getMenuItems,
  aggregateSalesTrend,
  dashboardMetrics as initialMetrics,
  salesTrend as initialSalesTrend,
  suppliers,
  stockItems,
  customers,
} from "@/lib/data";
import Link from "next/link";
import { useEffect, useState } from "react";
import { MenuItem, RestaurantOrder, DashboardMetric, SalesPoint } from "@/lib/data";

export default function DashboardPage() {
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [orders, setOrders] = useState<RestaurantOrder[]>([]);
  const [metrics, setMetrics] = useState<DashboardMetric[]>(initialMetrics);
  const [salesTrendData, setSalesTrendData] = useState<SalesPoint[]>(initialSalesTrend);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [menuData, ordersData] = await Promise.all([
          getMenuItems(),
          getCommandes()
        ]);
        
        setMenu(menuData);
        setOrders(ordersData);
        setSalesTrendData(aggregateSalesTrend(ordersData));

        // Update metrics based on real data
        const totalRevenue = ordersData.reduce((acc, curr) => acc + curr.total, 0);
        const updatedMetrics = [...initialMetrics];
        updatedMetrics[0].value = totalRevenue;
        updatedMetrics[1].value = ordersData.length;
        updatedMetrics[3].value = ordersData.length > 0 ? Math.round(totalRevenue / ordersData.length) : 0;
        
        setMetrics(updatedMetrics);
      } catch (error) {
        console.error("Failed to load dashboard data:", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="space-y-6">
      <PageBreadCrumb pageTitle="Dashboard restaurant" />

      <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-theme-xs dark:border-gray-800 dark:bg-white/[0.03]">
        <p className="text-sm text-brand-500">TaiTai SaaS</p>
        <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-gray-900 dark:text-white/90">
              Jesyon konplè restoran TaiTai
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-gray-500 dark:text-gray-400">
              Entèfas konekte an dirèk ak Supabase. {loading ? "Mizajou done yo..." : "Done yo senkronize."}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/commandes"
              className="rounded-lg bg-brand-500 px-4 py-3 text-sm font-medium text-white transition hover:bg-brand-600"
            >
              Gade komand yo
            </Link>
            <Link
              href="/menu"
              className="rounded-lg border border-gray-300 px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              Jere meni an
            </Link>
          </div>
        </div>
      </section>

      <MetricGrid metrics={metrics} />

      <SectionCard
        title="Aksè rapid"
        description="Navigasyon dirèk pou modil jesyon yo."
      >
        <QuickActionLinks />
      </SectionCard>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <SalesPerformanceChart data={salesTrendData} />

        <SectionCard
          title="Kòmand resan"
          description="Dènye tikè ki soti sou sit kliyan an."
          actions={
            <Link
              href="/commandes"
              className="text-sm font-medium text-brand-500 transition hover:text-brand-600"
            >
              Louvri modil la
            </Link>
          }
        >
          <OrdersTable orders={orders.slice(0, 5)} />
        </SectionCard>
      </div>

      <SectionCard
        title="Jesyon plat yo"
        description="Eta aktyèl meni an ak disponibilite yo."
      >
        <MenuGrid items={menu} />
      </SectionCard>

      <SectionCard
        title="Clients"
        description="Pwofil kliyan (done demonstrasyon)."
      >
        <CustomersTable customers={customers} />
      </SectionCard>
    </div>
  );
}

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
  customers,
  dashboardMetrics,
  menuItems,
  restaurantOrders,
  salesTrend,
  stockItems,
  suppliers,
} from "@/lib/data";
import Link from "next/link";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <PageBreadCrumb pageTitle="Dashboard restaurant" />

      <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-theme-xs dark:border-gray-800 dark:bg-white/[0.03]">
        <p className="text-sm text-brand-500">TaiTai SaaS</p>
        <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-gray-900 dark:text-white/90">
              Pilotage complet du restaurant TaiTai
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-gray-500 dark:text-gray-400">
              Le shell admin reste intact, mais il pilote maintenant les ventes, les commandes,
              le menu, les stocks et la relation client avec des donnees fictives.
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

      <MetricGrid metrics={dashboardMetrics} />

      <SectionCard
        title="Acces rapides"
        description="Un bouton par module, avec sa propre icone et sa page dediee."
      >
        <QuickActionLinks />
      </SectionCard>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <SalesPerformanceChart data={salesTrend} />

        <SectionCard
          title="Commandes recentes"
          description="Tickets prioritaires a traiter pendant le service."
          actions={
            <Link
              href="/commandes"
              className="text-sm font-medium text-brand-500 transition hover:text-brand-600"
            >
              Ouvrir le module
            </Link>
          }
        >
          <OrdersTable orders={restaurantOrders.slice(0, 5)} />
        </SectionCard>
      </div>

      <SectionCard
        title="Gestion des plats"
        description="Cartes menu, categories et disponibilites."
      >
        <MenuGrid items={menuItems} />
      </SectionCard>

      <SectionCard
        title="Fournisseurs & stocks"
        description="Suivi rapide des livraisons et des matieres premieres."
      >
        <InventoryOverview suppliers={suppliers} stockItems={stockItems} />
      </SectionCard>

      <SectionCard
        title="Clients"
        description="Profils VIP et clients les plus actifs."
      >
        <CustomersTable customers={customers} />
      </SectionCard>
    </div>
  );
}

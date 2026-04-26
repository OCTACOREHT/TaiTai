"use client";

import { useEffect, useState } from "react";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { PeakHoursChart } from "@/components/dashboard/PeakHoursChart";
import { SalesPerformanceChart } from "@/components/dashboard/SalesPerformanceChart";
import {
  getCommandes,
  formatCurrency,
  aggregateSalesTrend,
  aggregateDishSales,
  aggregatePeakHours,
  DishSale,
  HourlyVolume,
  SalesPoint,
  customers,
} from "@/lib/data";
import { TrendingUpIcon, TrendingDownIcon, MinusIcon, Loader2 } from "lucide-react";

export default function DonneesPage() {
  const [loading, setLoading] = useState(true);
  const [salesData, setSalesData] = useState<SalesPoint[]>([]);
  const [dishes, setDishes] = useState<DishSale[]>([]);
  const [hours, setHours] = useState<HourlyVolume[]>([]);

  useEffect(() => {
    async function loadRealData() {
      try {
        const orders = await getCommandes();
        setSalesData(aggregateSalesTrend(orders));
        setDishes(aggregateDishSales(orders));
        setHours(aggregatePeakHours(orders));
      } catch (error) {
        console.error("Failed to load analytics data:", error);
      } finally {
        setLoading(false);
      }
    }
    loadRealData();
  }, []);

  // Sort customers by lifetime spend to find top customers
  const topCustomers = [...customers]
    .sort((a, b) => b.lifetimeSpend - a.lifetimeSpend)
    .slice(0, 5);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="animate-spin text-brand-500" size={48} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageBreadCrumb pageTitle="Données" />

      <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-theme-xs dark:border-gray-800 dark:bg-white/[0.03]">
        <p className="text-sm text-brand-500">Analytique & Performance</p>
        <h1 className="mt-4 text-3xl font-semibold text-gray-900 dark:text-white/90">
          Intelligence d'Affaires TaiTai
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-gray-500 dark:text-gray-400">
          Visualisez vos revenus hebdomadaires, identifiez vos meilleurs plats et optimisez vos services selon l'affluence.
        </p>
      </section>

      <div className="grid gap-6 xl:grid-cols-2">
        <SalesPerformanceChart data={salesData} />
        <PeakHoursChart data={hours} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        {/* Top Best Sellers Table */}
        <section className="rounded-2xl border border-gray-200 bg-white shadow-theme-xs dark:border-gray-800 dark:bg-white/[0.03]">
           <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white/90">Palmarès des Plats</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Les plats qui generent le plus de revenus cette semaine.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800">
                  <th className="px-6 py-4 text-xs font-semibold uppercase text-gray-500">Plat</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase text-gray-500 text-center">Quantite</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase text-gray-500 text-right">Revenu</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase text-gray-500 text-center">Tendance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {dishes.map((dish) => (
                  <tr key={dish.name} className="hover:bg-gray-50 dark:hover:bg-white/5 transition">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white/90">{dish.name}</p>
                        <p className="text-xs text-gray-500">{dish.category}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center text-sm font-medium text-gray-700 dark:text-gray-300">
                      {dish.quantity}
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-semibold text-brand-500">
                      {formatCurrency(dish.revenue)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center">
                        {dish.trend === "up" && <TrendingUpIcon className="h-5 w-5 text-success-500" />}
                        {dish.trend === "down" && <TrendingDownIcon className="h-5 w-5 text-error-500" />}
                        {dish.trend === "stable" && <MinusIcon className="h-5 w-5 text-gray-400" />}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Top Customers Table */}
        <section className="rounded-2xl border border-gray-200 bg-white shadow-theme-xs dark:border-gray-800 dark:bg-white/[0.03]">
           <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white/90">Top Clients (VIP)</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Ceux qui commandent le plus.</p>
          </div>
          <div className="p-6">
            <ul className="space-y-6">
              {topCustomers.map((customer) => (
                <li key={customer.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 overflow-hidden rounded-full border border-gray-100">
                      {/* Using a placeholder if image doesn't exist */}
                      <div className="flex h-full w-full items-center justify-center bg-brand-50 text-brand-600 font-bold uppercase">
                        {customer.name.substring(0, 2)}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white/90">{customer.name}</p>
                      <p className="text-xs text-gray-500">{customer.visits} visites</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900 dark:text-white/90">{formatCurrency(customer.lifetimeSpend)}</p>
                    <span className="inline-flex rounded-full bg-success-50 px-2 py-0.5 text-[10px] font-bold text-success-600 uppercase">VIP</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}

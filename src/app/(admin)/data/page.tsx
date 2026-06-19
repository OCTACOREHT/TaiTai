"use client";

import { SectionCard } from "@/components/common/CmsShared";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { useAutoRefresh } from "@/hooks/useAutoRefresh";
import {
  aggregateSalesTrend,
  aggregateDishSales,
  aggregatePeakHours,
  getCommandes,
  getMenuItems,
  formatCurrency,
  formatNumber,
  type RestaurantOrder,
  type DishSale,
  type HourlyVolume,
} from "@/lib/data";
import { exportToExcel } from "@/lib/export-excel";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Download, Filter } from "lucide-react";

// Dynamically import ApexCharts to avoid SSR issues
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface DataMetric {
  label: string;
  value: number;
  formatted: string;
  icon: string;
  trend?: string;
}

interface FilterOptions {
  dateFrom: string;
  dateTo: string;
  status: string;
  sortBy: "date" | "amount" | "customer";
  sortOrder: "asc" | "desc";
  minAmount: number;
  maxAmount: number;
}

export default function DataPage() {
  const [orders, setOrders] = useState<RestaurantOrder[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<RestaurantOrder[]>([]);
  const [metrics, setMetrics] = useState<DataMetric[]>([]);
  const [dishSales, setDishSales] = useState<DishSale[]>([]);
  const [peakHours, setPeakHours] = useState<HourlyVolume[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [filters, setFilters] = useState<FilterOptions>({
    dateFrom: "",
    dateTo: "",
    status: "",
    sortBy: "date",
    sortOrder: "desc",
    minAmount: 0,
    maxAmount: 1000000,
  });

  const loadData = async (showLoading = true) => {
    if (showLoading) setLoading(true);

    try {
      const ordersData = await getCommandes();
      setOrders(ordersData);

      // Calculate metrics
      const totalRevenue = ordersData.reduce((acc, curr) => acc + curr.total, 0);
      const totalOrders = ordersData.length;
      const averageTicket = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

      // Count today's orders
      const today = new Date().toDateString();
      const todayOrders = ordersData.filter(
        (o) => new Date(o.date).toDateString() === today
      ).length;

      setMetrics([
        {
          label: "Revenu Total",
          value: totalRevenue,
          formatted: formatCurrency(totalRevenue),
          icon: "💰",
        },
        {
          label: "Commandes",
          value: totalOrders,
          formatted: formatNumber(totalOrders),
          icon: "📦",
        },
        {
          label: "Commandes Aujourd'hui",
          value: todayOrders,
          formatted: formatNumber(todayOrders),
          icon: "📅",
        },
        {
          label: "Panier Moyen",
          value: averageTicket,
          formatted: formatCurrency(averageTicket),
          icon: "🛒",
        },
      ]);

      // Get dish sales
      const dishes = aggregateDishSales(ordersData);
      setDishSales(dishes);

      // Get peak hours
      const hours = aggregatePeakHours(ordersData);
      setPeakHours(hours);

      // Apply filters
      applyFilters(ordersData);
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const applyFilters = (ordersData: RestaurantOrder[]) => {
    let filtered = [...ordersData];

    // Date filter
    if (filters.dateFrom) {
      const fromDate = new Date(filters.dateFrom);
      filtered = filtered.filter((o) => new Date(o.date) >= fromDate);
    }

    if (filters.dateTo) {
      const toDate = new Date(filters.dateTo);
      toDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter((o) => new Date(o.date) <= toDate);
    }

    // Status filter
    if (filters.status) {
      filtered = filtered.filter((o) => o.status === filters.status);
    }

    // Amount filter
    filtered = filtered.filter(
      (o) => o.total >= filters.minAmount && o.total <= filters.maxAmount
    );

    // Sorting
    filtered.sort((a, b) => {
      let comparison = 0;

      if (filters.sortBy === "date") {
        comparison =
          new Date(a.date).getTime() - new Date(b.date).getTime();
      } else if (filters.sortBy === "amount") {
        comparison = a.total - b.total;
      } else if (filters.sortBy === "customer") {
        comparison = a.customer.localeCompare(b.customer);
      }

      return filters.sortOrder === "asc" ? comparison : -comparison;
    });

    setFilteredOrders(filtered);
  };

  useAutoRefresh(() => loadData(false), { intervalMs: 30000 });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applyFilters(orders);
  }, [filters]);

  // Export functions
  const exportToCSV = () => {
    const headers = ["Commande", "Client", "Montant", "Statut", "Date"];
    const rows = filteredOrders.map((order) => [
      order.numero,
      order.customer,
      order.total,
      order.status,
      new Date(order.date).toLocaleString("fr-FR"),
    ]);

    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `commandes_${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const exportToExcelFile = () => {
    const headers = ["Commande", "Client", "Montant", "Statut", "Date"];
    const rows = filteredOrders.map((order) => [
      order.numero,
      order.customer,
      order.total,
      order.status,
      new Date(order.date).toLocaleString("fr-FR"),
    ]);

    exportToExcel({
      filename: `commandes_${new Date().toISOString().split("T")[0]}.xls`,
      sheetName: "Commandes",
      headers,
      rows,
    });
  };

  const exportDishSalesCSV = () => {
    const headers = ["Plat", "Catégorie", "Quantité", "Revenu", "Tendance"];
    const rows = dishSales.map((dish) => [
      dish.name,
      dish.category,
      dish.quantity,
      dish.revenue,
      dish.trend,
    ]);

    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `plats_vendus_${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Chart data - Sales by day
  const salesTrendData = aggregateSalesTrend(orders);
  const barChartOptions = {
    chart: {
      type: "bar",
      height: 350,
      toolbar: { show: true },
    },
    colors: ["#3b82f6"],
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "55%",
        borderRadius: 4,
      },
    },
    dataLabels: { enabled: false },
    stroke: { show: true, width: 2, colors: ["transparent"] },
    xaxis: {
      categories: salesTrendData.map((s) => s.label),
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      title: { text: "Revenu (HTG)" },
    },
    fill: { opacity: 1 },
    tooltip: {
      y: {
        formatter: (val: number) => formatCurrency(val),
      },
    },
  };

  const barChartSeries = [
    {
      name: "Revenu",
      data: salesTrendData.map((s) => s.total),
    },
  ];

  // Pie chart - Top dishes
  const topDishes = dishSales.slice(0, 5);
  const pieChartOptions = {
    chart: { height: 350 },
    colors: ["#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6"],
    labels: topDishes.map((d) => d.name),
    legend: {
      position: "bottom",
    },
    tooltip: {
      y: {
        formatter: (val: number) => formatNumber(val),
      },
    },
  };

  const pieChartSeries = topDishes.map((d) => d.quantity);

  // Area chart - Peak hours
  const areaChartOptions = {
    chart: {
      type: "area",
      height: 350,
      toolbar: { show: true },
    },
    colors: ["#10b981"],
    dataLabels: { enabled: false },
    stroke: { curve: "smooth", width: 2 },
    xaxis: {
      categories: peakHours.map((h) => h.hour),
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      title: { text: "Nombre de commandes" },
    },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.45,
        opacityTo: 0.05,
        stops: [20, 100, 100, 100],
      },
    },
    tooltip: {
      y: {
        formatter: (val: number) => formatNumber(val),
      },
    },
  };

  const areaChartSeries = [
    {
      name: "Commandes",
      data: peakHours.map((h) => h.orders),
    },
  ];

  // Revenue by dish
  const topDishes10 = dishSales.slice(0, 10);
  const horizontalBarOptions = {
    chart: {
      type: "bar",
      height: 400,
      toolbar: { show: true },
    },
    colors: ["#f59e0b"],
    plotOptions: {
      bar: {
        horizontal: true,
        dataLabels: { position: "top" },
      },
    },
    dataLabels: { enabled: false },
    xaxis: {
      categories: topDishes10.map((d) => d.name),
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    tooltip: {
      y: {
        formatter: (val: number) => formatCurrency(val),
      },
    },
  };

  const horizontalBarSeries = [
    {
      name: "Revenu",
      data: topDishes10.map((d) => d.revenue),
    },
  ];

  return (
    <>
      <PageBreadCrumb pageTitle="Données & Statistiques" />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        {metrics.map((metric, idx) => (
          <div
            key={idx}
            className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{metric.label}</p>
                <p className="mt-2 text-2xl font-bold text-gray-900">
                  {metric.formatted}
                </p>
              </div>
              <span className="text-4xl">{metric.icon}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Filter Panel */}
      <SectionCard
        title={
          <div className="flex items-center gap-2">
            <Filter size={20} />
            <span>Filtres & Exports</span>
          </div>
        }
        description="Filtrez vos données et exportez-les"
        className="mb-6"
      >
        <div className="space-y-4">
          {/* Filter Controls */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Du
              </label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) =>
                  setFilters({ ...filters, dateFrom: e.target.value })
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Au
              </label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) =>
                  setFilters({ ...filters, dateTo: e.target.value })
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Statut
              </label>
              <select
                value={filters.status}
                onChange={(e) =>
                  setFilters({ ...filters, status: e.target.value })
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Tous les statuts</option>
                <option value="En attente">En attente</option>
                <option value="En préparation">En préparation</option>
                <option value="Prêt">Prêt</option>
                <option value="Livré">Livré</option>
                <option value="Annulee">Annulée</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Montant min
              </label>
              <input
                type="number"
                value={filters.minAmount}
                onChange={(e) =>
                  setFilters({ ...filters, minAmount: Number(e.target.value) })
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Montant max
              </label>
              <input
                type="number"
                value={filters.maxAmount}
                onChange={(e) =>
                  setFilters({ ...filters, maxAmount: Number(e.target.value) })
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Trier par
              </label>
              <select
                value={filters.sortBy}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    sortBy: e.target.value as "date" | "amount" | "customer",
                  })
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="date">Date</option>
                <option value="amount">Montant</option>
                <option value="customer">Client</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ordre
              </label>
              <select
                value={filters.sortOrder}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    sortOrder: e.target.value as "asc" | "desc",
                  })
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="desc">Décroissant</option>
                <option value="asc">Croissant</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={() =>
                  setFilters({
                    dateFrom: "",
                    dateTo: "",
                    status: "",
                    sortBy: "date",
                    sortOrder: "desc",
                    minAmount: 0,
                    maxAmount: 1000000,
                  })
                }
                className="w-full rounded-lg bg-gray-300 px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-400 transition-colors"
              >
                Réinitialiser
              </button>
            </div>
          </div>

          {/* Export Buttons */}
          <div className="border-t pt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
            <button
              onClick={exportToCSV}
              className="flex items-center justify-center gap-2 rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600 transition-colors"
            >
              <Download size={16} />
              CSV Commandes
            </button>

            <button
              onClick={exportToExcelFile}
              className="flex items-center justify-center gap-2 rounded-lg bg-green-500 px-4 py-2 text-sm font-medium text-white hover:bg-green-600 transition-colors"
            >
              <Download size={16} />
              Excel Commandes
            </button>

            <button
              onClick={exportDishSalesCSV}
              className="flex items-center justify-center gap-2 rounded-lg bg-purple-500 px-4 py-2 text-sm font-medium text-white hover:bg-purple-600 transition-colors"
            >
              <Download size={16} />
              CSV Plats
            </button>

            <button
              onClick={() => {
                const headers = ["Plat", "Catégorie", "Quantité", "Revenu"];
                const rows = dishSales.map((dish) => [
                  dish.name,
                  dish.category,
                  dish.quantity,
                  dish.revenue,
                ]);

                exportToExcel({
                  filename: `plats_vendus_${new Date()
                    .toISOString()
                    .split("T")[0]}.xls`,
                  sheetName: "Plats Vendus",
                  headers,
                  rows,
                });
              }}
              className="flex items-center justify-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600 transition-colors"
            >
              <Download size={16} />
              Excel Plats
            </button>
          </div>
        </div>
      </SectionCard>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Sales by Day */}
        <SectionCard title="Ventes par Jour" description="Revenu quotidien de la semaine">
          <div className="h-80">
            {typeof window !== "undefined" && (
              <Chart
                options={barChartOptions}
                series={barChartSeries}
                type="bar"
                height={350}
              />
            )}
          </div>
        </SectionCard>

        {/* Top Dishes */}
        <SectionCard title="Top 5 Plats Vendus" description="Par quantité">
          <div className="h-80">
            {typeof window !== "undefined" && (
              <Chart
                options={pieChartOptions}
                series={pieChartSeries}
                type="pie"
                height={350}
              />
            )}
          </div>
        </SectionCard>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 mt-6">
        {/* Peak Hours */}
        <SectionCard title="Heures de Pointe" description="Volume de commandes par heure">
          <div className="h-80">
            {typeof window !== "undefined" && (
              <Chart
                options={areaChartOptions}
                series={areaChartSeries}
                type="area"
                height={350}
              />
            )}
          </div>
        </SectionCard>

        {/* Revenue by Dish */}
        <SectionCard
          title="Top 10 Revenus"
          description="Revenu généré par plat"
        >
          <div className="h-96">
            {typeof window !== "undefined" && (
              <Chart
                options={horizontalBarOptions}
                series={horizontalBarSeries}
                type="bar"
                height={400}
              />
            )}
          </div>
        </SectionCard>
      </div>

      {/* Dish Sales Table */}
      <SectionCard
        title="Détails des Ventes de Plats"
        description="Tous les plats vendus"
        className="mt-6"
      >
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                  Plat
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                  Catégorie
                </th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">
                  Quantité
                </th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">
                  Revenu
                </th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900">
                  Tendance
                </th>
              </tr>
            </thead>
            <tbody>
              {dishSales.map((dish, idx) => (
                <tr
                  key={idx}
                  className="border-b border-gray-200 hover:bg-gray-50"
                >
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                    {dish.name}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {dish.category}
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-gray-900">
                    {formatNumber(dish.quantity)}
                  </td>
                  <td className="px-4 py-3 text-right text-sm font-semibold text-gray-900">
                    {formatCurrency(dish.revenue)}
                  </td>
                  <td className="px-4 py-3 text-center text-sm">
                    <span
                      className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                        dish.trend === "up"
                          ? "bg-green-100 text-green-800"
                          : dish.trend === "down"
                          ? "bg-red-100 text-red-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {dish.trend === "up"
                        ? "📈 Hausse"
                        : dish.trend === "down"
                        ? "📉 Baisse"
                        : "➡️ Stable"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      {/* Recent Orders */}
      <SectionCard
        title="Commandes Récentes"
        description={`${filteredOrders.length} commande(s) selon les filtres appliqués`}
        className="mt-6"
      >
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                  N° Commande
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                  Client
                </th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">
                  Montant
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                  Statut
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                  Date
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order, idx) => (
                  <tr
                    key={idx}
                    className="border-b border-gray-200 hover:bg-gray-50"
                  >
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {order.numero}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {order.customer}
                    </td>
                    <td className="px-4 py-3 text-right text-sm font-semibold text-gray-900">
                      {formatCurrency(order.total)}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span
                        className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                          order.status === "Livré"
                            ? "bg-green-100 text-green-800"
                            : order.status === "Prêt"
                            ? "bg-blue-100 text-blue-800"
                            : order.status === "En préparation"
                            ? "bg-yellow-100 text-yellow-800"
                            : order.status === "Annulee"
                            ? "bg-red-100 text-red-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {new Date(order.date).toLocaleDateString("fr-FR", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                    Aucune commande ne correspond à vos critères de filtrage
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </>
  );
}

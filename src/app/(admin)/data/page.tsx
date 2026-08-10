"use client";

import { SectionCard } from "@/components/common/CmsShared";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { useAutoRefresh } from "@/hooks/useAutoRefresh";
import {
  aggregateSalesTrend,
  aggregateDishSales,
  aggregatePeakHours,
  getCommandes,
  formatCurrency,
  formatNumber,
  type RestaurantOrder,
  type DishSale,
  type HourlyVolume,
} from "@/lib/data";
import { exportToExcel } from "@/lib/export-excel";
import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import {
  Download,
  Filter,
  ChevronDown,
  TrendingUp,
  RotateCcw,
  ChefHat,
  CalendarDays,
  Clock,
  DollarSign,
  Package,
  ShoppingCart,
  Banknote,
} from "lucide-react";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface DataMetric {
  label: string;
  value: number;
  formatted: string;
  icon: React.ReactNode;
  trend?: string;
  color: string;
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
  const [expandFilters, setExpandFilters] = useState(false);
  
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

      // Calculate metrics (hors commandes annulées)
      const activeOrders = ordersData.filter((o) => o.status !== "Annulee");
      const totalRevenue = activeOrders.reduce((acc, curr) => acc + curr.total, 0);
      const totalOrders = activeOrders.length;
      const averageTicket = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

      // Count today's orders (hors annulées)
      const today = new Date().toDateString();
      const todayOrders = activeOrders.filter(
        (o) => new Date(o.date).toDateString() === today
      ).length;

      setMetrics([
        {
          label: "Revenu Total",
          value: totalRevenue,
          formatted: formatCurrency(totalRevenue),
          icon: <DollarSign size={28} />,
          color: "from-blue-500 to-blue-600",
        },
        {
          label: "Total Commandes",
          value: totalOrders,
          formatted: formatNumber(totalOrders),
          icon: <Package size={28} />,
          color: "from-purple-500 to-purple-600",
        },
        {
          label: "Aujourd'hui",
          value: todayOrders,
          formatted: formatNumber(todayOrders),
          icon: <CalendarDays size={28} />,
          color: "from-orange-500 to-orange-600",
        },
        {
          label: "Panier Moyen",
          value: averageTicket,
          formatted: formatCurrency(averageTicket),
          icon: <ShoppingCart size={28} />,
          color: "from-green-500 to-green-600",
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

  const hasActiveFilters =
    filters.dateFrom !== "" ||
    filters.dateTo !== "" ||
    filters.status !== "" ||
    filters.minAmount !== 0 ||
    filters.maxAmount !== 1000000;

  const displayedOrders = hasActiveFilters ? filteredOrders : filteredOrders.slice(0, 10);

  // Chart data - Sales by day
  const salesTrendData = aggregateSalesTrend(orders);
  const barChartOptions = {
    chart: {
      type: "bar" as const,
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
    chart: { type: "pie" as const, height: 350 },
    colors: ["#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6"],
    labels: topDishes.map((d) => d.name),
    legend: { position: "bottom" as const },
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
      type: "area" as const,
      height: 350,
      toolbar: { show: true },
    },
    colors: ["#10b981"],
    dataLabels: { enabled: false },
    stroke: { curve: "smooth" as const, width: 2 },
    xaxis: {
      categories: peakHours.map((h) => h.hour),
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      title: { text: "Nombre de commandes" },
    },
    fill: {
      type: "gradient" as const,
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
      type: "bar" as const,
      height: 400,
      toolbar: { show: true },
    },
    colors: ["#f59e0b"],
    plotOptions: {
      bar: {
        horizontal: true,
        dataLabels: { position: "top" as const },
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

      {/* Header Section */}
      <div className="mb-8 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 p-8 text-white shadow-xl">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-4xl font-bold mb-2">Dashboard Analytique</h1>
            <p className="text-slate-300">
              Aperçu complet de vos données et performances
            </p>
          </div>
          <button
            onClick={() => loadData()}
            className="flex items-center gap-2 rounded-lg bg-white/10 hover:bg-white/20 px-4 py-2 transition-colors"
          >
            <RotateCcw size={16} />
            Actualiser
          </button>
        </div>
      </div>

      {/* KPI Cards with Gradients */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {metrics.map((metric, idx) => (
          <div
            key={idx}
            className={`bg-gradient-to-br ${metric.color} rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow`}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-white/80 uppercase tracking-wide">
                  {metric.label}
                </p>
              </div>
              <span className="p-2 rounded-xl bg-white/20">{metric.icon}</span>
            </div>
            <p className="text-3xl font-bold">{metric.formatted}</p>
            <p className="text-xs text-white/60 mt-2">En temps réel</p>
          </div>
        ))}
      </div>

      {/* Filter Section - Collapsible */}
      <div className="mb-8">
        <button
          onClick={() => setExpandFilters(!expandFilters)}
          className="w-full flex items-center justify-between rounded-xl bg-white border border-gray-200 shadow-sm p-4 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center gap-3">
            <Filter size={20} className="text-blue-600" />
            <span className="font-semibold text-gray-900">Filtres & Exports</span>
            {Object.values(filters).some((v) => v !== "" && v !== 0 && v !== 1000000) && (
              <span className="ml-2 inline-block px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">
                Filtres actifs
              </span>
            )}
          </div>
          <ChevronDown
            size={20}
            className={`text-gray-600 transition-transform ${
              expandFilters ? "rotate-180" : ""
            }`}
          />
        </button>

        {expandFilters && (
          <div className="mt-3 rounded-xl bg-white border border-gray-200 shadow-sm p-6 animate-in fade-in slide-in-from-top-2 duration-200">
            {/* Filter Grid */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Depuis le
                </label>
                <input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) =>
                    setFilters({ ...filters, dateFrom: e.target.value })
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Jusqu'au
                </label>
                <input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) =>
                    setFilters({ ...filters, dateTo: e.target.value })
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Statut
                </label>
                <select
                  value={filters.status}
                  onChange={(e) =>
                    setFilters({ ...filters, status: e.target.value })
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Montant min (HTG)
                </label>
                <input
                  type="number"
                  value={filters.minAmount}
                  onChange={(e) =>
                    setFilters({ ...filters, minAmount: Number(e.target.value) })
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Montant max (HTG)
                </label>
                <input
                  type="number"
                  value={filters.maxAmount}
                  onChange={(e) =>
                    setFilters({ ...filters, maxAmount: Number(e.target.value) })
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="1000000"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
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
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="date">Date</option>
                  <option value="amount">Montant</option>
                  <option value="customer">Client</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
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
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="desc">↓ Décroissant</option>
                  <option value="asc">↑ Croissant</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 invisible">
                  Action
                </label>
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
                  className="w-full rounded-lg border-2 border-gray-300 hover:border-gray-400 px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors"
                >
                  Réinitialiser
                </button>
              </div>
            </div>

            {/* Export Buttons */}
            <div className="border-t pt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
              <button
                onClick={exportToCSV}
                className="flex items-center justify-center gap-2 rounded-lg bg-blue-50 border border-blue-200 hover:bg-blue-100 px-4 py-2.5 text-sm font-semibold text-blue-700 transition-colors"
              >
                <Download size={16} />
                CSV Commandes
              </button>

              <button
                onClick={exportToExcelFile}
                className="flex items-center justify-center gap-2 rounded-lg bg-green-50 border border-green-200 hover:bg-green-100 px-4 py-2.5 text-sm font-semibold text-green-700 transition-colors"
              >
                <Download size={16} />
                Excel Commandes
              </button>

              <button
                onClick={exportDishSalesCSV}
                className="flex items-center justify-center gap-2 rounded-lg bg-purple-50 border border-purple-200 hover:bg-purple-100 px-4 py-2.5 text-sm font-semibold text-purple-700 transition-colors"
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
                className="flex items-center justify-center gap-2 rounded-lg bg-orange-50 border border-orange-200 hover:bg-orange-100 px-4 py-2.5 text-sm font-semibold text-orange-700 transition-colors"
              >
                <Download size={16} />
                Excel Plats
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 mb-8">
        {/* Sales by Day */}
        <div className="rounded-xl bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
          <div className="border-b border-gray-200 px-6 py-4">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <TrendingUp size={20} className="text-blue-600" />
              Ventes par Jour
            </h3>
            <p className="text-sm text-gray-500 mt-1">Revenu quotidien de la semaine</p>
          </div>
          <div className="p-6">
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
          </div>
        </div>

        {/* Top Dishes */}
        <div className="rounded-xl bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
          <div className="border-b border-gray-200 px-6 py-4">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <ChefHat size={20} className="text-purple-600" />
              Top 5 Plats Vendus
            </h3>
            <p className="text-sm text-gray-500 mt-1">Classement par quantité</p>
          </div>
          <div className="p-6">
            <div className="h-80">
              {loading ? (
                <div className="flex h-full items-center justify-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-purple-500 border-t-transparent" />
                </div>
              ) : topDishes.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center gap-2 text-gray-400">
                  <ChefHat size={36} className="text-gray-300" />
                  <p className="text-sm font-medium">Aucun plat vendu pour l'instant</p>
                </div>
              ) : typeof window !== "undefined" ? (
                <Chart
                  options={pieChartOptions}
                  series={pieChartSeries}
                  type="pie"
                  height={350}
                />
              ) : null}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 mb-8">
        {/* Peak Hours */}
        <div className="rounded-xl bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
          <div className="border-b border-gray-200 px-6 py-4">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Clock size={20} className="text-orange-600" />
              Heures de Pointe
            </h3>
            <p className="text-sm text-gray-500 mt-1">Volume de commandes par heure</p>
          </div>
          <div className="p-6">
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
          </div>
        </div>

        {/* Revenue by Dish */}
        <div className="rounded-xl bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
          <div className="border-b border-gray-200 px-6 py-4">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Banknote size={20} className="text-yellow-600" />
              Top 10 Revenus
            </h3>
            <p className="text-sm text-gray-500 mt-1">Revenu généré par plat</p>
          </div>
          <div className="p-6">
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
          </div>
        </div>
      </div>

      {/* Dish Sales Table */}
      <div className="rounded-xl bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden mb-8">
        <div className="border-b border-gray-200 px-6 py-4">
          <h3 className="text-lg font-bold text-gray-900">Détails des Ventes de Plats</h3>
          <p className="text-sm text-gray-500 mt-1">Tous les plats vendus - {dishSales.length} plat(s)</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Plat</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Catégorie</th>
                <th className="px-6 py-4 text-right text-sm font-bold text-gray-900">Quantité</th>
                <th className="px-6 py-4 text-right text-sm font-bold text-gray-900">Revenu</th>
                <th className="px-6 py-4 text-center text-sm font-bold text-gray-900">Tendance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {dishSales.map((dish, idx) => (
                <tr
                  key={idx}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4 text-sm font-semibold text-gray-900">{dish.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{dish.category}</td>
                  <td className="px-6 py-4 text-right text-sm font-medium text-gray-900">
                    <span className="inline-block bg-blue-50 text-blue-700 px-3 py-1 rounded-full">
                      {formatNumber(dish.quantity)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-bold text-gray-900">
                    {formatCurrency(dish.revenue)}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {dish.trend === "up" ? (
                      <span className="inline-flex flex-col items-center gap-1">
                        <span className="inline-flex items-end gap-[3px] h-6">
                          <span className="w-2 rounded-t-sm bg-green-300" style={{ height: "6px" }} />
                          <span className="w-2 rounded-t-sm bg-green-400" style={{ height: "10px" }} />
                          <span className="w-2 rounded-t-sm bg-green-500" style={{ height: "14px" }} />
                          <span className="w-2 rounded-t-sm bg-green-600" style={{ height: "20px" }} />
                        </span>
                        <span className="text-[10px] font-bold text-green-600">▲ Hausse</span>
                      </span>
                    ) : dish.trend === "down" ? (
                      <span className="inline-flex flex-col items-center gap-1">
                        <span className="inline-flex items-end gap-[3px] h-6">
                          <span className="w-2 rounded-t-sm bg-red-600" style={{ height: "20px" }} />
                          <span className="w-2 rounded-t-sm bg-red-500" style={{ height: "14px" }} />
                          <span className="w-2 rounded-t-sm bg-red-400" style={{ height: "10px" }} />
                          <span className="w-2 rounded-t-sm bg-red-300" style={{ height: "6px" }} />
                        </span>
                        <span className="text-[10px] font-bold text-red-600">▼ Baisse</span>
                      </span>
                    ) : (
                      <span className="inline-flex flex-col items-center gap-1">
                        <span className="inline-flex items-end gap-[3px] h-6">
                          <span className="w-2 rounded-t-sm bg-gray-300" style={{ height: "10px" }} />
                          <span className="w-2 rounded-t-sm bg-gray-400" style={{ height: "14px" }} />
                          <span className="w-2 rounded-t-sm bg-gray-300" style={{ height: "10px" }} />
                          <span className="w-2 rounded-t-sm bg-gray-400" style={{ height: "14px" }} />
                        </span>
                        <span className="text-[10px] font-bold text-gray-500">— Stable</span>
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="rounded-xl bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Commandes Récentes</h3>
            <p className="text-sm text-gray-500 mt-1">
              {hasActiveFilters
                ? `${filteredOrders.length} commande(s) selon les filtres appliqués`
                : `10 dernières commandes sur ${filteredOrders.length} au total`}
            </p>
          </div>
          {hasActiveFilters && (
            <span className="inline-block px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">
              Filtres actifs
            </span>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">N° Commande</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Client</th>
                <th className="px-6 py-4 text-right text-sm font-bold text-gray-900">Montant</th>
                <th className="px-6 py-4 text-center text-sm font-bold text-gray-900">Statut</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {displayedOrders.length > 0 ? (
                displayedOrders.map((order, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-bold text-gray-900">{order.numero}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{order.customer}</td>
                    <td className="px-6 py-4 text-right text-sm font-bold text-gray-900">
                      {formatCurrency(order.total)}
                    </td>
                    <td className="px-6 py-4 text-center text-sm">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                          order.status === "Livré"
                            ? "bg-green-100 text-green-700"
                            : order.status === "Prêt"
                            ? "bg-blue-100 text-blue-700"
                            : order.status === "En préparation"
                            ? "bg-yellow-100 text-yellow-700"
                            : order.status === "Annulee"
                            ? "bg-red-100 text-red-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
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
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    <p className="text-lg font-medium">Aucune commande</p>
                    <p className="text-sm">Aucune commande ne correspond à vos critères de filtrage</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

"use client";

import { SalesPoint, formatCurrency } from "@/lib/data";
import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

export function SalesPerformanceChart({ data }: { data: SalesPoint[] }) {
  const options: ApexOptions = {
    chart: {
      type: "area",
      height: 320,
      toolbar: {
        show: false,
      },
      fontFamily: "Outfit, sans-serif",
      sparkline: {
        enabled: false,
      },
    },
    colors: ["#f4a640"],
    stroke: {
      curve: "smooth",
      width: 3,
    },
    fill: {
      type: "gradient",
      gradient: {
        opacityFrom: 0.24,
        opacityTo: 0.04,
      },
    },
    markers: {
      size: 5,
      strokeColors: "#ffffff",
      strokeWidth: 2,
      hover: {
        size: 7,
      },
    },
    dataLabels: {
      enabled: false,
    },
    grid: {
      borderColor: "#e4e7ec",
      strokeDashArray: 5,
      xaxis: {
        lines: {
          show: false,
        },
      },
    },
    xaxis: {
      categories: data.map((point) => point.label),
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    yaxis: {
      labels: {
        formatter: (value) => `${Math.round(value / 1000)}k`,
      },
    },
    tooltip: {
      y: {
        formatter: (value) => formatCurrency(value),
      },
    },
    legend: {
      show: false,
    },
  };

  const series = [
    {
      name: "Lavant",
      data: data.map((point) => point.total),
    },
  ];

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-5 pt-5 shadow-theme-xs dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-brand-500">Pwogresyon lavant</p>
          <h3 className="mt-1 text-lg font-semibold text-gray-900 dark:text-white/90">
            Revni sou 7 jou
          </h3>
        </div>
        <div className="rounded-2xl border border-gray-200 px-4 py-3 text-right dark:border-gray-800">
          <p className="text-xs uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400">
            Total semèn
          </p>
          <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white/90">
            {formatCurrency(data.reduce((sum, point) => sum + point.total, 0))}
          </p>
        </div>
      </div>

      <div className="mt-4 max-w-full overflow-x-auto custom-scrollbar">
        <div className="min-w-[640px]">
          <ReactApexChart options={options} series={series} type="area" height={320} />
        </div>
      </div>
    </div>
  );
}

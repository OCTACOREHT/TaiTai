"use client";

import { HourlyVolume } from "@/lib/data";
import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

export function PeakHoursChart({ data }: { data: HourlyVolume[] }) {
  const options: ApexOptions = {
    chart: {
      type: "bar",
      height: 320,
      toolbar: {
        show: false,
      },
      fontFamily: "Outfit, sans-serif",
    },
    colors: ["#4f46e5"],
    plotOptions: {
      bar: {
        borderRadius: 4,
        columnWidth: "60%",
      },
    },
    dataLabels: {
      enabled: false,
    },
    grid: {
      borderColor: "#e4e7ec",
      strokeDashArray: 5,
    },
    xaxis: {
      categories: data.map((point) => point.hour),
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    yaxis: {
      title: {
        text: "Nombre de commandes",
        style: {
           color: "#64748b",
           fontSize: "12px",
           fontWeight: 500,
        }
      }
    },
    tooltip: {
      y: {
        formatter: (value) => `${value} commandes`,
      },
    },
  };

  const series = [
    {
      name: "Commandes",
      data: data.map((point) => point.orders),
    },
  ];

  return (
    <div className="rounded-2xl border border-gray-200 bg-white px-5 pt-5 shadow-theme-xs dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
      <div className="mb-6">
        <p className="text-sm text-brand-500">Affluence</p>
        <h3 className="mt-1 text-lg font-semibold text-gray-900 dark:text-white/90">
          Heures de pointe (Tickets/Heure)
        </h3>
      </div>

      <div className="mt-4 max-w-full overflow-x-auto custom-scrollbar">
        <div className="min-w-[640px]">
          <ReactApexChart options={options} series={series} type="bar" height={320} />
        </div>
      </div>
    </div>
  );
}

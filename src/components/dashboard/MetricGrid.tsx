import { BoxIconLine, DollarLineIcon, GroupIcon, PieChartIcon } from "@/icons";
import { DashboardMetric, formatMetricValue } from "@/lib/data";

const iconMap = {
  revenue: DollarLineIcon,
  orders: BoxIconLine,
  customers: GroupIcon,
  averageTicket: PieChartIcon,
} as const;

const accentMap: Record<DashboardMetric["id"], string> = {
  revenue: "from-brand-500/15 to-brand-500/5 text-brand-600 dark:text-brand-300",
  orders: "from-warning-500/18 to-warning-500/5 text-warning-700 dark:text-warning-300",
  customers: "from-orange-500/15 to-orange-500/5 text-orange-700 dark:text-orange-300",
  averageTicket: "from-brand-400/15 to-brand-400/5 text-brand-700 dark:text-brand-300",
};

const cn = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(" ");

export function MetricGrid({ metrics }: { metrics: DashboardMetric[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {metrics.map((metric) => {
        const Icon = iconMap[metric.id];

        return (
          <div
            key={metric.id}
            className="rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-xs dark:border-gray-800 dark:bg-white/[0.03]"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{metric.label}</p>
                <p className="mt-3 text-2xl font-semibold text-gray-900 dark:text-white/90">
                  {formatMetricValue(metric.value, metric.kind)}
                </p>
              </div>
              <div
                className={cn(
                  "flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br",
                  accentMap[metric.id],
                )}
              >
                <Icon className="size-6" />
              </div>
            </div>
            <p className="mt-4 text-xs font-medium text-gray-500 dark:text-gray-400">{metric.note}</p>
          </div>
        );
      })}
    </div>
  );
}

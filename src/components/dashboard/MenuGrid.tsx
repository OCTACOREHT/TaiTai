import { MenuItem, formatCurrency } from "@/lib/data";
import { StatusPill } from "./StatusPill";
import Image from "next/image";

const gradients = [
  "from-brand-500/15 via-brand-500/8 to-transparent",
  "from-warning-500/18 via-warning-500/8 to-transparent",
  "from-orange-500/15 via-orange-500/8 to-transparent",
  "from-brand-400/15 via-brand-400/8 to-transparent",
];

export function MenuGrid({ items }: { items: MenuItem[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {items.map((item, index) => {
        const stockStatus = item.stock <= Math.ceil(item.maxStock * 0.35) ? "A recommander" : "Stable";
        const stockWidth = `${Math.max((item.stock / item.maxStock) * 100, 10)}%`;

        return (
          <article
            key={item.id}
            className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-theme-xs dark:border-gray-800 dark:bg-white/[0.03]"
          >
            <div className={`bg-gradient-to-br ${gradients[index % gradients.length]} p-5`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-gray-500 dark:text-gray-400">{item.category}</p>
                    {item.featured && (
                      <span className="inline-flex rounded-full border border-brand-200 bg-brand-50 px-2 py-0.5 text-[10px] font-semibold text-brand-700 dark:border-brand-900/40 dark:bg-brand-900/10 dark:text-brand-300 uppercase tracking-wider">
                        Best seller
                      </span>
                    )}
                  </div>
                  <h3 className="mt-2 text-lg font-semibold text-gray-900 dark:text-white/90">
                    {item.name}
                  </h3>
                  <p className="mt-2 text-sm leading-5 text-gray-600 dark:text-gray-300 line-clamp-2">
                    {item.description}
                  </p>
                </div>
                
                {item.image && (
                  <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-full border-2 border-white shadow-lg dark:border-gray-800">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4 p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400">
                    Prix
                  </p>
                  <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white/90">
                    {formatCurrency(item.price)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400">
                    Prep
                  </p>
                  <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white/90">
                    {item.prepTime}
                  </p>
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Stock restant</span>
                  <span className="font-medium text-gray-900 dark:text-white/90">
                    {item.stock}/{item.maxStock}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-gray-100 dark:bg-gray-800">
                  <div
                    className="h-full rounded-full bg-brand-500"
                    style={{ width: stockWidth }}
                  />
                </div>
                <div className="mt-3">
                  <StatusPill value={stockStatus} />
                </div>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}

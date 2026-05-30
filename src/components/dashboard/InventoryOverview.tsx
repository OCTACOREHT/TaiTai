import { StockItem, Supplier } from "@/lib/data";
import { StatusPill } from "./StatusPill";

const formatNumber = (value: number) => new Intl.NumberFormat("fr-FR").format(value);

export function InventoryOverview({
  suppliers,
  stockItems,
}: {
  suppliers: Supplier[];
  stockItems: StockItem[];
}) {
  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <section className="rounded-2xl border border-gray-200 bg-white shadow-theme-xs dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="border-b border-gray-100 px-5 py-5 dark:border-gray-800 sm:px-6">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white/90">
            Fournisseurs principaux
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Livraisons, contacts et fiabilite.
          </p>
        </div>
        <div className="space-y-4 p-5 sm:p-6">
          {suppliers.map((supplier) => (
            <div
              key={supplier.id}
              className="rounded-2xl border border-gray-200 px-4 py-4 dark:border-gray-800"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white/90">{supplier.name}</p>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {supplier.specialty}
                  </p>
                </div>
                <span className="rounded-full bg-success-50 px-2.5 py-1 text-xs font-semibold text-success-700 dark:bg-success-900/10 dark:text-success-300">
                  {supplier.reliability}%
                </span>
              </div>
              <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400">
                <span>{supplier.contact}</span>
                <span>{supplier.nextDelivery}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white shadow-theme-xs dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="border-b border-gray-100 px-5 py-5 dark:border-gray-800 sm:px-6">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white/90">
            Matieres premieres
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Articles a surveiller avant le prochain service.
          </p>
        </div>
        <div className="space-y-3 p-5 sm:p-6">
          {stockItems.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border border-gray-200 px-4 py-4 dark:border-gray-800"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white/90">{item.name}</p>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {item.supplier}
                  </p>
                </div>
                <StatusPill value={item.status} />
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl bg-gray-50 px-3 py-3 dark:bg-gray-900">
                  <p className="text-xs uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400">
                    Quantite
                  </p>
                  <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-white/90">
                    {formatNumber(item.quantity)} {item.unit}
                  </p>
                </div>
                <div className="rounded-xl bg-gray-50 px-3 py-3 dark:bg-gray-900">
                  <p className="text-xs uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400">
                    Seuil mini
                  </p>
                  <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-white/90">
                    {formatNumber(item.reorderLevel)} {item.unit}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

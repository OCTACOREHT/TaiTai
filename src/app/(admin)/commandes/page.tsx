import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { OrdersManagement } from "@/components/dashboard/OrdersManagement";
import { restaurantOrders } from "@/lib/data";

export default function OrdersPage() {
  return (
    <div className="space-y-6">
      <PageBreadCrumb pageTitle="Komand" />

      <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-theme-xs dark:border-gray-800 dark:bg-white/[0.03]">
        <p className="text-sm text-brand-500">Sèvis an dirèk</p>
        <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-gray-900 dark:text-white/90">
              Òganizasyon tikè TaiTai
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-gray-500 dark:text-gray-400">
              Kenbe kizin nan, sal la ak livrezon an senkronize depi yon sèl tab.
            </p>
          </div>
        </div>
      </section>

      <OrdersManagement initialOrders={restaurantOrders} />
    </div>
  );
}

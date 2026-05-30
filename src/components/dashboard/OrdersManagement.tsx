"use client";

import { SectionCard } from "@/components/common/CmsShared";
import {
  formatCurrency,
  getCommandes,
  type OrderStatus,
  type RestaurantOrder,
} from "@/lib/data";
import { useEffect, useState, useRef } from "react";
import { OrderReceiptPreview } from "./OrderReceiptPreview";
import { OrdersTable } from "./OrdersTable";
import { supabase } from "@/lib/supabase-client";

const cn = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(" ");

const filters: Array<"Tous" | OrderStatus> = ["Tous", "En attente", "En préparation", "Prêt", "Livré"];

export function OrdersManagement({ initialOrders }: { initialOrders: RestaurantOrder[] }) {
  const [orders, setOrders] = useState<RestaurantOrder[]>(initialOrders);
  const [statusFilter, setStatusFilter] = useState<"Tous" | OrderStatus>("Tous");
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const receiptRef = useRef<HTMLDivElement>(null);

  // Initial fetch
  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await getCommandes();
        setOrders(data);
        if (data.length > 0 && !selectedOrderId) setSelectedOrderId(data[0].id);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('cms-orders-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'commandes' },
        async () => {
          const data = await getCommandes();
          setOrders(data);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const filteredOrders =
    statusFilter === "Tous"
      ? orders
      : orders.filter((order) => order.status === statusFilter);

  const selectedOrder =
    orders.find((order) => order.id === selectedOrderId) ?? null;

  const counts = {
    pending: orders.filter((order) => order.status === "En attente").length,
    cooking: orders.filter((order) => order.status === "En préparation").length,
    ready: orders.filter((order) => order.status === "Prêt").length,
    delivered: orders.filter((order) => order.status === "Livré").length,
  };

  const handleStatusChange = async (orderId: string, nextStatus: OrderStatus) => {
    // Optimistic UI
    setOrders((current) => current.map(o => o.id === orderId ? { ...o, status: nextStatus } : o));

    // DB Update
    const { error } = await supabase
      .from("commandes")
      .update({ statut: nextStatus })
      .eq("id", orderId);

    if (error) {
      alert("Erreur lors de la mise à jour : " + error.message);
      const data = await getCommandes();
      setOrders(data);
    }
  };

  const handleSelectOrder = (order: RestaurantOrder) => {
    setSelectedOrderId(order.id);
    // On mobile, scroll to the receipt
    if (window.innerWidth < 1280) {
      receiptRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-xs dark:border-gray-800 dark:bg-white/[0.03]">
          <p className="text-sm text-gray-500 dark:text-gray-400">En attente</p>
          <p className="mt-2 text-2xl font-semibold text-warning-600 dark:text-warning-400">
            {counts.pending}
          </p>
        </div>
        <div className="rounded-2xl border border-orange-100 bg-orange-50/50 p-5 shadow-theme-xs dark:border-orange-900/20 dark:bg-orange-900/10">
          <p className="text-sm text-orange-600 dark:text-orange-400">En préparation</p>
          <p className="mt-2 text-2xl font-semibold text-orange-700 dark:text-orange-300">
            {counts.cooking}
          </p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-xs dark:border-gray-800 dark:bg-white/[0.03]">
          <p className="text-sm text-gray-500 dark:text-gray-400">Prêts pour service</p>
          <p className="mt-2 text-2xl font-semibold text-brand-600 dark:text-brand-400">
            {counts.ready}
          </p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-xs dark:border-gray-800 dark:bg-white/[0.03]">
          <p className="text-sm text-gray-500 dark:text-gray-400">Déjà livrés</p>
          <p className="mt-2 text-2xl font-semibold text-success-600 dark:text-success-400">
            {counts.delivered}
          </p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.45fr_0.85fr]">
        <section className="rounded-2xl border border-gray-200 bg-white shadow-theme-xs dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex flex-col gap-4 border-b border-gray-100 px-5 py-5 dark:border-gray-800 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-white/90">
                Suivi des commandes en direct
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 font-medium">
                Les nouvelles commandes apparaissent automatiquement ici.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {filters.map((filter) => (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setStatusFilter(filter)}
                  className={cn(
                    "rounded-full border px-4 py-2 text-xs font-bold transition-all",
                    statusFilter === filter
                      ? "border-[#101828] bg-[#101828] text-white shadow-lg"
                      : "border-gray-200 text-gray-600 hover:bg-gray-50",
                  )}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          <div className="p-5 sm:p-6">
            {loading && orders.length === 0 ? (
               <div className="py-20 text-center text-gray-500 font-medium">Chargement des commandes...</div>
            ) : (
              <OrdersTable
                orders={filteredOrders}
                selectedOrderId={selectedOrderId}
                onReceiptClick={handleSelectOrder}
                onPrintClick={(order) => {
                  setSelectedOrderId(order.id);
                  setTimeout(() => window.print(), 100);
                }}
                onStatusChange={handleStatusChange}
              />
            )}
          </div>
        </section>

        <div ref={receiptRef} className="xl:sticky xl:top-24 h-fit">
           <OrderReceiptPreview order={selectedOrder} />
        </div>
      </div>
    </div>
  );
}

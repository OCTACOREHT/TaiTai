"use client";

import {
  getCommandes,
  type OrderStatus,
  type RestaurantOrder,
} from "@/lib/data";
import { useAutoRefresh } from "@/hooks/useAutoRefresh";
import { useEffect, useState } from "react";
import { OrdersTable } from "./OrdersTable";
import { Toast } from "@/components/ui/toast/Toast";
import { supabase } from "@/lib/supabase-client";

const cn = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(" ");

const filters: Array<"Tous" | OrderStatus> = [
  "Tous",
  "En attente",
  "En préparation",
  "Prêt",
  "Livré",
  "Annulee",
];

export function OrdersManagement({ initialOrders }: { initialOrders: RestaurantOrder[] }) {
  const [orders, setOrders] = useState<RestaurantOrder[]>(initialOrders);
  const [statusFilter, setStatusFilter] = useState<"Tous" | OrderStatus>("Tous");
  const [loading, setLoading] = useState(false);
  const [sendingReceiptOrderId, setSendingReceiptOrderId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [sentReceiptIds, setSentReceiptIds] = useState<string[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("sentReceipts");
      if (saved) setSentReceiptIds(JSON.parse(saved));
    } catch (e) {}
  }, []);

  const markReceiptAsSent = (orderId: string) => {
    setSentReceiptIds((prev) => {
      if (prev.includes(orderId)) return prev;
      const next = [...prev, orderId];
      try {
        localStorage.setItem("sentReceipts", JSON.stringify(next));
      } catch (e) {}
      return next;
    });
  };

  const loadOrders = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const data = await getCommandes();
      setOrders(data);
    } catch (e) {
      console.error(e);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  useAutoRefresh(() => loadOrders(false));

  useEffect(() => {
    const channel = supabase
      .channel("cms-orders-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "commandes" },
        async () => {
          const data = await getCommandes();
          setOrders(data);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const filteredOrders = (
    statusFilter === "Tous"
      ? orders
      : orders.filter((order) => order.status === statusFilter)
  ).sort((a, b) => {
    const aSent = sentReceiptIds.includes(a.id);
    const bSent = sentReceiptIds.includes(b.id);
    if (aSent && !bSent) return 1;
    if (!aSent && bSent) return -1;
    return 0;
  });

  const counts = {
    pending: orders.filter((order) => order.status === "En attente").length,
    cooking: orders.filter((order) => order.status === "En préparation").length,
    ready: orders.filter((order) => order.status === "Prêt").length,
    delivered: orders.filter((order) => order.status === "Livré").length,
    canceled: orders.filter((order) => order.status === "Annulee").length,
  };

  const handleStatusChange = async (orderId: string, nextStatus: OrderStatus) => {
    setOrders((current) =>
      current.map((order) => (order.id === orderId ? { ...order, status: nextStatus } : order)),
    );

    const response = await fetch("/api/admin/orders/status", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, status: nextStatus }),
    });

    const payload = await response.json();

    if (!response.ok) {
      alert("Erreur lors de la mise a jour : " + (payload.error || "Statut non modifie."));
      const data = await getCommandes();
      setOrders(data);
      return;
    }

    if (payload.emailError) {
      alert("Statut modifie, mais l'email n'a pas pu etre envoye : " + payload.emailError);
    }
  };

  const handleSendReceipt = async (order: RestaurantOrder) => {
    setSendingReceiptOrderId(order.id);

    try {
      const response = await fetch("/api/orders/confirmation-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: order.id }),
      });

      const payload = await response.json();

      if (!response.ok) {
        alert("Impossible d'envoyer le reçu : " + (payload.error || "Erreur inconnue."));
        return;
      }

      setToast(`Reçu envoyé à ${payload.recipientEmail || order.clientEmail || "client"}`);
      markReceiptAsSent(order.id);
    } catch (error) {
      alert("Impossible d'envoyer le reçu : " + (error as Error).message);
    } finally {
      setSendingReceiptOrderId(null);
    }
  };

  return (
    <div className="space-y-6">
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
      <div className="grid gap-4 md:grid-cols-5">
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
        <div className="rounded-2xl border border-red-100 bg-red-50 p-5 shadow-theme-xs dark:border-red-900/20 dark:bg-red-900/10">
          <p className="text-sm text-red-600 dark:text-red-400">Annulees</p>
          <p className="mt-2 text-2xl font-semibold text-red-700 dark:text-red-300">
            {counts.canceled}
          </p>
        </div>
      </div>

      <section className="rounded-2xl border border-gray-200 bg-white shadow-theme-xs dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="flex flex-col gap-4 border-b border-gray-100 px-5 py-5 dark:border-gray-800 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white/90">
              Suivi des commandes en direct
            </h3>
            <p className="mt-1 text-sm font-medium text-gray-500 dark:text-gray-400">
              Les nouvelles commandes apparaissent automatiquement ici. Le recu special part
              vers le client par email.
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
            <div className="py-20 text-center font-medium text-gray-500">
              Chargement des commandes...
            </div>
          ) : (
            <OrdersTable
              orders={filteredOrders}
              onSendReceipt={handleSendReceipt}
              sendingReceiptOrderId={sendingReceiptOrderId}
              onStatusChange={handleStatusChange}
              sentReceiptIds={sentReceiptIds}
            />
          )}
        </div>
      </section>
    </div>
  );
}

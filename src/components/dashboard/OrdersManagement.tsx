"use client";

import { SectionCard, SelectInput, TextInput } from "@/components/common/CmsShared";
import {
  formatCurrency,
  menuItems,
  orderChannelOptions,
  orderStatusOptions,
  paymentMethodOptions,
  type OrderStatus,
  type RestaurantOrder,
} from "@/lib/data";
import { useState, type FormEvent } from "react";
import { OrderReceiptPreview } from "./OrderReceiptPreview";
import { OrdersTable } from "./OrdersTable";

const cn = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(" ");

const filters: Array<"Tous" | OrderStatus> = ["Tous", "En attente", "Pret", "Livre"];

import { Modal } from "@/components/ui/modal";
import { PlusIcon } from "lucide-react";

export function OrdersManagement({ initialOrders }: { initialOrders: RestaurantOrder[] }) {
  const [orders, setOrders] = useState(initialOrders);
  const [statusFilter, setStatusFilter] = useState<"Tous" | OrderStatus>("Tous");
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(initialOrders[0]?.id ?? null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [draft, setDraft] = useState({
    customer: "",
    table: "",
    dishId: menuItems[0]?.id ?? "",
    quantity: "1",
    channel: orderChannelOptions[0],
    paymentMethod: paymentMethodOptions[0],
    status: orderStatusOptions[0],
  });

  const filteredOrders =
    statusFilter === "Tous"
      ? orders
      : orders.filter((order) => order.status === statusFilter);

  const selectedOrder =
    filteredOrders.find((order) => order.id === selectedOrderId) ?? filteredOrders[0] ?? null;

  const counts = {
    pending: orders.filter((order) => order.status === "En attente").length,
    ready: orders.filter((order) => order.status === "Pret").length,
    delivered: orders.filter((order) => order.status === "Livre").length,
  };

  const handleStatusChange = (orderId: string, nextStatus: OrderStatus) => {
    setOrders((currentOrders) =>
      currentOrders.map((order) =>
        order.id === orderId ? { ...order, status: nextStatus } : order,
      ),
    );
  };

  const handleAddOrder = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const selectedDish = menuItems.find((item) => item.id === draft.dishId);
    const quantity = Math.max(Number(draft.quantity) || 1, 1);

    if (!draft.customer.trim() || !draft.table.trim() || !selectedDish) {
      return;
    }

    const nextOrder: RestaurantOrder = {
      id: `TT-${1000 + orders.length + 1}`,
      customer: draft.customer.trim(),
      table: draft.table.trim(),
      total: selectedDish.price * quantity,
      status: draft.status,
      channel: draft.channel,
      paymentMethod: draft.paymentMethod,
      placedAt: new Date().toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      items: [
        {
          name: selectedDish.name,
          quantity,
          price: selectedDish.price,
        },
      ],
    };

    setOrders((currentOrders) => [nextOrder, ...currentOrders]);
    setSelectedOrderId(nextOrder.id);
    setDraft({
      customer: "",
      table: "",
      dishId: menuItems[0]?.id ?? "",
      quantity: "1",
      channel: orderChannelOptions[0],
      paymentMethod: paymentMethodOptions[0],
      status: orderStatusOptions[0],
    });
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-600 shadow-theme-xs"
        >
          <PlusIcon className="h-5 w-5" />
          Ajouter une commande
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-xs dark:border-gray-800 dark:bg-white/[0.03]">
          <p className="text-sm text-gray-500 dark:text-gray-400">En attente</p>
          <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white/90">
            {counts.pending}
          </p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-xs dark:border-gray-800 dark:bg-white/[0.03]">
          <p className="text-sm text-gray-500 dark:text-gray-400">Pretes pour service</p>
          <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white/90">
            {counts.ready}
          </p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-xs dark:border-gray-800 dark:bg-white/[0.03]">
          <p className="text-sm text-gray-500 dark:text-gray-400">Deja livrees</p>
          <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white/90">
            {counts.delivered}
          </p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.45fr_0.85fr]">
        <section className="rounded-2xl border border-gray-200 bg-white shadow-theme-xs dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex flex-col gap-4 border-b border-gray-100 px-5 py-5 dark:border-gray-800 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-white/90">
                Suivi des commandes
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Mettez a jour le statut et ouvrez le recu sans quitter la page.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {filters.map((filter) => (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setStatusFilter(filter)}
                  className={cn(
                    "rounded-full border px-3 py-2 text-sm font-medium transition",
                    statusFilter === filter
                      ? "border-brand-200 bg-brand-50 text-brand-600 dark:border-brand-900/40 dark:bg-brand-900/10 dark:text-brand-300"
                      : "border-gray-200 text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/5",
                  )}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          <div className="p-5 sm:p-6">
            <OrdersTable
              orders={filteredOrders}
              selectedOrderId={selectedOrder?.id ?? null}
              onReceiptClick={(order) => setSelectedOrderId(order.id)}
              onPrintClick={(order) => {
                setSelectedOrderId(order.id);
                // Wait a tiny bit for the UI to update the receipt before showing the print dialog
                setTimeout(() => window.print(), 50);
              }}
              onStatusChange={handleStatusChange}
            />
          </div>
        </section>

        <OrderReceiptPreview order={selectedOrder} />
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} size="md">
        <div className="p-5">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white/90">Nouvelle Commande</h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Remplissez les details du ticket pour envoyer la commande en cuisine.
          </p>

          <form className="mt-5 space-y-3" onSubmit={handleAddOrder}>
             <div className="grid gap-4 sm:grid-cols-2">
                <TextInput
                  placeholder="Nom du client"
                  value={draft.customer}
                  onChange={(event) => setDraft((current) => ({ ...current, customer: event.target.value }))}
                />
                <TextInput
                  placeholder="Table ou reference"
                  value={draft.table}
                  onChange={(event) => setDraft((current) => ({ ...current, table: event.target.value }))}
                />
             </div>
             <div className="grid gap-4 sm:grid-cols-2">
                <SelectInput
                  value={draft.dishId}
                  onChange={(event) => setDraft((current) => ({ ...current, dishId: event.target.value }))}
                >
                  {menuItems.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name} ({formatCurrency(item.price)})
                    </option>
                  ))}
                </SelectInput>
                <TextInput
                  type="number"
                  min={1}
                  placeholder="Quantite"
                  value={draft.quantity}
                  onChange={(event) => setDraft((current) => ({ ...current, quantity: event.target.value }))}
                />
             </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <SelectInput
                  value={draft.channel}
                  onChange={(event) =>
                    setDraft((current) => ({ ...current, channel: event.target.value as typeof draft.channel }))
                  }
                >
                  {orderChannelOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </SelectInput>
                <SelectInput
                  value={draft.paymentMethod}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      paymentMethod: event.target.value as typeof draft.paymentMethod,
                    }))
                  }
                >
                  {paymentMethodOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </SelectInput>
                <SelectInput
                  value={draft.status}
                  onChange={(event) =>
                    setDraft((current) => ({ ...current, status: event.target.value as OrderStatus }))
                  }
                >
                  {orderStatusOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </SelectInput>
              </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/5"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-600"
              >
                Lancer la commande
              </button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
}

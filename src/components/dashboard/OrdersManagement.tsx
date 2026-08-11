"use client";

import {
  getCommandes,
  getArchivedCommandes,
  type OrderStatus,
  type RestaurantOrder,
} from "@/lib/data";
import { useAutoRefresh } from "@/hooks/useAutoRefresh";
import { useEffect, useState } from "react";
import { OrdersTable } from "./OrdersTable";
import { Toast } from "@/components/ui/toast/Toast";
import { ErrorModal } from "@/components/ui/ErrorModal";
import { supabase } from "@/lib/supabase-client";
import { Archive, ChevronDown, History, Loader2, Moon } from "lucide-react";
import { ConfirmModal } from "@/components/ui/ConfirmModal";

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
  const [archiving, setArchiving] = useState(false);
  const [showArchives, setShowArchives] = useState(false);
  const [archivedGroups, setArchivedGroups] = useState<{ date: string; label: string; orders: RestaurantOrder[] }[]>([]);
  const [loadingArchives, setLoadingArchives] = useState(false);
  const [expandedArchiveGroup, setExpandedArchiveGroup] = useState<string | null>(null);
  const [errorModal, setErrorModal] = useState<{ isOpen: boolean; title: string; message: string; details?: string }>({
    isOpen: false,
    title: "Erreur",
    message: "",
  });
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; orderId: string | null; loading: boolean }>({
    isOpen: false, orderId: null, loading: false,
  });
  const [archiveConfirm, setArchiveConfirm] = useState(false);

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
      body: JSON.stringify({ orderId, status: nextStatus, validated: true }),
    });

    if (!response.ok) {
      let errorMessage = "Statut non modifie.";
      try {
        const payload = await response.json();
        errorMessage = payload.error || errorMessage;
      } catch {
        const text = await response.text();
        errorMessage = text || errorMessage;
      }
      setErrorModal({
        isOpen: true,
        title: "Erreur de mise a jour",
        message: errorMessage,
        details: "Le statut de la commande n'a pas pu etre modifie.",
      });
      const data = await getCommandes();
      setOrders(data);
      return;
    }

    const payload = await response.json();
    if (payload.emailError) {
      alert("Statut modifie, mais l'email n'a pas pu etre envoye : " + payload.emailError);
    }
  };

  const handleDeleteOrder = (orderId: string) => {
    setDeleteConfirm({ isOpen: true, orderId, loading: false });
  };

  const confirmDelete = async () => {
    const orderId = deleteConfirm.orderId;
    if (!orderId) return;
    setDeleteConfirm((prev) => ({ ...prev, loading: true }));
    try {
      const res = await fetch("/api/admin/orders/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error || "Erreur lors de la suppression.");
      setOrders((current) => current.filter((o) => o.id !== orderId));
      setArchivedGroups((prev) =>
        prev.map((g) => ({ ...g, orders: g.orders.filter((o) => o.id !== orderId) }))
            .filter((g) => g.orders.length > 0)
      );
      setToast("Commande supprimée définitivement.");
    } catch (err) {
      setErrorModal({
        isOpen: true,
        title: "Erreur de suppression",
        message: (err as Error).message,
        details: "La commande n'a pas pu être supprimée.",
      });
    } finally {
      setDeleteConfirm({ isOpen: false, orderId: null, loading: false });
    }
  };

  const loadArchives = async () => {
    setLoadingArchives(true);
    try {
      const groups = await getArchivedCommandes();
      setArchivedGroups(groups);
    } catch (e) {
      console.error("Archive load error:", e);
    } finally {
      setLoadingArchives(false);
    }
  };

  const handleToggleArchives = async () => {
    if (!showArchives && archivedGroups.length === 0) {
      await loadArchives();
    }
    setShowArchives((v) => !v);
  };

  const handleArchiveDay = () => {
    if (orders.length === 0) {
      setToast("Aucune commande active à archiver.");
      return;
    }
    setArchiveConfirm(true);
  };

  const confirmArchiveDay = async () => {
    setArchiving(true);
    setArchiveConfirm(false);
    try {
      const res = await fetch("/api/admin/orders/archive", { method: "POST" });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error || "Erreur lors de l'archivage");
      setOrders([]);
      setToast(`✓ Journée terminée — ${payload.archived} commande(s) archivée(s) avec succès.`);
      if (showArchives) await loadArchives();
      else {
        setShowArchives(true);
        await loadArchives();
      }
    } catch (err) {
      setErrorModal({
        isOpen: true,
        title: "Erreur d'archivage",
        message: (err as Error).message,
      });
    } finally {
      setArchiving(false);
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

      if (!response.ok) {
        let errorMessage = "Impossible d'envoyer le reçu.";
        try {
          const payload = await response.json();
          errorMessage = payload.error || errorMessage;
        } catch {
          const text = await response.text();
          errorMessage = text || errorMessage;
        }
        setErrorModal({
          isOpen: true,
          title: "Erreur d'envoi",
          message: errorMessage,
          details: "Le reçu n'a pas pu être envoyé au client.",
        });
        return;
      }

      const payload = await response.json();
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
      {/* Confirm delete modal */}
      <ConfirmModal
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, orderId: null, loading: false })}
        onConfirm={confirmDelete}
        title="Supprimer cette commande ?"
        message="Cette commande annulée sera définitivement supprimée de la base de données. Cette action est irréversible."
        confirmLabel="Oui, supprimer"
        cancelLabel="Annuler"
        variant="danger"
        loading={deleteConfirm.loading}
      />

      {/* Confirm archive day modal */}
      <ConfirmModal
        isOpen={archiveConfirm}
        onClose={() => setArchiveConfirm(false)}
        onConfirm={confirmArchiveDay}
        title={`Terminer la journée ?`}
        message={`${orders.length} commande(s) seront archivées et la liste sera vidée. Vous pourrez les retrouver dans l'historique. Cette action est irréversible.`}
        confirmLabel="Oui, terminer la journée"
        cancelLabel="Pas encore"
        variant="warning"
        loading={archiving}
      />

      <ErrorModal
        isOpen={errorModal.isOpen}
        onClose={() => setErrorModal((prev) => ({ ...prev, isOpen: false }))}
        title={errorModal.title}
        message={errorModal.message}
        details={errorModal.details}
      />
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
          <div className="flex flex-wrap items-center gap-2">
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
            <div className="ml-2 h-5 w-px bg-gray-200" />
            {/* History button */}
            <button
              type="button"
              onClick={handleToggleArchives}
              className={cn(
                "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-bold transition",
                showArchives
                  ? "border-gray-700 bg-gray-900 text-white"
                  : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
              )}
              title="Voir l'historique des journées précédentes"
            >
              {loadingArchives ? <Loader2 size={13} className="animate-spin" /> : <History size={13} />}
              Historique
            </button>
            {/* Archive day button */}
            <button
              type="button"
              onClick={handleArchiveDay}
              disabled={archiving || orders.length === 0}
              className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-4 py-2 text-xs font-bold text-indigo-700 transition hover:bg-indigo-100 disabled:cursor-not-allowed disabled:opacity-50"
              title={orders.length === 0 ? "Aucune commande active à archiver" : `Terminer la journée et archiver les ${orders.length} commande(s) en cours`}
            >
              {archiving ? <Loader2 size={13} className="animate-spin" /> : <Moon size={13} />}
              {archiving ? "Archivage..." : "Terminer la journée"}
            </button>
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
              onDeleteOrder={handleDeleteOrder}
            />
          )}
        </div>
      </section>

      {/* Banner quand aucune commande active */}
      {orders.length === 0 && !loading && (
        <div className="rounded-2xl border-2 border-dashed border-indigo-200 bg-indigo-50 p-6 text-center dark:border-indigo-800 dark:bg-indigo-900/20">
          <Moon size={32} className="mx-auto mb-3 text-indigo-400" />
          <p className="text-base font-bold text-indigo-800 dark:text-indigo-300">Aucune commande active pour le moment</p>
          <p className="mt-1 text-sm text-indigo-600 dark:text-indigo-400">
            La journée est terminée ou aucune commande n'a encore été reçue. Les nouvelles commandes apparaîtront ici automatiquement.
          </p>
        </div>
      )}

      {/* Section Historique — visible quand showArchives est true */}
      {showArchives && (
      <section className="rounded-2xl border border-gray-200 bg-white shadow-theme-xs dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="flex items-center gap-4 border-b border-gray-100 px-5 py-4 dark:border-gray-800 sm:px-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800">
            <Archive size={18} className="text-gray-600 dark:text-gray-300" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900 dark:text-white">Historique des journées précédentes</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Rien n'est supprimé — toutes les commandes sont conservées.</p>
          </div>
        </div>

        <div className="divide-y divide-gray-100 dark:divide-gray-800">
          {loadingArchives ? (
            <div className="flex items-center justify-center gap-3 py-12 text-gray-400">
              <Loader2 size={22} className="animate-spin" />
              <span className="text-sm font-medium">Chargement de l'historique...</span>
            </div>
          ) : archivedGroups.length === 0 ? (
            <div className="py-12 text-center">
              <Archive size={32} className="mx-auto mb-3 text-gray-300" />
              <p className="text-sm font-bold text-gray-500">Aucun historique disponible</p>
              <p className="mt-1 text-xs text-gray-400">Terminez une journée pour voir les commandes archivées ici.</p>
            </div>
          ) : (
            archivedGroups.map((group) => {
              const activeOrders = group.orders.filter(o => o.status !== "Annulee");
              const revenue = activeOrders.reduce((s, o) => s + o.total, 0);
              const isExpanded = expandedArchiveGroup === group.date;
              return (
                <div key={group.date}>
                  <button
                    type="button"
                    onClick={() => setExpandedArchiveGroup(isExpanded ? null : group.date)}
                    className="flex w-full items-center justify-between px-5 py-4 transition hover:bg-gray-50 dark:hover:bg-gray-800/50 sm:px-6"
                  >
                    <div className="flex items-center gap-4">
                      <div className="hidden h-8 w-8 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800 sm:flex">
                        <Archive size={14} className="text-gray-500" />
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-bold capitalize text-gray-800 dark:text-white">{group.label}</p>
                        <p className="mt-0.5 text-xs text-gray-500">
                          {group.orders.length} commande{group.orders.length > 1 ? "s" : ""} au total
                          {group.orders.filter(o => o.status === "Annulee").length > 0 &&
                            ` · ${group.orders.filter(o => o.status === "Annulee").length} annulée(s)`
                          }
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-black text-brand-600">
                        {revenue.toLocaleString("fr-FR")} HTG
                      </span>
                      <ChevronDown size={14} className={cn("text-gray-400 transition-transform duration-200", isExpanded && "rotate-180")} />
                    </div>
                  </button>
                  {isExpanded && (
                    <div className="border-t border-gray-100 bg-gray-50/50 dark:border-gray-800 dark:bg-gray-900/30">
                      <div className="px-5 py-3 sm:px-6">
                        <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Détail des commandes</p>
                      </div>
                      <OrdersTable
                        orders={group.orders}
                        sentReceiptIds={sentReceiptIds}
                        onDeleteOrder={handleDeleteOrder}
                      />
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </section>
      )}
    </div>
  );
}

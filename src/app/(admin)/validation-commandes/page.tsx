"use client";

import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { useAutoRefresh } from "@/hooks/useAutoRefresh";
import { supabase } from "@/lib/supabase-client";
import { CheckCircle2, Eye, Loader2, RefreshCcw, X, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { ErrorModal } from "@/components/ui/ErrorModal";

type PendingOrderItem = {
  id: string;
  nom_plat: string;
  quantite: number;
  sous_total: number;
};

type PendingOrder = {
  id: string;
  numero_commande: string;
  client_nom: string;
  client_tel: string | null;
  client_user_id: string | null;
  adresse_livraison: string | null;
  frais_livraison: number | null;
  total: number;
  statut: string;
  payment_method: string | null;
  payment_status: string | null;
  payment_proof_url: string | null;
  notes: string | null;
  created_at: string;
  commande_items?: PendingOrderItem[];
};

export default function ValidationCommandesPage() {
  const [orders, setOrders] = useState<PendingOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [previewOrder, setPreviewOrder] = useState<PendingOrder | null>(null);
  const [viewedProofs, setViewedProofs] = useState<Record<string, boolean>>({});
  const [errorModal, setErrorModal] = useState<{ isOpen: boolean; title: string; message: string; details?: string }>({
    isOpen: false,
    title: "Erreur",
    message: "",
  });

  const loadOrders = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const res = await fetch("/api/admin/orders/list?archived=false", { cache: "no-store" });
      if (res.ok) {
        const payload = await res.json();
        if (Array.isArray(payload.orders)) {
          const pending = payload.orders.filter((o: any) => o.statut === "En attente");
          setOrders(pending);
          if (showLoading) setLoading(false);
          return;
        }
      }
    } catch (e) {
      console.warn("[validation loadOrders fallback]", e);
    }

    const { data, error } = await supabase
      .from("commandes")
      .select("id, numero_commande, client_nom, client_tel, client_user_id, adresse_livraison, frais_livraison, total, statut, payment_method, payment_status, payment_proof_url, notes, created_at, commande_items(id, nom_plat, quantite, sous_total)")
      .eq("statut", "En attente")
      .is("archived_at", null)
      .order("created_at", { ascending: false });

    if (error) {
      setErrorModal({
        isOpen: true,
        title: "Erreur de chargement",
        message: "Erreur lors du chargement des commandes : " + error.message,
        details: "Veuillez rafraîchir la page.",
      });
      setOrders([]);
    } else {
      setOrders((data || []) as PendingOrder[]);
    }
    if (showLoading) setLoading(false);
  };

  useEffect(() => {
    loadOrders();

    const channel = supabase
      .channel("pending-orders-validation")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "commandes" },
        () => {
          loadOrders();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useAutoRefresh(() => loadOrders(false));

  const updateOrder = async (orderId: string, status: "En préparation" | "Annulee") => {
    setUpdatingId(orderId);
    const response = await fetch("/api/admin/orders/status", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, status, validated: true }),
    });

    if (!response.ok) {
      let errorMessage = "Impossible de mettre a jour la commande.";
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
        details: "La commande n'a pas pu etre modifiee.",
      });
      await loadOrders();
      setUpdatingId(null);
      return;
    }

    const payload = await response.json();
    if (payload.emailError) {
      setErrorModal({
        isOpen: true,
        title: "Email non envoyé",
        message: "Commande mise à jour, mais email non envoyé : " + payload.emailError,
        details: "Le statut a été modifié, mais le client n'a pas reçu d'email.",
      });
    }

    await loadOrders();
    setUpdatingId(null);
  };

  const requiresProof = (order: PendingOrder) =>
    order.payment_method === "MonCash" || order.payment_method === "Zelle";

  const openProof = (order: PendingOrder) => {
    setViewedProofs((current) => ({ ...current, [order.id]: true }));
    setPreviewOrder(order);
  };

  return (
    <div className="space-y-6">
      <ErrorModal
        isOpen={errorModal.isOpen}
        onClose={() => setErrorModal((prev) => ({ ...prev, isOpen: false }))}
        title={errorModal.title}
        message={errorModal.message}
        details={errorModal.details}
      />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PageBreadCrumb pageTitle="Validation commandes" />
        <button
          type="button"
          onClick={() => loadOrders()}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-theme-xs transition hover:bg-gray-50"
        >
          <RefreshCcw className="h-4 w-4" />
          Actualiser
        </button>
      </div>

      <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-theme-xs dark:border-gray-800 dark:bg-white/[0.03]">
        <p className="text-sm text-brand-500">Commandes a traiter</p>
        <h1 className="mt-4 text-3xl font-semibold text-gray-900 dark:text-white/90">
          Commandes en attente de validation
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-gray-500 dark:text-gray-400">
          Validez les commandes apres verification du paiement. Si le justificatif est faux, annulez la commande et le client sera informe par email.
        </p>
      </section>

      {loading ? (
        <div className="flex h-64 items-center justify-center rounded-2xl border border-gray-200 bg-white">
          <Loader2 className="h-10 w-10 animate-spin text-brand-500" />
        </div>
      ) : orders.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center text-sm text-gray-500">
          Aucune commande en attente pour le moment.
        </div>
      ) : (
        <div className="grid gap-5">
          {orders.map((order) => (
            <article key={order.id} className="rounded-2xl border border-gray-200 bg-white p-4 shadow-theme-xs sm:p-5">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0 space-y-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="break-all text-lg font-black text-gray-900 sm:text-xl">{order.numero_commande}</h2>
                      <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">
                        {order.payment_status || "A verifier"}
                      </span>
                      <span
                        className={`rounded-2xl px-4 py-2 text-base font-black uppercase tracking-wide shadow-sm sm:px-5 sm:text-lg ${
                          requiresProof(order)
                            ? "bg-gray-950 text-brand-400"
                            : "bg-blue-50 text-blue-700"
                        }`}
                      >
                        {order.payment_method || "Sur place"}
                      </span>
                    </div>
                    <p className="mt-1 break-words text-sm text-gray-500">
                      {new Date(order.created_at).toLocaleString("fr-FR")} - {order.client_nom} - {order.client_tel || "Sans telephone"}
                    </p>
                    <p className="mt-1 max-w-2xl break-words text-sm font-medium text-gray-600">{order.adresse_livraison}</p>
                  </div>

                  <div className="grid gap-2 sm:grid-cols-2">
                    {(order.commande_items || []).map((item) => (
                      <div key={item.id} className="rounded-xl bg-gray-50 px-4 py-3 text-sm">
                        <p className="break-words font-bold text-gray-900">{item.nom_plat}</p>
                        <p className="text-gray-500">Qte: {item.quantite} - {item.sous_total} HTG</p>
                      </div>
                    ))}
                  </div>

                  {order.notes && (
                    <div className="rounded-xl border-2 border-orange-200 bg-orange-50 px-4 py-3">
                      <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-orange-600">Enstriksyon espesyal</p>
                      <p className="text-sm font-bold text-gray-900">{order.notes}</p>
                    </div>
                  )}
                </div>

                <div className="w-full space-y-3 lg:w-64">
                  <div className="rounded-2xl bg-gray-50 p-4">
                    {order.frais_livraison ? (
                      <div className="mb-2 space-y-1 border-b border-gray-200 pb-2 text-xs text-gray-500">
                        <div className="flex justify-between">
                          <span>Plats:</span>
                          <span className="font-semibold">{order.total - order.frais_livraison} HTG</span>
                        </div>
                        <div className="flex justify-between text-brand-600">
                          <span>Livraison:</span>
                          <span className="font-semibold">+{order.frais_livraison} HTG</span>
                        </div>
                      </div>
                    ) : null}
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Total a payer</p>
                    <p className="mt-1 text-2xl font-black text-gray-900">{order.total} HTG</p>
                  </div>

                  {order.payment_proof_url ? (
                    <button
                      type="button"
                      onClick={() => openProof(order)}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-bold text-gray-700 transition hover:border-brand-300 hover:text-brand-600"
                    >
                      Voir justificatif
                      <Eye className="h-4 w-4" />
                    </button>
                  ) : (
                    <div className="rounded-xl border border-dashed border-gray-200 px-4 py-3 text-center text-xs font-bold text-gray-400">
                      Aucun justificatif
                    </div>
                  )}

                  <button
                    type="button"
                    disabled={updatingId === order.id || (requiresProof(order) && !viewedProofs[order.id])}
                    onClick={() => updateOrder(order.id, "En préparation")}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-3 text-sm font-black text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Valider
                  </button>
                  {requiresProof(order) && !viewedProofs[order.id] && (
                    <p className="text-center text-xs font-bold text-amber-600">
                      Ouvrez le justificatif avant de valider.
                    </p>
                  )}
                  <button
                    type="button"
                    disabled={updatingId === order.id}
                    onClick={() => updateOrder(order.id, "Annulee")}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm font-black text-red-600 transition hover:bg-red-100 disabled:opacity-60"
                  >
                    <XCircle className="h-4 w-4" />
                    Annuler
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {previewOrder && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 p-4">
          <div className="relative flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="flex items-center justify-between gap-4 border-b border-gray-100 px-4 py-4 sm:px-5">
              <div className="min-w-0">
                <p className="text-xs font-black uppercase tracking-widest text-brand-500">
                  Justificatif
                </p>
                <h3 className="break-words pr-2 text-base font-black text-gray-900 sm:text-lg">
                  {previewOrder.numero_commande} - {previewOrder.payment_method || "Paiement"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setPreviewOrder(null)}
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                aria-label="Fermer le justificatif"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-auto bg-gray-50 p-2 sm:p-4">
              {previewOrder.payment_proof_url?.toLowerCase().endsWith(".pdf") ? (
                <iframe
                  src={previewOrder.payment_proof_url}
                  className="h-[75vh] w-full rounded-2xl border border-gray-200 bg-white"
                  title="Justificatif paiement"
                />
              ) : (
                <img
                  src={previewOrder.payment_proof_url || ""}
                  alt="Justificatif paiement"
                  className="mx-auto max-h-[75vh] max-w-full rounded-2xl object-contain"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { ReceiptInvoice } from "@/components/dashboard/ReceiptInvoice";
import { Toast } from "@/components/ui/toast/Toast";
import { type ReceiptDocument } from "@/lib/receipt";
import { supabase } from "@/lib/supabase-client";
import {
  CheckCircle2,
  ChefHat,
  Clock,
  Download,
  Eye,
  Mail,
  Package,
  RefreshCw,
  Search,
  X,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState, type MouseEvent as ReactMouseEvent, type ReactNode } from "react";
import { ErrorModal } from "@/components/ui/ErrorModal";

interface OrderResult {
  id: string;
  numero_commande: string;
  client_nom: string;
  client_email: string | null;
  client_user_id: string | null;
  client_tel: string | null;
  adresse_livraison: string | null;
  total: number;
  statut: string;
  canal: string;
  created_at: string;
  resolvedEmail?: string | null;
}

interface OrderItem {
  nom_plat: string;
  quantite: number;
  prix_unitaire: number;
  sous_total: number;
}

const statusColors: Record<string, string> = {
  "En attente": "bg-amber-50 text-amber-700 border-amber-200",
  "En préparation": "bg-orange-50 text-orange-700 border-orange-200",
  "Prêt": "bg-emerald-50 text-emerald-700 border-emerald-200",
  "En route": "bg-blue-50 text-blue-700 border-blue-200",
  "Livré": "bg-blue-50 text-blue-700 border-blue-200",
  Annulee: "bg-red-50 text-red-700 border-red-200",
};

const statusIcons: Record<string, ReactNode> = {
  "En attente": <Clock size={11} />,
  "En préparation": <ChefHat size={11} />,
  "Prêt": <Package size={11} />,
  "En route": <CheckCircle2 size={11} />,
  "Livré": <CheckCircle2 size={11} />,
};

async function resolveEmails(orders: OrderResult[]): Promise<OrderResult[]> {
  const missing = orders.filter((order) => !order.client_email && order.client_user_id);
  const clientEmails: Record<string, string> = {};

  if (missing.length > 0) {
    const userIds = [...new Set(missing.map((order) => order.client_user_id as string))];
    const { data: clients } = await supabase
      .from("clients")
      .select("id, email")
      .in("id", userIds);

    if (clients) {
      clients.forEach((client) => {
        clientEmails[client.id] = String(client.email || "");
      });
    }
  }

  return orders.map((order) => ({
    ...order,
    resolvedEmail: order.client_email || (order.client_user_id ? clientEmails[order.client_user_id] ?? null : null),
  }));
}

function buildReceiptDocument(order: OrderResult, items: OrderItem[]): ReceiptDocument {
  return {
    orderNumber: order.numero_commande,
    createdAt: order.created_at,
    dueAt: order.created_at,
    customerName: order.client_nom,
    customerPhone: order.client_tel,
    customerEmail: order.resolvedEmail || order.client_email,
    customerAddress: order.adresse_livraison,
    serviceLabel: order.canal,
    items: items.map((item) => ({
      name: item.nom_plat,
      quantity: Number(item.quantite) || 0,
      unitPrice: Number(item.prix_unitaire) || 0,
      amount: Number(item.sous_total) || 0,
    })),
    total: Number(order.total) || 0,
  };
}

function ReceiptModal({
  order,
  onClose,
  onSend,
  sending,
  sent,
}: {
  order: OrderResult;
  onClose: () => void;
  onSend: () => void;
  sending: boolean;
  sent: boolean;
}) {
  const [items, setItems] = useState<OrderItem[]>([]);
  const [loadingItems, setLoadingItems] = useState(true);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [errorModal, setErrorModal] = useState<{ isOpen: boolean; title: string; message: string; details?: string }>({
    isOpen: false,
    title: "Erreur",
    message: "",
  });
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;

    setLoadingItems(true);
    setItems([]);

    const loadItems = async () => {
      try {
        const { data } = await supabase
          .from("commande_items")
          .select("nom_plat, quantite, prix_unitaire, sous_total")
          .eq("commande_id", order.id)
          .order("id");

        if (!active) return;
        setItems((data || []) as OrderItem[]);
      } catch {
        if (!active) return;
        setItems([]);
      } finally {
        if (active) {
          setLoadingItems(false);
        }
      }
    };

    void loadItems();

    return () => {
      active = false;
    };
  }, [order.id]);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const handleOverlayClick = (event: ReactMouseEvent<HTMLDivElement>) => {
    if (event.target === overlayRef.current) {
      onClose();
    }
  };

  const date = new Date(order.created_at).toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const receiptDocument = buildReceiptDocument(order, items);

  const handleDownloadPdf = async () => {
    try {
      setDownloadingPdf(true);
      const response = await fetch(`/api/orders/receipt-pdf?orderId=${encodeURIComponent(order.id)}`);

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error || "Impossible de télécharger le PDF.");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = window.document.createElement("a");
      link.href = url;
      link.download = `fakti-${order.numero_commande}.pdf`;
      link.rel = "noopener";
      window.document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      } catch (error) {
        setErrorModal({
          isOpen: true,
          title: "Erreur de téléchargement",
          message: "Erreur : " + (error as Error).message,
          details: "Impossible de télécharger le PDF du reçu.",
        });
      } finally {
        setDownloadingPdf(false);
      }
  };

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/60 px-4 py-6 backdrop-blur-sm"
    >
      <ErrorModal
        isOpen={errorModal.isOpen}
        onClose={() => setErrorModal((prev) => ({ ...prev, isOpen: false }))}
        title={errorModal.title}
        message={errorModal.message}
        details={errorModal.details}
      />
      <div className="relative flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-[32px] bg-white shadow-2xl dark:bg-gray-900">
        <div className="flex items-start justify-between gap-4 border-b border-gray-100 px-6 py-4 dark:border-gray-800 sm:px-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gray-400">
              Aperçu du reçu
            </p>
            <h2 className="mt-1 text-base font-bold text-gray-900 dark:text-white">
              Commande {order.numero_commande}
            </h2>
            <p className="text-xs font-medium text-gray-400">{date}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={downloadingPdf}
              className="inline-flex items-center gap-2 rounded-xl border border-brand-200 bg-brand-50 px-3 py-2 text-xs font-bold text-brand-700 transition hover:border-brand-300 hover:bg-brand-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Download size={15} />
              {downloadingPdf ? "PDF..." : "PDF"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto bg-slate-50/70 px-4 py-5 sm:px-6">
          {loadingItems ? (
            <div className="flex min-h-[460px] items-center justify-center rounded-[28px] border border-dashed border-slate-200 bg-white text-sm font-medium text-slate-400 shadow-sm">
              Chargement de la facture...
            </div>
          ) : (
            <ReceiptInvoice document={receiptDocument} />
          )}
        </div>

        <div className="border-t border-gray-100 px-6 py-4 dark:border-gray-800 sm:px-8">
          {!order.resolvedEmail ? (
            <p className="text-center text-xs font-semibold text-amber-600">
              Aucun email disponible pour ce client - impossible d&apos;envoyer le reçu.
            </p>
          ) : sent ? (
            <div className="flex items-center justify-center gap-2 rounded-xl bg-emerald-50 py-3 text-sm font-bold text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400">
              <CheckCircle2 size={16} />
              Reçu envoyé à {order.resolvedEmail}
            </div>
          ) : (
            <button
              type="button"
              onClick={onSend}
              disabled={sending}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#101828] py-3 text-sm font-bold text-white transition hover:bg-gray-800 disabled:opacity-60"
            >
              <Mail size={16} />
              {sending ? "Envoi en cours..." : `Envoyer le reçu à ${order.resolvedEmail}`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function RechercheRecuPage() {
  const [query, setQuery] = useState("");
  const [allOrders, setAllOrders] = useState<OrderResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [sentIds, setSentIds] = useState<Set<string>>(new Set());
  const [previewOrder, setPreviewOrder] = useState<OrderResult | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [errorModal, setErrorModal] = useState<{ isOpen: boolean; title: string; message: string; details?: string }>({
    isOpen: false,
    title: "Erreur",
    message: "",
  });

  const loadAll = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    setLoadError(null);

    try {
      const { data, error } = await supabase
        .from("commandes")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);

      if (error) {
        const msg = error.message || error.details || JSON.stringify(error);
        console.error("[recherche-recu] Supabase error:", msg);
        setLoadError(msg);
        return;
      }

      const resolved = await resolveEmails((data || []) as OrderResult[]);
      setAllOrders(resolved);
    } catch (error: any) {
      const msg = error?.message || String(error);
      console.error("[recherche-recu] error:", msg);
      setLoadError(msg);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadAll();
  }, [loadAll]);

  const filtered = query.trim()
    ? allOrders.filter((order) => {
        const q = query.toLowerCase();
        return (
          order.client_nom?.toLowerCase().includes(q) ||
          order.numero_commande?.toLowerCase().includes(q) ||
          order.resolvedEmail?.toLowerCase().includes(q) ||
          order.client_tel?.includes(q)
        );
      })
    : allOrders;

  const handleSendReceipt = async (order: OrderResult) => {
    setSendingId(order.id);

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
      setSentIds((current) => new Set(current).add(order.id));
      setToast(`Reçu envoyé à ${payload.recipientEmail || order.resolvedEmail}`);
    } catch (error) {
      setErrorModal({
        isOpen: true,
        title: "Erreur d'envoi",
        message: "Erreur : " + (error as Error).message,
        details: "Impossible d'envoyer le reçu au client.",
      });
    } finally {
      setSendingId(null);
    }
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
      <PageBreadCrumb pageTitle="Reçus clients" />

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}

      {previewOrder && (
        <ReceiptModal
          order={previewOrder}
          onClose={() => setPreviewOrder(null)}
          onSend={() => handleSendReceipt(previewOrder)}
          sending={sendingId === previewOrder.id}
          sent={sentIds.has(previewOrder.id)}
        />
      )}

      <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-theme-xs dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm text-brand-500">Gestion des reçus</p>
            <h1 className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white/90">Reçus clients</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Visualisez et envoyez les reçus. Cliquez sur Vue pour voir le détail.
            </p>
          </div>

          <button
            type="button"
            onClick={() => loadAll(true)}
            disabled={refreshing}
            className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-600 transition hover:bg-gray-50 disabled:opacity-60 dark:border-gray-700 dark:bg-white/[0.05] dark:text-gray-300"
          >
            <RefreshCw size={15} className={refreshing ? "animate-spin" : ""} />
            Actualiser
          </button>
        </div>

        <div className="relative mt-5">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Nom, numéro de commande, email, téléphone..."
            className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-10 pr-10 text-sm font-medium text-gray-900 shadow-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100 dark:border-gray-700 dark:bg-white/[0.05] dark:text-white dark:focus:border-brand-500"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X size={15} />
            </button>
          )}
        </div>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white shadow-theme-xs dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 dark:border-gray-800">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white/90">
            {loading
              ? "Chargement..."
              : query
                ? `${filtered.length} résultat${filtered.length !== 1 ? "s" : ""} pour "${query}"`
                : `${allOrders.length} commande${allOrders.length !== 1 ? "s" : ""}`}
          </h3>
          {query && <span className="text-xs font-medium text-gray-400">sur {allOrders.length}</span>}
        </div>

        {loading ? (
          <div className="py-20 text-center text-sm font-medium text-gray-400">
            Chargement des commandes...
          </div>
        ) : loadError ? (
          <div className="px-6 py-12 text-center">
            <p className="text-sm font-semibold text-red-600">Erreur de chargement :</p>
            <p className="mt-1 text-xs font-mono text-red-500">{loadError}</p>
            <button
              type="button"
              onClick={() => loadAll()}
              className="mt-4 inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50"
            >
              <RefreshCw size={14} /> Réessayer
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-sm text-gray-500">
            {query ? (
              <>
                Aucune commande pour <strong>"{query}"</strong>.
              </>
            ) : (
              "Aucune commande trouvée."
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-[960px] w-full">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800">
                  {["Commande / Date", "Client", "Email", "Total", "Statut", "Actions"].map((heading) => (
                    <th
                      key={heading}
                      className={`px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-400 ${
                        heading === "Actions" ? "text-right" : "text-left"
                      }`}
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {filtered.map((order) => (
                  <tr key={order.id} className="group transition-colors hover:bg-gray-50/60 dark:hover:bg-white/[0.02]">
                    <td className="whitespace-nowrap px-5 py-4">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-sm font-black tracking-tight text-gray-900 dark:text-white/90">
                          {order.numero_commande}
                        </span>
                        <span className="flex items-center gap-1 text-[10px] font-semibold text-gray-400">
                          <Clock size={9} />
                          {new Date(order.created_at).toLocaleDateString("fr-FR", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}{" "}
                          {new Date(order.created_at).toLocaleTimeString("fr-FR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-sm font-bold text-gray-900 dark:text-white/90">{order.client_nom}</span>
                        {order.client_tel && (
                          <span className="text-[10px] font-semibold text-gray-400">{order.client_tel}</span>
                        )}
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      {order.resolvedEmail ? (
                        <a
                          href={`mailto:${order.resolvedEmail}`}
                          className="inline-flex items-center gap-1.5 rounded-full bg-gray-50 px-2.5 py-1 text-[10px] font-semibold text-gray-600 transition hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300"
                        >
                          <Mail size={9} />
                          {order.resolvedEmail}
                          {order.client_user_id && (
                            <span className="text-blue-400">(compte)</span>
                          )}
                        </a>
                      ) : (
                        <span className="text-[10px] font-semibold text-amber-500">Email manquant</span>
                      )}
                    </td>

                    <td className="whitespace-nowrap px-5 py-4">
                      <span className="text-sm font-black text-gray-900 dark:text-white/90">
                        {Number(order.total).toLocaleString("fr-FR")} HTG
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-xl border px-2.5 py-1 text-[11px] font-bold ${
                          statusColors[order.statut] || "border-gray-200 bg-gray-50 text-gray-600"
                        }`}
                      >
                        {statusIcons[order.statut]}
                        {order.statut}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            void (async () => {
                              try {
                                const response = await fetch(
                                  `/api/orders/receipt-pdf?orderId=${encodeURIComponent(order.id)}`,
                                );

                                if (!response.ok) {
                                  const payload = await response.json().catch(() => null);
                                  throw new Error(payload?.error || "Impossible de télécharger le PDF.");
                                }

                                const blob = await response.blob();
                                const url = window.URL.createObjectURL(blob);
                                const link = window.document.createElement("a");
                                link.href = url;
                                link.download = `fakti-${order.numero_commande}.pdf`;
                                link.rel = "noopener";
                                window.document.body.appendChild(link);
                                link.click();
                                link.remove();
                                window.URL.revokeObjectURL(url);
                              } catch (error) {
                                setErrorModal({
                                  isOpen: true,
                                  title: "Erreur de téléchargement",
                                  message: "Erreur : " + (error as Error).message,
                                  details: "Impossible de télécharger le PDF.",
                                });
                              }
                            })();
                          }}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-white/[0.05] dark:text-slate-300"
                        >
                          <Download size={13} />
                          PDF
                        </button>

                        <button
                          type="button"
                          onClick={() => setPreviewOrder(order)}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-bold text-gray-700 transition hover:border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:bg-white/[0.05] dark:text-gray-300"
                        >
                          <Eye size={13} />
                          Vue
                        </button>

                        {sentIds.has(order.id) ? (
                          <span className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700">
                            <CheckCircle2 size={13} />
                            Envoyé
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleSendReceipt(order)}
                            disabled={!order.resolvedEmail || sendingId === order.id}
                            title={order.resolvedEmail ? `Envoyer à ${order.resolvedEmail}` : "Aucun email disponible"}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-brand-200 bg-brand-50 px-3 py-2 text-xs font-bold text-brand-700 transition hover:border-brand-300 hover:bg-brand-100 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            <Mail size={13} />
                            {sendingId === order.id ? "Envoi..." : "Envoyer"}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

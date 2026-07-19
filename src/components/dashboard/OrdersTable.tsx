"use client";

import { cn } from "@/components/common/CmsShared";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import { OrderStatus, RestaurantOrder, formatCurrency, orderStatusOptions } from "@/lib/data";
import { ChevronDown, CheckCircle2, Clock, ChefHat, Mail, Package } from "lucide-react";
import { useState } from "react";

interface OrdersTableProps {
  orders: RestaurantOrder[];
  onSendReceipt?: (order: RestaurantOrder) => void;
  sendingReceiptOrderId?: string | null;
  onStatusChange?: (orderId: string, status: OrderStatus) => void;
  sentReceiptIds?: string[];
}

export function OrdersTable({
  orders,
  onSendReceipt,
  sendingReceiptOrderId,
  onStatusChange,
  sentReceiptIds = [],
}: OrdersTableProps) {
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  const toggleOrderDetails = (orderId: string) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  return (
    <div className="max-w-full overflow-x-auto custom-scrollbar">
      <Table className="min-w-[1040px]">
        <TableHeader className="border-y border-gray-100 dark:border-gray-800">
          <TableRow>
            <TableCell isHeader className="py-4 text-start text-xs font-bold uppercase tracking-wider text-gray-500">
              ID / Heure
            </TableCell>
            <TableCell isHeader className="py-4 text-start text-xs font-bold uppercase tracking-wider text-gray-500">
              Client / Email
            </TableCell>
            <TableCell isHeader className="py-4 text-start text-xs font-bold uppercase tracking-wider text-gray-500">
              Service
            </TableCell>
            <TableCell isHeader className="py-4 text-start text-xs font-bold uppercase tracking-wider text-gray-500">
              Total
            </TableCell>
            <TableCell isHeader className="py-4 text-start text-xs font-bold uppercase tracking-wider text-gray-500">
              Statut
            </TableCell>
            <TableCell isHeader className="py-4 text-right text-xs font-bold uppercase tracking-wider text-gray-500">
              Détails
            </TableCell>
            <TableCell isHeader className="py-4 text-right text-xs font-bold uppercase tracking-wider text-gray-500">
              Recu
            </TableCell>
          </TableRow>
        </TableHeader>

        <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
          {orders.map((order) => (
            <>
              <TableRow key={order.id} className="group transition-all hover:bg-gray-50/50">
                <TableCell className="py-5">
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-black tracking-tight text-gray-900 dark:text-white/90">
                      {order.numero}
                    </span>
                    <span className="flex items-center gap-1 text-[10px] font-bold text-gray-400">
                      <Clock size={10} /> {order.placedAt}
                    </span>
                  </div>
                </TableCell>

                <TableCell className="py-5">
                  <div className="flex max-w-[260px] flex-col gap-1">
                    <span className="text-sm font-bold text-gray-900 dark:text-white/90">
                      {order.customer}
                    </span>
                    <span className="text-xs italic text-gray-500 dark:text-gray-400">
                      {order.table}
                    </span>
                    {order.clientEmail ? (
                      <a
                        href={`mailto:${order.clientEmail}`}
                        className="inline-flex items-center gap-1.5 self-start rounded-full bg-gray-50 px-2.5 py-1 text-[10px] font-semibold text-gray-600 transition hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                      >
                        <Mail size={10} />
                        {order.clientEmail}
                      </a>
                    ) : order.clientUserId ? (
                      <span className="inline-flex items-center gap-1.5 self-start rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-semibold text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                        <Mail size={10} />
                        Email via compte
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold text-amber-600">Email manquant</span>
                    )}
                  </div>
                </TableCell>

                <TableCell className="py-5">
                  <div
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-widest",
                      order.channel === "Livraison"
                        ? "bg-blue-50 text-blue-600"
                        : order.channel === "Salle"
                          ? "bg-purple-50 text-purple-600"
                          : "bg-orange-50 text-orange-600",
                    )}
                  >
                    {order.channel}
                  </div>
                </TableCell>

                <TableCell className="py-5">
                  <div className="flex flex-col gap-1">
                    <span className="font-black text-gray-900 dark:text-white/90">
                      {formatCurrency(order.total)}
                    </span>
                    {order.paymentMethod && (
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                        {order.paymentMethod}
                        {order.paymentStatus ? ` - ${order.paymentStatus}` : ""}
                      </span>
                    )}
                  </div>
                </TableCell>

                <TableCell className="py-5">
                  {onStatusChange ? (
                    <div className="relative min-w-[170px]">
                      <select
                        value={order.status}
                        disabled={order.status === "En attente"}
                        onChange={(event) => onStatusChange(order.id, event.target.value as OrderStatus)}
                        className={cn(
                          "w-full appearance-none rounded-xl border px-4 py-2.5 pr-10 text-xs font-bold transition-all focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60",
                          order.status === "En attente"
                            ? "border-amber-200 bg-amber-50 text-amber-700 focus:ring-amber-200"
                            : order.status === "En préparation"
                              ? "border-orange-200 bg-orange-50 text-orange-700 focus:ring-orange-200"
                              : order.status === "Prêt"
                                ? "border-emerald-200 bg-emerald-50 text-emerald-700 focus:ring-emerald-200"
                                : order.status === "Annulee"
                                  ? "border-red-200 bg-red-50 text-red-700 focus:ring-red-200"
                                  : "border-gray-200 bg-gray-100 text-gray-600 focus:ring-gray-300",
                        )}
                      >
                        {orderStatusOptions.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-current opacity-60">
                        <ChevronDown size={14} strokeWidth={3} />
                      </div>
                      {order.status === "En attente" && (
                        <p className="mt-1 text-[10px] font-semibold text-amber-600">
                          Validez d’abord la commande pour pouvoir la traiter.
                        </p>
                      )}
                    </div>
                  ) : (
                    <div
                      className={cn(
                        "inline-flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-bold",
                        order.status === "En attente"
                          ? "bg-amber-50 text-amber-700"
                          : order.status === "En préparation"
                            ? "bg-orange-50 text-orange-700"
                            : order.status === "Prêt"
                              ? "bg-emerald-50 text-emerald-700"
                              : order.status === "Annulee"
                                ? "bg-red-50 text-red-700"
                                : "bg-gray-100 text-gray-600",
                      )}
                    >
                      {order.status === "En attente" && <Clock size={14} />}
                      {order.status === "En préparation" && <ChefHat size={14} />}
                      {order.status === "Prêt" && <Package size={14} />}
                      {order.status === "Livré" && <CheckCircle2 size={14} />}
                      {order.status}
                    </div>
                  )}
                </TableCell>

                <TableCell className="py-5 text-right">
                  <button
                    type="button"
                    onClick={() => toggleOrderDetails(order.id)}
                    className={cn(
                      "inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-xs font-bold transition",
                      expandedOrder === order.id
                        ? "border-brand-500 bg-brand-50 text-brand-700"
                        : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                    )}
                  >
                    {expandedOrder === order.id ? "Masquer" : "Voir détails"}
                    <ChevronDown 
                      size={14} 
                      className={cn("transition-transform", expandedOrder === order.id && "rotate-180")} 
                    />
                  </button>
                </TableCell>

                <TableCell className="py-5 text-right">
                  {(() => {
                    const isSent = sentReceiptIds.includes(order.id);
                    const isSending = sendingReceiptOrderId === order.id;

                    return (
                      <button
                        type="button"
                        onClick={() => onSendReceipt?.(order)}
                        disabled={(!order.clientEmail && !order.clientUserId) || isSending || isSent}
                        title={
                          order.clientEmail
                            ? `Envoyer le recu à ${order.clientEmail}`
                            : order.clientUserId
                              ? "Envoyer le recu via email du compte client"
                              : "Aucun email client n'est enregistre pour cette commande"
                        }
                        className={cn(
                          "inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-xs font-bold transition disabled:cursor-not-allowed disabled:opacity-50",
                          isSent
                            ? "border-green-200 bg-green-50 text-green-700"
                            : "border-brand-200 bg-brand-50 text-brand-700 hover:border-brand-300 hover:bg-brand-100"
                        )}
                      >
                        <Mail size={14} />
                        {isSending ? "Envoi..." : isSent ? "Envoyé" : "Envoyer recu"}
                      </button>
                    );
                  })()}
                </TableCell>
              </TableRow>
              {expandedOrder === order.id && (
                <TableRow key={`${order.id}-details`}>
                  <TableCell colSpan={7} className="p-0">
                    <div className="bg-gray-50 p-6 dark:bg-gray-900/50">
                      <h4 className="mb-4 text-sm font-black uppercase tracking-widest text-gray-700 dark:text-gray-300">
                        Détails de la commande
                      </h4>
                       <div className="space-y-3">
                        {order.items.map((item: any, index: number) => (
                          <div key={index} className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-800">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <p className="font-bold text-gray-900 dark:text-white">{item.name}</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  {item.quantity} x {formatCurrency(item.price)}
                                </p>
                              </div>
                              <p className="ml-4 font-black text-gray-900 dark:text-white">
                                {formatCurrency(item.price * item.quantity)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                      {order.notes && (
                        <div className="mt-4 rounded-xl border-2 border-orange-200 bg-orange-50 p-4 dark:border-orange-700 dark:bg-orange-900/20">
                          <p className="text-xs font-black uppercase tracking-widest text-orange-700 dark:text-orange-400 mb-2">
                            Enstriksyon espesyal:
                          </p>
                          <p className="text-sm font-bold text-gray-900 dark:text-white">
                            {order.notes}
                          </p>
                        </div>
                      )}
                      <div className="mt-4 flex justify-between rounded-xl border-2 border-gray-300 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
                        <span className="font-black text-gray-900 dark:text-white">Total</span>
                        <span className="font-black text-brand-500">{formatCurrency(order.total)}</span>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

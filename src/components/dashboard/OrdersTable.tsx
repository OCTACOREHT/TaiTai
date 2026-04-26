"use client";

import { cn } from "@/components/common/CmsShared";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import { OrderStatus, RestaurantOrder, formatCurrency, orderStatusOptions } from "@/lib/data";
import { PrinterIcon } from "lucide-react";
import Link from "next/link";
import { StatusPill } from "./StatusPill";

interface OrdersTableProps {
  orders: RestaurantOrder[];
  actionHref?: string;
  actionLabel?: string;
  selectedOrderId?: string | null;
  onReceiptClick?: (order: RestaurantOrder) => void;
  onPrintClick?: (order: RestaurantOrder) => void;
  onStatusChange?: (orderId: string, status: OrderStatus) => void;
}

export function OrdersTable({
  orders,
  actionHref = "/commandes",
  actionLabel = "Voir recu",
  selectedOrderId,
  onReceiptClick,
  onPrintClick,
  onStatusChange,
}: OrdersTableProps) {
  return (
    <div className="max-w-full overflow-x-auto custom-scrollbar">
      <Table>
        <TableHeader className="border-y border-gray-100 dark:border-gray-800">
          <TableRow>
            <TableCell
              isHeader
              className="py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400"
            >
              Commande
            </TableCell>
            <TableCell
              isHeader
              className="py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400"
            >
              Client / Table
            </TableCell>
            <TableCell
              isHeader
              className="py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400"
            >
              Canal
            </TableCell>
            <TableCell
              isHeader
              className="py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400"
            >
              Total
            </TableCell>
            <TableCell
              isHeader
              className="py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400"
            >
              Statut
            </TableCell>
            <TableCell
              isHeader
              className="py-3 text-right text-theme-xs font-medium text-gray-500 dark:text-gray-400"
            >
              Action
            </TableCell>
          </TableRow>
        </TableHeader>

        <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
          {orders.map((order) => (
            <TableRow
              key={order.id}
              className={cn(
                "transition-colors",
                selectedOrderId === order.id && "bg-brand-25/60 dark:bg-brand-500/10",
              )}
            >
              <TableCell className="py-4">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white/90">{order.id}</p>
                  <p className="text-theme-xs text-gray-500 dark:text-gray-400">{order.placedAt}</p>
                </div>
              </TableCell>
              <TableCell className="py-4">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white/90">{order.customer}</p>
                  <p className="text-theme-xs text-gray-500 dark:text-gray-400">{order.table}</p>
                </div>
              </TableCell>
              <TableCell className="py-4 text-theme-sm text-gray-500 dark:text-gray-400">
                {order.channel}
              </TableCell>
              <TableCell className="py-4 text-theme-sm font-medium text-gray-900 dark:text-white/90">
                {formatCurrency(order.total)}
              </TableCell>
              <TableCell className="py-4">
                {onStatusChange ? (
                  <select
                    value={order.status}
                    onChange={(event) =>
                      onStatusChange(order.id, event.target.value as OrderStatus)
                    }
                    className="h-10 min-w-[140px] rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 shadow-theme-xs outline-hidden transition focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                  >
                    {orderStatusOptions.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                ) : (
                  <StatusPill value={order.status} />
                )}
              </TableCell>
              <TableCell className="py-4 text-right">
                <div className="flex justify-end gap-2">
                  {onReceiptClick ? (
                    <button
                      type="button"
                      onClick={() => onReceiptClick(order)}
                      className="inline-flex items-center rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/5"
                    >
                      {actionLabel}
                    </button>
                  ) : (
                    <Link
                      href={actionHref}
                      className="inline-flex items-center rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/5"
                    >
                      {actionLabel}
                    </Link>
                  )}

                  <button
                    type="button"
                    onClick={() => onPrintClick?.(order)}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-300 text-gray-500 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-white/5"
                    title="Imprimer le reçu"
                  >
                    <PrinterIcon className="h-5 w-5" />
                  </button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

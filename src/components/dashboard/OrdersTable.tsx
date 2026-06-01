"use client";

import { cn } from "@/components/common/CmsShared";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import { OrderStatus, RestaurantOrder, formatCurrency, orderStatusOptions } from "@/lib/data";
import { PrinterIcon, ChevronDown, CheckCircle2, Clock, Package, ChefHat } from "lucide-react";

interface OrdersTableProps {
  orders: RestaurantOrder[];
  selectedOrderId?: string | null;
  onReceiptClick?: (order: RestaurantOrder) => void;
  onPrintClick?: (order: RestaurantOrder) => void;
  onStatusChange?: (orderId: string, status: OrderStatus) => void;
}

export function OrdersTable({
  orders,
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
            <TableCell isHeader className="py-4 text-start text-xs font-bold uppercase tracking-wider text-gray-500">ID / Heure</TableCell>
            <TableCell isHeader className="py-4 text-start text-xs font-bold uppercase tracking-wider text-gray-500">Client & Destination</TableCell>
            <TableCell isHeader className="py-4 text-start text-xs font-bold uppercase tracking-wider text-gray-500">Service</TableCell>
            <TableCell isHeader className="py-4 text-start text-xs font-bold uppercase tracking-wider text-gray-500">Total</TableCell>
            <TableCell isHeader className="py-4 text-start text-xs font-bold uppercase tracking-wider text-gray-500">Statut</TableCell>
            <TableCell isHeader className="py-4 text-right text-xs font-bold uppercase tracking-wider text-gray-500">Actions</TableCell>
          </TableRow>
        </TableHeader>

        <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
          {orders.map((order) => (
            <TableRow
              key={order.id}
              className={cn(
                "group transition-all hover:bg-gray-50/50",
                selectedOrderId === order.id && "bg-brand-50/40 dark:bg-brand-500/5 ring-1 ring-inset ring-brand-100",
              )}
            >
              <TableCell className="py-5">
                <div className="flex flex-col gap-1">
                  <span className="font-black text-gray-900 dark:text-white/90 text-sm tracking-tight">{order.numero}</span>
                  <span className="text-[10px] font-bold text-gray-400 flex items-center gap-1">
                     <Clock size={10} /> {order.placedAt}
                  </span>
                </div>
              </TableCell>
              
              <TableCell className="py-5">
                <div className="flex flex-col gap-1 max-w-[200px]">
                  <span className="font-bold text-gray-900 dark:text-white/90 text-sm truncate">{order.customer}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1 italic">{order.table}</span>
                </div>
              </TableCell>
              
              <TableCell className="py-5">
                 <div className={cn(
                    "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                    order.channel === 'Livraison' ? "bg-blue-50 text-blue-600" : 
                    order.channel === 'Salle' ? "bg-purple-50 text-purple-600" : "bg-orange-50 text-orange-600"
                 )}>
                    {order.channel}
                 </div>
              </TableCell>
              
              <TableCell className="py-5">
                <div className="flex flex-col gap-1">
                  <span className="font-black text-gray-900 dark:text-white/90">{formatCurrency(order.total)}</span>
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
                  <div className="relative group/status min-w-[140px]">
                    <select
                      value={order.status}
                      onChange={(event) =>
                        onStatusChange(order.id, event.target.value as OrderStatus)
                      }
                      className={cn(
                        "appearance-none w-full h-10 pl-4 pr-10 rounded-xl border text-xs font-bold transition-all cursor-pointer focus:outline-none focus:ring-2",
                        order.status === 'En attente' ? "bg-amber-50 border-amber-200 text-amber-700 focus:ring-amber-200" :
                        order.status === 'En préparation' ? "bg-orange-50 border-orange-200 text-orange-700 focus:ring-orange-200" :
                        order.status === 'Prêt' ? "bg-emerald-50 border-emerald-200 text-emerald-700 focus:ring-emerald-200" :
                        order.status === 'Annulee' ? "bg-red-50 border-red-200 text-red-700 focus:ring-red-200" :
                        "bg-gray-100 border-gray-200 text-gray-600 focus:ring-gray-300"
                      )}
                    >
                      {orderStatusOptions.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-current opacity-60">
                       <ChevronDown size={14} strokeWidth={3} />
                    </div>
                  </div>
                ) : (
                  <div className={cn(
                    "inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold",
                    order.status === 'En attente' ? "bg-amber-50 text-amber-700" :
                    order.status === 'En préparation' ? "bg-orange-50 text-orange-700" :
                    order.status === 'Prêt' ? "bg-emerald-50 text-emerald-700" :
                    order.status === 'Annulee' ? "bg-red-50 text-red-700" :
                    "bg-gray-100 text-gray-600"
                  )}>
                    {order.status === 'En attente' && <Clock size={14} />}
                    {order.status === 'En préparation' && <ChefHat size={14} />}
                    {order.status === 'Prêt' && <Package size={14} />}
                    {order.status === 'Livré' && <CheckCircle2 size={14} />}
                    {order.status}
                  </div>
                )}
              </TableCell>
              
              <TableCell className="py-5 text-right">
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => onReceiptClick?.(order)}
                    className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-gray-600 bg-white border border-gray-200 rounded-xl transition hover:bg-gray-50 active:scale-95 shadow-sm"
                  >
                    Détails
                  </button>

                  <button
                    type="button"
                    onClick={() => onPrintClick?.(order)}
                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#101828] text-white transition hover:bg-brand-600 active:scale-95 shadow-lg shadow-black/10"
                    title="Imprimer le reçu"
                  >
                    <PrinterIcon size={18} strokeWidth={2.5} />
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

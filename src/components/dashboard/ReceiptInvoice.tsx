"use client";

import Image from "next/image";
import {
  formatReceiptDate,
  formatReceiptMoney,
  getReceiptSubtotal,
  RECEIPT_BRAND,
  type ReceiptDocument,
} from "@/lib/receipt";

type ReceiptInvoiceProps = {
  document: ReceiptDocument;
  className?: string;
};

function formatPartyLine(value: string | null | undefined) {
  return String(value ?? "").trim();
}

export function ReceiptInvoice({ document, className }: ReceiptInvoiceProps) {
  const subtotal = getReceiptSubtotal(document.items);
  const issueDate = formatReceiptDate(document.createdAt);
  const dueDate = formatReceiptDate(document.dueAt ?? document.createdAt);

  return (
    <section
      className={`w-full overflow-hidden rounded-[28px] border border-slate-200 bg-white text-slate-950 shadow-[0_24px_80px_rgba(15,23,42,0.08)] ${className ?? ""}`}
    >
      <div className="flex items-start justify-between gap-6 border-b border-slate-200 px-6 py-5 sm:px-8 sm:py-6">
        <div className="min-w-0">
          <p className="text-3xl font-black tracking-tight text-slate-950">Fakti</p>
          <p className="mt-2 text-sm font-semibold text-slate-500">{RECEIPT_BRAND.name}</p>
          <p className="mt-1 text-xs font-medium uppercase tracking-[0.24em] text-slate-400">
            {document.orderNumber}
          </p>
        </div>

        <div className="relative h-12 w-32 shrink-0 sm:h-14 sm:w-40">
          <Image
            src="/images/logo/tailogo.png"
            alt={RECEIPT_BRAND.name}
            fill
            priority
            sizes="(max-width: 640px) 128px, 160px"
            className="object-contain object-right"
          />
        </div>
      </div>

      <div className="grid gap-4 border-b border-slate-200 px-6 py-5 sm:grid-cols-2 sm:px-8">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-slate-400">Nimewo fakti</p>
          <p className="mt-1 text-sm font-bold text-slate-950">{document.orderNumber}</p>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-slate-400">Dat emisyon</p>
          <p className="mt-1 text-sm font-bold text-slate-950">{issueDate}</p>
        </div>
      </div>

      <div className="grid gap-6 px-6 py-6 sm:grid-cols-2 sm:px-8">
        <div>
          <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.24em] text-[#FF9000]">Depi</p>
          <div className="space-y-1 text-sm leading-6 text-slate-600">
            <p className="text-base font-bold text-slate-950">{RECEIPT_BRAND.name}</p>
            {RECEIPT_BRAND.addressLines.map((line) => (
              <p key={line}>{line}</p>
            ))}
            <p>Telefon: {RECEIPT_BRAND.phone}</p>
            <p>Imel: {RECEIPT_BRAND.email}</p>
          </div>
        </div>

        <div>
          <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.24em] text-[#FF9000]">Pou</p>
          <div className="space-y-1 text-sm leading-6 text-slate-600">
            <p className="text-base font-bold text-slate-950">{document.customerName}</p>
            {formatPartyLine(document.customerPhone) ? <p>Telefon kliyan: {document.customerPhone}</p> : null}
            {formatPartyLine(document.customerEmail) ? <p>Imel kliyan: {document.customerEmail}</p> : null}
            {formatPartyLine(document.customerAddress) ? <p>Adres: {document.customerAddress}</p> : null}
            {formatPartyLine(document.serviceLabel) ? <p>Servis: {document.serviceLabel}</p> : null}
          </div>
        </div>
      </div>

      <div className="px-6 pb-6 sm:px-8">
        <div className="flex flex-col gap-5 rounded-[24px] border border-slate-200 bg-slate-50 p-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-slate-400">
              Montan pou peye
            </p>
            <p className="mt-3 text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">
              {formatReceiptMoney(document.total)}
            </p>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              {RECEIPT_BRAND.subtitle}. Mesi pou konfyans ou nan TaïTaï.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">Rezime</p>
            <p className="mt-2 flex items-center justify-between gap-6">
              <span>Som total</span>
              <span className="font-bold text-slate-950">{formatReceiptMoney(subtotal)}</span>
            </p>
            {document.total > subtotal && (
              <p className="mt-1 flex items-center justify-between gap-6 text-[#FF9000]">
                <span>Frais de livraison</span>
                <span className="font-bold">{formatReceiptMoney(document.total - subtotal)}</span>
              </p>
            )}
            <p className="mt-1 flex items-center justify-between gap-6">
              <span>Total</span>
              <span className="font-bold text-slate-950">{formatReceiptMoney(document.total)}</span>
            </p>
            <div className="my-3 border-t border-slate-200" />
            <p className="flex items-center justify-between gap-6 text-base font-black text-slate-950">
              <span>Montan final</span>
              <span>{formatReceiptMoney(document.total)}</span>
            </p>
          </div>
        </div>
      </div>

      <div className="px-6 pb-5 sm:px-8">
        <div className="overflow-hidden rounded-[20px] border border-slate-200">
          <table className="w-full border-collapse bg-white">
            <thead>
              <tr className="bg-slate-50">
                <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-[0.24em] text-slate-500">
                  Deskripsyon
                </th>
                <th className="px-4 py-3 text-center text-[10px] font-bold uppercase tracking-[0.24em] text-slate-500">
                  Kantite
                </th>
                <th className="px-4 py-3 text-right text-[10px] font-bold uppercase tracking-[0.24em] text-slate-500">
                  Pri inite
                </th>
                <th className="px-4 py-3 text-right text-[10px] font-bold uppercase tracking-[0.24em] text-slate-500">
                  Montan
                </th>
              </tr>
            </thead>
            <tbody>
              {document.items.length > 0 ? (
                document.items.map((item, index) => (
                  <tr key={`${item.name}-${index}`} className="border-t border-slate-200">
                    <td className="px-4 py-4 align-top">
                      <p className="text-sm font-semibold text-slate-950">{item.name}</p>
                    </td>
                    <td className="px-4 py-4 align-top text-center text-sm font-semibold text-slate-700">
                      {item.quantity}
                    </td>
                    <td className="px-4 py-4 align-top text-right text-sm text-slate-700">
                      {formatReceiptMoney(item.unitPrice)}
                    </td>
                    <td className="px-4 py-4 align-top text-right text-sm font-bold text-slate-950">
                      {formatReceiptMoney(item.amount)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr className="border-t border-slate-200">
                  <td colSpan={4} className="px-4 py-8 text-center text-sm text-slate-500">
                    Pa gen atik pou montre.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="px-6 pb-7 sm:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Nòt</p>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Reku sa a pare pou enprime oswa sove kom PDF. Si ou bezwen asistans, kontakte ekip TaïTaï dirèkteman.
        </p>
      </div>
    </section>
  );
}

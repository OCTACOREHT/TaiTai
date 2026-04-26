"use client";

import { RestaurantOrder, formatCurrency } from "@/lib/data";
import Image from "next/image";

const Barcode = ({ orderId }: { orderId: string }) => (
  <div className="flex flex-col items-center w-full">
    <svg width="100%" height="45" viewBox="0 0 200 45" preserveAspectRatio="none" className="opacity-90">
      <rect width="200" height="45" fill="white" />
      <path
        d="M10 0h2v45h-2zM15 0h1v45h-1zM20 0h3v45h-3zM28 0h1v45h-1zM32 0h2v45h-2zM38 0h4v45h-4zM45 0h1v45h-1zM50 0h2v45h-2zM55 0h1v45h-1zM60 0h3v45h-3zM68 0h1v45h-1zM72 0h2v45h-2zM78 0h4v45h-4zM85 0h1v45h-1zM90 0h2v45h-2zM95 0h1v45h-1zM100 0h3v45h-3zM108 0h1v45h-1zM112 0h2v45h-2zM118 0h4v45h-4zM125 0h1v45h-1zM130 0h2v45h-2zM135 0h1v45h-1zM140 0h3v45h-3zM148 0h1v45h-1zM152 0h2v45h-2zM158 0h4v45h-4zM165 0h1v45h-1zM170 0h2v45h-2zM175 0h1v45h-1zM180 0h3v45h-3zM188 0h1v45h-1z"
        fill="black"
      />
    </svg>
    <p className="text-[11px] text-center mt-3 opacity-40 tracking-[0.5em] uppercase font-bold">{orderId}</p>
  </div>
);

export function OrderReceiptPreview({ order }: { order: RestaurantOrder | null }) {
  if (!order) {
    return (
      <section className="rounded-2xl border border-dashed border-gray-300 bg-white p-6 shadow-theme-xs dark:border-gray-700 dark:bg-white/[0.03]">
        <p className="text-sm text-gray-500 dark:text-gray-400 font-mono">
          Selectionnez une commande pour afficher son recu.
        </p>
      </section>
    );
  }

  const subtotal = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const now = new Date();
  const dateStr = now.toLocaleDateString("fr-FR");
  const timeStr = now.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="flex flex-col items-center w-full">
      {/* Receipt Paper */}
      <section className="receipt-paper w-full max-w-[340px] px-6 py-10 shadow-2xl font-mono text-gray-800 border-x border-gray-100 bg-white dark:bg-white">
        {/* Header */}
        <div className="flex flex-col items-center space-y-2">
          <div className="relative h-14 w-14 grayscale brightness-0">
             <Image
                src="/images/logo/tailogo.png"
                alt="TaiTai"
                fill
                className="object-contain"
              />
          </div>
          <p className="text-[10px] text-center opacity-70 leading-tight uppercase font-medium">
            18 RUE DES SAVEURS, PETION-VILLE<br />
            HAÏTI - TEL: +509 3644-8822
          </p>
        </div>

        <div className="my-6 border-b border-gray-400 border-dotted" />

        <div className="text-center space-y-1">
          <h2 className="text-2xl font-bold tracking-[0.2em] uppercase">*** RECU ***</h2>
          <div className="flex justify-between text-[11px] pt-6 uppercase font-bold text-gray-700">
            <span>TABLE: {order.table}</span>
            <span>{dateStr} - {timeStr}</span>
          </div>
          <div className="text-left text-[11px] opacity-70 mt-1 uppercase font-bold text-gray-600">
            CLIENT: {order.customer}
          </div>
        </div>

        <div className="my-6 border-b border-gray-400 border-dotted" />

        {/* Order Items */}
        <div className="space-y-4 text-[12px]">
          {order.items.map((item) => (
            <div key={`${order.id}-${item.name}`}>
              <div className="flex justify-between font-bold text-black text-[13px]">
                <span className="uppercase">{item.name}</span>
                <span>{formatCurrency(item.price * item.quantity)}</span>
              </div>
              <div className="text-[10px] opacity-70 uppercase mt-0.5 font-bold">
                {item.quantity} X {formatCurrency(item.price)}
              </div>
            </div>
          ))}
        </div>

        <div className="my-6 border-b border-gray-400 border-dotted" />

        {/* Totals */}
        <div className="space-y-3 text-[12px]">
          <div className="flex justify-between font-bold text-gray-700">
            <span>SOUS-TOTAL</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between text-2xl font-black pt-1 uppercase text-black">
             <span className="tracking-tighter">TOTAL</span>
             <span>{formatCurrency(order.total)}</span>
          </div>
          <div className="flex justify-between pt-4 opacity-100 uppercase font-bold text-gray-700">
            <span>MODE: {order.paymentMethod}</span>
            <span>{formatCurrency(order.total)}</span>
          </div>
          <div className="flex justify-between opacity-100 font-bold text-gray-700">
            <span>RENDU (CHANGE)</span>
            <span>0 HTG</span>
          </div>
        </div>

        <div className="my-8 border-b border-gray-400 border-dotted" />

        {/* Footer */}
        <div className="flex flex-col items-center space-y-6 pb-2">
          <p className="text-[12px] font-black text-center tracking-[0.05em] uppercase text-black">
            MERCI DE VOTRE CONFIANCE !
          </p>
          <Barcode orderId={order.id} />
        </div>
      </section>

      <button
        type="button"
        onClick={() => {
           window.print();
        }}
        className="mt-12 inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-brand-500 px-8 text-sm font-medium text-white shadow-theme-xs transition hover:bg-brand-600 no-print"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M17 17H19C20.1046 17 21 16.1046 21 15V11C21 9.89543 20.1046 9 19 9H5C3.89543 9 3 9.89543 3 11V15C3 16.1046 3.89543 17 5 17H7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M17 9V5C17 3.89543 16.1046 3 15 3H9C7.89543 3 7 3.89543 7 5V9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M17 13H7V21H17V13Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Imprimer le recu
      </button>

      <style jsx global>{`
        @media print {
          html, body {
             margin: 0 !important;
             padding: 0 !important;
             height: auto !important;
             background: white !important;
          }
          
          body * {
            visibility: hidden !important;
          }

          nav, aside, header, footer, button, .no-print, .sidebar, .header {
            display: none !important;
          }

          .receipt-paper, .receipt-paper * {
            visibility: visible !important;
          }

          .receipt-paper {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 80mm !important; 
            max-width: 80mm !important;
            margin: 0 !important;
            padding: 4mm !important;
            box-shadow: none !important;
            border: none !important;
            color: black !important;
            background: white !important;
            height: auto !important;
          }

          .receipt-paper::before,
          .receipt-paper::after {
            display: none !important;
          }
          
          @page {
            size: 80mm auto;
            margin: 0;
          }
        }
      `}</style>
    </div>
  );
}

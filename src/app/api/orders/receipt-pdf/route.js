import { NextResponse } from "next/server";
import { buildReceiptPdfBytes } from "@/lib/receipt-server";

const db = require("@/server/db");

export const runtime = "nodejs";

function buildReceiptDocument(order, items) {
  return {
    orderNumber: String(order.numero_commande || ""),
    createdAt: order.created_at,
    dueAt: order.created_at,
    customerName: String(order.client_nom || ""),
    customerPhone: order.client_tel || null,
    customerEmail: String(order.joined_email || "").trim() || null,
    customerAddress: order.adresse_livraison || null,
    serviceLabel: order.canal || null,
    items: items.map((item) => ({
      name: String(item.nom_plat || ""),
      quantity: Number(item.quantite) || 0,
      unitPrice: Number(item.prix_unitaire) || 0,
      amount: Number(item.sous_total) || 0,
      supplements: item.supplements || [],
    })),
    total: Number(order.total) || 0,
  };
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get("orderId");
    const clientTel = searchParams.get("clientTel");

    if (!orderId) {
      return NextResponse.json({ error: "orderId requis." }, { status: 400 });
    }

    const { rows } = await db.query(
      `SELECT
         o.id,
         o.numero_commande,
         o.client_nom,
         o.client_tel,
         o.client_user_id,
         o.adresse_livraison,
         o.canal,
         o.total,
         o.created_at,
         c.email AS joined_email
       FROM public.commandes o
       LEFT JOIN public.clients c ON c.id = o.client_user_id
       WHERE o.id = $1`,
      [orderId],
    );

    const order = rows[0];
    if (!order) {
      return NextResponse.json({ error: "Commande introuvable." }, { status: 404 });
    }

    if (clientTel && order.client_tel && String(order.client_tel) !== String(clientTel)) {
      return NextResponse.json({ error: "Commande invalide." }, { status: 403 });
    }

    const { rows: items } = await db.query(
      `SELECT nom_plat, quantite, prix_unitaire, sous_total, supplements
       FROM public.commande_items
       WHERE commande_id = $1
       ORDER BY id`,
      [orderId],
    );

    const document = buildReceiptDocument(order, items);
    const pdfBytes = await buildReceiptPdfBytes(document);

    return new Response(Buffer.from(pdfBytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="fakti-${order.numero_commande}.pdf"`,
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (error) {
    console.error("[GET /api/orders/receipt-pdf]", error?.message || error, error);
    return NextResponse.json(
      { error: error?.message || "Erreur inattendue." },
      { status: 500 },
    );
  }
}

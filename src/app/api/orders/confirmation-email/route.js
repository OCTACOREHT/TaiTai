import { NextResponse } from "next/server";
import { Resend } from "resend";
import { buildReceiptPdfBytes } from "@/lib/receipt-server";

const db = require("@/server/db");

export const runtime = "nodejs";

const fromEmail = process.env.RESEND_FROM_EMAIL || "TaïTaï <info@xn--tata-6pac.com>";

export async function POST(request) {
  try {
    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json({ error: "RESEND_API_KEY manquant." }, { status: 500 });
    }

    const { orderId, clientTel, email: emailFromRequest } = await request.json();
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

    const recipientEmail = String(emailFromRequest || order.joined_email || "").trim();
    if (!recipientEmail) {
      return NextResponse.json({ error: "Email du client introuvable." }, { status: 404 });
    }

    const { rows: items } = await db.query(
      `SELECT nom_plat, quantite, prix_unitaire, sous_total
       FROM public.commande_items
       WHERE commande_id = $1
       ORDER BY id`,
      [orderId],
    );

    const document = {
      orderNumber: String(order.numero_commande),
      createdAt: order.created_at,
      dueAt: order.created_at,
      customerName: String(order.client_nom || ""),
      customerPhone: order.client_tel || null,
      customerEmail: recipientEmail,
      customerAddress: order.adresse_livraison || null,
      serviceLabel: order.canal || null,
      items: items.map((item) => ({
        name: String(item.nom_plat || ""),
        quantity: Number(item.quantite) || 0,
        unitPrice: Number(item.prix_unitaire) || 0,
        amount: Number(item.sous_total) || 0,
      })),
      total: Number(order.total) || 0,
    };

    const emailHtml = `
      <div style="font-family: sans-serif; color: #101828; padding: 24px; max-width: 600px; margin: 0 auto; line-height: 1.6;">
        <h2 style="color: #FF9000; margin-bottom: 16px;">Mèsi pou komann ou an !</h2>
        <p>Bonswa <strong>${document.customerName}</strong>,</p>
        <p>Tanpri jwenn resi ou a nan dokiman ki atache anba a.</p>
        <p style="margin-top: 24px; font-size: 14px; color: #667085;">
          Mèsi anpil pou konfyans ou nan TaïTaï. Si ou bezwen asistans, kontakte nou dirèkteman.
        </p>
      </div>
    `;
    
    const emailText = `Mèsi pou komann ou an !\n\nBonswa ${document.customerName},\n\nTanpri jwenn resi ou a nan dokiman ki atache anba a.\n\nMèsi anpil pou konfyans ou nan TaïTaï.`;

    const pdfBytes = await buildReceiptPdfBytes(document);

    const resend = new Resend(process.env.RESEND_API_KEY);
    const { error: sendError } = await resend.emails.send({
      from: fromEmail,
      to: [recipientEmail],
      subject: `Fakti TaïTaï — ${order.numero_commande}`,
      html: emailHtml,
      text: emailText,
      attachments: [
        {
          filename: `fakti-${order.numero_commande}.pdf`,
          content: Buffer.from(pdfBytes),
          contentType: "application/pdf",
        },
      ],
    });

    if (sendError) {
      console.error("[Resend]", JSON.stringify(sendError));
      return NextResponse.json(
        { error: sendError.message || JSON.stringify(sendError) },
        { status: 500 },
      );
    }

    return NextResponse.json({ ok: true, recipientEmail });
  } catch (err) {
    console.error("[POST /api/orders/confirmation-email]", err.message, err);
    return NextResponse.json({ error: err.message || "Erreur inattendue." }, { status: 500 });
  }
}

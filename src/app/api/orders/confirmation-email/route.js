import { NextResponse } from "next/server";
import { Resend } from "resend";

const db = require("@/server/db");

export const runtime = "nodejs";

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function buildOrderEmailHtml({ order, items, followUrl }) {
  const itemRows = items
    .map(
      (item) => `
        <tr>
          <td style="padding:12px 0;border-bottom:1px solid #f2f4f7;color:#101828;font-weight:700;">
            ${escapeHtml(item.nom_plat)}
            <div style="margin-top:4px;color:#667085;font-size:12px;font-weight:600;">Quantite: ${item.quantite}</div>
          </td>
          <td align="right" style="padding:12px 0;border-bottom:1px solid #f2f4f7;color:#101828;font-weight:800;">
            ${item.sous_total} HTG
          </td>
        </tr>
      `,
    )
    .join("");

  return `
    <!DOCTYPE html>
    <html lang="fr">
      <head><meta charset="UTF-8" /></head>
      <body style="margin:0;padding:0;background:#f8fafc;font-family:Arial,sans-serif;color:#101828;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding:32px 16px;">
          <tr>
            <td align="center">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;background:#ffffff;border-radius:24px;overflow:hidden;border:1px solid #eaecf0;">
                <tr>
                  <td style="background:#101828;padding:28px 32px;">
                    <div style="font-size:24px;font-weight:900;letter-spacing:0.12em;text-transform:uppercase;color:#F4A640;">TAITAI</div>
                  </td>
                </tr>
                <tr>
                  <td style="padding:32px;">
                    <p style="margin:0 0 8px 0;font-size:13px;font-weight:800;letter-spacing:0.12em;text-transform:uppercase;color:#F4A640;">Commande ${escapeHtml(order.numero_commande)}</p>
                    <h1 style="margin:0 0 16px 0;font-size:26px;line-height:1.2;color:#101828;">Nou resevwa komann ou.</h1>
                    <p style="margin:0 0 18px 0;font-size:15px;line-height:1.7;color:#475467;">Bonjour ${escapeHtml(order.client_nom)},</p>
                    <p style="margin:0 0 24px 0;font-size:16px;line-height:1.8;color:#344054;">
                      Komann ou pase avek sikse. N ap verifye detay yo epi n ap prepare livrezon an.
                    </p>

                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:0 0 22px 0;">
                      ${itemRows}
                    </table>

                    <div style="margin-top:20px;padding:18px 20px;background:#fff7ed;border-radius:16px;">
                      <div style="display:flex;justify-content:space-between;gap:16px;font-size:16px;font-weight:900;color:#101828;">
                        <span>Total</span>
                        <span>${order.total} HTG</span>
                      </div>
                      <div style="margin-top:10px;color:#9a3412;font-size:13px;line-height:1.6;">
                        Nimewo komann: <strong>${escapeHtml(order.numero_commande)}</strong>
                      </div>
                    </div>

                    <div style="margin-top:24px;color:#667085;font-size:14px;line-height:1.7;">
                      Ou ka swiv komann nan isit la:
                      <a href="${escapeHtml(followUrl)}" style="color:#F4A640;font-weight:800;">${escapeHtml(followUrl)}</a>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
}

export async function POST(request) {
  try {
    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json({ error: "RESEND_API_KEY n'est pas configuree." }, { status: 500 });
    }

    const { orderId, email, clientTel } = await request.json();

    if (!orderId || !email) {
      return NextResponse.json({ error: "Commande et email requis." }, { status: 400 });
    }

    const { rows } = await db.query(
      `
        SELECT id, numero_commande, client_nom, client_tel, adresse_livraison, total
        FROM public.commandes
        WHERE id = $1
      `,
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
      `
        SELECT nom_plat, quantite, sous_total
        FROM public.commande_items
        WHERE commande_id = $1
        ORDER BY id
      `,
      [orderId],
    );

    const followUrl = `${request.nextUrl.origin}/suivi?numero=${encodeURIComponent(order.numero_commande)}`;
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { error } = await resend.emails.send({
      from: "TaiTai Restaurant <onboarding@resend.dev>",
      to: [email],
      subject: `Confirmation commande ${order.numero_commande}`,
      html: buildOrderEmailHtml({ order, items, followUrl }),
      text: `Bonjour ${order.client_nom}, votre commande ${order.numero_commande} a bien ete recue. Total: ${order.total} HTG. Suivi: ${followUrl}`,
    });

    if (error) {
      console.error("[Resend order confirmation]", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[POST /api/orders/confirmation-email]", err.message);
    return NextResponse.json({ error: "Impossible d'envoyer l'email de confirmation." }, { status: 500 });
  }
}

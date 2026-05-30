import { NextResponse } from "next/server";
import { Resend } from "resend";

const db = require("@/server/db");

export const runtime = "nodejs";

const allowedStatuses = new Set(["En attente", "En préparation", "Prêt", "Livré"]);

const statusMessages = {
  "En attente": "Votre commande a bien été reçue et attend confirmation.",
  "En préparation": "Votre commande est maintenant en préparation.",
  "Prêt": "Votre commande est prête.",
  "Livré": "Votre commande a été livrée. Merci pour votre confiance.",
};

function buildEmailHtml({ clientName, orderNumber, status }) {
  const message = statusMessages[status] || "Le statut de votre commande a changé.";

  return `
    <!DOCTYPE html>
    <html lang="fr">
      <head><meta charset="UTF-8" /></head>
      <body style="margin:0;padding:0;background:#f8fafc;font-family:Arial,sans-serif;color:#101828;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding:32px 16px;">
          <tr>
            <td align="center">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#ffffff;border-radius:24px;overflow:hidden;border:1px solid #eaecf0;">
                <tr>
                  <td style="background:#101828;padding:28px 32px;">
                    <div style="font-size:24px;font-weight:900;letter-spacing:0.12em;text-transform:uppercase;color:#F4A640;">TAITAI</div>
                  </td>
                </tr>
                <tr>
                  <td style="padding:32px;">
                    <p style="margin:0 0 8px 0;font-size:13px;font-weight:800;letter-spacing:0.12em;text-transform:uppercase;color:#F4A640;">Commande ${orderNumber}</p>
                    <h1 style="margin:0 0 16px 0;font-size:26px;line-height:1.2;color:#101828;">Statut: ${status}</h1>
                    <p style="margin:0 0 18px 0;font-size:15px;line-height:1.7;color:#475467;">Bonjour ${clientName || ""},</p>
                    <p style="margin:0;font-size:16px;line-height:1.8;color:#344054;">${message}</p>
                    <div style="margin-top:28px;padding:18px 20px;background:#fff7ed;border-radius:16px;color:#9a3412;font-size:14px;line-height:1.6;">
                      Vous pouvez aussi suivre votre commande depuis la page de suivi TaiTai avec le numéro <strong>${orderNumber}</strong>.
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

export async function PATCH(request) {
  try {
    const { orderId, status } = await request.json();

    if (!orderId || !allowedStatuses.has(status)) {
      return NextResponse.json({ error: "Commande ou statut invalide." }, { status: 400 });
    }

    const { rows } = await db.query(
      `
        UPDATE public.commandes
        SET statut = $2
        WHERE id = $1
        RETURNING id, numero_commande, client_nom, client_user_id
      `,
      [orderId, status],
    );

    const order = rows[0];

    if (!order) {
      return NextResponse.json({ error: "Commande introuvable." }, { status: 404 });
    }

    let email = null;

    if (order.client_user_id) {
      const { rows: clientRows } = await db.query(
        "SELECT email FROM public.clients WHERE id = $1",
        [order.client_user_id],
      );
      email = clientRows[0]?.email || null;
    }

    if (email && process.env.RESEND_API_KEY) {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const { error } = await resend.emails.send({
        from: "TaiTai Restaurant <onboarding@resend.dev>",
        to: [email],
        subject: `Votre commande ${order.numero_commande} est ${status}`,
        html: buildEmailHtml({
          clientName: order.client_nom,
          orderNumber: order.numero_commande,
          status,
        }),
        text: `Bonjour ${order.client_nom}, votre commande ${order.numero_commande} est maintenant: ${status}.`,
      });

      if (error) {
        console.error("[Resend order status]", error);
        return NextResponse.json({
          ok: true,
          emailSent: false,
          emailError: error.message,
        });
      }

      return NextResponse.json({ ok: true, emailSent: true });
    }

    return NextResponse.json({ ok: true, emailSent: false });
  } catch (err) {
    console.error("[PATCH /api/admin/orders/status]", err.message);
    return NextResponse.json(
      { error: "Impossible de mettre à jour le statut." },
      { status: 500 },
    );
  }
}

import { NextResponse } from "next/server";
import { Resend } from "resend";

const db = require("@/server/db");

export const runtime = "nodejs";

const fromEmail = process.env.RESEND_FROM_EMAIL || "TaiTai Restaurant <onboarding@resend.dev>";

const allowedStatuses = new Set(["En attente", "En préparation", "Prêt", "Livré", "Annulee"]);

const statusMessages = {
  "En attente": "Votre commande a bien été reçue et attend confirmation.",
  "En préparation": "Votre commande est maintenant en préparation.",
  "Prêt": "Votre commande est prête.",
  "Livré": "Votre commande a été livrée. Merci pour votre confiance.",
  Annulee:
    "Votre commande a été annulée après vérification. Si vous pensez qu'il s'agit d'une erreur, contactez TaiTai.",
};

function buildEmailHtml({ clientName, orderNumber, status, baseUrl }) {
  const message = statusMessages[status] || "Le statut de votre commande a changé.";

  return `
    <!DOCTYPE html>
    <html lang="fr-HT">
      <head>
        <meta charset="UTF-8" />
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body style="margin:0;padding:0;background:#f8fafc;font-family:Arial,sans-serif;color:#101828;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding:32px 16px;">
          <tr>
            <td align="center">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#ffffff;border-radius:24px;overflow:hidden;border:1px solid #eaecf0;">
                <tr>
                  <td style="background:#101828;padding:24px 32px;text-align:center;">
                    <img src="${baseUrl}/images/logo/tailogo.png" alt="TaïTaï" height="52" style="display:inline-block;height:52px;width:auto;max-width:160px;" />
                  </td>
                </tr>
                <tr>
                  <td style="padding:32px;">
                    <p style="margin:0 0 8px 0;font-size:13px;font-weight:800;letter-spacing:0.12em;text-transform:uppercase;color:#FF9000;">Commande ${orderNumber}</p>
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
  let client;

  try {
    const { orderId, status, validated = false } = await request.json();

    if (!orderId || !allowedStatuses.has(status)) {
      return NextResponse.json({ error: "Commande ou statut invalide." }, { status: 400 });
    }

    client = await db.connect();
    await client.query("BEGIN");

    const { rows: existingRows } = await client.query(
      `
        SELECT id, statut
        FROM public.commandes
        WHERE id = $1
        FOR UPDATE
      `,
      [orderId],
    );

    const existingOrder = existingRows[0];

    if (!existingOrder) {
      await client.query("ROLLBACK");
      return NextResponse.json({ error: "Commande introuvable." }, { status: 404 });
    }

    if (existingOrder.statut === "En attente" && !validated) {
      await client.query("ROLLBACK");
      return NextResponse.json(
        { error: "La commande doit d’abord être validée depuis la page Validation commandes avant de changer de statut." },
        { status: 409 },
      );
    }

    if (status === "Annulee" && existingOrder.statut !== "Annulee") {
      await client.query(
        `
          UPDATE public.menu_items AS menu
          SET stock_quantity = menu.stock_quantity + items.total_quantity
          FROM (
            SELECT menu_item_id, SUM(quantite)::integer AS total_quantity
            FROM public.commande_items
            WHERE commande_id = $1
              AND menu_item_id IS NOT NULL
            GROUP BY menu_item_id
          ) AS items
          WHERE menu.id = items.menu_item_id
        `,
        [orderId],
      );
    }

    const { rows } = await client.query(
      `
        UPDATE public.commandes
        SET statut = $2,
            payment_status = CASE
              WHEN $2 = 'Annulee' THEN 'Refuse'
              WHEN $2 = 'En préparation' THEN 'Valide'
              ELSE payment_status
          END
        WHERE id = $1
        RETURNING id, numero_commande, client_nom, client_user_id
      `,
      [orderId, status],
    );

    const order = rows[0];

    await client.query("COMMIT");
    client.release();
    client = null;

    let email = null;
    if (order.client_user_id) {
      const { rows: clientRows } = await db.query(
        "SELECT email FROM public.clients WHERE id = $1",
        [order.client_user_id],
      );
      email = String(clientRows[0]?.email || "").trim() || null;
    }

    if (email && process.env.RESEND_API_KEY) {
      const resend = new Resend(process.env.RESEND_API_KEY);
      
      // Prepare email with UTF-8 encoding
      const emailHtml = buildEmailHtml({
        clientName: order.client_nom,
        orderNumber: order.numero_commande,
        status,
        baseUrl: request.nextUrl.origin,
      });
      const emailText = `Bonjour ${order.client_nom}, votre commande ${order.numero_commande} est maintenant: ${status}.`;
      
      const { error } = await resend.emails.send({
        from: fromEmail,
        to: [email],
        subject: `Votre commande ${order.numero_commande} est ${status}`,
        html: emailHtml,
        text: emailText,
        headers: {
          "Content-Type": "text/html; charset=UTF-8",
        },
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
    if (client) {
      try {
        await client.query("ROLLBACK");
      } catch (rollbackErr) {
        console.error("[PATCH /api/admin/orders/status rollback]", rollbackErr.message);
      }
    }

    console.error("[PATCH /api/admin/orders/status]", err.message);
    return NextResponse.json(
      { error: "Impossible de mettre Ã  jour le statut." },
      { status: 500 },
    );
  } finally {
    if (client) {
      client.release();
    }
  }
}


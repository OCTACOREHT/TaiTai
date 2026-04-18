import { NextResponse } from "next/server";
import { Resend } from "resend";

const db = require("@/server/db");
export const runtime = "nodejs";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request) {
  try {
    const { to, toName, subject, replyMessage, messageId } = await request.json();

    if (!to || !subject || !replyMessage) {
      return NextResponse.json(
        { error: "Destinataire, sujet et message sont obligatoires." },
        { status: 400 }
      );
    }

    const safeName = toName || to;
    const safeMessage = replyMessage.replace(/\n/g, "<br/>");

    const { error } = await resend.emails.send({
      from: "FC TORO <onboarding@resend.dev>",
      to: [to],
      subject,
      html: `
        <!DOCTYPE html>
        <html lang="fr">
          <head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
          <body style="margin:0;padding:0;background:#0a1224;font-family:Arial,sans-serif;">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="padding:40px 16px;">
              <tr><td align="center">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:600px;">
                  <tr>
                    <td style="padding-bottom:32px;">
                      <div style="font-size:20px;font-weight:900;letter-spacing:0.12em;text-transform:uppercase;color:#ef233c;">FC TORO</div>
                    </td>
                  </tr>
                  <tr>
                    <td style="background:#ffffff;border-radius:24px;padding:36px 32px;box-shadow:0 30px 60px rgba(0,0,0,0.18);">
                      <div style="font-size:12px;font-weight:800;letter-spacing:0.2em;text-transform:uppercase;color:#ef233c;margin-bottom:12px;">Réponse de FC TORO</div>
                      <h2 style="margin:0 0 20px 0;font-size:26px;font-weight:900;line-height:1.1;color:#0a1d3a;">${subject}</h2>
                      <p style="margin:0 0 8px 0;font-size:15px;color:#40526f;">Bonjour <strong>${safeName}</strong>,</p>
                      <div style="margin:20px 0;padding:20px 24px;background:#f4f7ff;border-radius:16px;font-size:15px;line-height:1.8;color:#20314f;">
                        ${safeMessage}
                      </div>
                      <div style="margin-top:32px;padding-top:24px;border-top:1px solid #e4ebf5;font-size:12px;color:#778ca3;">
                        L'équipe FC TORO · 7 Rue Rigaud, Petion-Ville, Haïti
                      </div>
                    </td>
                  </tr>
                </table>
              </td></tr>
            </table>
          </body>
        </html>
      `,
      text: replyMessage,
    });

    if (error) {
      console.error("[Resend]", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // ── DATABASE STORAGE FOR HISTORY ──
    if (messageId) {
      try {
        // Fetch current message
        const { rows } = await db.query("SELECT payload FROM site_messages WHERE id = $1", [messageId]);
        if (rows.length > 0) {
          let currentPayload = rows[0].payload || {};
          if (typeof currentPayload === 'string') {
             try { currentPayload = JSON.parse(currentPayload); } catch { currentPayload = {}; }
          }
          
          // Ensure replies array exists
          if (!currentPayload.replies) currentPayload.replies = [];
          
          // Add new reply
          currentPayload.replies.push({
            role: 'admin',
            message: replyMessage,
            subject: subject,
            timestamp: new Date().toISOString()
          });

          // Update database
          await db.query(
            "UPDATE site_messages SET payload = $1 WHERE id = $2",
            [JSON.stringify(currentPayload), messageId]
          );
        }
      } catch (dbErr) {
        console.error("[DB History Error]", dbErr.message);
        // We don't fail the whole request if history storage fails, but we log it
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[send-reply]", err.message);
    return NextResponse.json(
      { error: "Impossible d'envoyer la réponse." },
      { status: 500 }
    );
  }
}

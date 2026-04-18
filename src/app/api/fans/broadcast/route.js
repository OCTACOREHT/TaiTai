import { NextResponse } from "next/server";
const db = require("@/server/db");
import { Resend } from "resend";

export const runtime = "nodejs";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request) {
  try {
    const { subject, message } = await request.json();

    if (!subject || !message) {
      return NextResponse.json(
        { error: "Le sujet et le message sont obligatoires." },
        { status: 400 }
      );
    }

    // Fetch all accepted fans
    const { rows: fans } = await db.query(
      "SELECT email, name FROM site_messages WHERE type = 'fan' AND status = 'accepted' AND email IS NOT NULL"
    );

    if (fans.length === 0) {
      return NextResponse.json(
        { error: "Aucun fan accepté trouvé pour l'envoi." },
        { status: 404 }
      );
    }

    const safeMessage = message.replace(/\n/g, "<br/>");

    // We send emails in a loop for now (simple implementation)
    // For large volumes, we would use batching or a queue.
    const results = await Promise.all(
      fans.map(async (fan) => {
        return resend.emails.send({
          from: "FC TORO <onboarding@resend.dev>",
          to: [fan.email],
          subject: subject,
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
                          <div style="font-size:12px;font-weight:800;letter-spacing:0.2em;text-transform:uppercase;color:#ef233c;margin-bottom:12px;">Message de FC TORO</div>
                          <h2 style="margin:0 0 20px 0;font-size:26px;font-weight:900;line-height:1.1;color:#0a1d3a;">${subject}</h2>
                          <p style="margin:0 0 8px 0;font-size:15px;color:#40526f;">Bonjour <strong>${fan.name}</strong>,</p>
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
          text: message,
        });
      })
    );

    const failures = results.filter((r) => r.error);
    if (failures.length > 0) {
      console.error("[Broadcast] Some emails failed:", failures);
      return NextResponse.json({ 
        ok: true, 
        sentCount: fans.length - failures.length,
        failCount: failures.length 
      });
    }

    return NextResponse.json({ ok: true, sentCount: fans.length });
  } catch (err) {
    console.error("[POST /api/fans/broadcast]", err.message);
    return NextResponse.json({ error: "Erreur lors de la diffusion." }, { status: 500 });
  }
}

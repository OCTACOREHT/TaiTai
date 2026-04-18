import { NextResponse } from "next/server";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import fs from "fs";
import path from "path";

const db = require("@/server/db");
export const runtime = "nodejs";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID manquant." }, { status: 400 });
    }

    // 1. Fetch the message first to get the linkage metadata
    const { rows: msgRows } = await db.query(
      "SELECT email, created_at FROM site_messages WHERE id = $1",
      [id]
    );

    if (msgRows.length === 0) {
      return NextResponse.json({ error: "Message non trouvé." }, { status: 404 });
    }

    const { email, created_at } = msgRows[0];

    // 2. Find the matching registration (using the same logic as the backfill script, but robust to microsecond precision issues)
    const { rows: regRows } = await db.query(
      `SELECT * FROM player_registrations 
       WHERE guardian_email = $1 
       ORDER BY ABS(EXTRACT(EPOCH FROM created_at) - EXTRACT(EPOCH FROM $2::timestamptz)) ASC 
       LIMIT 1`,
      [email, created_at]
    );

    if (regRows.length === 0) {
      return NextResponse.json({ error: "Inscription correspondante non trouvée." }, { status: 404 });
    }

    const reg = regRows[0];
    const registrationId = reg.id;

    // 3. Fetch Associated Documents using the REAL registration ID
    const { rows: docRows } = await db.query(
      "SELECT * FROM player_registration_documents WHERE registration_id = $1",
      [registrationId]
    );

    // 3. Create PDF
    const pdfDoc = await PDFDocument.create();
    const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
    const timesBoldFont = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);

    // --- PAGE 1: DOSSIER RÉCAPITULATIF ---
    let page = pdfDoc.addPage([595.28, 841.89]); // A4
    const { width, height } = page.getSize();

    // BRANDING: Logo
    try {
      const logoPath = path.join(process.cwd(), "public/images/logo/fc-toro.png");
      if (fs.existsSync(logoPath)) {
        const logoBytes = fs.readFileSync(logoPath);
        const logoImage = await pdfDoc.embedPng(logoBytes);
        page.drawImage(logoImage, {
          x: 40,
          y: height - 90,
          width: 50,
          height: 50,
        });
      }
    } catch (e) {
      console.warn("Logo error:", e.message);
    }

    // HEADER LINE
    page.drawLine({
      start: { x: 40, y: height - 105 },
      end: { x: width - 40, y: height - 105 },
      thickness: 2,
      color: rgb(0.8, 0.1, 0.1),
    });

    // HEADER INFO
    page.drawText("FC TORO - DOSSIER OFFICIEL", {
      x: 105,
      y: height - 55,
      size: 20,
      font: timesBoldFont,
      color: rgb(0.1, 0.1, 0.3), // Dark Blue
    });

    page.drawText("FICHE D'INSCRIPTION JOUEUR", {
      x: 105,
      y: height - 75,
      size: 12,
      font: timesBoldFont,
      color: rgb(0.4, 0.4, 0.4),
    });

    page.drawText("Port-au-Prince, Haïti | contact@fctoro.com", {
      x: 105,
      y: height - 90,
      size: 9,
      font: timesRomanFont,
      color: rgb(0.5, 0.5, 0.5),
    });

    // PLAYER PHOTO (Primary)
    const playerPhotoDoc = docRows.find(d => d.doc_key === 'document_photo_id');
    if (playerPhotoDoc) {
      try {
        let photoBytes = null;
        if (playerPhotoDoc.path) {
          const photoPath = path.join(process.cwd(), "public", playerPhotoDoc.path);
          if (fs.existsSync(photoPath)) {
            photoBytes = fs.readFileSync(photoPath);
          }
        }
        
        // Fallback to DB buffer if disk file missing OR path was null
        if (!photoBytes && playerPhotoDoc.data) {
          photoBytes = playerPhotoDoc.data;
        }

        if (photoBytes) {
          const mime = (playerPhotoDoc.content_type || '').toLowerCase();
          const photoImage = (mime === 'image/jpeg' || mime === 'image/jpg')
                             ? await pdfDoc.embedJpg(photoBytes) 
                             : await pdfDoc.embedPng(photoBytes);
          
          // Draw a frame for the photo
          page.drawRectangle({
            x: width - 152,
            y: height - 212,
            width: 104,
            height: 124,
            borderColor: rgb(0.8, 0.8, 0.8),
            borderWidth: 1,
          });

          page.drawImage(photoImage, {
            x: width - 150,
            y: height - 210,
            width: 100,
            height: 120,
          });
        }
      } catch (e) {
        console.warn("Photo error:", e.message);
      }
    }

    // HELPERS FOR DRAWING SECTIONS
    let currentY = height - 140;

    const drawFooter = (p, pNum) => {
        p.drawText(`Document généré le ${new Date().toLocaleDateString('fr-FR')} - Page ${pNum}`, {
            x: 40,
            y: 30,
            size: 8,
            font: timesRomanFont,
            color: rgb(0.6, 0.6, 0.6)
        });
    };
    const drawSectionHeader = (title) => {
      if (currentY < 100) { // New page if too low
          page = pdfDoc.addPage([595.28, 841.89]);
          currentY = 800;
          drawFooter(page, pdfDoc.getPageCount());
      }
      page.drawRectangle({
        x: 40,
        y: currentY - 5,
        width: width - 200,
        height: 18,
        color: rgb(0.95, 0.95, 0.98),
      });
      page.drawText(title, { 
        x: 45, 
        y: currentY, 
        size: 11, 
        font: timesBoldFont,
        color: rgb(0.1, 0.1, 0.3)
      });
      currentY -= 25;
    };

    const drawFields = (fields) => {
      fields.forEach(([label, value]) => {
        if (currentY < 60) {
            page = pdfDoc.addPage([595.28, 841.89]);
            currentY = 800;
            drawFooter(page, pdfDoc.getPageCount());
        }
        page.drawText(label, { x: 50, y: currentY, size: 9, font: timesBoldFont, color: rgb(0.3, 0.3, 0.3) });
        page.drawText(String(value || "—"), { x: 160, y: currentY, size: 10, font: timesRomanFont });
        currentY -= 14;
      });
    };

    // SECTION 1: IDENTITÉ
    drawSectionHeader("1. IDENTITÉ DU JOUEUR");
    drawFields([
      ["Nom Complet:", `${reg.child_first_name} ${reg.child_last_name}`],
      ["Date de Naissance:", String(reg.child_birth_date)],
      ["Genre:", reg.child_gender],
      ["École:", reg.child_school],
      ["Programme:", reg.program === 'tiToro' ? 'Ti Toro (2-5 ans)' : 'FC Toro (6-18 ans)'],
      ["Expérience Foot:", reg.child_soccer_experience],
      ["Adresse:", reg.child_address],
    ]);

    // SECTION 2: TUTEUR & URGENCE
    currentY -= 15;
    drawSectionHeader("2. TUTEUR ET CONTACT D'URGENCE");
    drawFields([
      ["Parent/Tuteur:", reg.guardian_name],
      ["Email Tuteur:", reg.guardian_email],
      ["Téléphone Tuteur:", reg.guardian_phone],
      ["Adresse Tuteur:", reg.guardian_address],
      ["Contact Urgence:", reg.emergency_name],
      ["Relation Urgence:", reg.emergency_relation],
      ["Téléphone Urgence:", reg.emergency_phone],
    ]);

    // SECTION 3: LOGISTIQUE ET PAIEMENT
    currentY -= 15;
    drawSectionHeader("3. LOGISTIQUE ET PAIEMENT");
    drawFields([
      ["Taille Maillot:", reg.uniform_top_size],
      ["Taille Short:", reg.uniform_short_size],
      ["Numéro Préféré:", reg.preferred_numbers],
      ["Plan de Paiement:", reg.payment_plan],
      ["Méthode:", reg.payment_method],
      ["Signature (Nom):", reg.signature_name],
    ]);

    // FOOTER RE-DRAW for consistency
    drawFooter(page, 1);

    // --- ATTACHEMENTS: Pièces Jointes ---
    for (const doc of docRows) {
      if (doc.doc_key === 'document_photo_id') continue; // Already handled on page 1
      
      try {
        let fileBytes = null;
        if (doc.path) {
          const filePath = path.join(process.cwd(), "public", doc.path);
          if (fs.existsSync(filePath)) {
            fileBytes = fs.readFileSync(filePath);
          }
        }

        if (!fileBytes && doc.data) {
          fileBytes = doc.data;
        }

        if (fileBytes) {
          const attPage = pdfDoc.addPage([595.28, 841.89]);
          const pNum = pdfDoc.getPageCount();
          
          attPage.drawText(`ANNEXE : ${doc.doc_key.replace(/_/g, ' ').toUpperCase()}`, {
            x: 50,
            y: 800,
            size: 14,
            font: timesBoldFont
          });

          const mime = (doc.content_type || '').toLowerCase();
          const attImage = (mime === 'image/jpeg' || mime === 'image/jpg')
                            ? await pdfDoc.embedJpg(fileBytes) 
                            : await pdfDoc.embedPng(fileBytes);
          
          // Fit image to page while preserving aspect ratio
          const maxWidth = 500;
          const maxHeight = 650;
          let drawWidth = attImage.width;
          let drawHeight = attImage.height;

          const ratio = Math.min(maxWidth / drawWidth, maxHeight / drawHeight);
          drawWidth *= ratio;
          drawHeight *= ratio;

          attPage.drawImage(attImage, {
            x: (595.28 - drawWidth) / 2,
            y: (841.89 - drawHeight - 100),
            width: drawWidth,
            height: drawHeight,
          });

          drawFooter(attPage, pNum);
        }
      } catch (attErr) {
        console.warn(`Could not embed attachment ${doc.doc_key}:`, attErr.message);
      }
    }

    const pdfBytes = await pdfDoc.save();

    return new Response(pdfBytes, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename=Dossier_FC_TORO_${reg.child_last_name}.pdf`,
      },
    });

  } catch (err) {
    console.error("[GET /api/demandes/pdf]", err.stack);
    return NextResponse.json({ 
      error: "Erreur lors de la génération du PDF.",
      details: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    }, { status: 500 });
  }
}

require('dotenv').config({ path: '.env.local' });
const { PDFDocument, rgb } = require('pdf-lib');
const fs = require('fs');
const db = require('../src/server/db');

async function run() {
  try {
    const registrationId = 1;

    console.log("Fetching documents for registration:", registrationId);
    const { rows: docRows } = await db.query(
      "SELECT * FROM player_registration_documents WHERE registration_id = $1",
      [registrationId]
    );

    console.log("Found documents:", docRows.length);
    if (!docRows.length) return;

    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595.28, 841.89]);

    const playerPhotoDoc = docRows.find(d => d.doc_key === 'document_photo_id');
    console.log("Photo Doc found:", !!playerPhotoDoc);

    if (playerPhotoDoc) {
      console.log("Photo path:", playerPhotoDoc.path);
      console.log("Photo content_type:", playerPhotoDoc.content_type);
      console.log("Photo data exists?", !!playerPhotoDoc.data);
      console.log("Photo data type:", typeof playerPhotoDoc.data);

      let photoBytes = playerPhotoDoc.data; // test fallback directly
      
      if (photoBytes) {
        console.log("Embedding photo...");
        const mime = (playerPhotoDoc.content_type || '').toLowerCase();
        let photoImage;
        try {
          if (mime === 'image/jpeg' || mime === 'image/jpg') {
            photoImage = await pdfDoc.embedJpg(photoBytes);
          } else {
            console.log("Attempting embedPng...");
            photoImage = await pdfDoc.embedPng(photoBytes);
          }
          console.log("Image embedded successfully. Dimensions:", photoImage.width, 'x', photoImage.height);
          
          page.drawImage(photoImage, {
            x: 100, y: 100, width: 100, height: 100
          });
        } catch (e) {
          console.error("Failed to embed image:", e.message);
        }
      }
    }

    const pdfBytes = await pdfDoc.save();
    fs.writeFileSync('test_output.pdf', pdfBytes);
    console.log("PDF saved to test_output.pdf");

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();

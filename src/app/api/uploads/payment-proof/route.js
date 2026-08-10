import { NextResponse } from "next/server";

const { saveUploadedFile } = require("@/server/uploads");

export const runtime = "nodejs";

const maxFileSize = 8 * 1024 * 1024;
const allowedTypes = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
  "application/pdf",
]);

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get("proof");

    if (!file || typeof file === "string") {
      return NextResponse.json({ error: "Justificatif manquant." }, { status: 400 });
    }

    const isImage = file.type?.startsWith("image/");
    const isPdf = file.type === "application/pdf" || file.name?.toLowerCase().endsWith(".pdf");

    if (!isImage && !isPdf) {
      return NextResponse.json(
        { error: "Le justificatif doit etre une image (JPG, PNG, HEIC, etc.) ou un PDF." },
        { status: 400 },
      );
    }

    if (file.size > maxFileSize) {
      return NextResponse.json(
        { error: "Le justificatif ne doit pas depasser 8 MB." },
        { status: 400 },
      );
    }

    const upload = await saveUploadedFile(file);

    return NextResponse.json({
      url: upload.publicUrl,
      filename: upload.filename,
    });
  } catch (err) {
    console.error("[payment-proof upload]", err?.message || err, err?.stack);
    return NextResponse.json({ error: `Impossible d'uploader le justificatif: ${err?.message || err}` }, { status: 500 });
  }
}

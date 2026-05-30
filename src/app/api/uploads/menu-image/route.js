import { NextResponse } from "next/server";

const { saveUploadedFile } = require("@/server/uploads");

export const runtime = "nodejs";

const maxFileSize = 5 * 1024 * 1024;

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get("image");

    if (!file || typeof file === "string") {
      return NextResponse.json({ error: "Image manquante." }, { status: 400 });
    }

    if (!file.type?.startsWith("image/")) {
      return NextResponse.json({ error: "Le fichier doit être une image." }, { status: 400 });
    }

    if (file.size > maxFileSize) {
      return NextResponse.json({ error: "L'image ne doit pas dépasser 5 MB." }, { status: 400 });
    }

    const upload = await saveUploadedFile(file);

    return NextResponse.json({
      url: upload.publicUrl,
      filename: upload.filename,
    });
  } catch (err) {
    console.error("[menu-image upload]", err.message);
    return NextResponse.json({ error: "Impossible d'uploader l'image." }, { status: 500 });
  }
}

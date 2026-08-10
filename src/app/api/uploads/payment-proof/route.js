import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
const { saveUploadedFile } = require("@/server/uploads");

export const runtime = "nodejs";

// Use service role key to bypass RLS on storage uploads (server-side only)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

const maxFileSize = 8 * 1024 * 1024;

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

    const timestamp = Date.now();
    const extension = file.name ? file.name.split(".").pop() : "jpg";
    const filename = `proof_${timestamp}_${Math.random().toString(36).substring(7)}.${extension}`;
    const filePath = `proofs/${filename}`;

    // Upload directly to Supabase Storage (cloud) so serverless read-only disk doesn't fail
    const { data: storageData, error: storageError } = await supabaseAdmin.storage
      .from("payment-proofs")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (!storageError && storageData) {
      const { data: publicUrlData } = supabaseAdmin.storage
        .from("payment-proofs")
        .getPublicUrl(filePath);

      if (publicUrlData?.publicUrl) {
        return NextResponse.json({
          url: publicUrlData.publicUrl,
          filename: filename,
        });
      }
    }

    if (storageError) {
      console.error("[Supabase Storage upload error]", storageError);
      return NextResponse.json(
        { error: `Erreur de stockage: ${storageError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "Impossible d'obtenir l'URL publique du justificatif." },
      { status: 500 }
    );
  } catch (err) {
    console.error("[payment-proof upload]", err?.message || err);
    return NextResponse.json(
      { error: `Impossible d'uploader le justificatif: ${err?.message || err}` },
      { status: 500 }
    );
  }
}

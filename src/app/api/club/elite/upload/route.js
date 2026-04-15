import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json({ error: "Aucun fichier reçu." }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
       throw new Error("Supabase credentials missing in environment variables.");
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Generate valid unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const filename = `${uniqueSuffix}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

    const { error } = await supabase.storage
      .from("videos")
      .upload(`elite/${filename}`, buffer, {
         contentType: file.type,
         upsert: true,
      });

    if (error) {
      console.error("Supabase Storage error:", error);
      throw error;
    }

    const { data: publicUrlData } = supabase.storage
      .from("videos")
      .getPublicUrl(`elite/${filename}`);

    const url = publicUrlData.publicUrl;

    return NextResponse.json({ data: { url } }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/club/elite/upload]", err);
    return NextResponse.json({ error: "Erreur lors de l'upload: " + err.message }, { status: 500 });
  }
}

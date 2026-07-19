import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase-client";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type, title, message, link } = body;

    if (!type || !title || !message) {
      return NextResponse.json(
        { error: "type, title et message sont requis" },
        { status: 400 }
      );
    }

    // Créer la notification
    const { data, error } = await supabase
      .from("notifications")
      .insert({
        type,
        title,
        message,
        link: link || null,
        read: false,
      })
      .select()
      .single();

    if (error) {
      console.error("Erreur création notification:", error);
      return NextResponse.json(
        { error: "Impossible de créer la notification" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, notification: data });
  } catch (error) {
    console.error("Erreur:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
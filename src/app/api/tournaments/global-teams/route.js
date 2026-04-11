import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase-client";

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("flagday_teams")
      .select("*")
      .order("name", { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: data || [], success: true });
  } catch (error) {
    console.error("Erreur [GET /api/tournaments/global-teams]:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des équipes globales" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const { name, logo_url } = await request.json();

    if (!name) {
      return NextResponse.json({ error: "Le nom est obligatoire" }, { status: 400 });
    }

    const slug = name.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w-]/g, '');

    const { data, error } = await supabase
      .from("flagday_teams")
      .insert([{ name, slug, logo_url: logo_url || "/images/logo/fc-toro.png" }])
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data, success: true }, { status: 201 });
  } catch (error) {
    console.error("Erreur [POST /api/tournaments/global-teams]:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création de l'équipe" },
      { status: 500 }
    );
  }
}

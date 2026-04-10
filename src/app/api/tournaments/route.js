import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase-client";

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("flagday_competitions")
      .select("*")
      .order("date_creation", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: data || [], success: true });
  } catch (error) {
    console.error("Erreur:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des tournois" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();

    const { data, error } = await supabase
      .from("flagday_competitions")
      .insert([
        {
          name: body.name,
          slug: body.name.toLowerCase().replace(/\s+/g, "-"),
          season: body.startDate ? new Date(body.startDate).getFullYear().toString() : "",
          description: body.description || "",
          active: true,
        },
      ])
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const tournamentId = data.id;

    // 2. Créer les catégories associées si présentes
    if (body.categories && Array.isArray(body.categories) && body.categories.length > 0) {
      const categoriesData = body.categories.map((cat, index) => ({
        competition_id: tournamentId,
        name: cat,
        sort_order: index + 1,
        active: true,
      }));

      const { error: catError } = await supabase
        .from("flagday_categories")
        .insert(categoriesData);

      if (catError) {
        console.error("Erreur creation categories:", catError.message);
        // On ne bloque pas tout le processus si les categories echouent
      }
    }

    return NextResponse.json({ data, success: true }, { status: 201 });
  } catch (error) {
    console.error("Erreur:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création du tournoi" },
      { status: 500 }
    );
  }
}

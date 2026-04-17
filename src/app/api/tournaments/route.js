import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase-client";

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("flagday_competitions")
      .select("*")
      .order("created_at", { ascending: false });

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
          slug: body.name.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, ''),
          season: body.season || new Date().getFullYear().toString(),
          description: body.description || "",
          age_category: body.age_category || "",
          status: "preparation",
          is_published: false,
          active: true,
        },
      ])
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json(
          { error: "Un championnat avec ce nom existe déjà. Veuillez en choisir un autre." },
          { status: 400 }
        );
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const tournamentId = data.id;

    // 2. Créer la catégorie associée (une seule par tournoi maintenant)
    if (body.age_category) {
      const { error: catError } = await supabase
        .from("flagday_categories")
        .insert({
          competition_id: tournamentId,
          name: body.age_category,
          sort_order: 1,
          active: true,
        });

      if (catError) {
        console.error("Erreur creation categorie:", catError.message);
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

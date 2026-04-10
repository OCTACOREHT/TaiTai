import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase-client";

// Ajouter une équipe à un championnat
export async function POST(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { teamName, logo, category } = body;

    // 1. Créer ou récupérer l'équipe
    let team;
    const { data: existingTeam, error: fetchError } = await supabase
      .from("flagday_teams")
      .select("id")
      .eq("name", teamName)
      .single();

    if (fetchError && fetchError.code !== "PGRST116") {
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    if (existingTeam) {
      team = existingTeam;
    } else {
      const { data: newTeam, error: insertError } = await supabase
        .from("flagday_teams")
        .insert([
          {
            name: teamName,
            slug: teamName.toLowerCase().replace(/\s+/g, "-"),
            logo_url: logo || "/images/logo/fc-toro.png",
          },
        ])
        .select()
        .single();

      if (insertError) {
        return NextResponse.json({ error: insertError.message }, { status: 500 });
      }

      team = newTeam;
    }

    // 2. Ajouter l'équipe au championnat
    const { data, error } = await supabase
      .from("flagday_competition_teams")
      .insert([
        {
          competition_id: id,
          team_id: team.id,
          logo_url: logo || "/images/logo/fc-toro.png",
          category: category || "U9",
        },
      ])
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data, success: true }, { status: 201 });
  } catch (error) {
    console.error("Erreur:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'ajout de l'équipe" },
      { status: 500 }
    );
  }
}

// Récupérer les équipes d'un championnat
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const { data, error } = await supabase
      .from("flagday_competition_teams")
      .select(
        `
        id,
        team_id,
        logo_url,
        category,
        flagday_teams (
          id,
          name,
          slug,
          logo_url,
          color
        )
      `
      )
      .eq("competition_id", id)
      .order("sort_order", { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: data || [], success: true });
  } catch (error) {
    console.error("Erreur:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des équipes" },
      { status: 500 }
    );
  }
}

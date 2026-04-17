import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase-client";

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const { data, error } = await supabase
      .from("flagday_competitions")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      return NextResponse.json(
        { error: "Tournoi non trouvé" },
        { status: 404 }
      );
    }

    return NextResponse.json({ data, success: true });
  } catch (error) {
    console.error("Erreur:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération du tournoi" },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();

    const { data, error } = await supabase
      .from("flagday_competitions")
      .update(body)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data, success: true });
  } catch (error) {
    console.error("Erreur:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour du tournoi" },
      { status: 500 }
    );
  }
}
export async function DELETE(request, { params }) {
  const { requireAuth, requireSuperAdmin } = require("@/server/auth");
  const auth = requireAuth(request);
  if (auth.error) return auth.error;
  const forbidden = requireSuperAdmin(auth.user);
  if (forbidden) return forbidden;

  try {
    const { id } = await params;

    // 1. Supprimer les données liées (Nettoyage manuel si le cascade n'est pas actif)
    // On commence par les éléments les plus profonds
    await supabase.from("flagday_match_scorers").delete().in("match_id", (await supabase.from("flagday_matches").select("id").eq("competition_id", id)).data?.map(m => m.id) || []);
    await supabase.from("flagday_matches").delete().eq("competition_id", id);
    await supabase.from("flagday_standings").delete().in("category_id", (await supabase.from("flagday_categories").select("id").eq("competition_id", id)).data?.map(c => c.id) || []);
    await supabase.from("flagday_categories").delete().eq("competition_id", id);
    await supabase.from("flagday_competition_teams").delete().eq("competition_id", id);

    // 2. Supprimer la compétition elle-même
    const { error } = await supabase
      .from("flagday_competitions")
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Championnat supprimé" });
  } catch (error) {
    console.error("Erreur [DELETE /api/tournaments/[id]]:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression du tournoi" },
      { status: 500 }
    );
  }
}

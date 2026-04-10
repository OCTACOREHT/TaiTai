import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase-client";

// Supprimer une équipe d'un championnat
export async function DELETE(request, { params }) {
  try {
    const { teamId } = await params;
    const { data, error } = await supabase
      .from("flagday_competition_teams")
      .delete()
      .eq("id", teamId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data, success: true });
  } catch (error) {
    console.error("Erreur:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression de l'équipe" },
      { status: 500 }
    );
  }
}

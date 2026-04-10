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

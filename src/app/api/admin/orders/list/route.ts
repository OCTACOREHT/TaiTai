import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
);

const ITEMS_SELECT = "id, nom_plat, quantite, prix_unitaire, sous_total, supplements";
const COMMANDES_SELECT = `id, numero_commande, client_nom, client_tel, client_email, client_user_id, table_numero, adresse_livraison, canal, total, frais_livraison, statut, payment_method, payment_proof_url, payment_status, notes, created_at, archived_at, commande_items(${ITEMS_SELECT})`;

// GET /api/admin/orders/list?archived=false|true|all
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const archived = searchParams.get("archived") ?? "false";

  let query = supabaseAdmin
    .from("commandes")
    .select(COMMANDES_SELECT)
    .order("created_at", { ascending: false });

  if (archived === "false") {
    query = query.is("archived_at", null);
  } else if (archived === "true") {
    query = query.not("archived_at", "is", null).order("archived_at", { ascending: false });
  }
  // "all" = no filter

  const { data, error } = await query;

  if (error) {
    console.error("[orders/list]", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ orders: data || [] });
}

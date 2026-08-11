import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const db = require("@/server/db");

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
);

let columnCheckDone = false;

async function ensureArchivedAtColumn() {
  if (columnCheckDone) return;
  try {
    await db.query("ALTER TABLE public.commandes ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ NULL;");
    await db.query("CREATE INDEX IF NOT EXISTS idx_commandes_archived_at ON public.commandes (archived_at) WHERE archived_at IS NULL;");
    columnCheckDone = true;
  } catch (err) {
    console.warn("[ensureArchivedAtColumn]", (err as Error).message);
  }
}

const ITEMS_SELECT = "id, nom_plat, quantite, prix_unitaire, sous_total, supplements";
const COMMANDES_SELECT = `id, numero_commande, client_nom, client_tel, client_email, client_user_id, table_numero, adresse_livraison, canal, total, frais_livraison, statut, payment_method, payment_proof_url, payment_status, notes, created_at, archived_at, commande_items(${ITEMS_SELECT})`;
const COMMANDES_SELECT_FALLBACK = `id, numero_commande, client_nom, client_tel, client_email, client_user_id, table_numero, adresse_livraison, canal, total, frais_livraison, statut, payment_method, payment_proof_url, payment_status, notes, created_at, commande_items(${ITEMS_SELECT})`;

// GET /api/admin/orders/list?archived=false|true|all
export async function GET(request: Request) {
  await ensureArchivedAtColumn();

  const { searchParams } = new URL(request.url);
  const archived = searchParams.get("archived") ?? "false";

  try {
    let query = supabaseAdmin
      .from("commandes")
      .select(COMMANDES_SELECT)
      .order("created_at", { ascending: false });

    if (archived === "false") {
      query = query.is("archived_at", null);
    } else if (archived === "true") {
      query = query.not("archived_at", "is", null).order("archived_at", { ascending: false });
    }

    const { data, error } = await query;

    if (error) {
      console.warn("[orders/list fallback]", error.message);
      const fallbackQuery = await supabaseAdmin
        .from("commandes")
        .select(COMMANDES_SELECT_FALLBACK)
        .order("created_at", { ascending: false });

      return NextResponse.json({ orders: fallbackQuery.data || [] });
    }

    return NextResponse.json({ orders: data || [] });
  } catch (err) {
    console.error("[orders/list exception]", err);
    return NextResponse.json({ orders: [] });
  }
}

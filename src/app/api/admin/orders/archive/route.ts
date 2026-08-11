import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const db = require("@/server/db");

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
);

// POST /api/admin/orders/archive — archive all active orders (end of day)
export async function POST() {
  const now = new Date().toISOString();

  try {
    // Ensure column exists
    await db.query("ALTER TABLE public.commandes ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ NULL;");
  } catch (err) {
    console.warn("[archive column check]", (err as Error).message);
  }

  const { data, error } = await supabaseAdmin
    .from("commandes")
    .update({ archived_at: now })
    .is("archived_at", null)
    .select("id");

  if (error) {
    console.error("[archive orders]", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ archived: data?.length ?? 0, archived_at: now });
}
